/** ------------------------------------------------------------------------
 * Form Filler
 * - Handles filling selected form fields with AI suggestions
 * ------------------------------------------------------------------------ */

export interface SelectedFieldData {
	id: string;
	value: string;
	fieldName?: string;
}

export interface FillResponse {
	success: boolean;
	filledCount?: number;
	errors?: string[];
	error?: string;
}

/**
 * Check if content script is loaded and responsive
 */
async function pingContentScript(): Promise<void> {
	return new Promise((resolve, reject) => {
		chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
			if (!tabs[0]?.id) {
				reject(new Error("No active tab found"));
				return;
			}

			const timeoutId = setTimeout(() => {
				reject(new Error("Content script ping timeout"));
			}, 5000);

			chrome.tabs.sendMessage(tabs[0].id, { type: "PING" }, (response) => {
				clearTimeout(timeoutId);
				if (chrome.runtime.lastError) {
					reject(new Error("Content script not responding"));
				} else {
					resolve();
				}
			});
		});
	});
}

/**
 * Fill selected fields in the active tab
 */
export async function fillSelectedFields(
	selectedFields: SelectedFieldData[]
): Promise<FillResponse> {
	console.log("🔄 [FORM-FILLER] Filling selected fields:", selectedFields);

	// First, check if content script is loaded
	try {
		await pingContentScript();
	} catch (error) {
		throw new Error(
			"Content script not loaded. Please refresh the page and try again."
		);
	}

	return new Promise((resolve, reject) => {
		chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
			if (!tabs[0]?.id) {
				reject(new Error("No active tab found"));
				return;
			}

			// Set up a timeout to prevent hanging
			const timeoutId = setTimeout(() => {
				reject(
					new Error("Form filling operation timed out. Please try again.")
				);
			}, 30000); // 30 second timeout

			chrome.tabs.sendMessage(
				tabs[0].id,
				{
					type: "FILL_SELECTED_FIELDS",
					selectedFields,
				},
				(response: FillResponse) => {
					clearTimeout(timeoutId);

					if (chrome.runtime.lastError) {
						console.error(
							"🚨 [FORM-FILLER] Chrome runtime error:",
							chrome.runtime.lastError
						);
						reject(
							new Error(
								`Chrome runtime error: ${chrome.runtime.lastError.message}`
							)
						);
					} else if (!response) {
						reject(
							new Error(
								"No response received from content script. Make sure the page is fully loaded."
							)
						);
					} else if (response.success) {
						console.log(
							"✅ [FORM-FILLER] Fill operation successful:",
							response
						);
						resolve(response);
					} else {
						console.error("❌ [FORM-FILLER] Fill operation failed:", response);
						reject(new Error(response.error || "Failed to fill fields"));
					}
				}
			);
		});
	});
}

/**
 * Get selected fields from the UI
 */
export function getSelectedFields(): SelectedFieldData[] {
	const selectedFields: SelectedFieldData[] = [];
	const tbody = document.querySelector("tbody");

	if (!tbody) {
		console.warn("⚠️ [FORM-FILLER] Table body not found");
		return selectedFields;
	}

	const rows = tbody.querySelectorAll("tr");

	rows.forEach((row, index) => {
		const checkbox = row.querySelector(
			"input[type='checkbox']"
		) as HTMLInputElement;
		const valueBubble = row.querySelector(".value-bubble") as HTMLElement;
		const fieldNameElement = row.querySelector(".field-name") as HTMLElement;

		if (checkbox && checkbox.checked && valueBubble && fieldNameElement) {
			const value = valueBubble.textContent?.trim();
			const fieldName = fieldNameElement.textContent?.trim();

			if (value && fieldName && value !== "No suggestion") {
				selectedFields.push({
					id: `field-${index + 1}`, // This should match the ID assigned in content script
					value: value,
					fieldName: fieldName,
				});
			}
		}
	});

	console.log("📋 [FORM-FILLER] Selected fields:", selectedFields);
	return selectedFields;
}

/**
 * Update the Fill Selected button text and state
 */
export function updateFillSelectedButton(selectedCount: number): void {
	const fillBtn = document.getElementById(
		"fill-selected-btn"
	) as HTMLButtonElement;

	if (fillBtn) {
		fillBtn.textContent = `Fill Selected (${selectedCount})`;
		fillBtn.disabled = selectedCount === 0;

		if (selectedCount === 0) {
			fillBtn.classList.add("disabled");
		} else {
			fillBtn.classList.remove("disabled");
		}
	}
}

/**
 * Show success/error message for form filling
 */
export function showFillResult(result: FillResponse): void {
	if (result.success && result.filledCount !== undefined) {
		const message =
			result.errors && result.errors.length > 0
				? `✅ Filled ${result.filledCount} fields successfully!\n⚠️ ${result.errors.length} fields could not be filled.`
				: `✅ Successfully filled all ${result.filledCount} fields!`;

		alert(message);

		if (result.errors && result.errors.length > 0) {
			console.warn("⚠️ [FORM-FILLER] Fill errors:", result.errors);
		}
	} else {
		const errorMsg = result.error || "Unknown error";
		let userMessage = `❌ Failed to fill fields: ${errorMsg}`;

		// Add helpful suggestions based on error type
		if (errorMsg.includes("Content script not loaded")) {
			userMessage +=
				"\n\n💡 Try refreshing the page and scanning for fields again.";
		} else if (errorMsg.includes("timed out")) {
			userMessage +=
				"\n\n💡 The page might be slow to respond. Try again in a moment.";
		} else if (errorMsg.includes("No active tab")) {
			userMessage +=
				"\n\n💡 Make sure you're on the form page you want to fill.";
		}

		alert(userMessage);
	}
}
