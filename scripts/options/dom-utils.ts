/** ------------------------------------------------------------------------
 * DOM Utilities
 * - Helper functions for DOM manipulation and element selection
 * ------------------------------------------------------------------------ */

export const $ = (id: string) => document.getElementById(id)!;

export const getDOMReferences = () => ({
	// Custom fields
	newLabelInput: $("new-custom-label") as HTMLInputElement,
	newValueInput: $("new-custom-value") as HTMLInputElement,
	newTypeSelect: $("new-custom-type") as HTMLSelectElement,
	addFieldButton: $("add-custom-field-btn"),
	customFieldsContainer: $("custom-fields-container"),

	// Modals
	saveModal: $("save-modal"),
	instructionModal: $("instruction-modal"),
	closeModalBtn: $("close-modal"),

	// Bio interface elements
	aiInterviewBtn: $("ai-interview-btn"),
	manualBioBtn: $("manual-bio-btn"),
	aiInterviewContainer: $("ai-interview-container"),
	manualBioContainer: $("manual-bio-container"),
	bioPreviewContainer: $("bio-preview-container"),
	interviewChat: $("interview-chat"),
	interviewAnswer: $("interview-answer") as HTMLInputElement,
	sendAnswerBtn: $("send-answer-btn"),
	progressFill: $("progress-fill"),
	progressText: $("progress-text"),
	bioPreview: $("bio-preview"),
	editBioBtn: $("edit-bio-btn"),
	regenerateBioBtn: $("regenerate-bio-btn"),
	acceptBioBtn: $("accept-bio-btn"),

	// Persona
	savePersonaBtn: $("save-persona"),
	loadProfileBtn: $("load-profile-btn"),
	clearAllBtn: $("clear-all-btn"),
});

export type DOMRefs = ReturnType<typeof getDOMReferences>;
