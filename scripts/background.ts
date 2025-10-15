chrome.runtime.onInstalled.addListener(() => {
	chrome.runtime.openOptionsPage();
});

chrome.runtime.onMessage.addListener((msg, sender) => {
	if (msg.type === "POPUP_OPENED") {
		console.log("Popup just opened!");
	} else if (msg.type === "GET_AI_SUGGESTIONS") {
		console.log("Fields received in background script:", msg.fields);
		// TODO: Implement AI suggestion logic here
	}
});
