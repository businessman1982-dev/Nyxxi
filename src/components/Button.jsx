export default function Button({ children, onClick, variant = "secondary", style = {}, disabled }) {
  const base = {
    width: "100%", padding: "11px", borderRadius: "var(--radius)", fontSize: 14, fontWeight: 500,
    cursor: disabled ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
    opacity: disabled ? 0.5 : 1,
  };
  const variants = {
    primary: { background: "var(--fill-secondary)", border: "2px solid var(--border-accent)", color: "var(--text-primary)" },
    secondary: { background: "var(--fill-secondary)", border: "0.5px solid var(--border-strong)", color: "var(--text-primary)" },
    ghost: { background: "transparent", border: "none", color: "var(--text-secondary)" },
    danger: { background: "transparent", border: "0.5px solid var(--border-strong)", color: "#d4537e" },
  };
  return (
    <button disabled={disabled} onClick={onClick} style={{ ...base, ...variants[variant], ...style }}>
      {children}
    </button>
  );
}
