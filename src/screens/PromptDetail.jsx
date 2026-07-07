import { useState } from "react";
import Header from "../components/Header.jsx";
import Avatar from "../components/Avatar.jsx";
import Button from "../components/Button.jsx";

export default function PromptDetail({ state, nav, route, generate, deletePrompt }) {
  const prompt = state.prompts.find((p) => p.id === route.id);
  const [generating, setGenerating] = useState(false);
  if (!prompt) return null;
  const character = state.characters.find((c) => c.id === prompt.characterId);
  const backRoute = character ? { screen: "character", id: character.id, tab: "prompts" } : { screen: "prompts" };

  return (
    <div>
      <Header
        title="Prompt"
        onBack={() => nav(backRoute)}
        action={
          <span
            onClick={() => {
              if (window.confirm("Delete this prompt?")) {
                deletePrompt(prompt.id);
                nav(backRoute);
              }
            }}
            style={{ fontSize: 12, color: "var(--text-muted)", cursor: "pointer" }}
          >
            Delete
          </span>
        }
      />
      <div style={{ padding: "18px 16px" }}>
        {character && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <Avatar name={character.name} photo={character.sheets?.[0]} size={24} />
            <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0 }}>{character.name}</p>
          </div>
        )}
        <div style={{ border: "0.5px solid var(--border)", borderRadius: "var(--radius)", padding: 10, marginBottom: 18 }}>
          <p style={{ fontSize: 13, margin: 0, lineHeight: 1.6 }}>{prompt.text}</p>
        </div>
        <Button
          variant="primary"
          disabled={generating}
          onClick={() => {
            setGenerating(true);
            setTimeout(() => {
              generate(prompt);
              setGenerating(false);
              nav({ screen: "vault" });
            }, 1400);
          }}
        >
          {generating ? "Generating..." : "✦ Generate"}
        </Button>
        <p style={{ fontSize: 11, color: "var(--text-muted)", textAlign: "center", marginTop: 10 }}>
          Output will save automatically to your asset vault.
        </p>
      </div>
    </div>
  );
}
