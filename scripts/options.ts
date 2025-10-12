// Array to store custom fields data (Updated structure to include 'type')
const $ = (id: string) => document.getElementById(id)!;

const newLabelInput = $("new-custom-label") as HTMLInputElement;
const customFieldsContainer = $("custom-fields-container");
const newValueInput = $("new-custom-value") as HTMLInputElement;
const newTypeSelect = $("new-custom-type") as HTMLInputElement;
const addFieldButton = $("add-custom-field-btn");
const closeModalBtn = $("close-modal");

// Modal references
const saveModal = $("save-modal");
const instructionModal = $("instruction-modal");

let customFields = [
	{ label: "Project ID", value: "GLaDOS-1975", type: "text" },
	{ label: "Preferred Initials", value: "JKD", type: "text" },
	{ label: "Start Date", value: "2019-01-01", type: "date" },
	{ label: "Employee ID", value: "87532", type: "number" },
];

// Define the simplified default text for the textarea
const defaultBioText = `Paste your detailed personal Q&A transcript here. Click the "How do I fill this?" button above for detailed instructions on using the AI interview prompt.`;

/**
 * Renders all custom fields from the customFields array into the UI.
 */
function renderCustomFields() {
	customFieldsContainer.innerHTML = "";

	if (customFields.length === 0) {
		customFieldsContainer.innerHTML = `<p class="subtitle">No custom fields added yet. Use the form above to add one.</p>`;
		return;
	}

	customFields.forEach((field, index) => {
		const item = document.createElement("div");
		item.className = "custom-field-item";
		// Updated innerHTML to include the data type
		item.innerHTML = `
                    <div>
                        <strong>${field.label}</strong> 
                        <span style="color: var(--muted); font-size: 11px; text-transform: capitalize;">(${field.type})</span>: 
                        <span>${field.value}</span>
                    </div>
                    <button class="delete-btn" data-index="${index}" onclick="deleteCustomField(${index})" title="Remove Field">
                        <i data-lucide="x" class="h-4 w-4"></i>
                    </button>
                `;
		customFieldsContainer.appendChild(item);
	});
}

/**
 * Adds a new custom field from the input values.
 */
function addCustomField() {
	const label = newLabelInput.value.trim();
	const value = newValueInput.value.trim();
	const type = newTypeSelect.value;

	if (!label || !value) {
		console.error("Please enter both a label and a value.");
		return;
	}

	// Push all three properties (label, value, type)
	customFields.push({ label, value, type });

	// Clear inputs and reset type selection
	newLabelInput.value = "";
	newValueInput.value = "";
	newTypeSelect.value = "text";

	renderCustomFields();
}

/**
 * Deletes a custom field by index.
 * @param {number} index - The index of the field to delete.
 */
function deleteCustomField(index: number) {
	customFields.splice(index, 1);
	renderCustomFields();
}

/**
 * Opens a specified modal.
 * @param {string} id - The ID of the modal to open ('save-modal' or 'instruction-modal').
 */
function openModal(id: string) {
	$(id).style.display = "flex";
}

/**
 * Closes a specified modal.
 * @param {string} id - The ID of the modal to close ('save-modal' or 'instruction-modal').
 */
function closeModal(id: string) {
	$(id).style.display = "none";
}

/**
 * Opens the instruction modal.
 */
function openInstructionModal() {
	openModal("instruction-modal");
}

/**
 * Collects all persona data, logs it, and shows the confirmation modal.
 */
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
		customFields: customFields,
	};

	console.log("--- Persona Saved (Placeholder) ---");
	// console.log(JSON.stringify(personaData, null, 2)); // Keeping log brief for UI testing

	// Show confirmation modal
	openModal("save-modal");
}

/**
 * Placeholder for loading profile data.
 */
function loadProfile() {
	console.log("Loading profile data...");
	// In a real application, you'd fetch data and update the inputs and customFields array.
}

/**
 * Clears all fields and resets the bio textarea to the prompt text.
 */
function clearAll() {
	($("name") as HTMLInputElement).value = "Jane K. Doe"; // Keeping some defaults for quick testing
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

	// Reset custom fields to initial state
	customFields = [
		{ label: "Project ID", value: "GLaDOS-1975", type: "text" },
		{ label: "Preferred Initials", value: "JKD", type: "text" },
		{ label: "Start Date", value: "2019-01-01", type: "date" },
		{ label: "Employee ID", value: "87532", type: "number" },
	];
	renderCustomFields();
	console.log("All fields reset to initial state.");
}

// Attach event listener for the Add button
addFieldButton.addEventListener("click", addCustomField);

// Initialize Lucide icons and ensure initial bio text is set correctly on load
window.addEventListener("load", () => {
	// Initialize bio content to the guidance/prompt text
	($("bio") as HTMLInputElement).value = defaultBioText;
});

const openInstructionsBtn = $("openInstructionsBtn");

openInstructionsBtn.addEventListener("click", function () {
	openModal("instruction-modal");
});

instructionModal.addEventListener("click", function (e) {
	const closeBtn = (e.target as HTMLElement).closest(
		"#instructionModalCloseBtn"
	);
	const modal = (e.target as HTMLElement) === instructionModal;
	const closeInstruction = (e.target as HTMLElement).closest(
		"#close-instructions"
	);

	closeBtn || modal || closeInstruction
		? closeModal("instruction-modal")
		: null;
});

renderCustomFields();
