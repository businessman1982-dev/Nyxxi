import { useState } from "react";
import Header from "../components/Header.jsx";
import Button from "../components/Button.jsx";
import { PLANS, checkoutUrl, monthlyEquivalent, monthsSaved } from "../lib/plans.js";
import { track } from "../lib/leads.js";

const REASONS = {
  characters: (limit) => `You've filled all ${limit} character slots on the Free plan.`,
  prompts: (limit) => `Your prompt vault is full at ${limit} prompts on the Free plan.`,
  assets: (limit) => `Your asset vault is full at ${limit} assets on the Free plan.`,
  sheets: (limit) => `Free characters hold ${limit} reference sheets. Studio holds ${PLANS.studio.limits.sheets}.`,
};

const SAVED = monthsSaved(PLANS.studio);

export default function Upgrade({ nav, route, onExitToSite }) {
  const [cycle, setCycle] = useState("monthly");
  const plan = PLANS.studio;
  const back = route.from || { screen: "dashboard" };
  const reason = REASONS[route.reason]?.(PLANS.free.limits[route.reason]);
  const amount = cycle === "yearly" ? monthlyEquivalent(plan) : plan.price.monthly;
  const href = checkoutUrl(plan.id, cycle);

  return (
    <div>
      <Header title="Upgrade" onBack={() => nav(back)} />
      <div style={{ padding: "22px 16px 26px" }}>
        {reason && (
          <div
            style={{
              background: "var(--bg-accent)",
              borderRadius: "var(--radius)",
              padding: "12px 14px",
              marginBottom: 22,
            }}
          >
            <p style={{ fontSize: 13, lineHeight: 1.6, margin: 0, color: "var(--text-primary)" }}>{reason}</p>
          </div>
        )}

        <p style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", margin: "0 0 8px" }}>
          Nyxxi Studio
        </p>
        <p style={{ fontSize: 20, fontWeight: 600, letterSpacing: "-0.02em", margin: "0 0 6px" }}>
          Take the ceiling off.
        </p>
        <p style={{ fontSize: 13, lineHeight: 1.6, color: "var(--text-secondary)", margin: "0 0 20px" }}>
          Unlimited characters and prompts, {plan.limits.sheets} reference sheets each, and cloud
          sync so your vault follows you between devices.
        </p>

        <div style={{ display: "flex", gap: 6, marginBottom: 18 }}>
          {["monthly", "yearly"].map((c) => (
            <button
              key={c}
              onClick={() => setCycle(c)}
              style={{
                flex: 1,
                padding: "9px 8px",
                fontSize: 13,
                borderRadius: "var(--radius)",
                cursor: "pointer",
                background: cycle === c ? "var(--fill-secondary)" : "transparent",
                border: cycle === c ? "2px solid var(--border-accent)" : "0.5px solid var(--border-strong)",
                color: "var(--text-primary)",
              }}
            >
              {c === "monthly" ? "Monthly" : `Yearly${SAVED > 0 ? ` · ${SAVED} mo free` : ""}`}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 4 }}>
          <span style={{ fontSize: 32, fontWeight: 600, letterSpacing: "-0.03em" }}>${amount}</span>
          <span style={{ fontSize: 13, color: "var(--text-muted)" }}>/ month</span>
        </div>
        <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "0 0 20px" }}>
          {cycle === "yearly" ? `Billed $${plan.price.yearly} yearly` : "Cancel anytime"}
        </p>

        <ul style={{ listStyle: "none", margin: "0 0 24px", padding: 0, display: "flex", flexDirection: "column", gap: 9 }}>
          {plan.features.map((f) => (
            <li key={f} style={{ fontSize: 13, color: "var(--text-secondary)", paddingLeft: 20, position: "relative" }}>
              <span style={{ position: "absolute", left: 0, color: "var(--text-accent)" }}>✓</span>
              {f}
            </li>
          ))}
        </ul>

        {href ? (
          <a
            href={href}
            onClick={() => track("checkout_start", { plan: plan.id, cycle, location: "in_app", reason: route.reason })}
            style={{ textDecoration: "none" }}
          >
            <Button variant="primary">✦ Upgrade to Studio</Button>
          </a>
        ) : (
          <Button
            variant="primary"
            onClick={() => {
              track("cta_click", { location: "in_app", plan: plan.id, cycle, checkout: "unconfigured" });
              onExitToSite("#pricing");
            }}
          >
            ✦ Upgrade to Studio
          </Button>
        )}

        <Button variant="ghost" style={{ marginTop: 8 }} onClick={() => onExitToSite("#pricing")}>
          Compare all plans
        </Button>
      </div>
    </div>
  );
}
