import Avatar from "../components/Avatar.jsx";
import Button from "../components/Button.jsx";
import Tile from "../components/Tile.jsx";

export default function Dashboard({ state, nav, search, setSearch, loadDemo }) {
  const hasCharacters = state.characters.length > 0;
  const results = search.trim()
    ? {
        characters: state.characters.filter(
          (c) =>
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            (c.look || "").toLowerCase().includes(search.toLowerCase()) ||
            (c.bible || "").toLowerCase().includes(search.toLowerCase())
        ),
        prompts: state.prompts.filter((p) => p.text.toLowerCase().includes(search.toLowerCase())),
        locations: state.locations.filter(
          (l) =>
            l.name.toLowerCase().includes(search.toLowerCase()) ||
            (l.note || "").toLowerCase().includes(search.toLowerCase())
        ),
        wardrobe: state.characters.flatMap((c) =>
          (c.wardrobe || [])
            .filter((w) => w.note.toLowerCase().includes(search.toLowerCase()))
            .map((w) => ({ ...w, characterName: c.name, characterId: c.id }))
        ),
      }
    : null;

  return (
    <div>
      <div style={{ padding: "18px 16px 8px" }}>
        <p style={{ fontSize: 17, fontWeight: 500, margin: "0 0 14px" }}>Dashboard</p>
        <input
          type="text"
          placeholder="Search characters, looks, wardrobe, locations, prompts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: "100%" }}
        />
      </div>

      {results ? (
        <div style={{ padding: "12px 16px" }}>
          {results.characters.length === 0 && results.prompts.length === 0 && results.wardrobe.length === 0 && results.locations.length === 0 && (
            <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", padding: "24px 0" }}>
              No matches.
            </p>
          )}
          {results.characters.length > 0 && (
            <>
              <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "0 0 8px" }}>Characters</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
                {results.characters.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => nav({ screen: "character", id: c.id })}
                    style={{ display: "flex", alignItems: "center", gap: 10, border: "0.5px solid var(--border)", borderRadius: "var(--radius)", padding: "8px 10px", cursor: "pointer" }}
                  >
                    <Avatar name={c.name} photo={c.sheets?.[0]} size={32} />
                    <p style={{ fontSize: 13, margin: 0 }}>{c.name}</p>
                  </div>
                ))}
              </div>
            </>
          )}
          {results.wardrobe.length > 0 && (
            <>
              <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "0 0 8px" }}>Wardrobe</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
                {results.wardrobe.map((w) => (
                  <div
                    key={w.id}
                    onClick={() => nav({ screen: "character", id: w.characterId, tab: "wardrobe" })}
                    style={{ display: "flex", alignItems: "center", gap: 10, border: "0.5px solid var(--border)", borderRadius: "var(--radius)", padding: "8px 10px", cursor: "pointer" }}
                  >
                    <Avatar name={w.note} photo={w.photo} size={32} />
                    <div>
                      <p style={{ fontSize: 13, margin: 0 }}>{w.note}</p>
                      <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0 }}>{w.characterName}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
          {results.locations.length > 0 && (
            <>
              <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "0 0 8px" }}>Locations</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
                {results.locations.map((l) => (
                  <div
                    key={l.id}
                    onClick={() => nav({ screen: "locations" })}
                    style={{ border: "0.5px solid var(--border)", borderRadius: "var(--radius)", padding: "8px 10px", cursor: "pointer" }}
                  >
                    <p style={{ fontSize: 13, margin: 0 }}>{l.name}</p>
                  </div>
                ))}
              </div>
            </>
          )}
          {results.prompts.length > 0 && (
            <>
              <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "0 0 8px" }}>Prompts</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {results.prompts.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => nav({ screen: "prompt", id: p.id })}
                    style={{ border: "0.5px solid var(--border)", borderRadius: "var(--radius)", padding: "8px 10px", cursor: "pointer" }}
                  >
                    <p style={{ fontSize: 13, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.text}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      ) : !hasCharacters ? (
        <div style={{ padding: "36px 24px 32px", textAlign: "center" }}>
          <div style={{
            width: 56, height: 56, borderRadius: "50%", background: "var(--bg-accent)",
            display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 24,
          }}>+</div>
          <p style={{ fontSize: 16, fontWeight: 500, margin: "0 0 6px" }}>Create your first character</p>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "0 0 20px", lineHeight: 1.6 }}>
            Characters are where everything starts — wardrobe, prompts, and generations all build from here.
          </p>
          <Button variant="primary" style={{ width: "auto", padding: "11px 22px" }} onClick={() => nav({ screen: "newCharacter" })}>
            + Create character
          </Button>
          <p
            onClick={loadDemo}
            style={{ fontSize: 12, color: "var(--text-accent)", cursor: "pointer", margin: "16px 0 0" }}
          >
            Or load a demo character
          </p>
          <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "6px 0 0", lineHeight: 1.5 }}>
            A worked example with a look, a wardrobe and locations. Delete it whenever.
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 24 }}>
            <span onClick={() => nav({ screen: "prompts" })} style={{ fontSize: 11, color: "var(--text-muted)", cursor: "pointer" }}>Prompt vault</span>
            <span onClick={() => nav({ screen: "vault" })} style={{ fontSize: 11, color: "var(--text-muted)", cursor: "pointer" }}>Asset vault</span>
          </div>
        </div>
      ) : (
        <div style={{ padding: "20px 16px 24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Tile icon="👤" label="Characters" onClick={() => nav({ screen: "characters" })} />
          <Tile icon="✏️" label="Prompt vault" onClick={() => nav({ screen: "prompts" })} />
          <Tile icon="📍" label="Locations" onClick={() => nav({ screen: "locations" })} />
          <Tile icon="🖼️" label="Asset vault" onClick={() => nav({ screen: "vault" })} />
          <Tile icon="+" label="Create a character" dashed onClick={() => nav({ screen: "newCharacter" })} />
        </div>
      )}
    </div>
  );
}
