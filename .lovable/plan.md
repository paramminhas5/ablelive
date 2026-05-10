## Plan: make the learning tools reliable and more Duolingo-like while keeping both looks

### 1) Fix audio first, then simplify the device chain
- Replace the fragile Workbench chain graph with a very small, deterministic chain demo focused on learning:
  - one local Play/Stop button
  - one source selector
  - 4 clearly audible effects: EQ/filter, compressor, saturator, reverb/delay
  - per-effect on/off and A/B dry/wet comparison
  - visible before/after meters so students understand what each effect changed
- Keep the existing `DeviceEngine` for single device pages, but stop using the complex Workbench chain as the main teaching path.
- Remove the confusing shared Workbench/master transport behavior where possible: each sim/tool should own its own Play button and audio.
- Add lightweight audio debug state in the simplified chain: `Audio ready`, `Playing`, `Source`, `Effect active`, `Output moving`.

### 2) Improve Sidechain Sim with a better example
- Rebuild the sidechain example around a clear musical contrast:
  - kick + sustained bass/pad fighting for space
  - toggle sidechain off/on
  - presets like `No Duck`, `Clean Pump`, `EDM Pump`, `Too Much`
  - animated ducking curve and gain-reduction meter
- Make the lesson point explicit in the interaction: users hear the kick become clearer when the pad ducks.

### 3) Make spectrum meters more useful and fit the same window
- Update `SpectrumMeter` to use RGB/wavelength-style frequency coloring:
  - lows red/orange
  - mids green
  - highs blue/violet
- Add compact sizing options and reduce the output spectrum height in device pages/workbench so the core controls, signal flow, and spectrum fit together better.
- Keep high contrast and avoid direct black-on-black text.

### 4) Rework device pages layout
- Move signal flow lower and make it collapsed by default inside device pages.
- Fix signal-flow colors so text is always readable.
- Keep the brutalist look, but make the learning layout cleaner:
  - transport and A/B at top
  - device controls in the main area
  - compact output spectrum in the side rail
  - collapsed signal flow/details below
- Fix the “Advanced” expectation by making advanced mode visibly affect device pages too:
  - beginner mode: concise controls + listen-for + simple explanation
  - advanced mode: expanded technical notes/signal flow/manual source details

### 5) Make Ear Training a real answer-based drill
- Change ear training from “click options and maybe see feedback” into rounds:
  - Play Target
  - audition options A/B/C/D
  - choose final answer
  - submit/check
  - streak/score and next round
- Add a clear correct/incorrect mechanism and prevent accidental answer locking while auditioning.

### 6) Merge Paths and Skill Tree into one page
- Make `/paths` and `/learn` the same learning-map experience instead of separate concepts.
- Use existing `PATHS`, `WORLDS`, and missions together:
  - each path is a selectable route through the same map
  - worlds are map regions
  - skills like beat, melody, drums, MIDI, audio, mixing, arrangement, sound design appear as map lanes/tags
- Classic mode: all nodes stay open and brutalist.
- CCD/Duolingo mode: path nodes are gated, with XP/streak/hearts displayed.
- Header keeps both looks/modes and adds a clear Duolingo/CCD tab.

### 7) Upgrade the journey map visually
- Replace the plain row of numbered boxes with a more creative map:
  - subway/skill-lane hybrid using world regions
  - path branches for beat, melody, drums, mixing, sound design, performance
  - better completed/current/locked states
  - progress summary without overwhelming the screen
- Reuse the earlier “skill map” idea, but bind it to the real mission/path data.

### 8) Manual coverage audit
- Use the uploaded Live 12 manual contents as the source of truth for a coverage gap report.
- Produce a new artifact, e.g. `/mnt/documents/manual-coverage.md`, listing:
  - already covered topics
  - partially covered topics
  - missing high-priority topics
  - device gaps, especially instruments vs audio effects
  - recommended new worlds/paths/lessons
- Initial visible gaps from the parsed contents: Browser depth, file/project management, Arrangement editing, Clip View, Warping, Recording, MIDI tools, automation, comping, stem separation, Push, settings/preferences, CPU/audio setup, accessibility, and a much broader instrument catalog.

## Technical notes
- Files likely touched:
  - `src/components/SpectrumMeter.tsx`
  - `src/components/SignalFlowSVG.tsx`
  - `src/components/DeviceLab.tsx`
  - `src/components/sims/DeviceChainSim.tsx`
  - `src/components/sims/SidechainSim.tsx`
  - `src/components/sims/EarTrainingSim.tsx`
  - `src/routes/playground.tsx`
  - `src/routes/learn.tsx`
  - `src/routes/paths.tsx`
  - `src/components/JourneyMap.tsx`
  - possibly `src/components/Header.tsx` and `src/routes/__root.tsx` for nav/master-bar cleanup
- No database changes needed for this pass; keep progress local as currently implemented.
- Do not edit generated route files directly.
- Keep both visual modes: classic brutalist remains, CCD/Duolingo mode becomes the gated learning layer.