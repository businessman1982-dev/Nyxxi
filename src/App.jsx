import { useEffect, useState } from "react";
import { loadState, saveState } from "./lib/storage.js";
import { loadPlan, PLANS, quota } from "./lib/plans.js";
import { track } from "./lib/leads.js";
import { uid } from "./lib/utils.js";
import Dashboard from "./screens/Dashboard.jsx";
import CharacterList from "./screens/CharacterList.jsx";
import NewCharacter from "./screens/NewCharacter.jsx";
import CharacterDetail from "./screens/CharacterDetail.jsx";
import PromptList from "./screens/PromptList.jsx";
import NewPrompt from "./screens/NewPrompt.jsx";
import PromptDetail from "./screens/PromptDetail.jsx";
import AssetVault from "./screens/AssetVault.jsx";
import Upgrade from "./screens/Upgrade.jsx";

export default function App({ theme, onToggleTheme, onExitToSite }) {
  const [state, setState] = useState(loadState);
  const [route, setRoute] = useState({ screen: "dashboard" });
  const [search, setSearch] = useState("");
  const [plan] = useState(loadPlan);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const nav = (r) => {
    setSearch("");
    setRoute(r);
  };

  const limits = {
    characters: quota(plan, "characters", state.characters.length),
    prompts: quota(plan, "prompts", state.prompts.length),
    assets: quota(plan, "assets", state.assets.length),
    sheets: PLANS[plan].limits.sheets,
  };

  /** Send the user to the paywall instead of the blocked screen. */
  const gate = (kind, from = route) => {
    track("paywall_hit", { reason: kind || "manual", plan });
    nav({ screen: "upgrade", reason: kind, from });
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
      assets: [
        ...s.assets,
        {
          id: uid(),
          promptId: prompt.id,
          characterId: prompt.characterId,
          promptSnippet: prompt.text.slice(0, 40),
        },
      ],
    }));

  let screen;
  if (route.screen === "dashboard")
    screen = (
      <Dashboard
        state={state}
        nav={nav}
        search={search}
        setSearch={setSearch}
        limits={limits}
        gate={gate}
      />
    );
  else if (route.screen === "characters")
    screen = <CharacterList state={state} nav={nav} limits={limits} gate={gate} />;
  else if (route.screen === "newCharacter")
    screen = <NewCharacter nav={nav} addCharacter={addCharacter} limits={limits} gate={gate} />;
  else if (route.screen === "character")
    screen = (
      <CharacterDetail
        key={route.id}
        state={state}
        nav={nav}
        route={route}
        updateCharacter={updateCharacter}
        deleteCharacter={deleteCharacter}
        limits={limits}
        gate={gate}
      />
    );
  else if (route.screen === "prompts")
    screen = <PromptList state={state} nav={nav} limits={limits} gate={gate} />;
  else if (route.screen === "newPrompt")
    screen = <NewPrompt state={state} nav={nav} route={route} addPrompt={addPrompt} />;
  else if (route.screen === "prompt")
    screen = (
      <PromptDetail
        state={state}
        nav={nav}
        route={route}
        generate={generate}
        deletePrompt={deletePrompt}
        limits={limits}
        gate={gate}
      />
    );
  else if (route.screen === "vault") screen = <AssetVault state={state} nav={nav} />;
  else if (route.screen === "upgrade")
    screen = <Upgrade nav={nav} route={route} onExitToSite={onExitToSite} />;

  return (
    <div className="app-shell">
      <div className="app-topbar">
        <div>
          <p className="app-wordmark" onClick={() => onExitToSite()} style={{ cursor: "pointer" }}>
            NYX<span>XI</span>
          </p>
          <p className="app-tagline">AI Creator OS</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            className="plan-chip"
            onClick={() => (plan === "free" ? gate(null) : nav({ screen: "dashboard" }))}
          >
            {PLANS[plan].name}
            {plan === "free" && <span> · Upgrade</span>}
          </button>
          <button className="theme-toggle" aria-label="Toggle theme" onClick={onToggleTheme}>
            {theme === "dark" ? "☀️" : "\u{1F319}"}
          </button>
        </div>
      </div>
      <div className="app-card">{screen}</div>
    </div>
  );
}
