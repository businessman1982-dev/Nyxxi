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

export async function handleCheckout({ requestUrl, env = {}, fetchImpl = fetch }) {
  const url = new URL(requestUrl);
  const hint = (url.searchParams.get("plan") || "").toLowerCase();
  const sessionId = url.searchParams.get("session_id") || "";
  const key = String(env.STRIPE_SECRET_KEY || "").trim();

  if (!key) {
    if (!isPaidPlan(hint)) return { status: 400, body: { ok: false, error: "unconfirmed" } };
    return { status: 200, body: { ok: true, verified: false, reason: "unconfigured", plan: hint } };
  }

  if (!SESSION_RE.test(sessionId)) {
    return { status: 400, body: { ok: false, error: "missing_session" } };
  }

  let session;
  try {
    const res = await fetchImpl(`https://api.stripe.com/v1/checkout/sessions/${sessionId}`, {
      headers: { Authorization: `Bearer ${key}` },
      cache: "no-store",
    });
    if (!res.ok) return { status: 402, body: { ok: false, error: "stripe_rejected" } };
    session = await res.json();
  } catch {
    return { status: 502, body: { ok: false, error: "stripe_unreachable" } };
  }

  const plan = planFromSession(session, hint);
  if (!plan) return { status: 402, body: { ok: false, error: "unpaid_or_unknown" } };
  return { status: 200, body: { ok: true, verified: true, plan } };
}

export async function onRequestGet(context) {
  const result = await handleCheckout({
    requestUrl: context.request.url,
    env: context.env || {},
  });
  return json(result.body, result.status);
}
