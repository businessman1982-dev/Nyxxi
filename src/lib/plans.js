// Plan catalogue. Limits here are enforced in the app; prices are rendered on the
// landing page. Keep the two in sync — the offer only works if the gate is real.

export const PLAN_ORDER = ["free", "studio", "agency"];

export const PLANS = {
  free: {
    id: "free",
    name: "Free",
    tagline: "Enough to prove it works.",
    price: { monthly: 0, yearly: 0 },
    limits: { characters: 2, prompts: 10, assets: 25, sheets: 2 },
    features: [
      "2 characters",
      "10 saved prompts",
      "25 assets in the vault",
      "Wardrobe + character sheets",
      "Stored in your browser",
    ],
    cta: "Start free",
  },
  studio: {
    id: "studio",
    name: "Studio",
    tagline: "For the creator running this daily.",
    price: { monthly: 19, yearly: 190 },
    limits: { characters: Infinity, prompts: Infinity, assets: Infinity, sheets: 6 },
    features: [
      "Unlimited characters & prompts",
      "6 reference sheets per character",
      "Unlimited asset vault",
      "Cloud sync across devices",
      "Bulk export of prompts & assets",
      "Priority support",
    ],
    cta: "Start Studio",
    highlight: true,
  },
  agency: {
    id: "agency",
    name: "Agency",
    tagline: "For teams shipping for clients.",
    price: { monthly: 79, yearly: 790 },
    limits: { characters: Infinity, prompts: Infinity, assets: Infinity, sheets: 12 },
    features: [
      "Everything in Studio",
      "5 seats included",
      "Client workspaces with separate vaults",
      "Shared brand kits & prompt templates",
      "API access",
      "Onboarding call",
    ],
    cta: "Talk to us",
  },
};

// Vite inlines `import.meta.env.VITE_*` at build time, so these have to be written
// out statically — a computed lookup would resolve to undefined in production.
const CHECKOUT = {
  studio: {
    monthly: import.meta.env.VITE_CHECKOUT_STUDIO_MONTHLY,
    yearly: import.meta.env.VITE_CHECKOUT_STUDIO_YEARLY,
  },
  agency: {
    monthly: import.meta.env.VITE_CHECKOUT_AGENCY_MONTHLY,
    yearly: import.meta.env.VITE_CHECKOUT_AGENCY_YEARLY,
  },
};

/** Hosted checkout link for a plan, or "" when none is configured yet. */
export function checkoutUrl(planId, cycle) {
  return CHECKOUT[planId]?.[cycle] || "";
}

/** Monthly-equivalent price when billed yearly. */
export function monthlyEquivalent(plan) {
  return plan.price.yearly ? Math.round((plan.price.yearly / 12) * 100) / 100 : 0;
}

/** Whole months saved by paying yearly (0 for free plans). */
export function monthsSaved(plan) {
  if (!plan.price.monthly) return 0;
  return Math.round(12 - plan.price.yearly / plan.price.monthly);
}

const PLAN_KEY = "nyxxi-plan";

export function loadPlan() {
  try {
    const id = localStorage.getItem(PLAN_KEY);
    if (id && PLANS[id]) return id;
  } catch {}
  return "free";
}

export function savePlan(id) {
  try {
    localStorage.setItem(PLAN_KEY, id);
  } catch {}
}

/**
 * What the current plan allows right now.
 * `used` is the current count, `limit` may be Infinity.
 */
export function quota(planId, kind, used) {
  const limit = PLANS[planId]?.limits[kind] ?? 0;
  return {
    limit,
    used,
    remaining: limit === Infinity ? Infinity : Math.max(0, limit - used),
    exceeded: used >= limit,
    unlimited: limit === Infinity,
  };
}
