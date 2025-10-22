# FormFillr

A fun Chrome extension that uses AI to fill out forms for you! Because who has time to type the same info over and over again?

## What does it do?

- **Saves your info**: Store your name, email, job, etc. once
- **AI magic**: Uses AI to figure out what goes where in forms
- **One-click filling**: Select suggestions and boom, form is filled!
- **Works great with Google Forms** (other forms... we're working on it 😅)

## Why I built this

I got tired of filling out the same Google Forms over and over. So I thought "what if AI could just do this for me?" Turns out, it can! Pretty neat, right?

## How to use it

### 1. Set up your info

- Click the extension icon → Options
- Fill in your basic info (name, email, etc.)
- Optional: Let AI generate a bio for you by answering some questions

### 2. Fill forms like magic

- Go to any Google Form
- Click the extension icon
- Hit "Scan" to find form fields
- Hit "Get AI Suggestions" to see what AI thinks should go where
- Check the boxes next to suggestions you like
- Hit "Fill Selected" and watch the magic happen! ✨

## Installation

### The easy way (if I ever publish this)

Just install from Chrome Web Store... but I haven't done that yet 😅

### The developer way

1. Clone this repo
2. Get an OpenRouter API key from [openrouter.ai/settings/keys](https://openrouter.ai/settings/keys) (it's free!)
3. Run `npm install` and `npm run build`
4. Load the `dist` folder as an unpacked extension in Chrome
5. Enter your OPEN ROUTER api key

## What works well

- ✅ Google Forms (works great!)
- ✅ Basic text inputs and textareas
- ✅ AI is pretty smart about matching fields
- ✅ You can pick and choose which suggestions to use

## What's a bit wonky

- ⚠️ Other form platforms are hit-or-miss
- ⚠️ Complex forms might confuse it
- ⚠️ Sometimes AI gets creative with suggestions (in a weird way)

## Cool features

### AI Bio Generator

Answer a few questions and AI writes a professional bio for you. It's actually pretty good!

### Smart Suggestions

The AI looks at field labels and tries to figure out what should go there. It even gives confidence scores so you know when it's just guessing.

### Privacy First

All your personal info stays on your computer. The AI only sees the form structure, not your actual data.

## Technical stuff (for nerds 🤓)

Built with:

- TypeScript (because I like types)
- Chrome Extension APIs
- OpenRouter API (using Llama 4)
- A lot of coffee ☕

The code is split into:

- `scripts/popup/` - The popup you see when you click the icon
- `scripts/options/` - The settings page
- `scripts/content/` - The part that actually fills forms
- `scripts/background/` - Talks to the AI

## Contributing

Found a bug? Have an idea? Cool!

- Open an issue if something's broken
- PRs welcome if you want to fix stuff
- Please don't judge my code too harshly 😅

## Future ideas (maybe?)

- Support more form platforms
- Better AI suggestions
- Firefox??
- Who knows! This is just a fun side project

## FAQ

**Q: Is this safe?**
A: Your data stays on your computer. The AI only sees form field names, not your personal info.

**Q: Does it cost money?**
A: The extension is free. You need an OpenRouter API key which has a free tier.

**Q: Why Google Forms only?**
A: They have a consistent structure that's easy to work with. Other forms are... complicated.

**Q: Can I use this for evil?**
A: Please don't. It's meant to save time on legitimate forms, not spam people.

## License

MIT - Do whatever you want with it, just don't blame me if it breaks something 😄

---

Made with ❤️ and probably too much caffeine by someone who really hates filling out forms.

_P.S. - If you work at Google and want to hire me, this extension shows I can build stuff that actually works! 😉_
