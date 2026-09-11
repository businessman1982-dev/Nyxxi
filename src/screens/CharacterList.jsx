import Header from "../components/Header.jsx";
import PhotoSlot from "../components/PhotoSlot.jsx";

export default function CharacterList({ state, nav, limits, gate }) {
  const newCharacter = () =>
    limits.characters.exceeded ? gate("characters") : nav({ screen: "newCharacter" });
  return (
    <div>
      <Header title="Characters" onBack={() => nav({ screen: "dashboard" })} />
      <div style={{ padding: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {state.characters.map((c) => (
          <div key={c.id} onClick={() => nav({ screen: "character", id: c.id })} style={{ cursor: "pointer" }}>
            <PhotoSlot src={c.sheets?.[0]} />
            <p style={{ fontSize: 12, fontWeight: 500, margin: "6px 0 0" }}>{c.name}</p>
          </div>
        ))}
        <div onClick={newCharacter} style={{ cursor: "pointer" }}>
          <div
            style={{
              aspectRatio: "1", borderRadius: 12, border: "1px dashed var(--border-strong)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--text-muted)", fontSize: 20,
            }}
          >
            +
          </div>
          <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "6px 0 0" }}>
            {limits.characters.exceeded ? "Upgrade for more" : "New character"}
          </p>
        </div>
      </div>
    </div>
  );
}
