/** ------------------------------------------------------------------------
 * API Key Management
 * - Handles secure storage and retrieval of user-provided API keys
 * ------------------------------------------------------------------------ */

export interface APIKeyConfig {
	openRouterKey?: string;
	isConfigured: boolean;
}

/**
 * Get stored API key configuration
 */
export async function getAPIKeyConfig(): Promise<APIKeyConfig> {
	try {
		const result = await chrome.storage.local.get(["apiKeys"]);
		return result.apiKeys || { isConfigured: false };
	} catch (error) {
		console.error("Failed to get API key config:", error);
		return { isConfigured: false };
	}
}

/**
 * Save API key configuration
 */
export async function saveAPIKeyConfig(config: APIKeyConfig): Promise<void> {
	try {
		await chrome.storage.local.set({ apiKeys: config });
		console.log("API key configuration saved");
	} catch (error) {
		console.error("Failed to save API key config:", error);
		throw error;
	}
}

/**
 * Check if API keys are configured
 */
export async function isAPIConfigured(): Promise<boolean> {
	const config = await getAPIKeyConfig();
	return config.isConfigured && !!config.openRouterKey;
}

/**
 * Get the OpenRouter API key
 */
export async function getOpenRouterKey(): Promise<string | null> {
	const config = await getAPIKeyConfig();
	return config.openRouterKey || null;
}

/**
 * Validate API key format
 */
export function validateAPIKey(key: string): boolean {
	// Basic validation - adjust based on OpenRouter's key format
	return key.length > 10 && key.startsWith("sk-");
}

/**
 * Clear all stored API keys
 */
export async function clearAPIKeys(): Promise<void> {
	try {
		await chrome.storage.local.remove(["apiKeys"]);
		console.log("API keys cleared");
	} catch (error) {
		console.error("Failed to clear API keys:", error);
		throw error;
	}
}
