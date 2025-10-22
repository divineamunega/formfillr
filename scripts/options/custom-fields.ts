/** ------------------------------------------------------------------------
 * Custom Fields Management
 * - Handles CRUD operations for custom fields
 * ------------------------------------------------------------------------ */

import { type DOMRefs } from "./dom-utils.js";

export interface CustomField {
	label: string;
	value: string;
	type: string;
}

// State
let customFields: CustomField[] = [];

let domRefs: DOMRefs;

export function initCustomFields(refs: DOMRefs): void {
	domRefs = refs;
	bindEvents();
}

export function getCustomFields(): CustomField[] {
	return [...customFields];
}

export function setCustomFields(fields: CustomField[]): void {
	customFields = [...fields];
	renderCustomFields();
}

/** Render all custom fields into the UI. */
export function renderCustomFields(): void {
	const { customFieldsContainer } = domRefs;
	customFieldsContainer.innerHTML = "";

	if (customFields.length === 0) {
		customFieldsContainer.innerHTML = `
      <p class="subtitle">
        No custom fields added yet. Use the form above to add one.
      </p>
    `;
		return;
	}

	customFields.forEach((field, index) => {
		const item = document.createElement("div");
		item.className = "custom-field-item";
		item.innerHTML = `
      <div>
        <strong>${field.label}</strong>
        <span class="field-type">(${field.type})</span>:
        <span>${field.value}</span>
      </div>
      <button class="delete-btn" data-index="${index}" title="Remove Field">&times;</button>
    `;
		customFieldsContainer.appendChild(item);
	});
}

/** Add a new custom field from input values. */
function addCustomField(): void {
	const { newLabelInput, newValueInput, newTypeSelect } = domRefs;
	const label = newLabelInput.value.trim();
	const value = newValueInput.value.trim();
	const type = newTypeSelect.value;

	if (!label || !value) {
		console.error("Please enter both a label and a value.");
		return;
	}

	customFields.push({ label, value, type });

	// Reset inputs
	newLabelInput.value = "";
	newValueInput.value = "";
	newTypeSelect.value = "text";

	renderCustomFields();
}

/** Delete a custom field by index. */
function deleteCustomField(index: number): void {
	customFields.splice(index, 1);
	renderCustomFields();
}

/** Reset to empty custom fields */
export function resetToDefaults(): void {
	customFields = [];
	renderCustomFields();
}

function bindEvents(): void {
	const { addFieldButton, customFieldsContainer } = domRefs;

	// Field management
	addFieldButton.addEventListener("click", addCustomField);
	customFieldsContainer.addEventListener("click", (e) => {
		const deleteBtn = (e.target as HTMLElement).closest(".delete-btn");
		const index = (deleteBtn as HTMLElement)?.dataset.index;
		if (index) deleteCustomField(+index);
	});
}
