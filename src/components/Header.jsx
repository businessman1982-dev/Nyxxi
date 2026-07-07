export default function Header({ title, onBack, action }) {
  return (
    <div style={{
      padding: "12px 16px", borderBottom: "0.5px solid var(--border)",
      display: "flex", alignItems: "center", gap: 10,
    }}>
      {onBack && (
        <span onClick={onBack} style={{ cursor: "pointer", fontSize: 18, color: "var(--text-secondary)" }}>‹</span>
      )}
      <p style={{ fontSize: 15, fontWeight: 500, margin: 0, flex: 1 }}>{title}</p>
      {action}
    </div>
  );
}
