# FormFillr

A Chrome extension that uses AI to fill out forms for you. Built to eliminate repetitive typing and streamline form completion — especially for Google Forms.

---

## Overview

FormFillr intelligently scans web forms, identifies input fields, and uses AI to generate context-aware suggestions based on your saved profile data. It’s designed to work seamlessly on Google Forms and will expand to support more platforms over time.

---

## Features

- **Profile Storage** – Save your personal details (name, email, job, etc.) once and reuse them across forms.
- **AI Mapping** – Uses AI to understand which data belongs in which field.
- **One-Click Autofill** – Select suggestions and automatically populate form fields.
- **Optimized for Google Forms** – Reliable structure makes it the current best use case.

---

## Why This Exists

Typing the same information into forms repeatedly wastes time. FormFillr was built out of frustration with that process and curiosity about how far AI could automate small, everyday tasks.

---

## How It Works

1. Open the extension popup and set up your personal info.
2. Visit a Google Form.
3. Click the FormFillr icon.
4. Run a scan to detect fields.
5. Get AI-generated suggestions.
6. Select and fill automatically.

---

## Installation

### Developer Setup

1. Clone this repository.
2. Get an OpenRouter API key from [openrouter.ai/settings/keys](https://openrouter.ai/settings/keys).
3. Run:

   ```bash
   npm install
   npm run build
   ```

4. Open Chrome → Extensions → Developer Mode → “Load unpacked” → select the `dist` folder.
5. Add your OpenRouter API key in the extension settings.

---

## Current Status

| Area           | Status                            |
| -------------- | --------------------------------- |
| Google Forms   | Fully supported                   |
| Other Forms    | Partial support                   |
| Complex Inputs | Experimental                      |
| AI Suggestions | Stable with occasional mismatches |

---

## Technical Details

**Stack**

- TypeScript
- Chrome Extension APIs (Manifest V3)
- OpenRouter (Llama 4)
- Bundled with Vite

**Architecture**

- `scripts/content/` – Form scanning and autofill logic
- `scripts/background/` – Handles API requests and AI communication
- `scripts/popup/` – Main user interface
- `scripts/options/` – Profile setup and configuration

Data is stored locally using Chrome Storage. No personal information is sent to remote servers. Only anonymized field names are sent to the AI for context generation.

---

## Known Limitations

- Non-Google form structures can be inconsistent or missing labels.
- Some AI suggestions may be off-target or incomplete.
- Forms using dynamic frameworks (React/Vue-based DOM mutations) may need manual input.

---

## Future Work

- Broader platform support beyond Google Forms
- Smarter AI field classification
- Optional offline inference (local model)
- Firefox compatibility

---

## Contributing

Pull requests are welcome.
If you find a bug or have an idea, open an issue or propose an improvement.

---

## License

MIT License — use, modify, and distribute freely at your own risk.

---

**FormFillr** is a personal project built for efficiency and experimentation. Automation doesnt need to be complicated.
