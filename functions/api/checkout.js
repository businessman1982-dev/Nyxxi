// Pages Function: GET /api/checkout?session_id=cs_...&plan=studio
//
// Verifies a Stripe Checkout Session when STRIPE_SECRET_KEY is set on the
// Pages project (runtime env, not a VITE_ variable). With no key, a paid plan
// named in `plan` is accepted so the return URL still unlocks the app.

import { isPaidPlan, planFromSession } from "../../src/lib/plan-prices.js";

const SESSION_RE = /^cs_[A-Za-z0-9_]{8,200}$/;

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

/** Dashboard secrets are often pasted with quotes, a Bearer prefix, or a newline. */
export function sanitizeStripeKey(raw) {
  let key = String(raw ?? "").replace(/^\uFEFF/, "").trim();
  if (key.length >= 2) {
    const quote = key[0];
    if ((quote === '"' || quote === "'") && key.endsWith(quote)) key = key.slice(1, -1).trim();
  }
  key = key.replace(/^Bearer\s+/i, "").trim();
  // A CR/LF inside the value makes `Authorization` an illegal header and fetch throws.
  return stripControls(key);
}

function stripControls(value) {
  let out = "";
  for (const ch of value) {
    const code = ch.codePointAt(0);
    if (code <= 0x1f || code === 0x7f) continue;
    out += ch;
  }
  return out;
}

function redact(message) {
  return String(message ?? "")
    .replace(/sk_(?:live|test)_[A-Za-z0-9]+/g, "[key]")
    .replace(/rk_(?:live|test)_[A-Za-z0-9]+/g, "[key]")
    .replace(/Bearer\s+\S+/gi, "Bearer [key]")
    .slice(0, 180);
}

export async function handleCheckout({ requestUrl, env = {}, fetchImpl = fetch }) {
  const url = new URL(requestUrl);
  const hint = (url.searchParams.get("plan") || "").toLowerCase();
  const sessionId = url.searchParams.get("session_id") || "";
  const key = sanitizeStripeKey(env.STRIPE_SECRET_KEY);

  if (!key) {
    if (!isPaidPlan(hint)) return { status: 400, body: { ok: false, error: "unconfirmed" } };
    return { status: 200, body: { ok: true, verified: false, reason: "unconfigured", plan: hint } };
  }

  if (!SESSION_RE.test(sessionId)) {
    return { status: 400, body: { ok: false, error: "missing_session" } };
  }

  let session;
  try {
    // Do not pass `cache`: Pages' production runtime throws
    // "The 'cache' field on 'RequestInitializerDict' is not implemented"
    // for that option. The throw was caught below and answered with HTTP 502,
    // which Cloudflare's edge replaces with the plain-text "error code: 502"
    // page. Stripe responses already send Cache-Control: no-store, and an
    // Authorization GET is not served from the cache.
    const res = await fetchImpl(`https://api.stripe.com/v1/checkout/sessions/${sessionId}`, {
      headers: { Authorization: `Bearer ${key}` },
    });
    // Read the body on every status. Leaving it unread faults the isolate
    // after the handler returns, and Pages turns that into the same 502 page.
    const text = await res.text();
    if (!res.ok) {
      return { status: 402, body: { ok: false, error: "stripe_rejected", stripe_status: res.status } };
    }
    session = text ? JSON.parse(text) : null;
  } catch (err) {
    // Never answer 502/503/504. Cloudflare replaces those with its own page.
    const detail = redact(err instanceof Error ? err.message : err);
    console.error(JSON.stringify({ event: "checkout_stripe_fetch_failed", detail }));
    return { status: 422, body: { ok: false, error: "stripe_unreachable", detail } };
  }

  const plan = planFromSession(session, hint);
  if (!plan) return { status: 402, body: { ok: false, error: "unpaid_or_unknown" } };
  return { status: 200, body: { ok: true, verified: true, plan } };
}

export async function onRequestGet(context) {
  try {
    const result = await handleCheckout({
      requestUrl: context.request.url,
      env: context.env || {},
    });
    return json(result.body, result.status);
  } catch (err) {
    return json(
      { ok: false, error: "stripe_unreachable", detail: redact(err instanceof Error ? err.message : err) },
      422,
    );
  }
}
