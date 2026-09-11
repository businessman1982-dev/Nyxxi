# Nyxxi — AI Creator OS

A home base for AI content creators: keep your characters, their wardrobe, your prompt
library, and generated assets organized in one place.

The repo holds two pages:

| Route   | What it is                                                                  |
| ------- | --------------------------------------------------------------------------- |
| `/`     | The **scroll-film** landing page — one continuous cinematic shot, plus the offer |
| `/app/` | The Nyxxi app itself (React, local-first)                                   |

## The app

- **Characters** — create characters with up to two reference sheets each
- **Look** — the physical description (skin, hair, eyes, build) that goes into every
  image prompt for that character. Autosaves, counts words, copies in one click
- **Bible** — who the character is: backstory, personality, how they carry themselves.
  Kept separate from the look, because only one of the two belongs in a prompt
- **Locations** — a reusable library of places, each with a description and an
  optional reference photo
- **Compose** — hold the look locked, pick one of each wardrobe kind plus a
  location, and get a
  finished prompt to copy or save to the vault. Reference photos (character sheet,
  outfit, location) are gathered beside it to attach in your generator

Nyxxi does not generate images — it is where you assemble everything a generator
needs, so the copy-out is one click and nothing drifts between renders.
- **Wardrobe** — clothes, hair, shoes, bags and jewellery, each with a photo and a
  note, grouped by kind. Shoot a piece on its own or leave it in the outfit photo.
  A hair piece picked in Compose replaces the hair line in the character's look, so
  the prompt never says two different things about it
- **Prompt vault** — save prompts globally or per character, then generate from them
- **Asset vault** — generation outputs are collected automatically
- **Search** — one search box across characters, looks, bibles, wardrobe, and prompts
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

## Plans & monetization

`src/lib/plans.js` is the single source of truth for both the rates rendered on the
landing page and the limits enforced in the app — change a number there and both
surfaces move together. It is plain JS with no React in it, so the vanilla landing
script imports the same module the React app does.

| Plan   | Price    | Characters | Prompts   | Assets    | Sheets |
| ------ | -------- | ---------- | --------- | --------- | ------ |
| Free   | $0       | 2          | 10        | 25        | 2      |
| Studio | $19 / mo | Unlimited  | Unlimited | Unlimited | 6      |
| Agency | $79 / mo | Unlimited  | Unlimited | Unlimited | 12     |

Yearly billing is priced at 10x the monthly rate (two months free); the landing page
and the in-app paywall both derive that discount from the numbers rather than
hard-coding it.

When a free-plan quota is spent, the action routes to the in-app `Upgrade` screen
carrying the reason that triggered it — including saving a prompt out of **Compose**.
Once a quota passes 60%, the dashboard shows a single progress nudge: the tightest
quota only, so the app never stacks upsells.

> The current plan is read from `localStorage` and there is no server, so the gate is a
> product surface, not a security boundary. Real enforcement arrives with the backend
> that issues the entitlement — the same backend Studio's cloud sync is sold on.

## Configuration

Copy `.env.example` to `.env` and fill in what you have:

| Variable                       | Purpose                                                               |
| ------------------------------ | --------------------------------------------------------------------- |
| `VITE_CHECKOUT_STUDIO_MONTHLY` | Hosted checkout link (Stripe Payment Link, Lemon Squeezy, Paddle…)     |
| `VITE_CHECKOUT_STUDIO_YEARLY`  | Same, billed yearly                                                   |
| `VITE_CHECKOUT_AGENCY_MONTHLY` | Same, Agency                                                          |
| `VITE_CHECKOUT_AGENCY_YEARLY`  | Same, Agency yearly                                                   |
| `VITE_SIGNUP_ENDPOINT`         | POST target for email capture; receives `{ email, source, plan, at }` |
| `VITE_SIGNUP_FORMAT`           | `json` (default) or `form` — see below                                |

Any checkout link left blank turns that rate's button into a jump to the early-access
list, so the page still converts before billing is wired up.

**`VITE_SIGNUP_ENDPOINT` is not optional in production.** With it unset, signups are
written to the visitor's own `localStorage` and never reach you — the console warns on
every capture. It is a URL that accepts a POST, not an email address.

### Collecting signups in a Google Sheet

`scripts/lead-sink.gs` turns a Sheet into that endpoint — free, no third party, and the
list stays yours. Paste it into the Sheet's Apps Script editor, deploy as a web app with
access set to **Anyone**, and put the `/exec` URL it gives you in `VITE_SIGNUP_ENDPOINT`.
Each signup lands as a row; a repeat address updates its row instead of duplicating.

Set `VITE_SIGNUP_FORMAT=form` for this route. Apps Script cannot answer the CORS
preflight that a JSON body triggers, so `json` mode fails in the browser before the
request is ever sent. `form` posts as `application/x-www-form-urlencoded`, which is a
CORS-simple request and skips the preflight. Hosted services that answer OPTIONS
properly (Formspree, Buttondown, your own API) work on the `json` default.

Conversion events (`cta_click`, `pricing_yearly_viewed`, `checkout_start`,
`paywall_hit`, `lead_captured`) are pushed to `window.dataLayer` and
`window.plausible` when either is present, and silently dropped when neither is.

## Deploying

Step-by-step for putting the site online and collecting signups for real:
**[DEPLOY.md](DEPLOY.md)**.

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
