# Lumina — Learn Languages the Smart Way

A distraction-free language learning platform powered by spaced-repetition science, native audio dictation, and daily math sprints. Supports 10 languages with 3,000 top-frequency words each.

## Features

- 🎧 **Dictation Studio** — Hear words in your target language and type what you hear
- 🧠 **Spaced Repetition (SM-2)** — Vocab cards that adapt to your memory
- ➗ **Math Sprint** — Daily mental arithmetic in your target language  
- 🌍 **10 Languages** — French, German, Spanish, Italian, Portuguese, Russian, Hindi, Japanese, Chinese, English
- 🌙 **Dark/Light Mode** — Full system-preference-aware theming
- 📱 **Mobile-first** — Responsive with bottom tab bar on mobile, sidebar on desktop
- 🌐 **Localized UI** — Interface switches to your native language

## Getting Started

```bash
cd platform
npm install
npm run dev
```

## Build for Production

```bash
cd platform
npm run build
```

The output is in `platform/dist/` — fully static, no server required.

## Deploy to GitHub Pages

1. Push this repo to GitHub
2. Go to **Settings → Pages → Source → GitHub Actions**
3. Every push to `main` triggers an automatic build and deploy

Your app will be live at: `https://damansaini1298.github.io/lumina/`

## Tech Stack

- **React 19** + **TypeScript**
- **Vite 5** (build tool)
- **Tailwind CSS 3** (utility-first styling)
- **React Router 7** (HashRouter for static hosting)
- **Custom SM-2 SRS** (spaced-repetition engine)
- **Web Speech API** (native browser TTS audio)
