const STATE_KEY = "nyxxi-state";
const THEME_KEY = "nyxxi-theme";

const EMPTY = { characters: [], prompts: [], assets: [], locations: [] };

export function loadState() {
  try {
    const raw = localStorage.getItem(STATE_KEY);
    if (raw) return { ...EMPTY, ...JSON.parse(raw) };
  } catch (e) {
    console.error("load failed", e);
  }
  return { ...EMPTY };
}

export function saveState(state) {
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
  } catch (e) {
    // Most likely quota exceeded from large photo data URLs.
    console.error("save failed", e);
  }
}

export function loadTheme() {
  try {
    const t = localStorage.getItem(THEME_KEY);
    if (t === "light" || t === "dark") return t;
  } catch {}
  // Honour a theme already stamped on the document — our own pre-paint script, or a
  // host that renders the page inside its own theme — before asking the OS.
  const stamped = document.documentElement.dataset.theme;
  if (stamped === "light" || stamped === "dark") return stamped;
  return window.matchMedia?.("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

export function saveTheme(theme) {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {}
}
