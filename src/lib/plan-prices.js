// Charged amounts in US cents. Checkout verification matches these against the
// Stripe Checkout Session. Keep them aligned with the prices in plans.js — that
// file derives its dollar amounts from here.

export const PAID_PLAN_IDS = ["studio", "agency"];

export const PLAN_PRICES_CENTS = {
  studio: { monthly: 1900, yearly: 19000 },
  agency: { monthly: 7900, yearly: 79000 },
};

export function isPaidPlan(id) {
  return id === "studio" || id === "agency";
}

/** Plan whose list price equals `cents`, or null. USD only. */
export function planFromAmount(cents, currency = "usd") {
  if (currency && String(currency).toLowerCase() !== "usd") return null;
  if (typeof cents !== "number" || !Number.isFinite(cents)) return null;
  for (const id of PAID_PLAN_IDS) {
    const prices = PLAN_PRICES_CENTS[id];
    if (cents === prices.monthly || cents === prices.yearly) return id;
  }
  return null;
}

/**
 * Which paid plan a completed Checkout Session unlocked.
 * Amount wins (the buyer cannot edit what Stripe charged). `metadata.plan` is
 * next, for a Payment Link the merchant tagged. The return-URL hint is only
 * used when the session is paid but neither of those matched — a buyer can
 * edit that query string, so set metadata or keep the prices in sync.
 */
export function planFromSession(session, hint) {
  if (!session || typeof session !== "object") return null;
  if (session.status !== "complete") return null;
  if (session.payment_status !== "paid" && session.payment_status !== "no_payment_required") {
    return null;
  }

  const currency = typeof session.currency === "string" ? session.currency : "usd";
  const fromSubtotal = planFromAmount(session.amount_subtotal, currency);
  if (fromSubtotal) return fromSubtotal;
  const fromTotal = planFromAmount(session.amount_total, currency);
  if (fromTotal) return fromTotal;

  const meta = session.metadata && typeof session.metadata.plan === "string" ? session.metadata.plan : "";
  if (isPaidPlan(meta)) return meta;

  return isPaidPlan(hint) ? hint : null;
}
