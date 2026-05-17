# Mission Overhaul Plan

Scope: ~125 missions across 10 worlds (Foundations 40, DJ 40, plus Live worlds W1–W8). All four problems get fixed in one pass, but lesson-deepening rolls out in tiered batches so it actually ships.

---

## 1. Per-world numbering (every world starts at 1)

Today `Mission.number` is a single global counter (1…125). Confusing, especially when a world is filtered.

- Treat `number` as **the position inside its own world**. Foundations 1–40, DJ 1–40, First Contact 1–N, Two Views 1–N, etc.
- Recompute by grouping `MISSIONS` by `world` (in the order each world lists them today) and assigning 1..N. One small script under `scripts/renumber-missions.mjs` writes the new values back to `missions.ts`, `missions-foundations.ts`, `missions-dj.ts`.
- Update everywhere that renders the number:
  - `mission.$slug.tsx` header (`Mission {00X}`)
  - `JourneyMap.tsx` stop labels (already per-world rail, just shows new `m.number`)
  - `CompletionModal`, `HomeWidgets`, `SkillMap`, breadcrumbs
- Add a `globalIndex` helper in `missions.ts` for any place that genuinely needs a unique ordinal (prev/next still works on array order, not number).
- `nextMission` / `prevMission` switch to "next inside same world, else first of next world" so the per-world numbers feel right when you click through.

## 2. Drop the per-mission "References — Ableton Live 12 Reference Manual" block

- Delete the rendering block in `mission.$slug.tsx` (the `deep?.sources` section).
- Leave the `sources` field on `LessonDeep` for now (data is harmless) but stop writing new ones. Add one global "Built from the Ableton Live 12 manual & learningmusic.ableton.com" line in the site footer instead.

## 3. Deepen every explanation (the big one)

Today most `beginner.what` / `advanced.what` are one or two sentences. Target depth per mission:

- **Hook** — one punchy line (already exists, keep).
- **What it is** — 3–5 paragraphs, plain English, with a concrete musical example.
- **Why you care** — 4–6 bullets tied to real production/DJ moves.
- **How it works (mechanism)** — 2–3 paragraphs on the underlying signal/data flow, plus the existing `flow` arrow diagram.
- **Walkthrough** — 5–8 do/listen steps (today many are 2–3).
- **Listen for** — 5+ items.
- **Common mistakes** — 4+.
- **Pro moves** — 4+.
- **Advanced track** (`advanced.what` + `edgeCases` + `engineerNotes`) — required for every mission, not optional. Edge cases ≥4, engineer notes ≥4.
- **Quiz** — keep 3 questions for beginner, add 3 harder ones in `quizHard` for advanced mode. Every Q gets `explain` + `hint`.

Content sourcing rule (per your earlier choice): mirror the structure and exercise sequence of learningmusic.ableton.com and the rekordbox manual, but write the copy ourselves with improvements — no verbatim paste. Cite nothing inline.

### Rollout batches (so this actually ships)

Because deepening 125 missions in one shot is too big to land cleanly:

- **Batch A — Foundations (40)**: full rewrite of `beginner-foundations.ts` + matching `LESSONS[slug]` entries in `lesson-deep.ts`. Modeled on learningmusic.ableton.com chapters (Beat, Notes & Scales, Chords, Basslines, Melodies, Song Structure, Synthesis, Sampling).
- **Batch B — DJ World (40)**: full rewrite of `dj-missions.ts` deep entries. Modeled on rekordbox manual + Pioneer/DJ school sequence (gear, beatmatching, EQ mixing, phrasing, FX, hot cues, harmonic mixing, sets).
- **Batch C — Live worlds W1–W4 (~30)**: First Contact, Two Views, MIDI & Audio, Devices.
- **Batch D — Live worlds W5–W8 (~25)**: Mixing, Performance, MIDI & Instruments, Live 12 Power.

Each batch lands in its own commit-shaped edit so the build stays green and you can review per-world. You can copy paras verbatim if you need to cie somethin or where necessarry

## 4. Better sims — copy what learningmusic.ableton.com does and reuse what we already built

Important: "copy them directly" — I'll **rebuild the same interactions** in our own code and copy the code directly wherever its easier and more accurate. (drum sequencer grid, scale picker, chord stacker, bassline pattern, warp marker drag, etc.). We won't lift their source or assets.

### Audit current sims (already built, just under-used)

```
drum-pad, piano-roll, mixer, device-chain, warp-lab, knob-trainer,
session-grid, arrangement, routing-puzzle, midi-map, ear-training,
interface-tour, browser-tour, midi-vs-audio, device-lab, sidechain,
send-return, comp-lake, midi-transform, scale-aware, stem-splitter,
groove-extractor, push3, bpm-tap, granular, synth-playground,
buffer-sim, tempo-compare
```

### New sims to add (matches learningmusic.ableton chapters)

- `beat-builder` — 4×16 step grid for kick/snare/hat with swing slider. (Replaces generic `drum-pad` on Foundations beat lessons.)
- `note-explorer` — keyboard with scale overlay, click to hear, shows interval names.
- `chord-stacker` — root + quality picker, builds triad/7th/9th, shows on staff + keyboard.
- `bassline-lab` — root-note pattern grid synced to a drum loop, octave + rhythm toggles.
- `melody-shaper` — contour drawing → MIDI line.
- `song-structure` — drag intro/verse/chorus/drop blocks on a timeline ruler.
- `subtractive-synth` — osc → filter → amp env with live spectrum (extend `synth-playground`).
- `beatmatch-trainer` — two decks, pitch fader, tempo offset; pass when phase locked >8 bars.
- `hot-cue-drill` — load loop, set 4 cues, timed recall test.
- `loop-roll` — beat/2 → 1/32 loop divider against a track.
- `harmonic-mix-wheel` — Camelot wheel, pick compatible next key.

### Mapping pass

One script (`scripts/audit-sim-fit.mjs`) prints `(mission, current sim) → (suggested sim)` so we can re-point every mission's `sim.type` to the most pedagogically relevant one. Replace generic reuses (e.g. `drum-pad` showing up on rhythm theory missions where `beat-builder` is the right tool).

## 5. Advanced mode everywhere

- Render the Standard/Advanced toggle in `mission.$slug.tsx` for **every** mission (no `hasAdvanced` gate after Batches A–D complete). Until each batch lands, the toggle keeps its current conditional behaviour for un-deepened missions, so we never show an empty Advanced tab.
- Advanced mode also swaps the quiz to `quizHard` and unlocks the full `listenFor` list, all `edgeCases`, all `engineerNotes`, `proMoves`.

## 6. Verification

- `scripts/audit.mjs` extended to check, per mission:
  - `number` resets to 1 inside each world and is contiguous.
  - `LESSONS[slug]` exists with `beginner.what.length ≥ 3` paragraphs, `advanced.what.length ≥ 2`, `walkthrough.length ≥ 5`, `quizHard.length ≥ 3`.
  - `sim.type` is in the allowed list and not the "generic fallback" for theory missions.
- Manual click-through of one mission per world after each batch.
- Mobile pass at 390px on Foundations 1, DJ 1, First Contact 1.

---

## Files touched

- **Data**: `src/content/missions.ts`, `missions-foundations.ts`, `missions-dj.ts`, `lesson-deep.ts`, `beginner-foundations.ts`, `dj-missions.ts`, `types.ts` (no schema change, just docs), `worlds.ts` (only if we renumber world ordering).
- **UI**: `src/routes/mission.$slug.tsx` (remove sources block, always-on advanced toggle, per-world number rendering), `src/components/JourneyMap.tsx`, `CompletionModal.tsx`, `HomeWidgets.tsx`, `SkillMap.tsx`.
- **Sims new**: `src/components/sims/BeatBuilderSim.tsx`, `NoteExplorerSim.tsx`, `ChordStackerSim.tsx`, `BasslineLabSim.tsx`, `MelodyShaperSim.tsx`, `SongStructureSim.tsx`, `BeatmatchTrainerSim.tsx`, `HotCueDrillSim.tsx`, `LoopRollSim.tsx`, `HarmonicMixWheelSim.tsx`. Register each in `Simulator.tsx` + extend `SimType` in `types.ts`.
- **Scripts**: `scripts/renumber-missions.mjs`, `scripts/audit-sim-fit.mjs`, extend `scripts/audit.mjs`.

## Order of execution

1. Schema + UI plumbing: extend `SimType`, build the 10 new sim components as empty-but-mounted shells, remove sources block, always-on Advanced toggle, per-world numbering + audit.
2. Batch A (Foundations content + sim re-mapping).
3. Batch B (DJ content + sim re-mapping).
4. Batch C (Live W1–W4).
5. Batch D (Live W5–W8).
6. Final audit + mobile pass.

## Out of scope (call out so it's not a surprise)

- No new backend, no auth changes, no theme changes.
- Homepage/dashboard work from the earlier plan stays as-is; this plan is mission/world content only.
  &nbsp;