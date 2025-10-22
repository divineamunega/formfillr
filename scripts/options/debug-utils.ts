/** ------------------------------------------------------------------------
 * Debug Utilities
 * - Handles debug mode configuration and utilities
 * ------------------------------------------------------------------------ */

import {
	DEBUG_MODE,
	debugLog as sharedDebugLog,
	debugError as sharedDebugError,
	debugWarn as sharedDebugWarn,
} from "../shared/debug-config.js";

// Check if debug mode is enabled via environment variable
export const isDebugMode = (): boolean => {
	return DEBUG_MODE;
};

// Initialize debug tools if debug mode is enabled
export const initDebugTools = (): void => {
	if (!DEBUG_MODE) {
		return;
	}

	console.log("🔧 Debug mode enabled - showing debug tools");

	// Show debug section
	const debugSection = document.getElementById("debug-section");
	if (debugSection) {
		debugSection.style.display = "block";
	}
};

// Debug logging wrappers using shared config
export const debugLog = (message: string, ...args: any[]): void => {
	sharedDebugLog("OPTIONS", message, ...args);
};

export const debugError = (message: string, ...args: any[]): void => {
	sharedDebugError("OPTIONS", message, ...args);
};

export const debugWarn = (message: string, ...args: any[]): void => {
	sharedDebugWarn("OPTIONS", message, ...args);
};
