# Stage 2 — The video prompt (assemble the film)

Goal: one long structured prompt for **Seedance 2.5** that assembles the
generated references into a **30-second multi-cut film**, with every
reference handle already assigned. One artifact: the prompt, its settings
table, the progress line.

## Before writing

Confirm you know, from the conversation:

1. **Which references actually generated.** Ask the user to list what they
   kept if they haven't. The prompt is written against the real images, in
   the order the user will attach them — never against planned-but-failed
   assets. If an asset failed and they skipped it, write the film without it.
2. **The attach order.** You decide it and publish it: hero product first,
   second state next, then character sheets, then location plates, then
   machine/prop, logo last. Each gets a handle: the first attached image is
   `@image1`, the second `@image2`, and so on. Use these handles verbatim in
   the prompt.
3. The brief's story. If Stage 1 happened in this conversation, you have it.
   If the user arrived with their own references, get a one-paragraph brief
   first.

## The prompt structure

Write it as one structured prompt with labelled sections, in this order:

```
FILM — <working title>, 30 seconds, <aspect>

REFERENCES
@image1 — <what it is and what it anchors: "the product; it must look exactly like this in every shot">
@image2 — ...
(one line per attached image, in attach order; the logo line says it appears only in the end card)

GLOBAL STYLE
<2–3 sentences: look, grade, lens feel, lighting mood, pacing. Reuse the exact
style-tail wording from the Stage 1 assets so the film matches its references.>

SHOT LIST
Cut 1 (0.0–X.Xs) — <shot size + camera move> · <what happens, present tense,
one action per cut> · <which handles appear: "the product from @image1 on the
counter from @image4">
Cut 2 (X.X–X.Xs) — ...
...
Final cut (…–30.0s) — end card: <product from @image1> with the logo from
@imageN, <tagline verbatim if there is one>, hold to 30.0s.

AUDIO
<one line: music direction + any sound effects; dialogue lines verbatim in
quotes with speaker, only if the brief has dialogue>

RULES
The product always matches @image1 exactly — label, colours, proportions.
<Character name> always matches @imageK — same face, same wardrobe, in every cut.
No extra text anywhere except the end card. No morphing between cuts; every cut is a clean hard cut unless the shot list says otherwise.
```

## How to write the shot list

- **6 to 10 cuts** across 30.0 seconds. Timecodes are explicit, contiguous,
  and sum exactly to 30. Short punchy cuts (2–3s) for energy, longer holds
  (4–5s) for the hero moments and the end card.
- **One action per cut.** "She lifts the can and turns to camera" is two
  cuts. Seedance follows a cut with a single verb far better than a sequence.
- **Camera written like a shot list, not prose**: shot size (ECU / CU / MCU /
  MS / WS), then one move (push-in, pan left, orbit, static, handheld,
  whip-pan into the next cut). Name the move or say "static" — never leave it
  implied.
- **Every cut names its handles.** Anything that must stay consistent —
  product, face, location, machine — is referenced by `@imageN` in the cut
  that shows it. An unanchored subject is where drift happens.
- **The transformation** (if Stage 1 made a second product state) gets its
  own cut: "the product from @image1 becomes the state in @image2" with the
  mechanism stated (lid opens, liquid pours, light comes on).
- **The end card is always the final cut**: product + logo + tagline, static
  or a slow push, held to 30.0.
- Keep the whole prompt under roughly 600 words. Seedance rewards structure
  and specificity, not volume.

## Settings table (under the prompt)

| Setting | Value |
|---|---|
| Model | Seedance 2.5 |
| Aspect | *(the film's aspect, usually 16:9 or 9:16)* |
| Duration | 30 seconds |
| Batch | 4 — generate four, keep the best |
| References | attach in this order: 1. hero product, 2. …, N. logo *(list the actual kept files, matching the handles)* |

## Progress line for this stage

`▸ Stage 2 · Video prompt — delivered · next: attach the references in the order above, paste the prompt, batch 4 — then tell me what came out (good or broken, Stage 3 handles the rest)`
