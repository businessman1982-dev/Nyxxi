import { useState } from "react";
import Header from "../components/Header.jsx";
import PhotoSlot from "../components/PhotoSlot.jsx";
import Button from "../components/Button.jsx";
import TextField from "../components/TextField.jsx";
import NotesField from "../components/NotesField.jsx";
import { uid } from "../lib/utils.js";

export default function CharacterDetail({ state, nav, route, updateCharacter, deleteCharacter, addPrompt, locations }) {
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
        {["profile", "wardrobe", "compose", "prompts"].map((t) => (
          <div
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: 1, textAlign: "center", padding: "10px 0", fontSize: 12, cursor: "pointer",
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

      {tab === "compose" && (
        <ComposeTab character={character} nav={nav} addPrompt={addPrompt} setTab={setTab} locations={locations || []} />
      )}

      {tab === "prompts" && (
        <PromptsTab state={state} nav={nav} character={character} />
      )}
    </div>
  );
}

function ProfileTab({ character, updateCharacter }) {
  return (
    <div style={{ padding: 16 }}>
      <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "0 0 8px" }}>Character sheets ({character.sheets.length}/2)</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, marginBottom: 24 }}>
        {character.sheets.map((s, i) => (
          <PhotoSlot key={i} src={s} onRemove={() => updateCharacter(character.id, { sheets: character.sheets.filter((_, j) => j !== i) })} />
        ))}
        {character.sheets.length < 2 && (
          <PhotoSlot onAdd={(url) => updateCharacter(character.id, { sheets: [...character.sheets, url] })} />
        )}
      </div>

      <NotesField
        label="Look"
        hint={"The physical description you paste into every image prompt. Keep it to what the generator needs to draw " + character.name + " — no story, no personality."}
        value={character.look}
        onCommit={(look) => updateCharacter(character.id, { look })}
        copyLabel="Copy look"
        rows={8}
        placeholder={
          "Skin — tone, texture, freckles, scars\n" +
          "Hair — colour, length, cut, how it falls\n" +
          "Eyes — colour, shape\n" +
          "Face and build — bone structure, age, height, frame\n" +
          "Never — the details that keep coming out wrong"
        }
      />

      <NotesField
        label="Bible"
        hint={"Who " + character.name + " is. Backstory, personality, how they carry themselves — the context that shapes a shot without describing a pixel of it."}
        value={character.bible}
        onCommit={(bible) => updateCharacter(character.id, { bible })}
        copyLabel="Copy bible"
        rows={8}
        placeholder={
          "Who they are, where they came from, what they want.\n" +
          "How they hold themselves. How they look at a camera.\n" +
          "The moods and settings they belong in — and the ones they don't."
        }
      />
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

function ComposeTab({ character, nav, addPrompt, setTab, locations }) {
  const wardrobe = character.wardrobe || [];
  const [outfitId, setOutfitId] = useState("");
  const [locationId, setLocationId] = useState("");
  const [scene, setScene] = useState("");
  const [extra, setExtra] = useState("");
  const [copied, setCopied] = useState(false);

  const look = (character.look || "").trim();
  const outfit = wardrobe.find((w) => w.id === outfitId);
  const location = locations.find((l) => l.id === locationId);

  // A saved location contributes its description; free text either stands in
  // for one or adds to it.
  const sceneText = [location ? location.note || location.name : "", scene.trim()]
    .filter(Boolean)
    .join(", ");

  const prompt = [
    look,
    outfit ? `Wearing: ${outfit.note}` : "",
    sceneText ? `Scene: ${sceneText}` : "",
    extra.trim(),
  ]
    .filter(Boolean)
    .join("\n");

  // Photos can't live inside a text prompt, so they travel alongside it.
  const refs = [
    ...(character.sheets || []).map((src) => ({ src, label: character.name })),
    ...(outfit?.photo ? [{ src: outfit.photo, label: outfit.note }] : []),
    ...(location?.photo ? [{ src: location.photo, label: location.name }] : []),
  ];

  if (!look) {
    return (
      <div style={{ padding: 16 }}>
        <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", padding: "18px 0", lineHeight: 1.6 }}>
          Write {character.name}&rsquo;s look first — that&rsquo;s the part every prompt starts from.
        </p>
        <Button onClick={() => setTab("profile")}>Write the look</Button>
      </div>
    );
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const selectStyle = {
    width: "100%", marginBottom: 18, padding: "10px 12px", fontSize: 13,
    background: "var(--fill-secondary)", color: "var(--text-primary)",
    border: "0.5px solid var(--border-strong)", borderRadius: "var(--radius)",
  };

  return (
    <div style={{ padding: 16 }}>
      <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "0 0 14px", lineHeight: 1.5 }}>
        {character.name}&rsquo;s look stays locked. Swap the outfit and the location.
      </p>

      <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "0 0 8px" }}>Outfit</p>
      {wardrobe.length === 0 ? (
        <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "0 0 18px" }}>
          No outfits yet — add one in the Wardrobe tab and it will show up here.
        </p>
      ) : (
        <select value={outfitId} onChange={(e) => setOutfitId(e.target.value)} style={selectStyle}>
          <option value="">No outfit</option>
          {wardrobe.map((w) => (
            <option key={w.id} value={w.id}>{w.note}</option>
          ))}
        </select>
      )}

      <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "0 0 8px" }}>Location</p>
      {locations.length > 0 && (
        <select value={locationId} onChange={(e) => setLocationId(e.target.value)} style={selectStyle}>
          <option value="">No saved location</option>
          {locations.map((l) => (
            <option key={l.id} value={l.id}>{l.name}</option>
          ))}
        </select>
      )}
      <TextField
        value={scene}
        onChange={setScene}
        area
        rows={2}
        placeholder={
          locations.length > 0
            ? "…or describe one here, or add to the saved one"
            : "Describe the location — or save one under Locations to reuse it"
        }
      />

      <TextField label="Anything else" area rows={2} value={extra} onChange={setExtra} placeholder="e.g. 35mm, shallow depth, cold key light" />

      <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "0 0 8px" }}>Prompt</p>
      <pre
        style={{
          margin: "0 0 12px", padding: 12, fontSize: 12, lineHeight: 1.7, whiteSpace: "pre-wrap",
          wordBreak: "break-word", fontFamily: "inherit", background: "var(--fill-secondary)",
          border: "0.5px solid var(--border)", borderRadius: "var(--radius)", color: "var(--text-primary)",
        }}
      >
        {prompt}
      </pre>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 22 }}>
        <Button variant="primary" onClick={copy}>{copied ? "Copied" : "Copy prompt"}</Button>
        <Button
          onClick={() => {
            const id = uid();
            addPrompt({ id, text: prompt, characterId: character.id });
            nav({ screen: "prompt", id });
          }}
        >
          ✦ Save to prompt vault
        </Button>
      </div>

      {refs.length > 0 && (
        <>
          <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "0 0 4px" }}>
            Reference images ({refs.length})
          </p>
          <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "0 0 10px", lineHeight: 1.5 }}>
            Images can&rsquo;t go into a text prompt. Attach these in your generator alongside
            the prompt above.
          </p>
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
            {refs.map((r, i) => (
              <div key={i} style={{ flex: "none", width: 78 }}>
                <img
                  src={r.src}
                  alt={r.label}
                  style={{ width: 78, height: 78, objectFit: "cover", borderRadius: 8, display: "block" }}
                />
                <p style={{
                  fontSize: 10, color: "var(--text-muted)", margin: "4px 0 0",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {r.label}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
