/*
 * The terms — pricing + the early-access list.
 *
 * Rendered from src/lib/plans.js, the same module the app enforces its quotas
 * with, so what the page sells and what the product allows cannot drift.
 */
import {
  PLANS,
  PLAN_ORDER,
  checkoutUrl,
  monthlyEquivalent,
  monthsSaved,
} from "../lib/plans.js";
import { captureLead, isValidEmail, track } from "../lib/leads.js";

const ARROW =
  '<svg viewBox="0 0 16 16" aria-hidden="true" style="width:12px;height:12px;fill:none;stroke:currentColor;stroke-width:1.6"><path d="M3 13L13 3M13 3H5.5M13 3v7.5" /></svg>';

const escape = (v) =>
  String(v).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

function rateCard(plan, cycle) {
  const free = plan.price.monthly === 0;
  const amount = free ? 0 : cycle === "yearly" ? monthlyEquivalent(plan) : plan.price.monthly;
  const href = free ? "" : checkoutUrl(plan.id, cycle);
  const note = free
    ? "No card, no account, no expiry."
    : cycle === "yearly"
      ? `Billed $${plan.price.yearly} yearly.`
      : "Billed monthly. Cancel anytime.";

  const cta = free
    ? `<a class="rate__cta" href="/app/" data-plan="free">${escape(plan.cta)}${ARROW}</a>`
    : href
      ? `<a class="rate__cta" href="${escape(href)}" data-plan="${plan.id}" data-checkout="1">${escape(plan.cta)}${ARROW}</a>`
      : `<button class="rate__cta" type="button" data-plan="${plan.id}">${escape(plan.cta)}${ARROW}</button>`;

  return `
    <div class="rate ${plan.highlight ? "rate--featured" : ""}">
      ${plan.highlight ? '<p class="rate__flag">Most chosen</p>' : ""}
      <p class="rate__name">${escape(plan.name)}</p>
      <div class="rate__price">
        <b>$${escape(amount)}</b><span>${free ? "forever" : "/ month"}</span>
      </div>
      <p class="rate__note">${escape(note)}</p>
      <ul class="rate__list">
        ${plan.features.map((f) => `<li>${escape(f)}</li>`).join("")}
      </ul>
      ${cta}
    </div>`;
}

/* Which plan sent the visitor to the list, so a Studio lead is distinguishable
   from a generic signup. Null when they found the form on their own. */
let intent = null;

export function initRates() {
  const grid = document.getElementById("ratesGrid");
  const toggle = document.querySelector(".rates__toggle");
  if (!grid || !toggle) return;

  const saved = monthsSaved(PLANS.studio);
  if (saved > 0) {
    const yearly = toggle.querySelector('[data-cycle="yearly"]');
    if (yearly) yearly.insertAdjacentHTML("beforeend", ` <i>${saved} months free</i>`);
  }

  let cycle = "monthly";

  const render = () => {
    grid.innerHTML = PLAN_ORDER.map((id) => rateCard(PLANS[id], cycle)).join("");
  };

  toggle.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-cycle]");
    if (!btn || btn.dataset.cycle === cycle) return;
    cycle = btn.dataset.cycle;
    toggle.querySelectorAll("button[data-cycle]").forEach((b) => {
      b.setAttribute("aria-pressed", String(b.dataset.cycle === cycle));
    });
    if (cycle === "yearly") track("pricing_yearly_viewed");
    render();
  });

  // A plan with no checkout link yet falls through to the early-access list.
  grid.addEventListener("click", (e) => {
    const cta = e.target.closest("[data-plan]");
    if (!cta) return;
    const plan = cta.dataset.plan;
    if (cta.dataset.checkout) {
      track("checkout_start", { plan, cycle });
      return;
    }
    track("cta_click", { location: "rates", plan, cycle });
    if (plan === "free") return; // a real link to /app/

    // No checkout link for this plan yet, so the list is where the interest lands.
    intent = plan;
    const msg = document.getElementById("signupMsg");
    if (msg) {
      msg.className = "summon__msg";
      msg.textContent = `${PLANS[plan].name} — leave an address and you'll be first in.`;
    }
    document.querySelector(".summon")?.scrollIntoView({ behavior: "smooth", block: "center" });
    document.getElementById("signupEmail")?.focus({ preventScroll: true });
  });

  render();
}

export function initSignup() {
  const form = document.getElementById("signupForm");
  const input = document.getElementById("signupEmail");
  const button = document.getElementById("signupBtn");
  const msg = document.getElementById("signupMsg");
  if (!form || !input || !button || !msg) return;

  const say = (text, state) => {
    msg.textContent = text;
    msg.classList.toggle("is-ok", state === "ok");
    msg.classList.toggle("is-error", state === "error");
  };

  input.addEventListener("focus", () => track("signup_focus", { source: "landing" }), { once: true });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!isValidEmail(input.value)) {
      say("That address doesn't look right.", "error");
      return;
    }
    button.disabled = true;
    say("Sending…");
    try {
      await captureLead(input.value, { source: intent ? "rates" : "landing", plan: intent });
      say(intent ? `You're on the ${PLANS[intent].name} list.` : "You're on the list.", "ok");
      form.reset();
      intent = null;
    } catch (err) {
      console.error(err);
      say("Something broke on our end. Try again in a moment.", "error");
    } finally {
      button.disabled = false;
    }
  });
}
