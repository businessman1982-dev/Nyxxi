import { isPaidPlan } from "./plan-prices.js";
import { PLANS, savePlan } from "./plans.js";

const SESSION_RE = /^cs_[A-Za-z0-9_]{8,200}$/;

const FAIL = {
  missing_session:
    "Nyxxi couldn't confirm this payment, so you're still on Free. Refresh the page, or open the link from your Stripe receipt.",
  unpaid_or_unknown:
    "This checkout isn't a completed payment, so you're still on Free. If you were charged, refresh the page.",
  stripe_rejected:
    "Stripe didn't confirm this checkout, so you're still on Free. Refresh the page. If it keeps failing, use the link from your Stripe receipt.",
  stripe_unreachable: "Nyxxi couldn't reach Stripe to confirm the payment. Refresh the page.",
  unconfirmed: "Nyxxi couldn't confirm a plan from this link, so you're still on Free.",
  network: "Nyxxi couldn't confirm the payment just now. Refresh the page to try again.",
};

/** Pull `plan` and `session_id` off a Stripe return URL, or null when neither is present. */
export function readReturnParams(search) {
  const q = new URLSearchParams(search || "");
  const plan = (q.get("plan") || "").toLowerCase();
  const sessionId = q.get("session_id") || "";
  if (!isPaidPlan(plan) && !sessionId) return null;
  return { plan: isPaidPlan(plan) ? plan : "", sessionId };
}

/**
 * Apply a post-payment return URL (`/app/?plan=studio&session_id=cs_...`).
 * Asks `/api/checkout` to verify the session when that function answers JSON.
 * An HTML response means the function isn't deployed (local Vite); the plan
 * named in the URL is stored anyway. A 5xx or Cloudflare's plain-text
 * "error code: 502" page is a failed check, not a missing function — it must
 * not unlock the hinted plan. A JSON rejection is never overridden.
 */
export async function claimCheckoutReturn(search = window.location.search) {
  const params = readReturnParams(search);
  if (!params) return null;

  try {
    const q = new URLSearchParams();
    if (params.sessionId && SESSION_RE.test(params.sessionId)) q.set("session_id", params.sessionId);
    else if (params.sessionId) q.set("session_id", params.sessionId.slice(0, 200));
    if (params.plan) q.set("plan", params.plan);
    const res = await fetch(`/api/checkout?${q.toString()}`, { headers: { Accept: "application/json" } });
    if (res.status >= 500) return fail("stripe_unreachable");
    const type = res.headers.get("content-type") || "";
    if (!type.includes("application/json")) return acceptHint(params.plan);
    const data = await res.json();
    if (data?.ok && isPaidPlan(data.plan)) {
      return acceptPlan(data.plan, data.verified !== false);
    }
    return fail(data?.error || "unconfirmed");
  } catch {
    return fail("network");
  }
}

function acceptHint(plan) {
  if (!isPaidPlan(plan)) return fail("unconfirmed");
  return acceptPlan(plan, false);
}

function acceptPlan(plan, verified) {
  const persisted = savePlan(plan);
  if (persisted) clearReturnParams();
  const name = PLANS[plan].name;
  return {
    ok: true,
    plan,
    verified,
    persisted,
    title: `${name} is unlocked`,
    message: persisted
      ? `${name} is unlocked in this browser. It stays on this device — cloud sync across devices is coming soon, so another device, or clearing this browser's data, comes back as Free.`
      : `${name} unlocked, but this browser didn't keep it. Instagram and TikTok's in-app browsers and private mode often don't keep data. Copy this page's address into Safari, Chrome, or Firefox.`,
  };
}

function fail(error) {
  return {
    ok: false,
    error,
    title: "Payment not confirmed",
    message: FAIL[error] || FAIL.unconfirmed,
  };
}

function clearReturnParams() {
  const url = new URL(window.location.href);
  url.searchParams.delete("plan");
  url.searchParams.delete("session_id");
  const qs = url.searchParams.toString();
  window.history.replaceState({}, "", `${url.pathname}${qs ? `?${qs}` : ""}${url.hash}`);
}
