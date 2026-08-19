import { useEffect, useRef, useState } from "react";
import Header from "../components/Header.jsx";
import PhotoSlot from "../components/PhotoSlot.jsx";
import Button from "../components/Button.jsx";
import TextField from "../components/TextField.jsx";
import { uid } from "../lib/utils.js";

export default function CharacterDetail({ state, nav, route, updateCharacter, deleteCharacter }) {
  const character = state.characters.find((c) => c.id === route.id);
  const [tab, setTab] = useState(route.tab || "profile");
  if (!character) return null;

  return (
    <div>
      <div style={{ height: 80, background: "var(--bg-accent)", position: "relative" }}>
        <span onClick={() => nav({ screen: "dashboard" })} style={{ position: "absolute", left: 12, top: 12, fontSize: 18, color: "var(--text-accent)", cursor: "pointer" }}>‹</span>
      </div>
      <div style={{ padding: "12px 16px 12px", display: "flex", alignItems: "center" }}>
        <p style={{ fontSize: 16, fontWeight: 500, margin: 0, flex: 1 }}>{character.name}</p>
        <span
          onClick={() => {
            if (window.confirm(`Delete ${character.name}? Their wardrobe and prompts go too.`)) {
              deleteCharacter(character.id);
              nav({ screen: "dashboard" });
            }
          }}
          style={{ fontSize: 12, color: "var(--text-muted)", cursor: "pointer" }}
        >
          Delete
        </span>
      </div>
      <div style={{ display: "flex", borderTop: "0.5px solid var(--border)", borderBottom: "0.5px solid var(--border)" }}>
        {["profile", "wardrobe", "prompts"].map((t) => (
          <div
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: 1, textAlign: "center", padding: "10px 0", fontSize: 13, cursor: "pointer",
              fontWeight: tab === t ? 500 : 400,
              color: tab === t ? "var(--text-primary)" : "var(--text-secondary)",
              borderBottom: tab === t ? "2px solid var(--border-accent)" : "2px solid transparent",
            }}
          >
            {t[0].toUpperCase() + t.slice(1)}
          </div>
        ))}
      </div>

      {tab === "profile" && (
        <ProfileTab character={character} updateCharacter={updateCharacter} />
      )}

      {tab === "wardrobe" && (
        <WardrobeTab character={character} updateCharacter={updateCharacter} />
      )}

      {tab === "prompts" && (
        <PromptsTab state={state} nav={nav} character={character} />
      )}
    </div>
  );
}

function ProfileTab({ character, updateCharacter }) {
  const [bible, setBible] = useState(character.bible || "");
  const [saved, setSaved] = useState(true);
  const [copied, setCopied] = useState(false);
  const latest = useRef(bible);
  const committed = useRef(character.bible || "");
  latest.current = bible;

  // Debounced: every keystroke would otherwise rewrite the whole store,
  // and photos are data URLs, so that write is not cheap.
  useEffect(() => {
    if (bible === committed.current) {
      setSaved(true);
      return;
    }
    setSaved(false);
    const t = setTimeout(() => {
      updateCharacter(character.id, { bible });
      committed.current = bible;
      setSaved(true);
    }, 500);
    return () => clearTimeout(t);
  }, [bible, character.id, updateCharacter]);

  // Leaving the tab mid-sentence must not lose the last few keystrokes.
  useEffect(
    () => () => {
      if (latest.current !== committed.current) {
        updateCharacter(character.id, { bible: latest.current });
      }
    },
    [character.id, updateCharacter]
  );

  const words = bible.trim() ? bible.trim().split(/\s+/).length : 0;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(bible);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "0 0 8px" }}>Character sheets ({character.sheets.length}/2)</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, marginBottom: 22 }}>
        {character.sheets.map((s, i) => (
          <PhotoSlot key={i} src={s} onRemove={() => updateCharacter(character.id, { sheets: character.sheets.filter((_, j) => j !== i) })} />
        ))}
        {character.sheets.length < 2 && (
          <PhotoSlot onAdd={(url) => updateCharacter(character.id, { sheets: [...character.sheets, url] })} />
        )}
      </div>

      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 8 }}>
        <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0, flex: 1 }}>
          Character bible{words > 0 ? ` · ${words} word${words === 1 ? "" : "s"}` : ""}
        </p>
        <span style={{ fontSize: 11, color: saved ? "var(--text-muted)" : "var(--text-accent)" }}>
          {saved ? "Saved" : "Saving…"}
        </span>
      </div>
      <textarea
        rows={10}
        value={bible}
        onChange={(e) => setBible(e.target.value)}
        placeholder={
          "Everything that has to stay true about " +
          character.name +
          " from one render to the next.\n\n" +
          "Look — age, build, hair, eyes, skin, distinguishing marks\n" +
          "Never — the things that keep coming out wrong\n" +
          "Lighting and lens you keep coming back to\n" +
          "Who they are — the bits that change how they stand and look at camera"
        }
        style={{ width: "100%", fontSize: 13, lineHeight: 1.6, padding: 10, resize: "vertical" }}
      />
      <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "8px 0 12px", lineHeight: 1.5 }}>
        Paste this into any generator alongside your prompt to keep {character.name} consistent.
      </p>
      <Button onClick={copy} disabled={!bible.trim()}>
        {copied ? "Copied" : "Copy bible"}
      </Button>
    </div>
  );
}

function WardrobeTab({ character, updateCharacter }) {
  const [adding, setAdding] = useState(false);
  const [note, setNote] = useState("");
  const [photo, setPhoto] = useState(null);

  if (adding) {
    return (
      <div>
        <Header title="Add outfit" onBack={() => setAdding(false)} />
        <div style={{ padding: "18px 16px" }}>
          <TextField label="Outfit note" value={note} onChange={setNote} placeholder="e.g. Red bodysuit, stage look" />
          <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "0 0 8px" }}>Photo</p>
          <div style={{ maxWidth: 140, margin: "0 auto 22px" }}>
            <PhotoSlot src={photo} onAdd={setPhoto} onRemove={() => setPhoto(null)} />
          </div>
          <Button
            variant="primary"
            disabled={!note.trim() || !photo}
            onClick={() => {
              updateCharacter(character.id, {
                wardrobe: [...(character.wardrobe || []), { id: uid(), note: note.trim(), photo }],
              });
              setAdding(false);
              setNote("");
              setPhoto(null);
            }}
          >
            Add outfit
          </Button>
        </div>
      </div>
    );
  }

  const wardrobe = character.wardrobe || [];
  return (
    <div style={{ padding: 16 }}>
      {wardrobe.length === 0 ? (
        <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", padding: "20px 0" }}>
          No outfits yet — add your first look for {character.name}.
        </p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, marginBottom: 12 }}>
          {wardrobe.map((w) => (
            <div key={w.id}>
              <PhotoSlot
                src={w.photo}
                onRemove={() => updateCharacter(character.id, { wardrobe: wardrobe.filter((x) => x.id !== w.id) })}
              />
              <p style={{ fontSize: 12, fontWeight: 500, margin: "6px 0 0" }}>{w.note}</p>
            </div>
          ))}
        </div>
      )}
      <Button onClick={() => setAdding(true)}>+ Add outfit</Button>
    </div>
  );
}

function PromptsTab({ state, nav, character }) {
  const prompts = state.prompts.filter((p) => p.characterId === character.id);
  return (
    <div style={{ padding: 16 }}>
      {prompts.length === 0 ? (
        <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", padding: "16px 0" }}>
          No prompts yet for {character.name}.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
          {prompts.map((p) => (
            <div
              key={p.id}
              onClick={() => nav({ screen: "prompt", id: p.id })}
              style={{ border: "0.5px solid var(--border)", borderRadius: "var(--radius)", padding: 10, cursor: "pointer" }}
            >
              <p style={{ fontSize: 13, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.text}</p>
            </div>
          ))}
        </div>
      )}
      <Button onClick={() => nav({ screen: "newPrompt", characterId: character.id })}>+ New prompt</Button>
    </div>
  );
}
