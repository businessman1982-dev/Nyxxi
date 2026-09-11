import { useState } from "react";
import Header from "../components/Header.jsx";
import PhotoSlot from "../components/PhotoSlot.jsx";
import Button from "../components/Button.jsx";
import TextField from "../components/TextField.jsx";
import { uid } from "../lib/utils.js";

export default function NewCharacter({ nav, addCharacter, limits, gate }) {
  const maxSheets = limits.sheets;
  const [name, setName] = useState("");
  const [sheets, setSheets] = useState([]);

  return (
    <div>
      <Header title="New character" onBack={() => nav({ screen: "dashboard" })} />
      <div style={{ padding: "24px 16px" }}>
        <TextField label="Name" value={name} onChange={setName} placeholder="e.g. Nyxxi Blaze" />

        <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "0 0 8px" }}>
          Character sheet ({sheets.length}/{maxSheets})
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, marginBottom: 28, maxWidth: 220 }}>
          {sheets.map((s, i) => (
            <PhotoSlot key={i} src={s} onRemove={() => setSheets(sheets.filter((_, j) => j !== i))} />
          ))}
          {sheets.length < maxSheets && (
            <PhotoSlot onAdd={(url) => setSheets([...sheets, url])} />
          )}
        </div>

        <Button
          variant="primary"
          disabled={!name.trim() || sheets.length === 0}
          onClick={() => {
            if (limits.characters.exceeded) return gate("characters");
            const id = uid();
            addCharacter({ id, name: name.trim(), sheets, wardrobe: [] });
            nav({ screen: "character", id });
          }}
        >
          Create character
        </Button>
      </div>
    </div>
  );
}
