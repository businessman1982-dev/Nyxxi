import { useState } from "react";
import { captureLead, isValidEmail, track } from "../lib/leads.js";

export default function SignupForm({ source = "landing", plan = null, cta = "Get early access" }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({ state: "idle", message: "" });

  const submit = async (e) => {
    e.preventDefault();
    if (!isValidEmail(email)) {
      setStatus({ state: "error", message: "That email doesn't look right." });
      return;
    }
    setStatus({ state: "sending", message: "" });
    try {
      await captureLead(email, { source, plan });
      setStatus({ state: "ok", message: "You're on the list. We'll be in touch." });
      setEmail("");
    } catch (err) {
      console.error(err);
      setStatus({ state: "error", message: "Something broke on our end. Try again in a moment." });
    }
  };

  return (
    <form className="lp-form" onSubmit={submit} noValidate>
      <label className="sr-only" htmlFor={`email-${source}`}>
        Email address
      </label>
      <input
        id={`email-${source}`}
        type="email"
        inputMode="email"
        autoComplete="email"
        placeholder="Nyxxi@studio.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onFocus={() => track("signup_focus", { source, plan })}
      />
      <button
        type="submit"
        className="lp-btn lp-btn-primary"
        disabled={status.state === "sending"}
      >
        {status.state === "sending" ? "Sending…" : cta}
      </button>
      <p
        className={`lp-form-msg ${status.state === "error" ? "is-error" : ""} ${
          status.state === "ok" ? "is-ok" : ""
        }`}
        role="status"
        aria-live="polite"
        style={{ flexBasis: "100%" }}
      >
        {status.message}
      </p>
    </form>
  );
}
