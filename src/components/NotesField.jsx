import { useEffect, useRef, useState } from "react";
import Button from "./Button.jsx";

/**
 * An autosaving block of text with a word count and a copy button.
 *
 * Saving is debounced: committing on every keystroke would rewrite the whole
 * store each time, and photos are held as data URLs, so that write is not
 * cheap. The pending text is flushed on unmount so leaving the tab or the
 * screen mid-sentence never loses the last few characters.
 */
export default function NotesField({
  label,
  hint,
  value,
  onCommit,
  placeholder,
  rows = 8,
  copyLabel = "Copy",
}) {
  const [text, setText] = useState(value || "");
  const [saved, setSaved] = useState(true);
  const [copied, setCopied] = useState(false);
  const latest = useRef(text);
  const committed = useRef(value || "");
  const commit = useRef(onCommit);
  latest.current = text;
  commit.current = onCommit;

  useEffect(() => {
    if (text === committed.current) {
      setSaved(true);
      return;
    }
    setSaved(false);
    const t = setTimeout(() => {
      commit.current(text);
      committed.current = text;
      setSaved(true);
    }, 500);
    return () => clearTimeout(t);
  }, [text]);

  useEffect(
    () => () => {
      if (latest.current !== committed.current) commit.current(latest.current);
    },
    []
  );

  const words = text.trim() ? text.trim().split(/\s+/).length : 0;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div style={{ marginBottom: 26 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 6 }}>
        <p style={{ fontSize: 12, fontWeight: 500, margin: 0, flex: 1 }}>
          {label}
          {words > 0 && (
            <span style={{ fontWeight: 400, color: "var(--text-muted)" }}>
              {" · "}
              {words} word{words === 1 ? "" : "s"}
            </span>
          )}
        </p>
        <span style={{ fontSize: 11, color: saved ? "var(--text-muted)" : "var(--text-accent)" }}>
          {saved ? "Saved" : "Saving…"}
        </span>
      </div>
      {hint && (
        <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "0 0 8px", lineHeight: 1.5 }}>
          {hint}
        </p>
      )}
      <textarea
        rows={rows}
        value={text}
        placeholder={placeholder}
        onChange={(e) => setText(e.target.value)}
        style={{ width: "100%", fontSize: 13, lineHeight: 1.6, padding: 10, resize: "vertical" }}
      />
      <Button onClick={copy} disabled={!text.trim()} style={{ marginTop: 8 }}>
        {copied ? "Copied" : copyLabel}
      </Button>
    </div>
  );
}
