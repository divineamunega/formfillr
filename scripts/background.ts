chrome.runtime.onInstalled.addListener(() => {
	chrome.runtime.openOptionsPage();
});

chrome.runtime.onMessage.addListener(async (msg, sender) => {
	if (msg.type === "POPUP_OPENED") {
	}

	if (msg.type === "GET_AI_SUGGESTIONS") {
		const { personaData } = await chrome.storage.local.get("personaData");
		const formData = JSON.stringify(msg.fields);

		const data = { personaData, formData };

		const stringifiedData = JSON.stringify(data);

		fetch("https://openrouter.ai/api/v1/chat/completions", {
			method: "POST",
			headers: {
				Authorization:
					"Bearer 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",
				"HTTP-Referer": "autofill_ai", // Optional. Site URL for rankings on openrouter.ai.
				"X-Title": "autofill_ai", // Optional. Site title for rankings on openrouter.ai.
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				// The AI model to be used
				model: "meta-llama/llama-4-maverick:free",
				// The messages to be sent to the AI model
				messages: [
					{
						role: "system",
						// The system prompt to be used in the AI model
						content: `You are an AI assistant embedded in a Chrome extension that helps users autofill forms on web pages using their stored persona information.

Your job is to map each input field in a web form to the most relevant value from the user’s saved persona data.

---

### Context

The extension scans the current webpage and extracts a list of input fields.  
Each field contains metadata such as:
- label (from <label> or text near it)
- placeholder
- input type (text, email, date, etc.)
- name attribute
- id attribute

You will receive:
1. \`persona\` — structured JSON of user profile data (e.g., name, email, role, company, etc.)
2. \`fields\` — array of form field descriptors from the web page.

You must return a **strictly valid JSON array** containing objects with:
- \`id\` or \`name\` (used to identify the DOM element)
- \`value\` (the text that should be filled into the field)
- \`confidence\` (0–1 float indicating confidence of match)

---

### Rules

1. **Match by semantic meaning**, not exact string equality.
   - “Full Name” ↔ \`persona.name\`
   - “Job Title” ↔ \`persona.role\`
   - “Organization” ↔ \`persona.company\`
   - “Phone Number” ↔ \`persona.phone\`
   - “Summary” ↔ \`persona.bio\`

2. Only use **non-sensitive** persona fields (no passwords, IDs, or tokens).

3. If no suitable value exists in the persona, skip the field entirely.

4. Output must be **strict JSON** — no explanations, markdown, or commentary.

5. Prefer concise, human-readable values (no long bios for short text fields).

6. For multi-line text areas (like “About Me” or “Bio”), it’s acceptable to use longer persona text.

7. Never hallucinate. If uncertain, omit the field.

---

### Example Input

**persona:**
{
  "name": "Jane Doe",
  "email": "jane.doe@example.com",
  "role": "Frontend Engineer",
  "company": "Idealabs",
  "bio": "Passionate about UI design and web performance.",
  "customFields": [
    { "label": "GitHub", "value": "https://github.com/janedoe" },
    { "label": "LinkedIn", "value": "https://linkedin.com/in/janedoe" }
  ]
}

**fields:**
[
  { "id": "fullname", "label": "Your Name", "placeholder": "Enter full name", "type": "text" },
  { "id": "email", "label": "Contact Email", "type": "email" },
  { "id": "bio", "label": "About You", "type": "textarea" },
  { "id": "portfolio", "label": "Portfolio URL", "placeholder": "https://", "type": "url" }
]

---

### Expected Output
[
  { "id": "fullname", "value": "Jane Doe", "confidence": 0.98 },
  { "id": "email", "value": "jane.doe@example.com", "confidence": 1.0 },
  { "id": "bio", "value": "Passionate about UI design and web performance.", "confidence": 0.92 },
  { "id": "portfolio", "value": "https://github.com/janedoe", "confidence": 0.85 }
]
### OUTPUT INSTRUCTIONS

You must return **only** a valid JSON array as plain text — no markdown, no explanation, no code blocks, and no additional commentary.

If the response is not valid JSON, your output will be discarded automatically.

Return only:
[
  { "id": "...", "value": "...", "confidence": 0.95 },
  ...
]
  
`,
					},
					{
						role: "user",
						// The user prompt to be used in the AI model
						content: stringifiedData,
					},
				],
			}),
		})
			.then((response) => response.json())
			.then((data) => console.log(data.choices[0].message.content));
	}
});
