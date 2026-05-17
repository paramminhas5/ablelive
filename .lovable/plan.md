# Mega-pass — clear writing, real sims, Synths world, all at once

Goal: one shippable pass that fixes voice, depth, sims, and adds the Synths world. Reuse what we already have; rewrite only what reads like jargon or one-liners.

## Voice rules (every mission we touch)

- **High-school clear.** First time a term appears, give a one-line plain-English definition. No undefined jargon.
- **One analogy per concept** (bouncing ball, conversation, LEGO…). Stops once the idea lands.
- **Concrete musical example** — name the genre, the part of the track, the move you'd actually make.
- **Advanced ≠ jargon.** Advanced means *deeper*, still plain. Engineer notes explain *why* the number matters, not just what it is.
- Verbatim is fine where it's the clearest phrasing; we rephrase only when it's unclear.

## Source material (knowledge we draw from, written in our own voice)

- **learningmusic.ableton.com** — structure & exercise sequence for Foundations.
- **learningsynths.ableton.com** — structure & sims for new Synths world.
- **Ableton Live 12 Reference Manual** — Live worlds.
- **rekordbox Operation Manual (Pioneer DJ, v6.x)** — DJ world. This is the spine we were missing; every DJ mission gets re-checked against the manual section it covers (Browse, Analysis, Beatgrid, Cues, Loops, Pad FX, Beat FX, Phrasing, Export, etc.).
- *The Complete Idiot's Guide to Music Theory*, *Making Music* (DeSantis), *Rock The Dancefloor* (Morse) — extra background.

## What ships in this pass (all batches in parallel)

### Batch 1 — Plumbing & fixes

- **Hydration fix** on `/mission/$slug` (Standard/Advanced toggle renders different markup server vs client when `hasAdvanced` flips).  The user should be able to toggle between both 
- Extend `scripts/audit.mjs` with depth thresholds (`beginner.what ≥ 400 chars`, `walkthrough ≥ 5`, `listenFor ≥ 4`, `advanced.what` present, `advanced.edgeCases ≥ 3`, `quizHard ≥ 3`, `analogy` present) and a "reads like jargon" flag (counts undefined terms from a small glossary).
- Add `synths` to `WorldSlug` in `types.ts`; add Synths to `WORLDS` in `worlds.ts`.
- Add 3 new `SimType`s: `osc-mixer`, `filter-envelope`, `lfo-lab`.

### Batch 2 — Foundations advanced rewrite (52 missions)

- Pass over every Foundations mission's `advanced.what` + `engineerNotes`. Anywhere it reads like manual jargon, rewrite into plain English with: definition → one analogy → concrete example → why the number/setting matters → what happens if you push it too far.
- Keep `beginner` content from last batch where it's already strong; tighten the few that drift abstract.
- Top up missions flagged by the new audit: pad thin `walkthrough`, add missing `analogy`, fill `quizHard` where empty.

### Batch 3 — DJ world deep rewrite (40 missions, rekordbox-spined)

- For each DJ mission, map to the rekordbox manual section it teaches (e.g. *Beatmatching* → manual §"Performing with the Beat Sync" + §"TEMPO slider"; *Hot Cues* → §"Setting a Hot Cue"; *Beat FX* → §"Using BEAT FX"; *Phrase analysis* → §"Phrase").
- Rewrite both `beginner` and `advanced` to that depth: what the control does, the exact gesture, what to listen for, what breaks if you do it wrong, the pro move on top.
- Re-point each mission's `sim.type` to the best-fit sim (`beatmatch-trainer`, `hot-cue-drill`, `loop-roll`, `harmonic-mix-wheel`, `beat-builder`, `mixer`, `bpm-tap`).

### Batch 4 — Synths world (NEW, ~18 missions, 3 paths)

Modeled on learningsynths.ableton.com. Three new sims, ported in our own code from the same interaction patterns (no asset/source lifts):

- `osc-mixer` — pick 2 oscillator shapes (sine/saw/square/tri/noise), blend, hear & see the sum waveform.
- `filter-envelope` — ADSR on filter cutoff, animated curve overlay on spectrum.
- `lfo-lab` — LFO shape + rate + depth + target (pitch / cutoff / amp).

Existing reusable sims: `SubtractiveSynthSim`, `NoteExplorerSim`, `KnobTrainerSim`, `SynthPlaygroundSim`, `EarTrainingSim`.

**Paths:**

1. **Sound** (5) — what a sound wave is, pitch vs amplitude, timbre, harmonics/overtones, noise.
2. **Oscillators & Shaping** (7) — sine/saw/square/tri, mixing oscillators, detune & unison, sub-osc, filters (LP/HP/BP, cutoff, resonance), amp envelope, filter envelope.
3. **Movement & Character** (6) — LFOs, modulation routing, FM basics, effects (chorus/delay/reverb), preset anatomy (bass/lead/pad/pluck), build-your-own patch challenge.

All 18 missions ship with the full beginner+advanced template from day one.

### Batch 5 — Sim swaps across the catalog

One script (`scripts/audit-sim-fit.mjs`) prints `(mission, current sim) → (suggested sim)` and we apply the swaps. Targets to fix:

- Rhythm theory missions on generic `drum-pad` → `beat-builder`.
- Interval/scale missions on `piano-roll` → `note-explorer`.
- Chord missions → `chord-stacker`.
- Arrangement missions → `song-structure`.
- Synth theory missions in Foundations Tech path → `subtractive-synth` (and the new Synths sims where deeper).
- DJ practice missions → the trainer sims (see Batch 3).

### Batch 6 — Final audit + mobile pass

- Re-run audit, fix remaining red rows.
- Click one mission per world at 390px viewport (mobile) and at desktop.
- Confirm hydration error gone on `/mission/overtones-harmonics`.

## Files touched

- **New**: `src/content/missions-synths.ts`, `src/content/lesson-deep-synths.ts`, `src/components/sims/OscillatorMixerSim.tsx`, `FilterEnvelopeSim.tsx`, `LFOLabSim.tsx`, `scripts/audit-sim-fit.mjs`.
- **Edited**: `src/content/worlds.ts`, `src/content/types.ts`, `src/content/missions.ts`, `src/content/lesson-deep.ts`, `src/content/lesson-deep-foundations.ts` (advanced rewrite), `src/content/dj-missions.ts` + `src/content/missions-dj.ts` (rewrite + sim swaps), `src/components/sims/Simulator.tsx` (register 3 sims), `src/routes/mission.$slug.tsx` (hydration fix), `scripts/audit.mjs` (extend).

## What I need from you

Green light to run all six batches together. It'll be one big diff — I'll group by world in the file list so it's reviewable. Default first commit lands the plumbing (Batch 1) + Synths world (Batch 4) so you can click around immediately while I push the content rewrites (Batches 2, 3, 5) right behind it.