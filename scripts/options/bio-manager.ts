/** ------------------------------------------------------------------------
 * Bio Management
 * - Handles bio display, editing, and mode switching
 * ------------------------------------------------------------------------ */

import { $, type DOMRefs } from "./dom-utils.js";
import {
	initAIInterview,
	startInterview,
	regenerateBio,
} from "./ai-interview.js";
import { isDebugMode, debugLog } from "./debug-utils.js";

const defaultBioText = `Write about your professional background, key skills, achievements, interests, and what makes you unique. This helps FormFillr answer complex form questions about your goals, experiences, and personality.`;

let domRefs: DOMRefs;

export function initBioManager(refs: DOMRefs): void {
	domRefs = refs;
	initAIInterview(refs, showBioPreview);
	bindEvents();
}

export function getDefaultBioText(): string {
	return defaultBioText;
}

export function showManualBio(): void {
	const { aiInterviewContainer, bioPreviewContainer, manualBioContainer } =
		domRefs;

	// Hide others, show manual
	aiInterviewContainer.classList.add("hidden");
	bioPreviewContainer.classList.add("hidden");
	manualBioContainer.classList.remove("hidden");
}

export function showBioPreview(bio: string): void {
	const { bioPreview, aiInterviewContainer, bioPreviewContainer } = domRefs;

	bioPreview.textContent = bio;

	// Hide interview, show preview
	aiInterviewContainer.classList.add("hidden");
	bioPreviewContainer.classList.remove("hidden");
}

export function editBio(): void {
	const { bioPreview } = domRefs;

	// Switch to manual mode with current bio content
	const currentBio = bioPreview.textContent || "";
	($("bio") as HTMLTextAreaElement).value = currentBio;
	showManualBio();
}

export async function handleRegenerateBio(): Promise<void> {
	const newBio = await regenerateBio();
	if (newBio) {
		showBioPreview(newBio);
	}
}

export function acceptBio(): void {
	const { bioPreview, bioPreviewContainer } = domRefs;
	const bio = bioPreview.textContent || "";
	($("bio") as HTMLTextAreaElement).value = bio;

	// Hide preview, show success message
	bioPreviewContainer.classList.add("hidden");

	// Show a brief success message
	const successMsg = document.createElement("div");
	successMsg.className = "success-message";
	successMsg.textContent = "✅ Bio saved! You can edit it anytime.";
	successMsg.style.cssText =
		"padding: 12px; background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.2); border-radius: 8px; color: #22c55e; margin: 16px 0;";

	bioPreviewContainer.parentNode?.insertBefore(successMsg, bioPreviewContainer);

	setTimeout(() => {
		successMsg.remove();
	}, 3000);
}

function bindEvents(): void {
	const {
		aiInterviewBtn,
		manualBioBtn,
		editBioBtn,
		regenerateBioBtn,
		acceptBioBtn,
	} = domRefs;

	// Bio interface interactions
	aiInterviewBtn.addEventListener("click", startInterview);
	manualBioBtn.addEventListener("click", showManualBio);
	editBioBtn.addEventListener("click", editBio);
	regenerateBioBtn.addEventListener("click", handleRegenerateBio);
	acceptBioBtn.addEventListener("click", acceptBio);

	// Debug tools (only if debug mode is enabled)
	if (isDebugMode()) {
		debugLog("Initializing debug tools");

		const testBioBtn = $("test-bio-btn");
		const clearLogsBtn = $("clear-logs-btn");
		const debugOutput = $("debug-output");

		if (testBioBtn) {
			testBioBtn.addEventListener("click", async () => {
				console.log("🧪 Starting debug bio generation test...");
				debugOutput.style.display = "block";
				debugOutput.textContent = "🔄 Testing bio generation...\n";

				try {
					const testPrompt = `Based on these interview answers, create a comprehensive professional bio (2-3 paragraphs):

Q: What's your current role and what do you do day-to-day?
A: I'm a software engineer working on web applications and APIs.

Q: What are your key skills and areas of expertise?
A: JavaScript, TypeScript, React, Node.js, and database design.

Create a bio that is 150-300 words.

Bio:`;

					const startTime = Date.now();

					// Test the chrome.runtime.sendMessage directly
					chrome.runtime.sendMessage(
						{
							type: "GENERATE_BIO",
							prompt: testPrompt,
						},
						(response) => {
							const duration = Date.now() - startTime;

							debugOutput.textContent += `⏱️ Request took ${duration}ms\n`;
							debugOutput.textContent += `📥 Response: ${JSON.stringify(
								response,
								null,
								2
							)}\n`;

							if (chrome.runtime.lastError) {
								debugOutput.textContent += `❌ Chrome runtime error: ${chrome.runtime.lastError.message}\n`;
							} else if (response?.success) {
								debugOutput.textContent += `✅ Success! Bio length: ${
									response.bio?.length || 0
								} characters\n`;
								debugOutput.textContent += `📄 Bio preview: ${response.bio?.substring(
									0,
									100
								)}...\n`;
							} else {
								debugOutput.textContent += `❌ Failed: ${
									response?.error || "Unknown error"
								}\n`;
								debugOutput.textContent += `🔍 Debug info: ${JSON.stringify(
									response?.debugInfo,
									null,
									2
								)}\n`;
							}

							debugOutput.scrollTop = debugOutput.scrollHeight;
						}
					);
				} catch (error) {
					debugOutput.textContent += `💥 Test error: ${error}\n`;
					debugOutput.scrollTop = debugOutput.scrollHeight;
				}
			});
		}

		if (clearLogsBtn) {
			clearLogsBtn.addEventListener("click", () => {
				console.clear();
				debugOutput.textContent = "Console cleared.\n";
				setTimeout(() => {
					debugOutput.style.display = "none";
				}, 1000);
			});
		}
	}
}
