import { useState } from "react";
import Header from "../components/Header.jsx";
import Avatar from "../components/Avatar.jsx";
import Button from "../components/Button.jsx";
import TextField from "../components/TextField.jsx";
import { uid } from "../lib/utils.js";

export default function NewPrompt({ state, nav, route, addPrompt }) {
  const [text, setText] = useState("");
  const characterId = route.characterId || null;
  const character = state.characters.find((c) => c.id === characterId);

  return (
    <div>
      <Header title="New prompt" onBack={() => nav(character ? { screen: "character", id: character.id, tab: "prompts" } : { screen: "prompts" })} />
      <div style={{ padding: "18px 16px" }}>
        {character && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <Avatar name={character.name} photo={character.sheets?.[0]} size={24} />
            <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0 }}>{character.name}</p>
          </div>
        )}
        <TextField area rows={5} value={text} onChange={setText} placeholder="Write your prompt..." />
        <Button
          variant="primary"
          disabled={!text.trim()}
          onClick={() => {
            const id = uid();
            addPrompt({ id, text: text.trim(), characterId });
            nav({ screen: "prompt", id });
          }}
        >
          ✦ Save prompt
        </Button>
      </div>
    </div>
  );
}
