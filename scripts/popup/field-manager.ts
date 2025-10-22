/** ------------------------------------------------------------------------
 * Field Management
 * - Handles fetching and rendering form fields from the active tab
 * ------------------------------------------------------------------------ */

import type { PopupDOMRefs } from "./dom-utils.js";

export interface FormField {
	name: string;
	type?: string;
	[key: string]: any;
}

let fields: FormField[] = [];
let domRefs: PopupDOMRefs;

export function initFieldManager(refs: PopupDOMRefs): void {
	domRefs = refs;
}

export function getFields(): FormField[] {
	return [...fields];
}

export function fetchAndRenderFields(): void {
	chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
		if (!tabs[0]?.id) {
			console.error("No active tab found");
			return;
		}

		chrome.tabs.sendMessage(tabs[0].id, { type: "GET_FIELDS" }, (res) => {
			if (chrome.runtime.lastError) {
				console.error(
					"Error communicating with content script:",
					chrome.runtime.lastError
				);
				if (domRefs.fieldCount) {
					domRefs.fieldCount.textContent = "Error: Content script not loaded";
				}
				return;
			}

			fields = res || [];
			updateFieldCount();
			renderFieldsTable();
		});
	});
}

function updateFieldCount(): void {
	if (domRefs.fieldCount) {
		domRefs.fieldCount.textContent = `${fields.length} fields detected`;
	}
}

function renderFieldsTable(): void {
	const { tbody } = domRefs;
	if (!tbody) return;

	tbody.innerHTML = "";

	if (fields.length === 0) {
		const row = document.createElement("tr");
		row.innerHTML = `
			<td colspan="4" style="text-align: center; padding: 20px; color: var(--muted);">
				No form fields detected on this page
			</td>
		`;
		tbody.appendChild(row);
	} else {
		fields.forEach((field: FormField) => {
			const row = document.createElement("tr");
			row.innerHTML = `
				<td>
					<div class="col-label">
						<span class="field-name">${field.name}</span>
						<small style="color: var(--muted); display: block;">${
							field.type || "text"
						}</small>
					</div>
				</td>
				<td class="initially-hidden">
					<span class="value-bubble"></span>
				</td>
				<td class="initially-hidden">
					<div class="confidence">
						<div style="font-weight: 600; color: var(--muted)"></div>
						<div class="conf-bar">
							<div class="conf-fill"></div>
						</div>
					</div>
				</td>
				<td class="initially-hidden actions-cell">
					<label class="checkbox">
						<input type="checkbox" />
					</label>
				</td>
			`;
			tbody.appendChild(row);
		});
	}
}
