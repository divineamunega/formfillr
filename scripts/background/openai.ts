/// <reference types="vite/client" />

import { systemPrompt as SYSTEMPROMPT } from "./system";
import OpenAI from "openai";
const APIKEY = import.meta.env.VITE_API_KEY;

const openAi = new OpenAI({
	baseURL: "https://openrouter.ai/api/v1",
	apiKey: APIKEY,
});

// Retry configuration
const RETRY_CONFIG = {
	maxRetries: 3,
	baseDelay: 1000, // 1 second
	maxDelay: 10000, // 10 seconds
};

// Exponential backoff with jitter
const delay = (attempt: number): Promise<void> => {
	const exponentialDelay = Math.min(
		RETRY_CONFIG.baseDelay * Math.pow(2, attempt),
		RETRY_CONFIG.maxDelay
	);
	const jitter = Math.random() * 0.1 * exponentialDelay;
	return new Promise((resolve) =>
		setTimeout(resolve, exponentialDelay + jitter)
	);
};

// Check if error is retryable
const isRetryableError = (error: any): boolean => {
	if (!error) return false;

	// Network errors
	if (error.code === "NETWORK_ERROR" || error.message?.includes("fetch"))
		return true;

	// OpenAI/OpenRouter specific retryable errors
	if (error.status) {
		return [408, 429, 500, 502, 503, 504].includes(error.status);
	}

	// Generic connection errors
	return (
		error.message?.includes("connection") ||
		error.message?.includes("timeout") ||
		error.message?.includes("offline")
	);
};

// Generic retry wrapper
const withRetry = async <T>(
	operation: () => Promise<T>,
	context: string
): Promise<T> => {
	let lastError: any;

	console.log(
		`🔄 [RETRY] Starting ${context} with up to ${
			RETRY_CONFIG.maxRetries + 1
		} attempts`
	);

	for (let attempt = 0; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
		try {
			console.log(
				`🎯 [RETRY] ${context} attempt ${attempt + 1}/${
					RETRY_CONFIG.maxRetries + 1
				}`
			);
			const result = await operation();
			console.log(`✅ [RETRY] ${context} succeeded on attempt ${attempt + 1}`);
			return result;
		} catch (error) {
			lastError = error;
			const isRetryable = isRetryableError(error);

			console.error(`❌ [RETRY] ${context} attempt ${attempt + 1} failed:`, {
				error: (error as any)?.message || error,
				status: (error as any)?.status,
				code: (error as any)?.code,
				isRetryable,
				attemptsRemaining: RETRY_CONFIG.maxRetries - attempt,
			});

			if (attempt === RETRY_CONFIG.maxRetries || !isRetryable) {
				console.error(
					`🚫 [RETRY] ${context} giving up after ${attempt + 1} attempts`
				);
				break;
			}

			const delayMs = Math.min(
				RETRY_CONFIG.baseDelay * Math.pow(2, attempt),
				RETRY_CONFIG.maxDelay
			);
			console.log(`⏳ [RETRY] Waiting ${delayMs}ms before retry...`);
			await delay(attempt);
		}
	}

	console.error(`💥 [RETRY] ${context} failed permanently:`, lastError);
	throw lastError;
};

export const createSuggestions = async function (data: any) {
	return withRetry(async () => {
		const completion = await openAi.chat.completions.create(
			{
				model: "meta-llama/llama-4-maverick:free",
				messages: [
					{ role: "system", content: SYSTEMPROMPT },
					{ role: "user", content: data },
				],
			},
			{
				timeout: 30000, // 30 second timeout
			}
		);

		if (!completion.choices?.[0]?.message?.content) {
			throw new Error("Empty response from AI service");
		}

		return completion;
	}, "AI Suggestions");
};

export const generateBio = async function (prompt: string): Promise<string> {
	console.log("🤖 [OPENAI] Starting bio generation with OpenAI");
	console.log("📝 [OPENAI] Prompt length:", prompt.length);
	console.log("🔑 [OPENAI] API Key present:", !!APIKEY);
	console.log("🌐 [OPENAI] Base URL:", "https://openrouter.ai/api/v1");

	return withRetry(async () => {
		console.log("📤 [OPENAI] Making API request...");

		const requestConfig = {
			model: "meta-llama/llama-4-maverick:free",
			messages: [
				{
					role: "system" as const,
					content:
						"You are a professional bio writer. Create engaging, natural-sounding bios based on interview responses. Keep them concise but comprehensive, highlighting key strengths and personality.",
				},
				{ role: "user" as const, content: prompt },
			],
			max_completion_tokens: 500,
			temperature: 0.7,
		};

		console.log("⚙️ [OPENAI] Request config:", {
			model: requestConfig.model,
			messageCount: requestConfig.messages.length,
			maxTokens: requestConfig.max_completion_tokens,
			temperature: requestConfig.temperature,
		});

		const completion = await openAi.chat.completions.create(requestConfig, {
			timeout: 30000, // 30 second timeout
		});

		console.log("📥 [OPENAI] Raw completion response:", {
			id: completion.id,
			model: completion.model,
			choicesCount: completion.choices?.length || 0,
			usage: completion.usage,
			finishReason: completion.choices?.[0]?.finish_reason,
		});
		console.log(completion);
		if (!completion.choices || completion.choices.length === 0) {
			console.error("❌ [OPENAI] No choices in completion response");
			throw new Error("No choices returned from AI service");
		}

		const bioContent = completion.choices[0]?.message?.content?.trim();

		console.log("📄 [OPENAI] Bio content details:", {
			hasContent: !!bioContent,
			contentLength: bioContent?.length || 0,
			contentPreview: bioContent?.substring(0, 100) + "...",
		});

		if (!bioContent) {
			console.error("❌ [OPENAI] Empty bio content");
			throw new Error("Empty bio response from AI service");
		}

		console.log("✅ [OPENAI] Bio generation completed successfully");
		return bioContent;
	}, "Bio Generation");
};
