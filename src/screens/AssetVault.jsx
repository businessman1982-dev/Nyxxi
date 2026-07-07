import Header from "../components/Header.jsx";
import { colorFor } from "../lib/utils.js";

export default function AssetVault({ state, nav }) {
  return (
    <div>
      <Header title="Asset vault" onBack={() => nav({ screen: "dashboard" })} />
      {state.assets.length === 0 ? (
        <div style={{ padding: "40px 24px", textAlign: "center" }}>
          <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>
            Outputs land here automatically when you generate from a prompt.
          </p>
        </div>
      ) : (
        <div style={{ padding: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
            {state.assets.slice().reverse().map((a) => {
              const character = state.characters.find((c) => c.id === a.characterId);
              return (
                <div key={a.id}>
                  <div style={{
                    aspectRatio: "1", borderRadius: "var(--radius)", background: colorFor(a.id),
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <span style={{ color: "#fff", fontSize: 11, opacity: 0.85, padding: "0 8px", textAlign: "center" }}>
                      {a.promptSnippet}
                    </span>
                  </div>
                  {character && <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "5px 0 0" }}>{character.name}</p>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
