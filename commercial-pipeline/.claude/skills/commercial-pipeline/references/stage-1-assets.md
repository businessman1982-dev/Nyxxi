# Stage 1 — Assets (build the references)

Goal: turn the brief into an **asset plan** of five to eight reference images,
then deliver **one image prompt per asset, one per turn**, in plan order. The
references are what keep the film consistent: the video model will see them,
so every asset is shot clean, isolated, and information-dense.

## Step 1 — the asset plan (first artifact of the stage)

Read the brief and list the references the film needs. Draw from this menu —
include an asset only if the film uses it:

| Asset | When the film needs it |
|---|---|
| **Hero product on white** | Always. The product, packshot-clean, on seamless white. |
| **Second product state** | Only if there is a transformation (open/closed, before/after, poured, assembled, lit up). One extra state per transformation. |
| **Character sheet** (one per character) | Any time a person appears. Front-facing plus 3/4 views on one sheet, neutral expression, plain background. |
| **Empty location plate** | Always, one per location. The set with nobody in it and no product in it. |
| **Hero machine / prop** | Any machine, vehicle, or prop that gets its own shot or is handled on camera. |
| **Client logo** | Listed in the plan, marked **"client file — never generated"**. No prompt is ever written for it. |

Plan format — a numbered table: #, asset name, what it is for (one clause),
and aspect ratio. Keep it to 5–8 rows (the logo row does not count toward the
prompt total). After the table, one line: "Say **next** and I'll write #1."

If the brief is missing something that changes the plan (is there a person?
how many locations?), ask at most one compact question before planning —
otherwise make the sensible call and note the assumption under the table.

## Step 2 — one asset prompt per turn

On "next" (or any confirmation), deliver the next undelivered asset from the
plan. Each turn: the prompt in a fenced code block, the settings table, the
progress line. Nothing else beyond one sentence of context.

### How to write an asset prompt

Every asset prompt is a single paragraph-style prompt for the session's image
model, built from these layers in order:

1. **Subject** — what it is, precisely: materials, colours, finish, label
   text verbatim if the product has any, distinguishing marks. Name real
   proportions ("330 ml slim can", "matte aluminium body").
2. **Framing** — camera and crop: "centered, full product in frame,
   straight-on at product height" for packshots; "head-and-shoulders front
   view beside 3/4 left and 3/4 right view, same person" for character
   sheets; "wide establishing, eye level, empty" for plates.
3. **Light** — one lighting idea, named simply: "soft even studio light, no
   hard shadows" for packshots and sheets; the film's actual mood for
   location plates ("low warm tungsten practicals, haze").
4. **Background** — packshots and sheets: "seamless pure white background,
   nothing else in frame". Plates: the environment *is* the subject; say
   explicitly "no people, no products, no text".
5. **Quality tail** — "photorealistic, sharp focus, high detail" (adjust to
   the film's look if it is stylised — then the *same* style tail on every
   asset, so references match each other).

Per-asset specifics:

- **Hero product on white** — the single most important asset. Describe the
  product like a catalogue entry; any text on the product must be quoted
  exactly so the model can render it. Aspect 1:1 unless the product is tall
  or wide.
- **Second product state** — repeat the hero description verbatim, change
  only the state clause. Identical light, identical background. The video
  model must read both images as the same object.
- **Character sheet** — one sheet, multiple views of the *same* person.
  Describe the face once, in detail (age, skin, hair, eyes, build), then
  wardrobe. Neutral expression, flat even light, plain mid-grey or white
  background. Aspect 16:9 or 3:2 so the views fit side by side.
- **Empty location plate** — match the aspect of the film (usually 16:9).
  Shoot it the way the film's widest shot will see it. State the time of day
  and practical light sources; the video prompt will reuse these words.
- **Hero machine / prop** — treat like the hero product: clean, isolated,
  3/4 angle so geometry is legible, neutral background unless it is fixed
  in the location (then shoot it in place in its own plate).

### Settings table (under every asset prompt)

| Setting | Value |
|---|---|
| Model | *(the session's image model)* |
| Aspect | *(per asset, as above)* |
| Batch | 4 — generate four, keep the best |
| References | none *(asset prompts attach nothing)* |

### Consistency across the stage

- Reuse exact wording: the product described in asset #1 is described with
  the same words in every later asset and in the video prompt.
- One style tail for the whole film, chosen at the plan and never varied.
- If the user comes back saying an asset generated badly, that is **Stage 3**
  — diagnose there, even mid-Stage-1.

### Progress line for this stage

`▸ Stage 1 · Assets — N of M delivered · next: <asset name> (say "next")`

When the last asset is delivered:
`▸ Stage 1 · Assets — all M delivered · next: generate them, then tell me which came out and we'll build the video prompt (Stage 2)`
