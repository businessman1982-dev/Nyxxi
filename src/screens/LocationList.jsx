import { useState } from "react";
import Header from "../components/Header.jsx";
import Button from "../components/Button.jsx";
import PhotoSlot from "../components/PhotoSlot.jsx";
import TextField from "../components/TextField.jsx";
import { uid } from "../lib/utils.js";

export default function LocationList({ state, nav, addLocation, deleteLocation }) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [photo, setPhoto] = useState(null);

  if (adding) {
    return (
      <div>
        <Header title="New location" onBack={() => setAdding(false)} />
        <div style={{ padding: "18px 16px" }}>
          <TextField label="Name" value={name} onChange={setName} placeholder="e.g. Rooftop, rain" />
          <TextField
            label="Description"
            area
            rows={4}
            value={note}
            onChange={setNote}
            placeholder="How the place looks in the shot — light, weather, time of day, what's behind them."
          />
          <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "0 0 8px" }}>
            Reference photo (optional)
          </p>
          <div style={{ maxWidth: 140, margin: "0 auto 8px" }}>
            <PhotoSlot src={photo} onAdd={setPhoto} onRemove={() => setPhoto(null)} />
          </div>
          <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "0 0 22px", textAlign: "center", lineHeight: 1.5 }}>
            A photo can&rsquo;t go into a text prompt — Nyxxi keeps it beside the prompt so
            you can attach it in your generator.
          </p>
          <Button
            variant="primary"
            disabled={!name.trim()}
            onClick={() => {
              addLocation({ id: uid(), name: name.trim(), note: note.trim(), photo });
              setAdding(false);
              setName("");
              setNote("");
              setPhoto(null);
            }}
          >
            Save location
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header title="Locations" onBack={() => nav({ screen: "dashboard" })} />
      <div style={{ padding: 14 }}>
        {state.locations.length === 0 ? (
          <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", padding: "20px 0", lineHeight: 1.6 }}>
            No locations yet — save the places you shoot in and they&rsquo;ll be one tap
            away when you compose a prompt.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
            {state.locations.map((l) => (
              <div
                key={l.id}
                style={{
                  border: "0.5px solid var(--border)", borderRadius: "var(--radius)", padding: 10,
                  display: "flex", gap: 10, alignItems: "flex-start",
                }}
              >
                {l.photo ? (
                  <img
                    src={l.photo}
                    alt=""
                    style={{ width: 46, height: 46, objectFit: "cover", borderRadius: 8, flex: "none" }}
                  />
                ) : (
                  <div style={{
                    width: 46, height: 46, borderRadius: 8, flex: "none", background: "var(--fill-secondary)",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
                  }}>📍</div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, margin: "0 0 2px" }}>{l.name}</p>
                  {l.note && (
                    <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0, lineHeight: 1.5 }}>{l.note}</p>
                  )}
                </div>
                <span
                  onClick={() => {
                    if (window.confirm(`Delete ${l.name}?`)) deleteLocation(l.id);
                  }}
                  style={{ fontSize: 11, color: "var(--text-muted)", cursor: "pointer", flex: "none" }}
                >
                  Delete
                </span>
              </div>
            ))}
          </div>
        )}
        <Button onClick={() => setAdding(true)}>+ New location</Button>
      </div>
    </div>
  );
}
