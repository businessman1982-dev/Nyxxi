import { useRef, useState } from "react";
import { preparePhoto } from "../lib/images.js";

export default function PhotoSlot({ src, onAdd, onRemove, size = "100%", label = "Add photo" }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  if (src) {
    return (
      <div style={{ position: "relative", width: size, aspectRatio: "1" }}>
        <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 12 }} />
        {onRemove && (
          <button
            onClick={onRemove}
            aria-label="Remove photo"
            style={{
              position: "absolute", top: 4, right: 4, width: 22, height: 22, borderRadius: "50%",
              background: "rgba(0,0,0,0.55)", color: "#fff", border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12,
            }}
          >
            ✕
          </button>
        )}
      </div>
    );
  }
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={label}
      aria-busy={busy}
      onClick={() => {
        if (!busy) inputRef.current?.click();
      }}
      onKeyDown={(e) => {
        if (busy) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
      style={{
        width: size, aspectRatio: "1", borderRadius: 12, border: "1px dashed var(--border-strong)",
        display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)",
        cursor: "pointer", flexDirection: "column", gap: 4,
      }}
    >
      <span style={{ fontSize: busy ? 12 : 20 }}>{busy ? "Preparing…" : "+"}</span>
      <input
        ref={inputRef}
        type="file"
        aria-label={label}
        tabIndex={-1}
        accept="image/*"
        style={{ display: "none" }}
        onChange={async (e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (!file) return;
          setBusy(true);
          try {
            onAdd(await preparePhoto(file));
          } catch (err) {
            console.error("photo failed", err);
          } finally {
            setBusy(false);
          }
        }}
      />
    </div>
  );
}
