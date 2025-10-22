/** ------------------------------------------------------------------------
 * Persona Data Management
 * - Handles saving, loading, and resetting persona data
 * ------------------------------------------------------------------------ */

import { $ } from "./dom-utils.js";
import {
	getCustomFields,
	resetToDefaults,
	type CustomField,
} from "./custom-fields.js";

import {
	showSaveToast,
	showErrorToast,
	showInfoToast,
} from "./modal-manager.js";

export interface PersonaData {
	name: string;
	email: string;
	dob: string;
	gender: string;
	role: string;
	company: string;
	address: string;
	phone: string;
	bio: string;
	customFields: CustomField[];
}

/** Collect all persona data and save it. */
export async function savePersona(): Promise<void> {
	const saveBtn = $("save-persona") as HTMLButtonElement;
	const originalText = saveBtn.textContent;

	// Show loading state
	showLoadingState(saveBtn);

	try {
		const personaData: PersonaData = {
			name: ($("name") as HTMLInputElement).value,
			email: ($("email") as HTMLInputElement).value,
			dob: ($("dob") as HTMLInputElement).value,
			gender: ($("gender") as HTMLInputElement).value,
			role: ($("role") as HTMLInputElement).value,
			company: ($("company") as HTMLInputElement).value,
			address: ($("address") as HTMLInputElement).value,
			phone: ($("phone") as HTMLInputElement).value,
			bio: ($("bio") as HTMLInputElement).value,
			customFields: getCustomFields(),
		};

		console.log("--- Persona Saved (Placeholder) ---");
		console.log(personaData);
		const serializedPersonaData = JSON.stringify(personaData);

		// Add a small delay to show loading state
		await new Promise((resolve) => setTimeout(resolve, 800));
		await savePersonaData(serializedPersonaData);

		// Show success state
		showSuccessState(saveBtn);
		showSaveToast();

		// Reset button after delay
		setTimeout(() => {
			resetButtonState(saveBtn, originalText);
		}, 2000);
	} catch (error) {
		console.error("Failed to save persona:", error);

		// Show error state
		showErrorState(saveBtn);
		showErrorToast(
			error instanceof Error ? error.message : "Failed to save persona"
		);

		// Reset button after delay
		setTimeout(() => {
			resetButtonState(saveBtn, originalText);
		}, 3000);
	}
}

/** Load stored profile data from Chrome storage */
export async function loadProfile(): Promise<void> {
	const loadBtn = $("load-profile-btn") as HTMLButtonElement | null;
	const originalText = loadBtn?.textContent || "Load Profile";

	try {
		// Show loading state if button exists
		if (loadBtn) {
			showLoadingState(loadBtn, "Loading...");
		}

		const result = await chrome.storage.local.get("personaData");

		if (result.personaData) {
			const personaData: PersonaData = JSON.parse(result.personaData);
			await populateFormWithPersonaData(personaData);

			// Show success state
			if (loadBtn) {
				showSuccessState(loadBtn, "Loaded!");
				setTimeout(() => {
					resetButtonState(loadBtn, originalText);
				}, 2000);
			}

			console.log("✅ Profile loaded successfully");
		} else {
			console.log("⚠️ No stored persona data found");
			if (loadBtn) {
				showErrorState(loadBtn, "No Data");
				setTimeout(() => {
					resetButtonState(loadBtn, originalText);
				}, 2000);
			}
		}
	} catch (error) {
		console.error("❌ Failed to load profile:", error);
		if (loadBtn) {
			showErrorState(loadBtn, "Failed");
			setTimeout(() => {
				resetButtonState(loadBtn, originalText);
			}, 3000);
		}
		showErrorToast(
			error instanceof Error ? error.message : "Failed to load profile"
		);
	}
}

/** Automatically load stored persona data on page load */
export async function autoLoadPersona(): Promise<void> {
	try {
		console.log("🔄 Auto-loading stored persona data...");

		const result = await chrome.storage.local.get("personaData");

		if (result.personaData) {
			const personaData: PersonaData = JSON.parse(result.personaData);
			await populateFormWithPersonaData(personaData);
			console.log("✅ Auto-loaded persona data successfully");
			showInfoToast("Persona data loaded from storage");
		} else {
			console.log("ℹ️ No stored persona data found, using defaults");
		}
	} catch (error) {
		console.error("❌ Failed to auto-load persona:", error);
		// Don't show error toast for auto-load failures, just log them
	}
}

/** Clear all fields and delete stored persona data */
export async function clearAll(): Promise<void> {
	// Check if there's any data to clear
	const hasStoredData = await hasPersonaData();
	const hasFormData = checkFormHasData();

	if (!hasStoredData && !hasFormData) {
		showInfoToast("No persona data to clear");
		return;
	}

	// Show confirmation dialog
	const confirmed = confirm(
		"Are you sure you want to clear all persona data?\n\n" +
			"This will:\n" +
			"• Clear all form fields\n" +
			"• Delete your stored persona from browser storage\n" +
			"• Remove all custom fields\n\n" +
			"This action cannot be undone."
	);

	if (!confirmed) {
		return;
	}

	const clearBtn = $("clear-all-btn") as HTMLButtonElement;
	const originalText = clearBtn?.textContent || "Clear All";

	try {
		// Show loading state
		if (clearBtn) {
			showLoadingState(clearBtn, "Clearing...");
		}

		// Clear form fields
		($("name") as HTMLInputElement).value = "";
		($("email") as HTMLInputElement).value = "";
		($("dob") as HTMLInputElement).value = "";
		($("gender") as HTMLInputElement).value = "prefer_not_say";
		($("role") as HTMLInputElement).value = "";
		($("company") as HTMLInputElement).value = "";
		($("address") as HTMLInputElement).value = "";
		($("phone") as HTMLInputElement).value = "";
		($("bio") as HTMLInputElement).value = "";

		// Clear custom fields
		resetToDefaults();

		// Delete stored persona data from Chrome storage
		await deleteStoredPersonaData();

		// Show success state
		if (clearBtn) {
			showSuccessState(clearBtn, "Cleared!");
			setTimeout(() => {
				resetButtonState(clearBtn, originalText);
			}, 2000);
		}

		showInfoToast("All persona data cleared successfully");
		console.log("✅ All persona data cleared and deleted from storage");
	} catch (error) {
		console.error("❌ Failed to clear persona data:", error);

		if (clearBtn) {
			showErrorState(clearBtn, "Failed");
			setTimeout(() => {
				resetButtonState(clearBtn, originalText);
			}, 3000);
		}

		showErrorToast(
			error instanceof Error ? error.message : "Failed to clear persona data"
		);
	}
}

async function savePersonaData(data: string): Promise<void> {
	try {
		await chrome.storage.local.set({ personaData: data });
		console.log("Saved Persona Data");
	} catch (error) {
		console.error("Chrome storage error:", error);
		throw new Error("Failed to save to browser storage");
	}
}

/** Delete stored persona data from Chrome storage */
async function deleteStoredPersonaData(): Promise<void> {
	try {
		await chrome.storage.local.remove(["personaData"]);
		console.log("🗑️ Deleted stored persona data");
	} catch (error) {
		console.error("Chrome storage error:", error);
		throw new Error("Failed to delete persona data from browser storage");
	}
}

/** Check if there's any stored persona data */
async function hasPersonaData(): Promise<boolean> {
	try {
		const result = await chrome.storage.local.get("personaData");
		return !!result.personaData;
	} catch (error) {
		console.error("Error checking stored persona data:", error);
		return false;
	}
}

/** Check if form has any data entered */
function checkFormHasData(): boolean {
	const fields = [
		($("name") as HTMLInputElement).value,
		($("email") as HTMLInputElement).value,
		($("dob") as HTMLInputElement).value,
		($("role") as HTMLInputElement).value,
		($("company") as HTMLInputElement).value,
		($("address") as HTMLInputElement).value,
		($("phone") as HTMLInputElement).value,
		($("bio") as HTMLInputElement).value,
	];

	// Check if any field has content
	const hasFieldData = fields.some((value) => value.trim() !== "");

	// Check if gender is not default
	const genderValue = ($("gender") as HTMLInputElement).value;
	const hasGenderData = genderValue !== "prefer_not_say";

	// Check if there are custom fields
	const hasCustomFields = getCustomFields().length > 0;

	return hasFieldData || hasGenderData || hasCustomFields;
}

/** Populate form fields with persona data */
async function populateFormWithPersonaData(
	personaData: PersonaData
): Promise<void> {
	// Import setCustomFields function
	const { setCustomFields } = await import("./custom-fields.js");

	// Populate basic fields
	($("name") as HTMLInputElement).value = personaData.name || "";
	($("email") as HTMLInputElement).value = personaData.email || "";
	($("dob") as HTMLInputElement).value = personaData.dob || "";
	($("gender") as HTMLInputElement).value = personaData.gender || "";
	($("role") as HTMLInputElement).value = personaData.role || "";
	($("company") as HTMLInputElement).value = personaData.company || "";
	($("address") as HTMLInputElement).value = personaData.address || "";
	($("phone") as HTMLInputElement).value = personaData.phone || "";
	($("bio") as HTMLInputElement).value = personaData.bio || "";

	// Populate custom fields
	if (personaData.customFields && Array.isArray(personaData.customFields)) {
		setCustomFields(personaData.customFields);
	}
}

/** Show loading state on button */
function showLoadingState(
	button: HTMLButtonElement,
	text: string = "Saving..."
): void {
	button.disabled = true;
	button.innerHTML = `
		<span style="display: inline-flex; align-items: center; gap: 8px;">
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;">
				<path d="M21 12a9 9 0 11-6.219-8.56"/>
			</svg>
			${text}
		</span>
	`;

	// Add spin animation if not already present
	if (!document.querySelector("#spin-animation")) {
		const style = document.createElement("style");
		style.id = "spin-animation";
		style.textContent = `
			@keyframes spin {
				from { transform: rotate(0deg); }
				to { transform: rotate(360deg); }
			}
		`;
		document.head.appendChild(style);
	}
}

/** Show success state on button */
function showSuccessState(
	button: HTMLButtonElement,
	text: string = "Saved!"
): void {
	button.innerHTML = `
		<span style="display: inline-flex; align-items: center; gap: 8px;">
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M20 6L9 17l-5-5"/>
			</svg>
			${text}
		</span>
	`;
	button.style.backgroundColor = "#22c55e";
}

/** Show error state on button */
function showErrorState(
	button: HTMLButtonElement,
	text: string = "Failed"
): void {
	button.innerHTML = `
		<span style="display: inline-flex; align-items: center; gap: 8px;">
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<circle cx="12" cy="12" r="10"/>
				<line x1="15" y1="9" x2="9" y2="15"/>
				<line x1="9" y1="9" x2="15" y2="15"/>
			</svg>
			${text}
		</span>
	`;
	button.style.backgroundColor = "#ef4444";
}

/** Reset button to original state */
function resetButtonState(
	button: HTMLButtonElement,
	originalText: string | null
): void {
	button.disabled = false;
	button.textContent = originalText || "Save Persona";
	button.style.backgroundColor = "";
}
