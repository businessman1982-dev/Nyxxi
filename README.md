# Nyxxi — AI Creator OS

A home base for AI content creators: keep your characters, their wardrobe, your prompt
library, and generated assets organized in one place — plus the marketing site and
pricing that sell it.

## Two surfaces, one bundle

| Route    | What it is                                                           |
| -------- | -------------------------------------------------------------------- |
| `/`      | Marketing landing page — hero, features, pricing, FAQ, email capture  |
| `/#/app` | The Creator OS app itself                                            |

Both share the design tokens and the theme system. `src/Root.jsx` owns the split and
the light/dark preference.

## Features

- **Characters** — create characters with reference sheets (2 on Free, 6 on Studio)
- **Wardrobe** — attach outfit photos and notes to every character
- **Prompt vault** — save prompts globally or per character, then generate from them
- **Asset vault** — generation outputs are collected automatically
- **Search** — one search box across characters, wardrobe, and prompts
- **Light / dark theme** — follows your system preference, with a manual toggle
- Everything is stored locally in your browser (`localStorage`) — no account needed

## Plans & monetization

`src/lib/plans.js` is the single source of truth for both the pricing table on the
landing page and the limits enforced in the app — change a number there and both
surfaces move together.

| Plan   | Price    | Characters | Prompts   | Assets    | Sheets |
| ------ | -------- | ---------- | --------- | --------- | ------ |
| Free   | $0       | 2          | 10        | 25        | 2      |
| Studio | $19 / mo | Unlimited  | Unlimited | Unlimited | 6      |
| Agency | $79 / mo | Unlimited  | Unlimited | Unlimited | 12     |

Yearly billing is priced at 10x the monthly rate (two months free); the landing page
and the in-app paywall both derive that discount from the numbers rather than
hard-coding it.

When a free-plan quota is spent, the action routes to the in-app `Upgrade` screen
carrying the reason that triggered it. Once a quota passes 60%, the dashboard shows a
single progress nudge — the tightest quota only, so the app never stacks upsells.

> The current plan is read from `localStorage` and there is no server, so the gate is a
> product surface, not a security boundary. Real enforcement arrives with the backend
> that issues the entitlement.

## Configuration

Copy `.env.example` to `.env` and fill in what you have:

| Variable                       | Purpose                                                               |
| ------------------------------ | --------------------------------------------------------------------- |
| `VITE_CHECKOUT_STUDIO_MONTHLY` | Hosted checkout link (Stripe Payment Link, Lemon Squeezy, Paddle…)     |
| `VITE_CHECKOUT_STUDIO_YEARLY`  | Same, billed yearly                                                   |
| `VITE_CHECKOUT_AGENCY_MONTHLY` | Same, Agency                                                          |
| `VITE_CHECKOUT_AGENCY_YEARLY`  | Same, Agency yearly                                                   |
| `VITE_SIGNUP_ENDPOINT`         | POST target for email capture; receives `{ email, source, plan, at }` |

Any checkout link left blank falls back to the email capture form, so the page still
converts before billing is wired up.

**`VITE_SIGNUP_ENDPOINT` is not optional in production.** With it unset, signups are
written to the visitor's own `localStorage` and never reach you — the console warns on
every capture.

Conversion events (`cta_click`, `pricing_yearly_viewed`, `checkout_start`,
`paywall_hit`, `lead_captured`) are pushed to `window.dataLayer` and
`window.plausible` when either is present, and silently dropped when neither is.

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
  next step, and it is what Studio's cloud sync is sold on.
- The **Generate** button is currently a simulation that drops a placeholder into the
  asset vault — wiring it to a real image-generation API is the next milestone. The
  landing-page FAQ says so plainly rather than implying otherwise.
