import { useEffect, useState } from "react";
import { loadState, saveState, loadTheme, saveTheme } from "./lib/storage.js";
import { uid } from "./lib/utils.js";
import Dashboard from "./screens/Dashboard.jsx";
import CharacterList from "./screens/CharacterList.jsx";
import NewCharacter from "./screens/NewCharacter.jsx";
import CharacterDetail from "./screens/CharacterDetail.jsx";
import PromptList from "./screens/PromptList.jsx";
import NewPrompt from "./screens/NewPrompt.jsx";
import PromptDetail from "./screens/PromptDetail.jsx";
import AssetVault from "./screens/AssetVault.jsx";

export default function App() {
  const [state, setState] = useState(loadState);
  const [route, setRoute] = useState({ screen: "dashboard" });
  const [search, setSearch] = useState("");
  const [theme, setTheme] = useState(loadTheme);

  useEffect(() => {
    saveState(state);
  }, [state]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    saveTheme(theme);
  }, [theme]);

  const nav = (r) => {
    setSearch("");
    setRoute(r);
  };

  const addCharacter = (c) => setState((s) => ({ ...s, characters: [...s.characters, c] }));
  const updateCharacter = (id, patch) =>
    setState((s) => ({
      ...s,
      characters: s.characters.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }));
  const deleteCharacter = (id) =>
    setState((s) => ({
      ...s,
      characters: s.characters.filter((c) => c.id !== id),
      prompts: s.prompts.filter((p) => p.characterId !== id),
    }));
  const addPrompt = (p) => setState((s) => ({ ...s, prompts: [...s.prompts, p] }));
  const deletePrompt = (id) => setState((s) => ({ ...s, prompts: s.prompts.filter((p) => p.id !== id) }));
  const generate = (prompt) =>
    setState((s) => ({
      ...s,
      assets: [...s.assets, { id: uid(), promptId: prompt.id, characterId: prompt.characterId, promptSnippet: prompt.text.slice(0, 40) }],
    }));

  let screen;
  if (route.screen === "dashboard") screen = <Dashboard state={state} nav={nav} search={search} setSearch={setSearch} />;
  else if (route.screen === "characters") screen = <CharacterList state={state} nav={nav} />;
  else if (route.screen === "newCharacter") screen = <NewCharacter nav={nav} addCharacter={addCharacter} />;
  else if (route.screen === "character") screen = <CharacterDetail key={route.id} state={state} nav={nav} route={route} updateCharacter={updateCharacter} deleteCharacter={deleteCharacter} />;
  else if (route.screen === "prompts") screen = <PromptList state={state} nav={nav} />;
  else if (route.screen === "newPrompt") screen = <NewPrompt state={state} nav={nav} route={route} addPrompt={addPrompt} />;
  else if (route.screen === "prompt") screen = <PromptDetail state={state} nav={nav} route={route} generate={generate} deletePrompt={deletePrompt} />;
  else if (route.screen === "vault") screen = <AssetVault state={state} nav={nav} />;

  return (
    <div className="app-shell">
      <div className="app-topbar">
        <div>
          <p className="app-wordmark">
            NYX<span>XI</span>
          </p>
          <p className="app-tagline">AI Creator OS</p>
        </div>
        <button
          className="theme-toggle"
          aria-label="Toggle theme"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>
      </div>
      <div className="app-card">{screen}</div>
    </div>
  );
}
