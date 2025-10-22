/** ------------------------------------------------------------------------
 * Persona Options Page - Main Entry Point
 * - Orchestrates all modules for maintainable code organization
 * ------------------------------------------------------------------------ */

import { $, getDOMReferences } from "./dom-utils.js";
import { initCustomFields, renderCustomFields } from "./custom-fields.js";
import {
	initBioManager,
	getDefaultBioText,
	showManualBio,
} from "./bio-manager.js";
import {
	savePersona,
	clearAll,
	loadProfile,
	autoLoadPersona,
} from "./persona-manager.js";
import { initDebugTools } from "./debug-utils.js";

// Initialize all modules
const domRefs = getDOMReferences();
initCustomFields(domRefs);
initBioManager(domRefs);

// Global functions for HTML onclick handlers
(window as any).loadProfile = loadProfile;

// Main initialization
window.addEventListener("load", async () => {
	// Leave bio field empty initially
	renderCustomFields();

	// Initialize debug tools if enabled
	initDebugTools();

	// Show manual bio by default
	showManualBio();

	// Auto-load stored persona data (this will override defaults if data exists)
	await autoLoadPersona();
});

// Save persona button event
domRefs.savePersonaBtn.addEventListener("click", async () => {
	await savePersona();
});

// Load profile button event
domRefs.loadProfileBtn.addEventListener("click", async () => {
	await loadProfile();
});

// Clear all button event
domRefs.clearAllBtn.addEventListener("click", async () => {
	await clearAll();
});
