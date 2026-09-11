import Header from "../components/Header.jsx";
import Avatar from "../components/Avatar.jsx";
import Button from "../components/Button.jsx";

export default function PromptList({ state, nav, limits, gate }) {
  return (
    <div>
      <Header title="Prompt vault" onBack={() => nav({ screen: "dashboard" })} />
      <div style={{ padding: 14 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
          {state.prompts.length === 0 && (
            <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", padding: "16px 0" }}>No prompts yet.</p>
          )}
          {state.prompts.map((p) => {
            const character = state.characters.find((c) => c.id === p.characterId);
            return (
              <div
                key={p.id}
                onClick={() => nav({ screen: "prompt", id: p.id })}
                style={{ border: "0.5px solid var(--border)", borderRadius: "var(--radius)", padding: 10, cursor: "pointer" }}
              >
                {character && (
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                    <Avatar name={character.name} photo={character.sheets?.[0]} size={18} />
                    <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: 0 }}>{character.name}</p>
                  </div>
                )}
                <p style={{ fontSize: 13, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.text}</p>
              </div>
            );
          })}
        </div>
        <Button onClick={() => (limits.prompts.exceeded ? gate("prompts") : nav({ screen: "newPrompt" }))}>
          {limits.prompts.exceeded ? "Upgrade for more prompts" : "+ New prompt"}
        </Button>
      </div>
    </div>
  );
}
