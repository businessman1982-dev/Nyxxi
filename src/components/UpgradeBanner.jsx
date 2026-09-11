const COPY = {
  characters: { noun: "characters", verb: "Add more" },
  prompts: { noun: "prompts", verb: "Save more" },
  assets: { noun: "assets", verb: "Keep generating" },
};

/**
 * Nudge shown on the dashboard once a free-plan quota is at least 60% spent.
 * Picks the single tightest quota so the app never stacks upsells.
 */
export default function UpgradeBanner({ limits, onUpgrade }) {
  const tightest = Object.entries(COPY)
    .map(([kind]) => ({ kind, q: limits[kind] }))
    .filter(({ q }) => q && !q.unlimited && q.used / q.limit >= 0.6)
    .sort((a, b) => b.q.used / b.q.limit - a.q.used / a.q.limit)[0];

  if (!tightest) return null;

  const { kind, q } = tightest;
  const { noun, verb } = COPY[kind];
  const pct = Math.min(100, Math.round((q.used / q.limit) * 100));

  return (
    <div
      onClick={() => onUpgrade(kind)}
      style={{
        background: "var(--bg-accent)",
        border: "0.5px solid var(--border-accent)",
        borderRadius: "var(--radius)",
        padding: "11px 13px",
        margin: "0 16px 14px",
        cursor: "pointer",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <p style={{ fontSize: 12, fontWeight: 500, margin: 0, flex: 1 }}>
          {q.exceeded ? `${noun[0].toUpperCase()}${noun.slice(1)} full` : `${q.used} of ${q.limit} ${noun} used`}
        </p>
        <span style={{ fontSize: 11, color: "var(--text-accent)", whiteSpace: "nowrap" }}>
          {verb} →
        </span>
      </div>
      <div style={{ height: 4, borderRadius: 2, background: "var(--fill-secondary)", overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: "var(--accent)" }} />
      </div>
    </div>
  );
}
