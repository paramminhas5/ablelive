## What's wrong right now

The 18 Synths missions exist as data (`missions-synths.ts`) and even have their own sims, but they're invisible in the UI. The site's world pages drive off `CHAPTERS` + `PATHS`, not the legacy `WORLDS` array — and Synths is in neither. So `/world/producer` never lists them and `/worlds` shows the original three.

## Plan

### 1. Restructure Synths as a Producer chapter (not a standalone world)

In `src/content/chapters.ts`, add a 6th Producer chapter:

- `synthesis` · world: `producer` · number: 6 · title "Synthesis" · trophy "Synth Architect" · paths `["synth-sound", "synth-shaping", "synth-movement"]`
- Bump the Producer world description on `/worlds` + `/world/producer` from "5 chapters" → "6 chapters · 15 paths · 91 missions" (recount after wiring).

In `src/content/paths.ts`, add 3 new paths under that chapter, splitting the 18 existing synth slugs:

- `synth-sound` (5): synth-what-is-sound, synth-pitch-vs-amplitude, synth-timbre, synth-harmonics, synth-noise
- `synth-shaping` (7): synth-oscillators, synth-mixing-oscillators, synth-detune-unison, synth-filters, synth-amp-envelope, synth-filter-envelope, synth-amp-vs-filter-env
- `synth-movement` (6): synth-lfo, synth-modulation-routing, synth-fm-basics, synth-effects, synth-preset-anatomy, synth-build-your-own
- `source: "learningsynths.ableton.com"`

Flip each synth mission's `world` from `"synths"` to `"producer"` in `missions-synths.ts` so breadcrumbs and filters behave. Remove Synths from `WORLDS` in `worlds.ts` (legacy list) and from the `WorldSlug` union in `types.ts` to avoid two sources of truth.

### 2. Theme palettes from the CCD reference repo

The reference (`paramminhas5/ccdfinal/src/lib/theme.ts`) uses HSL token sets. Our project uses oklch CSS vars under `[data-theme=...]` in `styles.css`. I'll port the same 14 named presets (default, midnight, sunburn, original, synthwave, brutalist, y2k, matcha, mono, sunset, oceanic, candy, forest, pinkpunk, linework) by converting each preset's surface/ink/accent/hotPink/electricBlue/acidYellow into our `--bone / --ink / --acid / --hot / --volt / --sun` slots.

Files:
- `src/styles.css` — add 14 `[data-theme="..."] { ... }` blocks (oklch conversions of the HSL values above), keep CCD Classic as default.
- `src/content/themes.ts` — replace the 6 `ThemeDef`s with the 14 new ones, matching ids so `<ThemePicker>` shows the full set.
- No component changes needed — picker, root attribute and persistence already drive off `THEMES[].id`.

### 3. Hydration fix on mission page

Already-shipped guard in `src/routes/mission.$slug.tsx` renders both Standard/Advanced toggle states unconditionally with `disabled={!hasAdvanced}`. Verify with a quick render at `/mission/overtones-harmonics` and confirm no React hydration warning in console.

### 4. Foundations advanced rewrite (in-place)

Sweep `src/content/lesson-deep-foundations.ts`. For every entry where `advanced.what` reads like manual jargon, rewrite in place using: plain-English definition → one analogy → concrete musical example → why the number matters → what breaks if pushed. Beginner content stays where already strong; top up thin `walkthrough` / `analogy` / `quizHard` fields flagged by the audit. No slug or schema changes.

### 5. DJ world deep rewrite (rekordbox-spined)

For each of the 40 DJ missions in `src/content/missions-dj.ts` and the matching deep lessons, map to the rekordbox 6.0 manual section already referenced in `paths.ts` (Beat Sync, Hot Cues, Beat FX, Phrase, EXPORT mode, etc.). Rewrite both beginner and advanced bodies to that manual section's depth, and re-point each mission's `sim.type` to the best-fit sim from the existing set (`beatmatch-trainer`, `hot-cue-drill`, `loop-roll`, `harmonic-mix-wheel`, `mixer`, `bpm-tap`, `beat-builder`).

### 6. Sim swaps across the catalog

Add `scripts/audit-sim-fit.mjs` that prints `(mission, current sim) → (suggested sim)` based on mission slug keywords. Apply the swaps directly:
- rhythm theory on generic `drum-pad` → `beat-builder`
- interval/scale on `piano-roll` → `note-explorer`
- chord missions → `chord-stacker`
- arrangement missions → `song-structure`
- synth theory in Foundations Tech path → `subtractive-synth`

### 7. Audit extension + final pass

Extend `scripts/audit.mjs` with thresholds (`beginner.what ≥ 400`, `walkthrough ≥ 5`, `listenFor ≥ 4`, `advanced.edgeCases ≥ 3`, `quizHard ≥ 3`, `analogy` present) plus a "reads like jargon" check against a small undefined-term glossary. Run it, fix remaining red rows, then click one mission per world at 390px to confirm mobile layout.

## Files touched

- New: `scripts/audit-sim-fit.mjs`
- Edited: `src/content/chapters.ts`, `src/content/paths.ts`, `src/content/missions-synths.ts` (world → producer), `src/content/worlds.ts` (drop synths), `src/content/types.ts` (drop `synths` from WorldSlug), `src/content/themes.ts` (14 presets), `src/styles.css` (14 `[data-theme]` blocks), `src/content/lesson-deep-foundations.ts` (advanced rewrite), `src/content/missions-dj.ts` + `src/content/dj-missions.ts` (rewrite + sim swaps), `src/content/missions.ts` + `src/content/lesson-deep.ts` (re-aggregations if needed), `scripts/audit.mjs` (extend), `src/routes/world.$slug.tsx` (update Producer description string).

## Order of commits

1. **Plumbing & visibility** — chapters/paths wiring + theme presets + hydration verify. (Synths becomes clickable under Producer; theme switcher shows new options.)
2. **Content mega-pass** — Foundations advanced rewrite + DJ deep rewrite + sim swaps + audit extension, in one diff grouped by world.
3. **Final audit + mobile pass.**

Green light and I'll start landing commit 1 right after.
