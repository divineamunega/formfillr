/** ------------------------------------------------------------------------
 * API Setup Component
 * - Handles API key configuration UI and validation
 * ------------------------------------------------------------------------ */

import { $ } from "./dom-utils.js";
import {
	getAPIKeyConfig,
	saveAPIKeyConfig,
	validateAPIKey,
	clearAPIKeys,
	type APIKeyConfig,
} from "./api-key-manager.js";
import {
	showSaveToast,
	showErrorToast,
	showInfoToast,
} from "./modal-manager.js";

let isSetupMode = false;

export async function initAPISetup(): Promise<void> {
	await checkAPIConfiguration();
	bindAPISetupEvents();
}

/**
 * Check if API is configured and show setup if needed
 */
async function checkAPIConfiguration(): Promise<void> {
	try {
		const config = await getAPIKeyConfig();

		if (!config.isConfigured) {
			showAPISetupModal();
		} else {
			hideAPISetupModal();
		}
	} catch (error) {
		console.error("Failed to check API configuration:", error);
		showAPISetupModal();
	}
}

/**
 * Show API setup modal
 */
function showAPISetupModal(): void {
	isSetupMode = true;
	const setupModal = getOrCreateSetupModal();
	setupModal.style.display = "flex";
}

/**
 * Hide API setup modal
 */
function hideAPISetupModal(): void {
	isSetupMode = false;
	const setupModal = $("api-setup-modal");
	if (setupModal) {
		setupModal.style.display = "none";
	}
}

/**
 * Create API setup modal if it doesn't exist
 */
function getOrCreateSetupModal(): HTMLElement {
	let modal = $("api-setup-modal");

	if (!modal) {
		modal = document.createElement("div");
		modal.id = "api-setup-modal";
		modal.className = "modal-backdrop";
		modal.innerHTML = `
			<div class="modal-content">
				<div class="modal-header">
					<h2 class="modal-title">🔑 API Configuration Required</h2>
				</div>
				<div class="modal-body">
					<p>FormFillr requires an OpenRouter API key to generate AI suggestions.</p>
					
					<div class="setup-steps">
						<h3>Setup Steps:</h3>
						<ol>
							<li>Visit <a href="https://openrouter.ai" target="_blank">OpenRouter.ai</a></li>
							<li>Create an account or sign in</li>
							<li>Go to "Keys" section</li>
							<li>Create a new API key</li>
							<li>Copy and paste it below</li>
						</ol>
					</div>
					
					<div class="form-group">
						<label for="openrouter-key">OpenRouter API Key:</label>
						<input type="password" id="openrouter-key" placeholder="sk-or-..." />
						<small>Your API key is stored locally and never shared.</small>
					</div>
					
					<div class="api-setup-actions">
						<button id="save-api-key" class="btn primary">Save Configuration</button>
						<button id="skip-api-setup" class="btn secondary">Skip (Limited Features)</button>
					</div>
				</div>
			</div>
		`;
		document.body.appendChild(modal);
	}

	return modal;
}

/**
 * Bind API setup event handlers
 */
function bindAPISetupEvents(): void {
	document.addEventListener("click", async (e) => {
		const target = e.target as HTMLElement;

		if (target.id === "save-api-key") {
			await handleSaveAPIKey();
		} else if (target.id === "skip-api-setup") {
			handleSkipSetup();
		} else if (target.id === "configure-api-btn") {
			showAPISetupModal();
		} else if (target.id === "clear-api-keys") {
			await handleClearAPIKeys();
		}
	});
}

/**
 * Handle saving API key
 */
async function handleSaveAPIKey(): Promise<void> {
	const keyInput = $("openrouter-key") as HTMLInputElement;
	const apiKey = keyInput?.value?.trim();

	if (!apiKey) {
		showErrorToast("Please enter an API key");
		return;
	}

	if (!validateAPIKey(apiKey)) {
		showErrorToast(
			'Invalid API key format. OpenRouter keys should start with "sk-"'
		);
		return;
	}

	try {
		const config: APIKeyConfig = {
			openRouterKey: apiKey,
			isConfigured: true,
		};

		await saveAPIKeyConfig(config);
		showSaveToast();
		hideAPISetupModal();

		// Clear the input for security
		if (keyInput) keyInput.value = "";

		showInfoToast(
			"API key configured successfully! You can now use AI features."
		);
	} catch (error) {
		console.error("Failed to save API key:", error);
		showErrorToast("Failed to save API key. Please try again.");
	}
}

/**
 * Handle skipping API setup
 */
function handleSkipSetup(): void {
	hideAPISetupModal();
	showInfoToast(
		"API setup skipped. AI features will be unavailable until configured."
	);
}

/**
 * Handle clearing API keys
 */
async function handleClearAPIKeys(): Promise<void> {
	if (
		!confirm(
			"Are you sure you want to clear all API keys? This will disable AI features."
		)
	) {
		return;
	}

	try {
		await clearAPIKeys();
		showInfoToast("API keys cleared successfully");
		showAPISetupModal();
	} catch (error) {
		console.error("Failed to clear API keys:", error);
		showErrorToast("Failed to clear API keys");
	}
}

/**
 * Add API configuration section to options page
 */
export function addAPIConfigSection(): void {
	const container = document.querySelector(".page");
	if (!container) return;

	const apiSection = document.createElement("div");
	apiSection.className = "card";
	apiSection.innerHTML = `
		<div class="section-title">🔑 API Configuration</div>
		<p>Configure your API keys for AI-powered features.</p>
		
		<div class="actions">
			<button id="configure-api-btn" class="btn secondary">Configure API Keys</button>
			<button id="clear-api-keys" class="btn secondary">Clear API Keys</button>
		</div>
	`;

	// Insert before the last card (actions)
	const lastCard = container.querySelector(".card:last-child");
	if (lastCard) {
		container.insertBefore(apiSection, lastCard);
	} else {
		container.appendChild(apiSection);
	}
}
