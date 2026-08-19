# Nyxxi — AI Creator OS

A home base for AI content creators: keep your characters, their wardrobe, your prompt
library, and generated assets organized in one place.

The repo holds two pages:

| Route   | What it is                                                              |
| ------- | ----------------------------------------------------------------------- |
| `/`     | The **scroll-film** landing page — one continuous cinematic shot         |
| `/app/` | The Nyxxi app itself (React, local-first)                                |

## The app

- **Characters** — create characters with up to two reference sheets each
- **Wardrobe** — attach outfit photos and notes to every character
- **Prompt vault** — save prompts globally or per character, then generate from them
- **Asset vault** — generation outputs are collected automatically
- **Search** — one search box across characters, wardrobe, and prompts
- **Light / dark theme** — follows your system preference, with a manual toggle
- Everything is stored locally in your browser (`localStorage`) — no account needed

## The scroll-film landing

The whole hero *is* the page: one unbroken shot that scrubs as you scroll, in five
chapters — **I VOID → II INVOCATION → III EMBODIMENT → IV WARDROBE → V THE VAULT** —
that dissolves into the content below.

It is built as a **single sticky stage driven by one master GSAP timeline**
(`src/landing/main.js`). The camera never scrolls and never cuts: each chapter is a
slice of the same 100-unit timeline, and neighbouring chapters overlap so one hands off
to the next by transform — the collapsing glow of chapter I becomes the seed of the
sigil in chapter II, the sigil collapses into the character plate in chapter III, and
so on. Chapter IV's horizontal rack gets its own scrubbed tween aligned to the same
slice so its cards can parallax via `containerAnimation`.

The film ends on a white bloom whose colour is exactly the background of the section
below it, so there is no visible line where the film becomes the page.

Everything is pure code — no video, no image assets. Fonts are self-hosted in
`public/fonts/`, so the page never calls a third party.

### Dev contract

The page implements the hooks the verification harness needs:

- `?jump=<scrollY>` — loads pre-scrolled with all scroll-driven state force-settled
  (smooth scroll and entrance animations are skipped so nothing overwrites the
  scrubbed state)
- `window.__ready === true` — set only once fonts are loaded and the film has settled
- `?jank` — logs per-frame rAF deltas (max / p95) to the console every 2s

```bash
npm run build && npm run preview
CHROME_PATH=/path/to/chrome node scripts/verify.cjs shot "http://localhost:4173/?jump=3500" beat.png
CHROME_PATH=/path/to/chrome node scripts/verify.cjs jank "http://localhost:4173/"
```

`prefers-reduced-motion: reduce` collapses the film into five static, legible panels.

## Getting started

```bash
npm install
npm run dev
```

Then open the URL Vite prints (default `http://localhost:5173`) for the landing page,
or `http://localhost:5173/app/` for the app.

## Scripts

| Command           | What it does                       |
| ----------------- | ---------------------------------- |
| `npm run dev`     | Start the dev server               |
| `npm run build`   | Production build into `dist/`      |
| `npm run preview` | Serve the production build locally |
| `npm run lint`    | Lint with oxlint                   |

## Tech

- [React 19](https://react.dev) + [Vite](https://vite.dev) (multi-page build)
- [GSAP](https://gsap.com) + ScrollTrigger and [Lenis](https://lenis.darkroom.engineering)
  for the landing page
- No backend — state persists to `localStorage`. Photos are stored as data URLs, so
  very large images can hit browser storage limits; a real backend/CDN is the natural
  next step.
- The **Generate** button is currently a simulation that drops a placeholder into the
  asset vault — wiring it to a real image-generation API is the next milestone.
