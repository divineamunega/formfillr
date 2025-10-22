/** ------------------------------------------------------------------------
 * Popup Main Entry Point
 * - Orchestrates all popup modules for maintainable code organization
 * ------------------------------------------------------------------------ */

import { getDOMReferences } from "./dom-utils.js";
import {
	initFieldManager,
	fetchAndRenderFields,
	getFields,
} from "./field-manager.js";
import {
	updateUIWithSuggestions,
	showButtonLoading,
	resetButton,
} from "./ui-updater.js";
import { handleAISuggestionsRequest } from "./ai-suggestions.js";
import {
	fillSelectedFields,
	getSelectedFields,
	showFillResult,
} from "./form-filler.js";

// Initialize all modules
document.addEventListener("DOMContentLoaded", () => {
	const domRefs = getDOMReferences();

	// Initialize field manager
	initFieldManager(domRefs);

	// Bind event handlers
	bindEventHandlers(domRefs);

	// Fetch fields on initial load
	fetchAndRenderFields();
});

function bindEventHandlers(domRefs: ReturnType<typeof getDOMReferences>): void {
	const { scanButton, getAiSuggestionsButton, fillSelectedBtn } = domRefs;

	// Scan button event
	if (scanButton) {
		scanButton.addEventListener("click", (e) => {
			e.preventDefault();
			console.log("🔍 [SCAN] Scan button clicked");
			fetchAndRenderFields();
		});
	}

	// AI suggestions button event
	if (getAiSuggestionsButton) {
		getAiSuggestionsButton.addEventListener("click", async () => {
			const originalText =
				getAiSuggestionsButton.textContent || "Get AI Suggestions";

			// Show loading state
			showButtonLoading(getAiSuggestionsButton, "Loading...");

			await handleAISuggestionsRequest(
				getFields(),
				// Success callback
				(suggestions) => {
					console.log("🎯 [SUCCESS] Real suggestions received:", suggestions);
					updateUIWithSuggestions(suggestions, getFields());
				},
				// Error callback
				(errorMessage) => {
					console.error("❌ [ERROR] AI suggestions failed:", errorMessage);
					// Show error to user (you might want to add a proper error display element)
					alert(`Failed to get AI suggestions: ${errorMessage}`);
				}
			);

			// Reset button state
			resetButton(getAiSuggestionsButton, originalText);
		});
	}

	// Fill Selected button event
	if (fillSelectedBtn) {
		fillSelectedBtn.addEventListener("click", async () => {
			const originalText = fillSelectedBtn.textContent || "Fill Selected";

			// Show loading state
			showButtonLoading(fillSelectedBtn, "Filling...");

			try {
				const selectedFields = getSelectedFields();

				if (selectedFields.length === 0) {
					alert("Please select at least one field to fill.");
					return;
				}

				console.log(
					"🔄 [FILL] Starting form fill with selected fields:",
					selectedFields
				);
				const result = await fillSelectedFields(selectedFields);

				console.log("✅ [FILL] Form fill completed:", result);
				showFillResult(result);
			} catch (error) {
				console.error("❌ [FILL] Form fill failed:", error);
				const errorMessage =
					error instanceof Error ? error.message : "Unknown error occurred";
				alert(`Failed to fill form: ${errorMessage}`);
			} finally {
				// Reset button state
				resetButton(fillSelectedBtn, originalText);
			}
		});
	}
}
