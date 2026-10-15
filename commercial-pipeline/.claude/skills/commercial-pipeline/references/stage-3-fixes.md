# Stage 3 — Fixes (when something breaks)

Goal: the user reports what went wrong in plain words. You **name the
failure**, **rewrite only the sections that caused it**, and **tell them what
to re-batch**. One fix per turn. Never rewrite the whole prompt for a local
failure — a working prompt is an asset; every untouched line is one that
can't regress.

A finished film takes around ten generations, of which only three or four are
real prompt changes — say so if the user gets discouraged, and remind them
that re-batching the same prompt is often the fix (one bad draw out of four
is normal, four out of four is a prompt problem).

## The method, every time

1. **Classify first.** Match the complaint to a failure class below and name
   it in one sentence ("This is reference drift — the model stopped looking
   at @image1 after cut 3.").
2. **Locate the cause.** Quote the exact line(s) of the delivered prompt that
   caused or failed to prevent it. If the cause is a *missing* line, say what
   is missing and where it goes.
3. **Rewrite only that.** Deliver the changed section(s) in a fenced block,
   marked clearly ("replace Cut 4 with:", "add to RULES:"). For an asset
   failure, redeliver that one asset prompt in full (asset prompts are short;
   the unit of change is the asset).
4. **Say what to re-batch.** Settings table as usual, scoped to the re-run:
   the same model/aspect/duration, batch 4, and whether the references or
   attach order changed (almost always: "references unchanged").

## Failure classes

### A — Bad draw, not a bad prompt
All four of the batch differ and at least one is close. **Fix: no rewrite.**
Tell them to re-batch as-is, or keep the near-miss. Only rewrite when a
failure repeats across a batch.

### B — Product drift (label wrong, shape morphs, colours shift)
Cause: a cut shows the product without naming its handle, or the RULES anchor
is weak. Fix: add the handle to every cut that shows the product; harden the
RULES line ("identical in every frame to @image1 — same label text, same
proportions"); if the label text renders wrong, quote it verbatim in the
RULES. If the *reference itself* is weak (soft, angled, cluttered), rewrite
the Stage 1 hero prompt instead and re-batch the asset.

### C — Character drift (face changes between cuts, wardrobe swaps)
Same mechanism as B, for a person. Fix: handle in every cut the character
appears in, plus a RULES line naming face *and* wardrobe. If the character
sheet has only one angle, the sides are unanchored — rewrite the sheet prompt
to a proper multi-view sheet and re-batch that asset.

### D — Location breaks (set changes between cuts, wrong time of day)
Fix: anchor each cut's setting to the plate handle; repeat the plate's
lighting words (time of day, practicals) in GLOBAL STYLE so cuts agree.

### E — Timing and cutting (a beat rushed, a cut missing, action spills over)
Fix: rewrite only the SHOT LIST timecodes around the problem. Give the
starved beat more seconds, take them from a hold, keep the sum at 30.0. A cut
doing two actions gets split into two cuts.

### F — Unwanted motion or morphing between cuts
Cause: transitions left implied. Fix: add or harden the no-morph RULES line;
mark each boundary "hard cut"; make any intentional transform its own cut
with the mechanism stated.

### G — Text and logo problems (gibberish text, logo mangled or appearing early)
Fix: RULES line "no text anywhere except the end card"; the logo handle
appears only in the final cut; any on-screen words quoted verbatim. Never
write a prompt that generates the logo — if the logo itself is bad, the fix
is attaching the client file, not prompting.

### H — Wrong mood or look (too bright, wrong grade, feels like a different film)
Fix: rewrite GLOBAL STYLE only. Name the one thing that is off and replace
that clause; keep the rest of the style wording identical so already-good
qualities don't move.

### I — The model ignored a cut or invented one
Cause: a cut with no concrete action, or over ~10 cuts, or prose instead of
shot-list grammar. Fix: rewrite the weak cut with one verb and one camera
move; if the list is overlong, merge the two least important cuts.

### J — An asset generated wrong (Stage 1 failure reported any time)
Fix: rewrite that one asset prompt — usually sharpening the subject layer
(exact materials, quoted label text) or stripping background clutter — and
redeliver it in full. Re-batch the asset, then re-run the video prompt with
the new reference in the same attach slot. The video prompt itself does not
change.

## Progress line for this stage

`▸ Stage 3 · Fixes — <failure class named> fixed · next: re-batch <what> (4), then tell me what came out`

When a fix round comes back good:
`▸ Stage 3 · Fixes — clean · the film is done. Anything else to adjust, tell me in plain words.`
