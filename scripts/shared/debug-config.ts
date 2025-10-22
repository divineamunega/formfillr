/** ------------------------------------------------------------------------
 * Shared Debug Configuration
 * - Centralized debug configuration that works in both content and background scripts
 * ------------------------------------------------------------------------ */

/// <reference types="vite/client" />

// Debug mode configuration - can be overridden at build time
export const DEBUG_MODE = import.meta.env.VITE_DEBUG_MODE === "true";

// Debug logging functions that work everywhere
export const debugLog = (
	context: string,
	message: string,
	...args: any[]
): void => {
	if (DEBUG_MODE) {
		console.log(`🐛 [${context}] ${message}`, ...args);
	}
};

export const debugError = (
	context: string,
	message: string,
	...args: any[]
): void => {
	if (DEBUG_MODE) {
		console.error(`🐛 [${context} ERROR] ${message}`, ...args);
	}
};

export const debugWarn = (
	context: string,
	message: string,
	...args: any[]
): void => {
	if (DEBUG_MODE) {
		console.warn(`🐛 [${context} WARN] ${message}`, ...args);
	}
};
