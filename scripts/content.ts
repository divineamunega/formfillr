chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
	if (msg.type === "GET_FIELDS") {
		const fields = detectFormFields();
		sendResponse(fields);
	}
});

function detectFormFields() {
	const listItem = Array.from(
		document.querySelector("div[role='list']")!.children
	);

	const listItemsWithElements = listItem.map((el, index) => {
		const name = el
			.querySelector("[role='heading']")
			?.querySelector("span")?.textContent;

		const textInput = el.querySelector<HTMLInputElement>("input[type='text']");
		const id = crypto.randomUUID();
		if (textInput) {
			textInput.id = "" + index + 1;
		}

		return { name, textInputEl: textInput };
	});

	const sentData = listItemsWithElements.map(({ name }, index) => {
		return { name, id: index + 1 };
	});

	return sentData;
}
