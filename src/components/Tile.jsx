export default function Tile({ icon, label, onClick, dashed }) {
  return (
    <div
      onClick={onClick}
      style={{
        border: dashed ? "1px dashed var(--border-strong)" : "0.5px solid var(--border)",
        borderRadius: 12, padding: "20px 14px", textAlign: "center", cursor: "pointer",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8,
      }}
    >
      <span style={{ fontSize: 20, color: dashed ? "var(--text-muted)" : "var(--text-accent)" }}>{icon}</span>
      <p style={{ fontSize: 13, fontWeight: 500, margin: 0, color: dashed ? "var(--text-muted)" : "var(--text-primary)" }}>{label}</p>
    </div>
  );
}
