# Nyxxi — AI Creator OS

A home base for AI content creators: keep your characters, their wardrobe, your prompt
library, and generated assets organized in one place.

## Features

- **Characters** — create characters with up to two reference sheets each
- **Wardrobe** — attach outfit photos and notes to every character
- **Prompt vault** — save prompts globally or per character, then generate from them
- **Asset vault** — generation outputs are collected automatically
- **Search** — one search box across characters, wardrobe, and prompts
- **Light / dark theme** — follows your system preference, with a manual toggle
- Everything is stored locally in your browser (`localStorage`) — no account needed

## Getting started

```bash
npm install
npm run dev
```

Then open the URL Vite prints (default `http://localhost:5173`).

## Scripts

| Command           | What it does                       |
| ----------------- | ---------------------------------- |
| `npm run dev`     | Start the dev server               |
| `npm run build`   | Production build into `dist/`      |
| `npm run preview` | Serve the production build locally |
| `npm run lint`    | Lint with oxlint                   |

## Tech

- [React 19](https://react.dev) + [Vite](https://vite.dev)
- No backend — state persists to `localStorage`. Photos are stored as data URLs, so
  very large images can hit browser storage limits; a real backend/CDN is the natural
  next step.
- The **Generate** button is currently a simulation that drops a placeholder into the
  asset vault — wiring it to a real image-generation API is the next milestone.
