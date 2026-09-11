import { useEffect, useState } from "react";
import App from "./App.jsx";
import Landing from "./marketing/Landing.jsx";
import { loadTheme, saveTheme } from "./lib/storage.js";

const APP_HASH = "#/app";

const readRoute = () => (window.location.hash.startsWith(APP_HASH) ? "app" : "site");

export default function Root() {
  const [view, setView] = useState(readRoute);
  const [theme, setTheme] = useState(loadTheme);

  useEffect(() => {
    const onHashChange = () => {
      setView(readRoute());
      window.scrollTo({ top: 0 });
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    saveTheme(theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  if (view === "app") {
    return (
      <App
        theme={theme}
        onToggleTheme={toggleTheme}
        onExitToSite={(anchor) => {
          window.location.hash = "";
          if (anchor) {
            // The hash listener resets scroll, so jump after it has run.
            requestAnimationFrame(() => document.querySelector(anchor)?.scrollIntoView());
          }
        }}
      />
    );
  }

  return (
    <Landing
      theme={theme}
      onToggleTheme={toggleTheme}
      onOpenApp={() => {
        window.location.hash = APP_HASH;
      }}
    />
  );
}
