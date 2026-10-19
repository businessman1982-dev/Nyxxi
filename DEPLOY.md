# Putting Nyxxi online

Two jobs, independent of each other. Do the Sheet first — then the site goes live
already able to collect signups, instead of losing the first week of them.

- [1 · Collect signups in a Google Sheet](#1--collect-signups-in-a-google-sheet) — ~5 min
- [2 · Publish the site on Cloudflare Pages](#2--publish-the-site-on-cloudflare-pages) — ~10 min

---

## 1 · Collect signups in a Google Sheet

You end up with a URL. That URL is the "endpoint" — the address the signup form posts
to. Every email that comes in becomes a row in your Sheet.

### Set it up

1. Go to [sheets.new](https://sheets.new) to create a Sheet. Name it something like
   *Nyxxi leads*.
2. Rename the first tab to **Leads** (double-click the tab at the bottom).
   The script creates it if you skip this, but matching keeps things obvious.
3. In the menu: **Extensions → Apps Script**. A code editor opens in a new tab.
4. Delete the few lines of placeholder code that are already there.
5. Open `scripts/lead-sink.gs` from this repo, copy all of it, paste it in.
6. Click the **save** icon (💾).
7. Click **Deploy → New deployment**.
8. Click the gear next to "Select type" and choose **Web app**.
9. Set:
   - **Execute as:** `Me`
   - **Who has access:** `Anyone`

   > `Anyone` is required. `Anyone with Google account` forces your visitors to log
   > into Google before they can join your list, which means almost nobody will.
   > This does not make your Sheet public — only this script can write to it, and it
   > only ever appends a row.

10. Click **Deploy**. Google asks you to authorise it: **Review permissions** → pick
    your account → **Advanced** → *Go to (project name)* → **Allow**. The scary
    "unverified app" warning is normal — the unverified app is the script you just
    pasted.
11. Copy the **Web app URL**. It ends in `/exec`.

### Check it works

Paste that `/exec` URL into a browser. You should see:

```json
{"ok":true,"rows":0}
```

If you see that, the endpoint is live. (If you get a Google login page instead, step 9
was set to the wrong access level — redeploy with `Anyone`.)

### Give it to the site

Two settings. Locally that means a `.env` file in the project root; on Cloudflare it
means the environment variables in part 2, step 5.

```
VITE_SIGNUP_ENDPOINT=https://script.google.com/macros/s/AKfy...long.../exec
VITE_SIGNUP_FORMAT=form
```

**`VITE_SIGNUP_FORMAT=form` is not optional here.** Google Apps Script can't answer the
CORS preflight that a JSON request triggers, so on the default setting the browser
blocks every signup before it's even sent. `form` sidesteps the preflight entirely.

### Later, if you outgrow it

Anything that accepts a POST works — Formspree, Buttondown, ConvertKit, your own API.
Swap the URL and drop `VITE_SIGNUP_FORMAT` back to `json` (or remove the line), since
those services answer preflight properly.

---

## 2 · Publish the site on Cloudflare Pages

Free, fast, and it redeploys itself every time you push.

1. Sign up at [dash.cloudflare.com](https://dash.cloudflare.com).
2. **Workers & Pages → Create → Pages → Connect to Git**, and authorise GitHub.
3. Pick the **Nyxxi** repository.
4. Build settings:

   | Field                  | Value           |
   | ---------------------- | --------------- |
   | Framework preset       | `Vite`          |
   | Build command          | `npm run build` |
   | Build output directory | `dist`          |
   | Production branch      | your branch     |

5. Expand **Environment variables** and add the ones you have:

   ```
   VITE_SIGNUP_ENDPOINT   = <your /exec URL from part 1>
   VITE_SIGNUP_FORMAT     = form
   ```

   Add the `VITE_CHECKOUT_*` links here too, once you have Stripe set up. Leave out
   what you don't have yet — an empty checkout link just routes that button to the
   signup list instead.

   > **These are read at build time, not when someone visits.** Vite bakes `VITE_*`
   > values into the JavaScript during the build. Changing one in the dashboard does
   > nothing until you redeploy (**Deployments → … → Retry deployment**). This catches
   > people out constantly — if you add the endpoint and signups still vanish, this is
   > almost certainly why.

6. **Save and Deploy.** First build takes a minute or two. You get a URL like
   `nyxxi-a1b.pages.dev`.

### Check it

- `/` — the scroll-film, all five chapters, rates at the bottom
- `/app/` — the app
- Submit your own email on the live site, then look at your Sheet. A row should appear
  within a second or two.

If the row doesn't appear: open the page, press F12, and submit again. A red CORS error
in the Console means `VITE_SIGNUP_FORMAT=form` didn't make it into the build — recheck
step 5 and redeploy.

### Your own domain

1. Register one anywhere (Cloudflare Registrar sells at cost).
2. In your Pages project: **Custom domains → Set up a custom domain**, enter it, follow
   the DNS prompt. If the domain is already on Cloudflare it's a couple of clicks.
3. HTTPS is automatic.

### From then on

Every push to the production branch rebuilds and redeploys. Pull requests get their own
preview URL, so you can look at a change before it's live.

### Unlock a plan after Stripe

The buy buttons go to Stripe Payment Links. Stripe does not tell the app about the
sale unless you send the buyer back to Nyxxi. On **each** Payment Link:

1. Stripe Dashboard → **Payment Links** → open the link.
2. **After payment**, redirect to your website instead of stopping on Stripe's confirmation page.
3. Paste the URL below. Leave `{CHECKOUT_SESSION_ID}` written exactly like that — Stripe replaces it.

| Payment Link | Redirect URL |
| --- | --- |
| Studio monthly | `https://nyxxi.io/app/?plan=studio&session_id={CHECKOUT_SESSION_ID}` |
| Studio yearly | `https://nyxxi.io/app/?plan=studio&session_id={CHECKOUT_SESSION_ID}` |
| Agency monthly | `https://nyxxi.io/app/?plan=agency&session_id={CHECKOUT_SESSION_ID}` |
| Agency yearly | `https://nyxxi.io/app/?plan=agency&session_id={CHECKOUT_SESSION_ID}` |

That stores the plan in the browser that finished checkout. It does not follow the buyer to another device. Cloud sync is not built; Studio says so.

To check the payment with Stripe before unlocking, add one runtime variable on the Pages project (**Settings → Environment variables**). This is **not** a `VITE_` variable — those are baked into the public JavaScript.

| Name | Value |
| --- | --- |
| `STRIPE_SECRET_KEY` | Secret key `sk_live_...`, or a restricted key that can **read Checkout Sessions** |

- Scope: **Production** (and **Preview** if preview URLs should verify too).
- Mark it encrypted / secret.
- No rebuild is required for the function to see it. Changing a `VITE_CHECKOUT_*` link still needs a redeploy.
- The function is `functions/api/checkout.js`, route `/api/checkout`. Pages picks up the `functions/` directory next to the `dist` build. Don't move it into `dist` yourself.

Until the key is set, the return URL still unlocks whatever `plan` it names. Anyone who knows that URL can unlock a plan on their own browser. With the key set, a rejected session, an unpaid session, or a failure to reach Stripe leaves the browser on Free. A 502 page from Cloudflare is not treated as a successful payment.

With the key set, Nyxxi loads the Checkout Session and unlocks the plan whose price matches the amount Stripe recorded: Studio $19 / $190, Agency $79 / $790 (USD, before tax — `amount_subtotal`). A buyer who edits `?plan=` in the address bar does not get a different plan when the amount matches. If you change a price, update `src/lib/plan-prices.js`, or set the Payment Link's metadata `plan` to `studio` or `agency`. Use a **live** key for live Payment Links and a **test** key for test-mode links — a mismatch rejects the session.

The in-app Studio button and the landing-page buttons use the same Payment Links, so one redirect URL per link covers both.

---

## What's in the repo for this

| File              | What it does                                                             |
| ----------------- | ------------------------------------------------------------------------ |
| `public/_headers` | Caching and security headers. Fingerprinted assets cached forever, HTML never — so a deploy reaches people immediately. Also works on Netlify. |
| `public/_redirects` | Sends `/app` to `/app/`.                                               |
| `wrangler.toml`   | Only for deploying from your own machine with `npx wrangler pages deploy`. The GitHub integration ignores it and uses the dashboard settings. |
| `scripts/lead-sink.gs` | The Google Sheets endpoint from part 1.                             |
| `.env.example`    | Every Vite variable, with notes. Copy to `.env` for local development. `STRIPE_SECRET_KEY` is documented there but belongs in the Pages dashboard, not in `.env`. |
| `functions/api/checkout.js` | Confirms a Stripe Checkout Session and tells the app which plan to unlock. |
