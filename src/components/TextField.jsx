import { useId } from "react";

export default function TextField({ label, value, onChange, placeholder, area, rows = 3, ariaLabel }) {
  const id = useId();
  const a11y = label ? { id } : { "aria-label": ariaLabel || placeholder };
  return (
    <div style={{ marginBottom: 18 }}>
      {label && (
        <label htmlFor={id} style={{ display: "block", fontSize: 12, color: "var(--text-secondary)", margin: "0 0 8px" }}>
          {label}
        </label>
      )}
      {area ? (
        <textarea
          {...a11y}
          rows={rows}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          style={{ width: "100%", fontSize: 13, resize: "none", padding: 10 }}
        />
      ) : (
        <input
          {...a11y}
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
