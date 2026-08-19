import { useState } from "react";
import Header from "../components/Header.jsx";
import PhotoSlot from "../components/PhotoSlot.jsx";
import Button from "../components/Button.jsx";
import TextField from "../components/TextField.jsx";
import { uid } from "../lib/utils.js";

export default function NewCharacter({ nav, addCharacter }) {
  const [name, setName] = useState("");
  const [sheets, setSheets] = useState([]);
  const [look, setLook] = useState("");

  return (
    <div>
      <Header title="New character" onBack={() => nav({ screen: "dashboard" })} />
      <div style={{ padding: "24px 16px" }}>
        <TextField label="Name" value={name} onChange={setName} placeholder="e.g. Nixie Blaze" />

        <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "0 0 8px" }}>Character sheet ({sheets.length}/2)</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, marginBottom: 28, maxWidth: 220 }}>
          {sheets.map((s, i) => (
            <PhotoSlot key={i} src={s} onRemove={() => setSheets(sheets.filter((_, j) => j !== i))} />
          ))}
          {sheets.length < 2 && (
            <PhotoSlot onAdd={(url) => setSheets([...sheets, url])} />
          )}
        </div>

        <TextField
          label="Look (optional — you can write this later)"
          area
          rows={5}
          value={look}
          onChange={setLook}
          placeholder="Skin, hair, eyes, face and build. The physical description you'll paste into every image prompt."
        />

        <Button
          variant="primary"
          disabled={!name.trim() || sheets.length === 0}
          onClick={() => {
            const id = uid();
            addCharacter({ id, name: name.trim(), sheets, look: look.trim(), bible: "", wardrobe: [] });
            nav({ screen: "character", id });
          }}
        >
          Create character
        </Button>
      </div>
    </div>
  );
}
