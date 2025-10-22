/** ------------------------------------------------------------------------
 * AI Suggestions Manager
 * - Handles AI suggestion requests and responses
 * ------------------------------------------------------------------------ */

import type { FormField } from "./field-manager.js";
import type { Suggestion } from "./ui-updater.js";

export interface SuggestionsResponse {
	suggestions?: Suggestion[];
	error?: string;
}

/**
 * Request AI suggestions from the background script
 */
export async function requestAISuggestions(
	fields: FormField[]
): Promise<Suggestion[]> {
	console.log("🤖 [AI] Requesting AI suggestions for fields:", fields);

	const response = await new Promise<SuggestionsResponse>((resolve, reject) => {
		chrome.runtime.sendMessage(
			{ type: "GET_AI_SUGGESTIONS", fields },
			(response: SuggestionsResponse) => {
				if (chrome.runtime.lastError) {
					reject(
						new Error(
							`Chrome runtime error: ${chrome.runtime.lastError.message}`
						)
					);
				} else if (response.error) {
					reject(new Error(response.error));
				} else {
					resolve(response);
				}
			}
		);
	});

	console.log("📥 [AI] AI suggestions received:", response);

	if (response.suggestions && Array.isArray(response.suggestions)) {
		return response.suggestions;
	} else {
		console.warn("⚠️ [AI] No valid suggestions received:", response);
		throw new Error("No suggestions were generated. Please try again.");
	}
}

/**
 * Handle AI suggestions request with error handling
 */
export async function handleAISuggestionsRequest(
	fields: FormField[],
	onSuccess: (suggestions: Suggestion[]) => void,
	onError: (error: string) => void
): Promise<void> {
	try {
		const suggestions = await requestAISuggestions(fields);
		onSuccess(suggestions);
	} catch (error) {
		console.error("❌ [AI] Failed to get AI suggestions:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error occurred";
		onError(errorMessage);
	}
}
