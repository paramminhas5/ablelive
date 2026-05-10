# Plan — Fix learning chain, audio, nav, and skill page

## 1. Fix the broken quiz on Next

**Bug:** When you press a "Next mission" link the route param changes but `<Quiz>` keeps its previous `answers` / `submitted` state, so the new mission appears to be already answered/submitted.

**Fix:** in `src/routes/mission.$slug.tsx`, key the quiz + completion state by slug.

- Add `key={slug}` to `<Quiz>` so it remounts per mission.
- Replace `useState(!!progress.completedMissions[slug])` with `useEffect` that resets `completed` and `flowKey` whenever `slug` changes.
- Also remount `<Simulator>` with `key={slug}` so audio nodes from the previous sim are torn down.

## 2. Audio missing on new sims

Audit the six new sims (`StemSplitterSim`, `MidiTransformSim`, `ScaleAwareSim`, `CompLakeSim`, `GrooveExtractorSim`, `Push3Sim`) and the older `EarTrainingSim`. For each, either:

- Wire them to the shared `audio.ts` / `source.ts` engine (drum-loop, bass-loop, vox-chop, MIDI synth voice via `audio.ts` oscillators), with a local Play/Stop button using `AudioUnlock`, or
- If the sim is conceptual only (e.g. Scale-Aware piano roll), add a small "▶ Audition" button that plays back the result using the shared synth.

Standard pattern (already used in `SidechainSim`): create source on first interaction, route through whatever the sim is demonstrating, expose Play/Stop + a "bypass" or A/B if relevant.

## 3. Prune mis-matched sim assignments

A lot of missions reuse a generic sim that doesn't teach the lesson topic. Pass:

- Read `src/content/missions.ts` end-to-end.
- For every mission where `sim.type` is unrelated to the topic, switch to either:
  - the matching `device-lab` (pass `preset.device`) when the lesson is about a built-in device, or
  - `none` (renders the "read & quiz only" block) when no useful sim exists yet.
- Examples to fix: instrument-overview lessons → `device-lab` of the discussed instrument; routing/sends lessons → `send-return`; warp-modes-deep → `warp-lab`; etc.
- Output a short table in the PR notes listing every mission whose sim changed.

## 4. Make Beginner/Advanced contextual

Remove the global `<ModeToggle>` from the header. The toggle should only appear where it actually changes content:

- `mission/$slug.tsx` — only render the toggle when `LESSONS[slug]` has BOTH a `beginner` and an `advanced` track (or differing `quizEasy`/`quizHard`).
- `device/$slug.tsx` — only render the toggle when the device explainer has advanced engineer notes.
- Everywhere else: hide it. The state still lives in `useMode()` so it persists when present.

## 5. Nav cleanup

- Remove `Paths` from the `MORE` menu in `Header.tsx` (route already redirects to /learn; the page now owns paths).
- Rename the top nav item `Skill Tree` → `**Learn**`.
- Update the `/learn` page H1 from "SKILL TREE" to **"LEARN — PATHS & SKILLS"** (or similar, see §7).

## 6. Add instrument explanations on /devices

On the Devices index and each `device/$slug` page, add a short "What it does / What it's for" block sourced from `device-explainers.ts`. For instruments specifically (Drift, Wavetable, Operator, Meld, Sampler, Drum Rack, Granulator III, Collision/Tension/Electric/Analog, Bass, Poli):

- 1-line tagline (already present)
- 2-3 sentence "what kind of sounds it makes & when to reach for it"
- A "Try a preset" row that loads 3 hand-picked presets into the existing device-lab.

Where copy doesn't exist yet, extend `src/content/device-explainers.ts` with an `overview` field and render it above the lab.  
Move the device chain to the bottom collapsed, its not very usful right now. Also make these new instruments and devices appear on the device tab i cant see it

## 7. Rebuild /learn page (paths + skills clearer, mobile-first)

The current page has three views (tree/lanes + JourneyMap) all stacked. Replace with a tighter layout:

```text
┌─ Hero: LEARN. progress + streak + XP ─┐
├─ Tabs:  [Paths] [Skill Map] [Journey] ┤
│                                       │
│  Paths tab → vertical list of paths,  │
│  each row shows mini-rail of stops    │
│  (mobile-friendly, no horizontal      │
│  scroll-fest). Tap a row to expand    │
│  into the Duolingo-style serpentine.  │
│                                       │
│  Skill Map tab → existing lanes view  │
│  but each lane wraps on mobile        │
│  (flex-wrap, 8 stops per row).        │
│                                       │
│  Journey tab → the subway JourneyMap, │
│  rotated to vertical on viewports     │
│  <768px so lanes stack instead of     │
│  overflowing horizontally.            │
└───────────────────────────────────────┘
```

- Fix `JourneyMap` mobile layout: replace `min-w-max` + horizontal rail with a responsive grid; on `<md` each world renders its stops as a wrapping 6-col grid.
- Rename internal "TREE" / "SKILL MAP" buttons to "PATHS" / "SKILL MAP" / "JOURNEY".

## 8. Verification

- Build & open `/learn` on 390px viewport — confirm no horizontal overflow, JourneyMap readable.
- Walk through `first-beat` path: start mission, submit quiz, click Next — confirm new mission has clean quiz state and the simulator audio starts fresh.
- Visit 3-4 randomly chosen missions whose sim assignment was changed; confirm sim matches topic.
- Visit `/devices/wavetable` and `/devices/drift` — confirm new explainer block renders and presets load.
- Confirm Beginner/Advanced toggle only appears on missions/devices where it changes content.

## Files touched

- `src/components/Header.tsx` — rename label, remove Paths, gate ModeToggle.
- `src/components/Quiz.tsx` — no change needed; keying happens at parent.
- `src/routes/mission.$slug.tsx` — slug-scoped state, key Quiz/Simulator, conditional ModeToggle.
- `src/routes/device.$slug.tsx` — conditional ModeToggle, instrument overview block.
- `src/routes/devices.tsx` — show overview blurb per device card (instruments only).
- `src/routes/learn.tsx` — new 3-tab layout, mobile fixes.
- `src/components/JourneyMap.tsx` — responsive layout.
- `src/components/sims/*` — wire audio in the six new sims.
- `src/content/missions.ts` — re-map mis-assigned sims.
- `src/content/device-explainers.ts` — add `overview` field for instruments.