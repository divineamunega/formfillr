document.addEventListener("DOMContentLoaded", () => {
	console.log("Popup DOM loaded");
	initPopup();
});

function initPopup() {
	chrome.runtime.sendMessage({ type: "POPUP_OPENED" }, (response) => {
		console.log("Service worker Responded");
	});
}

const form = document.querySelector(".form");

form?.addEventListener("submit", function (e) {
	e.preventDefault();
});
