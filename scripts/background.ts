// Background service worker script

chrome.runtime.onInstalled.addListener(() => {
	chrome.runtime.openOptionsPage();
});

chrome.runtime.onMessage.addListener((msg, sender) => {
	console.log(msg);
	if (msg.type === "POPUP_OPENED") {
		console.log("Popup just opened!");
	}
});
