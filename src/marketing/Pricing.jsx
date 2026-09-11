import { useState } from "react";
import { PLANS, PLAN_ORDER, checkoutUrl, monthlyEquivalent, monthsSaved } from "../lib/plans.js";
import { track } from "../lib/leads.js";

const SAVED = monthsSaved(PLANS.studio);

export default function Pricing({ onStartFree, onNoCheckout }) {
  const [cycle, setCycle] = useState("monthly");

  return (
    <>
      <div className="lp-toggle" role="group" aria-label="Billing period">
        <button aria-pressed={cycle === "monthly"} onClick={() => setCycle("monthly")}>
          Monthly
        </button>
        <button
          aria-pressed={cycle === "yearly"}
          onClick={() => {
            setCycle("yearly");
            track("pricing_yearly_viewed");
          }}
        >
          Yearly
          {SAVED > 0 && <span className="lp-save">{SAVED} months free</span>}
        </button>
      </div>

      <div className="lp-plans">
        {PLAN_ORDER.map((id) => {
          const plan = PLANS[id];
          const free = plan.price.monthly === 0;
          const amount = free ? 0 : cycle === "yearly" ? monthlyEquivalent(plan) : plan.price.monthly;
          const href = free ? "" : checkoutUrl(id, cycle);

          return (
            <div key={id} className={`lp-plan ${plan.highlight ? "is-featured" : ""}`}>
              {plan.highlight && <span className="lp-plan-flag">Most popular</span>}
              <h3>{plan.name}</h3>
              <p className="lp-plan-tagline">{plan.tagline}</p>

              <div className="lp-price">
                <strong>{free ? "$0" : `$${amount}`}</strong>
                <span>{free ? "forever" : "/ month"}</span>
              </div>
              <p className="lp-price-note">
                {free
                  ? "No card, no account."
                  : cycle === "yearly"
                    ? `Billed $${plan.price.yearly} yearly`
                    : "Billed monthly, cancel anytime"}
              </p>

              <ul>
                {plan.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>

              {free ? (
                <button
                  className="lp-btn lp-btn-ghost lp-btn-block"
                  onClick={() => {
                    track("cta_click", { location: "pricing", plan: id });
                    onStartFree();
                  }}
                >
                  {plan.cta}
                </button>
              ) : href ? (
                <a
                  className={`lp-btn lp-btn-block ${plan.highlight ? "lp-btn-primary" : "lp-btn-ghost"}`}
                  href={href}
                  onClick={() => track("checkout_start", { plan: id, cycle })}
                >
                  {plan.cta}
                </a>
              ) : (
                <button
                  className={`lp-btn lp-btn-block ${plan.highlight ? "lp-btn-primary" : "lp-btn-ghost"}`}
                  onClick={() => {
                    track("cta_click", { location: "pricing", plan: id, cycle, checkout: "unconfigured" });
                    onNoCheckout(id);
                  }}
                >
                  {plan.cta}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
