/** ------------------------------------------------------------------------
 * Persona Options Page
 * - Handles custom fields, persona data input, and modal interactions
 * - Clean frontend-only logic (no storage or encryption)
 * ------------------------------------------------------------------------ */

/* ----------------------------- DOM Utilities ----------------------------- */
const $ = (id: string) => document.getElementById(id)!;

/* ----------------------------- DOM References ---------------------------- */
const newLabelInput = $("new-custom-label") as HTMLInputElement;
const newValueInput = $("new-custom-value") as HTMLInputElement;
const newTypeSelect = $("new-custom-type") as HTMLSelectElement;
const addFieldButton = $("add-custom-field-btn");

const customFieldsContainer = $("custom-fields-container");

const saveModal = $("save-modal");
const instructionModal = $("instruction-modal");
const closeModalBtn = $("close-modal");

const openInstructionsBtn = $("openInstructionsBtn");

const savePersonaBtn = $("save-persona");

/* ----------------------------- Default Values ---------------------------- */
let customFields = [
	{ label: "Project ID", value: "GLaDOS-1975", type: "text" },
	{ label: "Preferred Initials", value: "JKD", type: "text" },
	{ label: "Start Date", value: "2019-01-01", type: "date" },
	{ label: "Employee ID", value: "87532", type: "number" },
];

const defaultBioText = `
Paste your detailed personal Q&A transcript here.
Click the "How do I fill this?" button above for detailed instructions
on using the AI interview prompt.
`.trim();

/* ----------------------------- Render Helpers ---------------------------- */

/** Render all custom fields into the UI. */
function renderCustomFields() {
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

/* ----------------------------- CRUD Operations --------------------------- */

/** Add a new custom field from input values. */
function addCustomField() {
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
function deleteCustomField(index: number) {
	customFields.splice(index, 1);
	renderCustomFields();
}

/* ----------------------------- Modal Management -------------------------- */

function openModal(id: string) {
	$(id).style.display = "flex";
}

function closeModal(id: string) {
	$(id).style.display = "none";
}

/** Shortcut for opening the instruction modal. */
function openInstructionModal() {
	openModal("instruction-modal");
}

/* ----------------------------- Persona Logic ----------------------------- */

/** Collect all persona data and show confirmation modal. */
function savePersona() {
	const personaData = {
		name: ($("name") as HTMLInputElement).value,
		email: ($("email") as HTMLInputElement).value,
		dob: ($("dob") as HTMLInputElement).value,
		gender: ($("gender") as HTMLInputElement).value,
		role: ($("role") as HTMLInputElement).value,
		company: ($("company") as HTMLInputElement).value,
		address: ($("address") as HTMLInputElement).value,
		phone: ($("phone") as HTMLInputElement).value,
		bio: ($("bio") as HTMLInputElement).value,
		customFields,
	};

	console.log("--- Persona Saved (Placeholder) ---");
	console.log(personaData);
	const serializedPersonaData = JSON.stringify(personaData);

	savePersonaData(serializedPersonaData);

	// chrome.storage.local.set()
	const toast = $("save-modal");
	toast.classList.add("visible");
	setTimeout(() => {
		toast.classList.remove("visible");
	}, 3000);
}

/** Placeholder for loading stored profile data. */
function loadProfile() {
	console.log("Loading profile data...");
}

/** Reset all fields and restore initial defaults. */
function clearAll() {
	($("name") as HTMLInputElement).value = "Jane K. Doe";
	($("email") as HTMLInputElement).value = "jane.doe@aperture.com";
	($("dob") as HTMLInputElement).value = "1987-03-24";
	($("gender") as HTMLInputElement).value = "female";
	($("role") as HTMLInputElement).value = "Lead Portal Tester";
	($("company") as HTMLInputElement).value = "Aperture Science, LLC";
	($("address") as HTMLInputElement).value = "123 Science Way, MI 49999";
	($("phone") as HTMLInputElement).value = "+1 (555) 555-1234";
	($("bio") as HTMLInputElement).value = defaultBioText;

	newLabelInput.value = "";
	newValueInput.value = "";
	newTypeSelect.value = "text";

	customFields = [
		{ label: "Project ID", value: "GLaDOS-1975", type: "text" },
		{ label: "Preferred Initials", value: "JKD", type: "text" },
		{ label: "Start Date", value: "2019-01-01", type: "date" },
		{ label: "Employee ID", value: "87532", type: "number" },
	];

	renderCustomFields();
	console.log("All fields reset to initial state.");
}

/* ----------------------------- Event Bindings ---------------------------- */

// Field management
addFieldButton.addEventListener("click", addCustomField);
customFieldsContainer.addEventListener("click", (e) => {
	const deleteBtn = (e.target as HTMLElement).closest(".delete-btn");
	const index = (deleteBtn as HTMLElement)?.dataset.index;
	if (index) deleteCustomField(+index);
});

// Modal interactions
openInstructionsBtn.addEventListener("click", () =>
	openModal("instruction-modal")
);

instructionModal.addEventListener("click", (e) => {
	const t = e.target as HTMLElement;
	const closeTargets = [
		t.closest("#instructionModalCloseBtn"),
		t.closest("#close-instructions"),
	];
	if (t === instructionModal || closeTargets.some(Boolean))
		closeModal("instruction-modal");
});

savePersonaBtn.addEventListener("click", savePersona);
// On load setup
window.addEventListener("load", () => {
	($("bio") as HTMLInputElement).value = defaultBioText;
	renderCustomFields();
});

const savePersonaData = async function (data: string) {
	await chrome.storage.local.set({ personaData: data });
	console.log("Saved Persona Data");
};
