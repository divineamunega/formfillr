import { createSuggestions, generateBio } from "./openai";
import { DEBUG_MODE, debugLog } from "../shared/debug-config.js";

/**
 * Parse AI suggestions from string response to JavaScript objects
 * Handles various formats: JSON, structured text, or fallback parsing
 */
function parseSuggestions(content: string): any[] {
	console.log(
		"🔍 [PARSER] Parsing suggestions content:",
		content.substring(0, 200) + "..."
	);

	try {
		// First, try to parse as direct JSON
		const jsonMatch = content.match(/\[[\s\S]*\]/);
		if (jsonMatch) {
			const parsed = JSON.parse(jsonMatch[0]);
			if (Array.isArray(parsed)) {
				console.log("✅ [PARSER] Successfully parsed as JSON array");
				return parsed;
			}
		}
	} catch (error) {
		console.log(
			"⚠️ [PARSER] JSON parsing failed, trying structured text parsing"
		);
	}

	try {
		// Try to extract JSON from code blocks
		const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
		if (codeBlockMatch) {
			const parsed = JSON.parse(codeBlockMatch[1]);
			if (Array.isArray(parsed)) {
				console.log("✅ [PARSER] Successfully parsed from code block");
				return parsed;
			}
		}
	} catch (error) {
		console.log(
			"⚠️ [PARSER] Code block parsing failed, trying line-by-line parsing"
		);
	}

	// Fallback: Parse structured text format
	try {
		const suggestions: any[] = [];
		const lines = content.split("\n").filter((line) => line.trim());

		let currentSuggestion: any = {};

		for (const line of lines) {
			const trimmed = line.trim();

			// Skip empty lines and headers
			if (
				!trimmed ||
				trimmed.includes("suggestions") ||
				trimmed.includes("---")
			) {
				continue;
			}

			// Look for field patterns
			if (trimmed.includes(":")) {
				const [key, ...valueParts] = trimmed.split(":");
				const value = valueParts.join(":").trim();

				const cleanKey = key.toLowerCase().replace(/[^a-z]/g, "");

				if (
					cleanKey.includes("field") ||
					cleanKey.includes("name") ||
					cleanKey.includes("id")
				) {
					// Start new suggestion
					if (Object.keys(currentSuggestion).length > 0) {
						suggestions.push(currentSuggestion);
					}
					currentSuggestion = { id: value.replace(/['"]/g, "") };
				} else if (
					cleanKey.includes("value") ||
					cleanKey.includes("suggestion")
				) {
					currentSuggestion.value = value.replace(/['"]/g, "");
				} else if (cleanKey.includes("confidence")) {
					const confidenceMatch = value.match(/(\d+)/);
					currentSuggestion.confidence = confidenceMatch
						? parseInt(confidenceMatch[1]) / 100
						: 0.8;
				}
			}
		}

		// Add the last suggestion
		if (Object.keys(currentSuggestion).length > 0) {
			suggestions.push(currentSuggestion);
		}

		if (suggestions.length > 0) {
			console.log("✅ [PARSER] Successfully parsed structured text format");
			return suggestions;
		}
	} catch (error) {
		console.error("❌ [PARSER] Structured text parsing failed:", error);
	}

	// Ultimate fallback: return empty array with error info
	console.warn(
		"⚠️ [PARSER] All parsing methods failed, returning empty suggestions"
	);
	return [];
}

chrome.runtime.onInstalled.addListener(() => {
	chrome.runtime.openOptionsPage();
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
	console.log("📨 [BACKGROUND] Message received:", msg.type);

	if (msg.type === "POPUP_OPENED") {
		return false; // No async response needed
	}

	if (msg.type === "GET_AI_SUGGESTIONS") {
		console.log("Getting AI Suggestions");

		// Handle async operation properly
		(async () => {
			try {
				const { personaData } = await chrome.storage.local.get("personaData");
				const formData = JSON.stringify(msg.fields);
				const data = { personaData, formData };
				const stringifiedData = JSON.stringify(data);

				const completion = await createSuggestions(stringifiedData);
				console.log("AI Suggestions completion received:", completion);

				// Extract the content from the completion
				const suggestionsContent = completion.choices?.[0]?.message?.content;
				if (!suggestionsContent) {
					throw new Error("No suggestions content received from AI");
				}

				console.log("Raw suggestions content:", suggestionsContent);

				// Parse the suggestions from string to JavaScript objects
				const suggestions = parseSuggestions(suggestionsContent);
				console.log("Parsed suggestions:", suggestions);

				sendResponse({ suggestions });
			} catch (error) {
				console.error("Failed to get AI suggestions:", error);
				const errorMessage =
					error instanceof Error
						? error.message
						: "Failed to generate suggestions";

				sendResponse({ error: errorMessage });
			}
		})();

		return true; // Keep message channel open for async response
	}

	if (msg.type === "GENERATE_BIO") {
		console.log("🔄 [BACKGROUND] Starting bio generation process");
		console.log("📝 [BACKGROUND] Message received:", {
			type: msg.type,
			promptLength: msg.prompt?.length || 0,
			hasPrompt: !!msg.prompt,
		});

		// Handle async operation properly with timeout protection
		(async () => {
			let hasResponded = false;

			// Set up a timeout to prevent hanging
			const timeoutId = setTimeout(() => {
				if (!hasResponded) {
					hasResponded = true;
					console.error(
						"⏰ [BACKGROUND] Bio generation timed out after 60 seconds"
					);
					sendResponse({
						success: false,
						error: "Request timed out",
						isRetryable: true,
						userMessage: "The request timed out. Please try again.",
						debugInfo: {
							errorType: "Timeout",
							timestamp: new Date().toISOString(),
						},
					});
				}
			}, 60000); // 60 second timeout

			try {
				if (!msg.prompt || typeof msg.prompt !== "string") {
					console.error("❌ [BACKGROUND] Invalid prompt:", {
						prompt: msg.prompt,
						type: typeof msg.prompt,
					});
					throw new Error("Invalid prompt provided for bio generation");
				}

				console.log("📤 [BACKGROUND] Calling OpenAI generateBio function...");
				const startTime = Date.now();

				const bioResponse = await generateBio(msg.prompt);

				const duration = Date.now() - startTime;
				console.log(
					`✅ [BACKGROUND] Bio generated successfully in ${duration}ms`
				);
				console.log(
					"📄 [BACKGROUND] Bio preview:",
					bioResponse.substring(0, 100) + "..."
				);

				if (!hasResponded) {
					hasResponded = true;
					clearTimeout(timeoutId);
					sendResponse({
						success: true,
						bio: bioResponse,
					});
				}
			} catch (error) {
				console.error("❌ [BACKGROUND] Error generating bio:", error);
				console.error("❌ [BACKGROUND] Error details:", {
					name: (error as any)?.name,
					message: (error as any)?.message,
					stack: (error as any)?.stack,
					status: (error as any)?.status,
					code: (error as any)?.code,
				});

				const errorMessage =
					error instanceof Error ? error.message : "An unknown error occurred";
				const isNetworkError =
					errorMessage.includes("connection") ||
					errorMessage.includes("timeout") ||
					errorMessage.includes("offline") ||
					errorMessage.includes("fetch") ||
					errorMessage.includes("network") ||
					(error as any)?.code === "NETWORK_ERROR";

				console.log("🔍 [BACKGROUND] Error classification:", {
					errorMessage,
					isNetworkError,
					errorType: typeof error,
					hasStatus: !!(error as any)?.status,
					status: (error as any)?.status,
				});

				if (!hasResponded) {
					hasResponded = true;
					clearTimeout(timeoutId);
					sendResponse({
						success: false,
						error: errorMessage,
						isRetryable: isNetworkError,
						userMessage: isNetworkError
							? "Connection issue detected. Please check your internet connection and try again."
							: `Failed to generate bio: ${errorMessage}`,
						debugInfo: {
							errorType: (error as any)?.constructor?.name || typeof error,
							status: (error as any)?.status,
							code: (error as any)?.code,
							timestamp: new Date().toISOString(),
						},
					});
				}
			}
		})();

		return true; // Keep message channel open for async response
	}

	return false; // No async response needed for other message types
});
