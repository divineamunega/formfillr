/** ------------------------------------------------------------------------
 * UI Updater
 * - Handles updating the UI with AI suggestions and visual feedback
 * ------------------------------------------------------------------------ */

import type { FormField } from "./field-manager.js";
import { updateFillSelectedButton } from "./form-filler.js";

/**
 * Safely convert a value to lowercase string
 */
function safeToLowerCase(value: any): string | null {
	if (value == null) return null;
	return value.toString().toLowerCase();
}

/**
 * Update the Fill Selected button state based on checked checkboxes
 */
function updateFillButtonState(): void {
	const checkboxes = document.querySelectorAll('input[type="checkbox"]');
	const checkedCount = Array.from(checkboxes).filter(
		(cb: Element) => (cb as HTMLInputElement).checked
	).length;
	updateFillSelectedButton(checkedCount);
}

export interface Suggestion {
	// Support both formats for backward compatibility
	fieldName?: string;
	suggestedValue?: string;
	// New format from AI
	id?: string;
	value?: string;
	confidence?: number;
}

/**
 * Update the UI with AI suggestions
 */
export function updateUIWithSuggestions(
	suggestions: Suggestion[],
	fields: FormField[]
): void {
	try {
		console.log("🎨 [UI] Updating UI with suggestions:", suggestions);
		console.log("🎨 [UI] Fields:", fields);

		if (!Array.isArray(suggestions)) {
			console.error("❌ [UI] Suggestions is not an array:", suggestions);
			return;
		}

		if (!Array.isArray(fields)) {
			console.error("❌ [UI] Fields is not an array:", fields);
			return;
		}

		const tbody = document.querySelector("tbody");
		if (!tbody) {
			console.error("❌ [UI] Table body not found");
			return;
		}

		const rows = tbody.querySelectorAll("tr");

		// Create a map of suggestions by field identifier for quick lookup
		const suggestionMap = new Map<string, Suggestion>();
		suggestions.forEach((suggestion, index) => {
			console.log(`🔍 [UI] Processing suggestion ${index}:`, suggestion);

			// Support both old and new formats
			const fieldId = suggestion.id || suggestion.fieldName;
			const fieldValue = suggestion.value || suggestion.suggestedValue;

			if (fieldId && fieldValue) {
				// Try to match by ID first, then by name (case insensitive)
				const fieldKey = safeToLowerCase(fieldId);
				if (fieldKey) {
					suggestionMap.set(fieldKey, suggestion);
					console.log(`✅ [UI] Added suggestion for field: ${fieldKey}`);
				}
			} else {
				console.warn(
					`⚠️ [UI] Invalid suggestion at index ${index}:`,
					suggestion
				);
			}
		});
		console.log("🗺️ [UI] Final suggestion map:", suggestionMap);

		// Update each row with matching suggestions
		rows.forEach((row, index) => {
			if (index >= fields.length) return;

			const field = fields[index];
			console.log(`🔍 [UI] Processing field ${index}:`, field);

			// Try to find a matching suggestion by various field identifiers
			let matchingSuggestion =
				(field.id && suggestionMap.get(safeToLowerCase(field.id) || "")) ||
				(field.name && suggestionMap.get(safeToLowerCase(field.name) || "")) ||
				(field.label && suggestionMap.get(safeToLowerCase(field.label) || ""));

			// If no exact match, try partial matching
			if (!matchingSuggestion) {
				const fieldIdentifiers = [
					field.id,
					field.name,
					field.label,
					field.placeholder,
				]
					.map(safeToLowerCase)
					.filter(Boolean) as string[];

				for (const [suggestionKey, suggestion] of suggestionMap) {
					for (const fieldId of fieldIdentifiers) {
						if (
							fieldId.includes(suggestionKey) ||
							suggestionKey.includes(fieldId)
						) {
							matchingSuggestion = suggestion;
							console.log(
								`🎯 [UI] Found partial match: ${suggestionKey} ↔ ${fieldId}`
							);
							break;
						}
					}
					if (matchingSuggestion) break;
				}
			}

			console.log(`🔍 [UI] Field ${index} match result:`, matchingSuggestion);
			updateRowWithSuggestion(row, matchingSuggestion);
		});

		// Show the initially hidden header columns
		showHiddenColumns();

		// Update the Fill Selected button state
		updateFillButtonState();

		console.log("✅ [UI] UI updated with suggestions");
	} catch (error) {
		console.error("❌ [UI] Error updating UI with suggestions:", error);
		throw error;
	}
}

/**
 * Show the initially hidden columns in the table header
 */
function showHiddenColumns(): void {
	const hiddenHeaders = document.querySelectorAll("thead .initially-hidden");
	console.log(`🔧 [UI] Found ${hiddenHeaders.length} initially-hidden headers`);
	hiddenHeaders.forEach((header, index) => {
		console.log(`🔧 [UI] Showing header ${index}:`, header);
		(header as HTMLElement).style.display = "table-cell";
	});
}

function updateRowWithSuggestion(row: Element, suggestion?: Suggestion): void {
	console.log("🔧 [UI] Updating row with suggestion:", suggestion);

	// Update the row with suggestion data
	const valueBubble = row.querySelector(".value-bubble") as HTMLElement;
	const confidenceDiv = row.querySelector(".confidence > div") as HTMLElement;
	const confidenceFill = row.querySelector(".conf-fill") as HTMLElement;
	const checkbox = row.querySelector(
		"input[type='checkbox']"
	) as HTMLInputElement;

	console.log("🔧 [UI] Found elements:", {
		valueBubble: !!valueBubble,
		confidenceDiv: !!confidenceDiv,
		confidenceFill: !!confidenceFill,
		checkbox: !!checkbox,
	});

	if (suggestion) {
		// Get the suggested value (support both formats)
		const suggestedValue = suggestion.value || suggestion.suggestedValue;

		// Show suggested value
		if (valueBubble && suggestedValue) {
			valueBubble.textContent = suggestedValue;
			valueBubble.style.background = "rgba(124, 92, 255, 0.1)";
			valueBubble.style.color = "var(--accent)";
			valueBubble.style.padding = "4px 8px";
			valueBubble.style.borderRadius = "4px";
			valueBubble.style.fontSize = "12px";
		}

		// Show confidence
		const confidence = suggestion.confidence || 0.8;
		if (confidenceDiv) {
			confidenceDiv.textContent = `${Math.round(confidence * 100)}%`;
		}
		if (confidenceFill) {
			confidenceFill.style.width = `${confidence * 100}%`;
			confidenceFill.style.background =
				confidence > 0.7
					? "var(--accent)"
					: confidence > 0.4
					? "#fbbf24"
					: "#ef4444";
		}

		// Check the checkbox by default for high-confidence suggestions
		if (checkbox && confidence > 0.6) {
			checkbox.checked = true;
			// Add checked class for styling fallback
			const checkboxLabel = checkbox.closest(".checkbox");
			if (checkboxLabel) {
				checkboxLabel.classList.add("checked");
			}
		}

		// Add event listener for checkbox state changes
		if (checkbox) {
			checkbox.addEventListener("change", () => {
				const checkboxLabel = checkbox.closest(".checkbox");
				if (checkboxLabel) {
					if (checkbox.checked) {
						checkboxLabel.classList.add("checked");
					} else {
						checkboxLabel.classList.remove("checked");
					}
				}

				// Update the Fill Selected button
				updateFillButtonState();
			});
		}

		// Show the initially hidden columns
		const hiddenCells = row.querySelectorAll(".initially-hidden");
		console.log(`🔧 [UI] Found ${hiddenCells.length} initially-hidden cells`);
		hiddenCells.forEach((cell, index) => {
			console.log(`🔧 [UI] Showing cell ${index}:`, cell);
			(cell as HTMLElement).style.display = "table-cell";
		});
	} else {
		// No suggestion found - show placeholder
		if (valueBubble) {
			valueBubble.textContent = "No suggestion";
			valueBubble.style.color = "var(--muted)";
			valueBubble.style.background = "transparent";
		}
		if (confidenceDiv) {
			confidenceDiv.textContent = "0%";
		}
		if (confidenceFill) {
			confidenceFill.style.width = "0%";
		}
	}
}

/**
 * Show loading state on button
 */
export function showButtonLoading(
	button: HTMLElement,
	loadingText: string = "Loading..."
): void {
	button.textContent = loadingText;
	button.setAttribute("disabled", "true");
}

/**
 * Reset button to original state
 */
export function resetButton(button: HTMLElement, originalText: string): void {
	button.textContent = originalText;
	button.removeAttribute("disabled");
}
