import { useRef } from "react";
import { fileToDataUrl } from "../lib/utils.js";

export default function PhotoSlot({ src, onAdd, onRemove, size = "100%" }) {
  const inputRef = useRef(null);
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
      onClick={() => inputRef.current?.click()}
      style={{
        width: size, aspectRatio: "1", borderRadius: 12, border: "1px dashed var(--border-strong)",
        display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)",
        cursor: "pointer", flexDirection: "column", gap: 4,
      }}
    >
      <span style={{ fontSize: 20 }}>+</span>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (file) {
            const url = await fileToDataUrl(file);
            onAdd(url);
          }
          e.target.value = "";
        }}
      />
    </div>
  );
}
