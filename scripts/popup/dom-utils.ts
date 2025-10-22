/** ------------------------------------------------------------------------
 * DOM Utilities for Popup
 * - Helper functions for DOM manipulation and element selection
 * ------------------------------------------------------------------------ */

export const $ = (id: string) => document.getElementById(id);

export const getDOMReferences = () => ({
	scanButton: $("scan-button"),
	fieldCount: $("field-count"),
	getAiSuggestionsButton: $("get-ai-suggestions-button"),
	fillSelectedBtn: $("fill-selected-btn"),
	tbody: document.querySelector("tbody"),
});

export type PopupDOMRefs = ReturnType<typeof getDOMReferences>;
