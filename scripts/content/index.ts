console.log("🚀 [CONTENT] FormFillr content script loaded");

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
	console.log("📨 [CONTENT] Message received:", msg.type);

	if (msg.type === "PING") {
		console.log("🏓 [CONTENT] Ping received, responding...");
		sendResponse({ pong: true });
		return false; // Synchronous response
	}

	if (msg.type === "GET_FIELDS") {
		try {
			const fields = detectFormFields();
			console.log("📋 [CONTENT] Detected fields:", fields);
			sendResponse(fields);
		} catch (error) {
			console.error("❌ [CONTENT] Error detecting fields:", error);
			sendResponse([]);
		}
		return false; // Synchronous response
	}

	if (msg.type === "FILL_SELECTED_FIELDS") {
		console.log("🔄 [CONTENT] Starting async fill operation...");

		// Handle async operation
		(async () => {
			try {
				// Add a small delay to ensure DOM is ready
				await new Promise((resolve) => setTimeout(resolve, 100));

				const result = await fillSelectedFieldsAsync(msg.selectedFields);
				console.log("✅ [CONTENT] Fill operation completed:", result);

				sendResponse({
					success: true,
					filledCount: result.filledCount,
					errors: result.errors,
				});
			} catch (error) {
				console.error("❌ [CONTENT] Error filling fields:", error);
				sendResponse({
					success: false,
					error: error instanceof Error ? error.message : "Unknown error",
				});
			}
		})();

		return true; // Async response
	}

	return false; // No response needed
});

function detectFormFields() {
	// Try Google Forms specific detection first
	const googleFormsList = document.querySelector("div[role='list']");
	if (googleFormsList) {
		return detectGoogleFormsFields(googleFormsList);
	}

	// Fallback to generic form detection
	return detectGenericFormFields();
}

function detectGoogleFormsFields(listContainer: Element) {
	const listItems = Array.from(listContainer.children);

	const fields = listItems
		.map((el, index) => {
			const name =
				el.querySelector("[role='heading']")?.querySelector("span")
					?.textContent || `Field ${index + 1}`;

			const textInput =
				el.querySelector<HTMLInputElement>("input[type='text']");
			const textArea = el.querySelector<HTMLTextAreaElement>("textarea");
			const selectInput = el.querySelector<HTMLSelectElement>("select");

			// Assign ID to the input element for later targeting
			const inputElement = textInput || textArea || selectInput;
			if (inputElement && !inputElement.id) {
				inputElement.id = `field-${index + 1}`;
			}

			return {
				name: name.trim(),
				id: index + 1,
				type: textInput
					? "text"
					: textArea
					? "textarea"
					: selectInput
					? "select"
					: "unknown",
				element: inputElement?.tagName.toLowerCase(),
			};
		})
		.filter((field) => field.name && !field.name.startsWith("Field "));
	console.log(fields);
	return fields;
}

function detectGenericFormFields() {
	// Generic form field detection for non-Google Forms
	const inputs = document.querySelectorAll(
		'input[type="text"], input[type="email"], input[type="tel"], input[type="url"], textarea, select'
	);

	return Array.from(inputs).map((input, index) => {
		const element = input as
			| HTMLInputElement
			| HTMLTextAreaElement
			| HTMLSelectElement;

		// Try to find a label
		let name = "";
		const label = document.querySelector(`label[for="${element.id}"]`);
		if (label) {
			name = label.textContent?.trim() || "";
		} else {
			// Look for nearby text that might be a label
			const placeholder = element.getAttribute("placeholder");
			const ariaLabel = element.getAttribute("aria-label");
			name = ariaLabel || placeholder || `Field ${index + 1}`;
		}

		// Ensure the element has an ID
		if (!element.id) {
			element.id = `generic-field-${index + 1}`;
		}

		return {
			name: name.trim(),
			id: element.id,
			type: element.type || element.tagName.toLowerCase(),
			element: element.tagName.toLowerCase(),
		};
	});
}

interface SelectedField {
	id: string;
	value: string;
	fieldName?: string;
}

interface FillResult {
	filledCount: number;
	errors: string[];
}

async function fillSelectedFieldsAsync(
	selectedFields: SelectedField[]
): Promise<FillResult> {
	console.log("🔄 [CONTENT] Filling selected fields:", selectedFields);

	let filledCount = 0;
	const errors: string[] = [];

	for (let index = 0; index < selectedFields.length; index++) {
		const field = selectedFields[index];
		try {
			const success = await fillFieldAsync(field);
			if (success) {
				filledCount++;
				console.log(
					`✅ [CONTENT] Filled field ${index + 1}: ${
						field.id || field.fieldName
					}`
				);
			} else {
				const errorMsg = `Field not found: ${field.id || field.fieldName}`;
				errors.push(errorMsg);
				console.warn(`⚠️ [CONTENT] ${errorMsg}`);
			}
		} catch (error) {
			const errorMsg = `Error filling field ${field.id || field.fieldName}: ${
				error instanceof Error ? error.message : "Unknown error"
			}`;
			errors.push(errorMsg);
			console.error(`❌ [CONTENT] ${errorMsg}`);
		}

		// Small delay between fields to ensure proper processing
		if (index < selectedFields.length - 1) {
			await new Promise((resolve) => setTimeout(resolve, 50));
		}
	}

	console.log(
		`🎯 [CONTENT] Fill complete: ${filledCount}/${selectedFields.length} fields filled`
	);
	return { filledCount, errors };
}

async function fillFieldAsync(field: SelectedField): Promise<boolean> {
	console.log(`🔍 [CONTENT] Looking for field: ${field.id || field.fieldName}`);

	// Try to find the field by ID first
	let element = document.getElementById(field.id);
	console.log(`🔍 [CONTENT] Found by ID: ${!!element}`);

	// If not found by ID, try to find by field name or other attributes
	if (!element) {
		// Try Google Forms specific selectors
		const googleFormsList = document.querySelector("div[role='list']");
		if (googleFormsList) {
			element = findGoogleFormsField(field);
			console.log(`🔍 [CONTENT] Found by Google Forms selector: ${!!element}`);
		}

		// Fallback to generic selectors
		if (!element) {
			element = findGenericField(field);
			console.log(`🔍 [CONTENT] Found by generic selector: ${!!element}`);
		}
	}

	if (!element) {
		console.warn(
			`⚠️ [CONTENT] Element not found for field: ${field.id || field.fieldName}`
		);
		return false;
	}

	console.log(
		`🎯 [CONTENT] Found element:`,
		element.tagName,
		(element as any).type || "N/A"
	);

	// Fill the field based on its type
	try {
		if (element instanceof HTMLInputElement) {
			element.focus();
			element.value = field.value;
			element.dispatchEvent(new Event("input", { bubbles: true }));
			element.dispatchEvent(new Event("change", { bubbles: true }));
			element.blur();
		} else if (element instanceof HTMLTextAreaElement) {
			element.focus();
			element.value = field.value;
			element.dispatchEvent(new Event("input", { bubbles: true }));
			element.dispatchEvent(new Event("change", { bubbles: true }));
			element.blur();
		} else if (element instanceof HTMLSelectElement) {
			// For select elements, try to find a matching option
			const option = Array.from(element.options).find(
				(opt) =>
					opt.value === field.value ||
					opt.textContent?.toLowerCase().includes(field.value.toLowerCase())
			);
			if (option) {
				element.focus();
				element.value = option.value;
				element.dispatchEvent(new Event("change", { bubbles: true }));
				element.blur();
			} else {
				console.warn(
					`⚠️ [CONTENT] No matching option found for: ${field.value}`
				);
				return false;
			}
		}

		// Small delay to allow for any UI updates
		await new Promise((resolve) => setTimeout(resolve, 10));

		console.log(
			`✅ [CONTENT] Successfully filled field with value: ${field.value}`
		);
		return true;
	} catch (error) {
		console.error(`❌ [CONTENT] Error filling field:`, error);
		return false;
	}
}

function findGoogleFormsField(field: SelectedField): HTMLElement | null {
	// Google Forms specific field finding logic
	const listItems = document.querySelectorAll("div[role='list'] > div");

	for (const item of listItems) {
		const heading = item
			.querySelector("[role='heading']")
			?.querySelector("span")?.textContent;
		if (
			heading &&
			(heading.toLowerCase().includes(field.fieldName?.toLowerCase() || "") ||
				field.fieldName?.toLowerCase().includes(heading.toLowerCase()))
		) {
			const input =
				item.querySelector<HTMLInputElement>("input[type='text']") ||
				item.querySelector<HTMLTextAreaElement>("textarea") ||
				item.querySelector<HTMLSelectElement>("select");
			return input;
		}
	}

	return null;
}

function findGenericField(field: SelectedField): HTMLElement | null {
	// Generic field finding by name, placeholder, or aria-label
	const selectors = [
		`input[name*="${field.fieldName}"]`,
		`input[placeholder*="${field.fieldName}"]`,
		`input[aria-label*="${field.fieldName}"]`,
		`textarea[name*="${field.fieldName}"]`,
		`textarea[placeholder*="${field.fieldName}"]`,
		`textarea[aria-label*="${field.fieldName}"]`,
		`select[name*="${field.fieldName}"]`,
		`select[aria-label*="${field.fieldName}"]`,
	];

	for (const selector of selectors) {
		try {
			const element = document.querySelector(selector);
			if (element) return element as HTMLElement;
		} catch (e) {
			// Invalid selector, continue
		}
	}

	return null;
}
