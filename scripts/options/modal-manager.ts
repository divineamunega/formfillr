/** ------------------------------------------------------------------------
 * Modal Management
 * - Handles modal display and interactions
 * ------------------------------------------------------------------------ */

import { $ } from "./dom-utils.js";

export function openModal(id: string): void {
	$(id).style.display = "flex";
}

export function closeModal(id: string): void {
	$(id).style.display = "none";
}

/** Shortcut for opening the instruction modal. */
export function openInstructionModal(): void {
	openModal("instruction-modal");
}

export function showSaveToast(): void {
	const toast = $("save-modal");
	toast.classList.add("visible");
	setTimeout(() => {
		toast.classList.remove("visible");
	}, 3000);
}

export function showErrorToast(message: string): void {
	// Create error toast if it doesn't exist
	let errorToast = $("error-modal") as HTMLElement | null;
	if (!errorToast) {
		errorToast = document.createElement("div");
		errorToast.id = "error-modal";
		errorToast.className = "save-toast error-toast hidden";
		errorToast.innerHTML = `
			<div class="toast-content">
				<p id="error-message">❌ ${message}</p>
			</div>
		`;
		document.body.appendChild(errorToast);
	} else {
		const errorMessage = $("error-message");
		if (errorMessage) {
			errorMessage.textContent = `❌ ${message}`;
		}
	}

	errorToast.classList.add("visible");
	setTimeout(() => {
		errorToast.classList.remove("visible");
	}, 4000);
}

export function showInfoToast(message: string): void {
	// Create info toast if it doesn't exist
	let infoToast = $("info-modal") as HTMLElement | null;
	if (!infoToast) {
		infoToast = document.createElement("div");
		infoToast.id = "info-modal";
		infoToast.className = "save-toast info-toast hidden";
		infoToast.innerHTML = `
			<div class="toast-content">
				<p id="info-message">ℹ️ ${message}</p>
			</div>
		`;
		document.body.appendChild(infoToast);
	} else {
		const infoMessage = $("info-message");
		if (infoMessage) {
			infoMessage.textContent = `ℹ️ ${message}`;
		}
	}

	infoToast.classList.add("visible");
	setTimeout(() => {
		infoToast.classList.remove("visible");
	}, 3000);
}
