import { useRef } from "react";
import "./marketing.css";
import Pricing from "./Pricing.jsx";
import SignupForm from "./SignupForm.jsx";
import { track } from "../lib/leads.js";

const PROBLEMS = [
  {
    title: "Reference sheets in Downloads",
    body: "Your character sheet is IMG_4471 (3).png, filed somewhere between a receipt and a screenshot of a parking sign.",
  },
  {
    title: "Prompts in a notes app",
    body: "The one prompt that finally nailed the lighting is in a note called “asdf”, three scrolls down, un-tagged.",
  },
  {
    title: "Consistency from memory",
    body: "Two weeks later the character isn’t quite the same person — and you can’t point at what changed.",
  },
];

const FEATURES = [
  {
    icon: "\u{1F464}",
    title: "Characters",
    body: "Every character gets a page: name, reference sheets, and everything that belongs to them. One source of truth for who they are.",
  },
  {
    icon: "\u{1F9E5}",
    title: "Wardrobe",
    body: "Attach outfit photos and notes to a character so the jacket that worked in March is still one tap away in September.",
  },
  {
    icon: "✏️",
    title: "Prompt vault",
    body: "Save prompts globally or bind them to a character. The prompts that worked stop being disposable.",
  },
  {
    icon: "\u{1F5BC}️",
    title: "Asset vault",
    body: "Generations land in a vault tied back to the prompt and character that produced them, so a good result is reproducible.",
  },
  {
    icon: "\u{1F50E}",
    title: "One search box",
    body: "Characters, wardrobe, and prompts in a single search. Find the thing by what you remember about it, not where you filed it.",
  },
  {
    icon: "\u{1F512}",
    title: "Yours by default",
    body: "The free plan runs entirely in your browser. No account, no upload, nothing leaves the machine until you ask it to.",
  },
];

const STEPS = [
  {
    title: "Create the character",
    body: "Name them, drop in the reference sheets that define the face. This is the anchor everything else hangs off.",
  },
  {
    title: "Build the world around them",
    body: "Add outfits to the wardrobe. Save the prompts that worked against the character they worked for.",
  },
  {
    title: "Generate from what already worked",
    body: "Open a prompt, generate, and the output files itself back against the character — with the trail intact.",
  },
];

const FAQ = [
  {
    q: "Do I need an account to try it?",
    a: "No. The free plan runs entirely in your browser — open the app and start creating. Accounts only come into play when you want cloud sync across devices.",
  },
  {
    q: "Does Nyxxi generate the images itself?",
    a: "Not yet. Today the Generate button records the generation against your prompt and character and drops a placeholder in your vault; wiring it to a real image model is the next milestone. Nyxxi is the layer around generation — the characters, the prompts, the outputs — rather than the model itself, so it works regardless of which generator you use.",
  },
  {
    q: "Where does my data live?",
    a: "On the free plan, in your browser’s local storage, on your device. Nothing is uploaded. That also means clearing your browser data clears your vault, and very large images can hit the browser’s storage limit — cloud sync on Studio is the fix for both.",
  },
  {
    q: "Which models and tools does it work with?",
    a: "All of them. Nyxxi stores prompts as text and sheets as images, so it sits alongside whatever you generate with rather than replacing it.",
  },
  {
    q: "Can I cancel?",
    a: "Yes, any time, and your vault stays readable on the free plan afterwards — you keep everything, you just go back to free-plan limits for adding new work.",
  },
];

export default function Landing({ onOpenApp, theme, onToggleTheme }) {
  const captureRef = useRef(null);

  const openApp = (location) => {
    track("cta_click", { location, plan: "free" });
    onOpenApp();
  };

  const scrollToCapture = () => {
    captureRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <div className="lp">
      <nav className="lp-nav">
        <div className="lp-wrap lp-nav-inner">
          <button className="lp-brand" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            NYX<span>XI</span>
          </button>
          <div className="lp-nav-links">
            <a href="#features">Features</a>
            <a href="#how">How it works</a>
            <a href="#pricing">Pricing</a>
            <a href="#faq">FAQ</a>
          </div>
          <button
            className="theme-toggle"
            aria-label="Toggle theme"
            onClick={onToggleTheme}
          >
            {theme === "dark" ? "☀️" : "\u{1F319}"}
          </button>
          <button className="lp-btn lp-btn-primary lp-btn-sm" onClick={() => openApp("nav")}>
            Open the app
          </button>
        </div>
      </nav>

      <header className="lp-hero">
        <div className="lp-wrap lp-hero-inner">
          <div>
            <p className="lp-eyebrow">✦ Early access</p>
            <h1 className="lp-h1">
              Every character, every outfit, every prompt — <em>one place</em>.
            </h1>
            <p className="lp-lede">
              Nyxxi is the home base for AI content creators. Keep your characters and their
              reference sheets, their wardrobe, and the prompts that actually worked —
              organised, searchable, and ready the next time you sit down to generate.
            </p>
            <div className="lp-cta-row">
              <button className="lp-btn lp-btn-primary" onClick={() => openApp("hero")}>
                Start free — no account
              </button>
              <a className="lp-btn lp-btn-ghost" href="#pricing">
                See pricing
              </a>
            </div>
            <p className="lp-fineprint">
              Runs in your browser. Free plan keeps 2 characters, forever.
            </p>
          </div>

          <div className="lp-mock" aria-hidden="true">
            <div className="lp-mock-bar">
              <p>
                NYX<span>XI</span>
              </p>
              <div className="lp-mock-dot" />
            </div>
            <div className="lp-mock-search">Search characters, wardrobe, prompts…</div>
            <div className="lp-mock-grid">
              <div className="lp-mock-tile">
                <em>{"\u{1F464}"}</em>
                <p>Characters</p>
              </div>
              <div className="lp-mock-tile">
                <em>✏️</em>
                <p>Prompt vault</p>
              </div>
              <div className="lp-mock-tile">
                <em>{"\u{1F5BC}️"}</em>
                <p>Asset vault</p>
              </div>
              <div className="lp-mock-tile dashed">
                <em>+</em>
                <p>Create a character</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="lp-section">
        <div className="lp-wrap">
          <div className="lp-section-head">
            <p className="lp-kicker">The current workflow</p>
            <h2 className="lp-h2">Your characters are scattered across four apps.</h2>
            <p className="lp-sub">
              Nobody designed that system. It accumulated. And it costs you the thing that
              actually matters in AI content: consistency.
            </p>
          </div>
          <div className="lp-problem">
            {PROBLEMS.map((p) => (
              <div className="lp-problem-card" key={p.title}>
                <p className="lp-strike">Today</p>
                <h3>{p.title}</h3>
                <p>{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="lp-section" id="features">
        <div className="lp-wrap">
          <div className="lp-section-head">
            <p className="lp-kicker">What you get</p>
            <h2 className="lp-h2">A workspace shaped like the way you actually work.</h2>
            <p className="lp-sub">
              Not a folder, not a spreadsheet. A place where a character, their look, and the
              prompts that produce them stay attached to each other.
            </p>
          </div>
          <div className="lp-features">
            {FEATURES.map((f) => (
              <div className="lp-feature" key={f.title}>
                <div className="lp-feature-icon" aria-hidden="true">
                  {f.icon}
                </div>
                <h3>{f.title}</h3>
                <p>{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="lp-section" id="how">
        <div className="lp-wrap">
          <div className="lp-section-head">
            <p className="lp-kicker">How it works</p>
            <h2 className="lp-h2">Three steps, then it compounds.</h2>
          </div>
          <div className="lp-steps">
            {STEPS.map((s) => (
              <div className="lp-step" key={s.title}>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="lp-section" id="pricing">
        <div className="lp-wrap">
          <div className="lp-section-head">
            <p className="lp-kicker">Pricing</p>
            <h2 className="lp-h2">Start free. Pay when it’s carrying real work.</h2>
            <p className="lp-sub">
              The free plan is a real plan, not a trial that expires. Upgrade when two
              characters stops being enough.
            </p>
          </div>
          <Pricing onStartFree={() => openApp("pricing")} onNoCheckout={scrollToCapture} />
        </div>
      </section>

      <section className="lp-section" id="faq">
        <div className="lp-wrap">
          <div className="lp-section-head">
            <p className="lp-kicker">Questions</p>
            <h2 className="lp-h2">Straight answers.</h2>
          </div>
          <div className="lp-faq">
            {FAQ.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="lp-section" ref={captureRef}>
        <div className="lp-wrap">
          <div className="lp-capture">
            <h2>Be first in when Studio opens.</h2>
            <p>
              Cloud sync, unlimited characters, and bulk export are what’s next. Leave an
              email and we’ll tell you the day it ships — nothing else.
            </p>
            <SignupForm source="landing-footer" cta="Get early access" />
          </div>
        </div>
      </section>

      <footer className="lp-wrap lp-footer">
        <p>© {new Date().getFullYear()} Nyxxi — AI Creator OS</p>
        <a href="#features">Features</a>
        <a href="#pricing">Pricing</a>
        <a href="#faq">FAQ</a>
        <button className="lp-btn lp-btn-quiet lp-btn-sm" onClick={() => openApp("footer")}>
          Open the app
        </button>
      </footer>
    </div>
  );
}
