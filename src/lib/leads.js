const LEADS_KEY = "nyxxi-leads";
const ENDPOINT = import.meta.env.VITE_SIGNUP_ENDPOINT;

/** Fire a conversion event into whatever analytics the page has loaded. */
export function track(event, props = {}) {
  try {
    window.dataLayer?.push({ event, ...props });
    window.plausible?.(event, { props });
  } catch (e) {
    console.error("track failed", e);
  }
}

export const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

/**
 * Capture a lead. Posts to VITE_SIGNUP_ENDPOINT when one is configured;
 * otherwise the address is only kept in this visitor's browser, which is a
 * dev/preview fallback and not a mailing list. Resolves to the sink used.
 */
export async function captureLead(email, { source = "landing", plan = null } = {}) {
  const payload = { email: email.trim(), source, plan, at: new Date().toISOString() };

  if (ENDPOINT) {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`signup failed (${res.status})`);
    track("lead_captured", { source, plan });
    return "remote";
  }

  console.warn(
    "[nyxxi] VITE_SIGNUP_ENDPOINT is not set — this signup was stored in localStorage only and will not reach you."
  );
  try {
    const existing = JSON.parse(localStorage.getItem(LEADS_KEY) || "[]");
    localStorage.setItem(LEADS_KEY, JSON.stringify([...existing, payload]));
  } catch (e) {
    console.error("lead save failed", e);
  }
  track("lead_captured", { source, plan, sink: "local" });
  return "local";
}
