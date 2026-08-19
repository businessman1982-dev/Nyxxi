import { uid } from "./utils.js";

/**
 * A worked example a new user can load, poke at, and delete.
 *
 * The first screen of Nyxxi is otherwise a blank "create your first character",
 * which asks someone to guess what a good Look actually reads like — and the
 * Look is what the whole app hangs on. This shows them one.
 *
 * Images are drawn at run time rather than shipped, so the bundle stays small.
 */
function swatch(from, to, angle) {
  const c = document.createElement("canvas");
  c.width = c.height = 220;
  const x = c.getContext("2d");
  const r = (angle * Math.PI) / 180;
  const g = x.createLinearGradient(
    110 - Math.cos(r) * 110,
    110 - Math.sin(r) * 110,
    110 + Math.cos(r) * 110,
    110 + Math.sin(r) * 110
  );
  g.addColorStop(0, from);
  g.addColorStop(1, to);
  x.fillStyle = g;
  x.fillRect(0, 0, 220, 220);
  for (let i = 0; i < 900; i++) {
    x.fillStyle = `rgba(255,255,255,${Math.random() * 0.05})`;
    x.fillRect(Math.random() * 220, Math.random() * 220, 1.5, 1.5);
  }
  return c.toDataURL("image/jpeg", 0.7);
}

export function buildDemo() {
  const characterId = uid();
  return {
    characters: [
      {
        id: characterId,
        name: "Selene",
        sheets: [swatch("#8f86e8", "#1a1630", 200), swatch("#6f66c9", "#120f22", 160)],
        look:
          "Skin: warm olive, light freckles across the nose and cheekbones.\n" +
          "Hair: silver undercut, swept left, slightly overgrown.\n" +
          "Eyes: green — never blue.\n" +
          "Face and build: late 20s, narrow frame, sharp jawline, tall.\n" +
          "Never: heavy makeup, styled or blown-out hair.",
        bible:
          "Grew up backstage at her mother's venue and never quite left.\n" +
          "Guarded and dry. Watches a room before she says anything.\n" +
          "Belongs in late light, empty spaces, weather. Not in daylight crowds.",
        wardrobe: [
          { id: uid(), kind: "outfit", note: "Black tour coat, matte", photo: swatch("#2b2b36", "#0b0b11", 200) },
          { id: uid(), kind: "outfit", note: "Midnight silk, full length", photo: swatch("#3d3470", "#0d0b1c", 210) },
          { id: uid(), kind: "outfit", note: "Ash linen, daylight", photo: swatch("#4a4437", "#16140f", 190) },
          { id: uid(), kind: "shoes", note: "Silver ankle boots, scuffed", photo: swatch("#9a9aa8", "#26262e", 170) },
          { id: uid(), kind: "bag", note: "Small black crossbody", photo: swatch("#33323c", "#0e0e12", 220) },
          { id: uid(), kind: "jewellery", note: "Thin gold hoops, signet ring", photo: swatch("#c9a24f", "#2b2113", 180) },
        ],
      },
    ],
    locations: [
      {
        id: uid(),
        name: "Rooftop, rain",
        note: "wet concrete, city glow behind, night, low haze",
        photo: swatch("#1d3b4a", "#08131c", 200),
      },
      {
        id: uid(),
        name: "Empty venue",
        note: "house lights down, one work light, dust in the air",
        photo: swatch("#4a2a18", "#140b12", 210),
      },
    ],
    prompts: [
      {
        id: uid(),
        text: "portrait, chest up, centred, cold key light, 35mm, shallow depth",
        characterId,
      },
    ],
    characterId,
  };
}
