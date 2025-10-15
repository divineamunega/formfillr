document.addEventListener("DOMContentLoaded", () => {
	const scanButton = document.getElementById("scan-button");
	const fieldCount = document.getElementById("field-count");
	const getAiSuggestionsButton = document.getElementById(
		"get-ai-suggestions-button"
	);

	let fields: any[] = [];

	function fetchAndRenderFields() {
		chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
			chrome.tabs.sendMessage(tabs[0].id!, { type: "GET_FIELDS" }, (res) => {
				fields = res;
				if (fieldCount) {
					fieldCount.textContent = `${fields.length} fields detected`;
				}

				const tbody = document.querySelector("tbody");
				if (tbody) {
					tbody.innerHTML = "";
					fields.forEach((field: any) => {
						const row = document.createElement("tr");
						row.innerHTML = `
              <td>
                <div class="col-label">
                  <span class="field-name">${field.name}</span>
                </div>
              </td>
              <td class="initially-hidden">
                <span class="value-bubble"></span>
              </td>
              <td class="initially-hidden">
                <div class="confidence">
                  <div style="font-weight: 600; color: var(--muted)"></div>
                  <div class="conf-bar">
                    <div class="conf-fill"></div>
                  </div>
                </div>
              </td>
              <td class="initially-hidden actions-cell">
                <label class="checkbox">
                  <input type="checkbox" />
                </label>
              </td>
            `;
						tbody.appendChild(row);
					});
				}
			});
		});
	}

	if (scanButton) {
		scanButton.addEventListener("click", fetchAndRenderFields);
	}

	if (getAiSuggestionsButton) {
		getAiSuggestionsButton.addEventListener("click", () => {
			getAiSuggestionsButton.textContent = "Loading...";
			getAiSuggestionsButton.setAttribute("disabled", "true");
			chrome.runtime.sendMessage({ type: "GET_AI_SUGGESTIONS", fields });
		});
	}

	fetchAndRenderFields(); // Also fetch fields on initial load
});
