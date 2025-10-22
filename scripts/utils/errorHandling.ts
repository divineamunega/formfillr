// Utility functions for consistent error handling across the extension

export interface RetryConfig {
	maxRetries: number;
	baseDelay: number;
	maxDelay?: number;
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
	maxRetries: 3,
	baseDelay: 1000,
	maxDelay: 10000,
};

// Check if an error is likely network-related and retryable
export function isNetworkError(error: any): boolean {
	if (!error) return false;

	const message = error.message?.toLowerCase() || "";
	const code = error.code?.toLowerCase() || "";

	return (
		// Network-related error messages
		message.includes("connection") ||
		message.includes("timeout") ||
		message.includes("offline") ||
		message.includes("fetch") ||
		message.includes("network") ||
		// HTTP status codes that are retryable
		(error.status && [408, 429, 500, 502, 503, 504].includes(error.status)) ||
		// Network error codes
		code.includes("network") ||
		code === "enotfound" ||
		code === "econnreset"
	);
}

// Exponential backoff with jitter
export function calculateDelay(attempt: number, config: RetryConfig): number {
	const exponentialDelay = Math.min(
		config.baseDelay * Math.pow(2, attempt),
		config.maxDelay || config.baseDelay * 10
	);
	const jitter = Math.random() * 0.1 * exponentialDelay;
	return exponentialDelay + jitter;
}

// Generic retry wrapper
export async function withRetry<T>(
	operation: () => Promise<T>,
	config: RetryConfig = DEFAULT_RETRY_CONFIG,
	context: string = "Operation"
): Promise<T> {
	let lastError: Error = new Error("Unknown error occurred");

	for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
		try {
			return await operation();
		} catch (error) {
			lastError = error instanceof Error ? error : new Error(String(error));
			console.warn(
				`${context} attempt ${attempt + 1} failed:`,
				lastError.message
			);

			// Don't retry on the last attempt or for non-retryable errors
			if (attempt === config.maxRetries || !isNetworkError(lastError)) {
				break;
			}

			// Wait before retrying
			const delay = calculateDelay(attempt, config);
			await new Promise((resolve) => setTimeout(resolve, delay));
		}
	}

	throw lastError;
}

// Format error messages for user display
export function formatErrorForUser(error: any): string {
	if (!error) return "An unknown error occurred";

	const message = error.message || String(error);

	if (isNetworkError(error)) {
		return "Connection issue detected. Please check your internet connection and try again.";
	}

	// Remove technical details for user-friendly messages
	if (
		message.includes("API") ||
		message.includes("OpenAI") ||
		message.includes("OpenRouter")
	) {
		return "AI service is temporarily unavailable. Please try again later.";
	}

	return message;
}
