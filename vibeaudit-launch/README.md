# vibeaudit launch film

30s launch commercial for vibeaudit.us, built from the published nyxxi.io sample audit.

## Build

```bash
./render/render_layerB.sh   # HyperFrames: out/layerB_{16x9,9x16}.mp4 + alpha out/overlay_{16x9,9x16}.mov
./render/stitch.sh          # HF-01 + Layer B + HF-02/overlay + SFX -> out/vibeaudit_launch_{16x9,9x16}.mp4
```

Higgsfield clips go in `assets/hf/` as `hf01_open_<ar>.mp4` and `hf02_close_<ar>.mp4` (job ids in `assets/hf/jobs.json`).
Without them, `stitch.sh` writes `*_preview.mp4` with black bookends.

## Where things live

| Change | Edit |
|---|---|
| Any on-screen text | `template/content.json` |
| Timing of a beat | `template/timeline.js` (`render()`; scroll in `scrollAt()`) |
| Colors / sizes / 9:16 layout | `template/styles.css` (variables at top) |
| Hero issue | `data-issue="2"` in `template/index.html`, then `./render/build_entries.sh` |
| SFX placement | `render/make_sfx.py` |

`template/index.html` is the single markup source; `render/build_entries.sh` derives the four HyperFrames entries
(main/overlay x 16:9/9:16). Animation state is a pure function of `t`: HyperFrames seeks a GSAP proxy tween whose setter
calls `render(t)`; `window.setT(t)` does the same for Playwright (`render/snap.cjs` grabs stills).

## Deviations from the brief

- **Renderer:** HyperFrames 0.8.210 (no fallback needed). 3s hero test: 180 frames at exactly 60 fps, the 15.000s copy flash
  lands on frame 900, alpha MOV (ProRes 4444) works.
- **Fix-prompt typing speed:** the brief says ~40 chars/s inside 12.0–14.5s, but the prompt is 305 characters, which needs
  ~122 chars/s to finish before the 15.0s copy beat. Kept the window, raised the speed.
- **Hero scroll position:** the section heading sits above the hero card with the whole block centred (not the top third),
  so the full card is on screen while it builds.
- **Compact cards and issue #4** stay hidden until 19.0s so they don't peek in under the hero card.
- **Key clicks** follow the actual typing spans from `timeline.js` rather than the rounder ranges in the brief.
- **SFX** are synthesised in `render/make_sfx.py` (no third-party audio). The stem is loudness-normalised toward -14 LUFS;
  because it is sparse SFX with a -1 dBTP ceiling it measures about -15 LUFS integrated.
- **Wordmark** fades in over 27.5–27.9s while scaling 0.96→1.0 (a pure scale on a hard cut would pop).
