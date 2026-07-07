export default function TextField({ label, value, onChange, placeholder, area, rows = 3 }) {
  return (
    <div style={{ marginBottom: 18 }}>
      {label && <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "0 0 8px" }}>{label}</p>}
      {area ? (
        <textarea
          rows={rows}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          style={{ width: "100%", fontSize: 13, resize: "none", padding: 10 }}
        />
      ) : (
        <input
          type="text"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          style={{ width: "100%" }}
        />
      )}
    </div>
  );
}
