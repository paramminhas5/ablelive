# Phase 12 — Compact, Mobile, Sim Repair, World-Class Polish

Three problem areas: (A) navigation is too wide and breaks on mobile, (B) Workbench device chain (and several sims) still don't actually pass audio reliably, (C) we're missing the engagement/polish that would make this best-in-class.

---

## A. Navigation & Layout — compact + mobile

**Header (`src/components/Header.tsx`)**

- 10 nav links in a single row blow out at <1024px — they overflow and stack ugly on a 390px viewport.
- Collapse to: **Logo · Worlds · Devices · Workbench · ⌘K · Avatar** on desktop. Everything else (Paths, Train, Match, Glossary, Keys, Profile) moves into:
  - Desktop: "MORE ▾" dropdown.
  - Mobile (<768px): full-screen drawer triggered by a hamburger; nav becomes a single icon row.
- Remove `/signal-flow` from the top nav entirely. Move it into the **Glossary** page as a "▸ Signal Flow Diagram" link/section — it's reference content, not a destination.
- Marquee: hide on mobile (`hidden md:block`) — wastes vertical space.
- XP / 🔥 badges: collapse to a single compact pill on mobile.

**Home (`src/routes/index.tsx`)**

- Hero `text-9xl` is fine on desktop but clips on 390px — clamp to `text-5xl sm:text-7xl md:text-9xl`.
- 4 hero CTAs wrap to 4 rows on mobile — reduce to **2 primary CTAs** + a "More ▾" disclosure.
- Progress card stacks below hero on mobile (already does) but the 3-stat grid needs `text-base` not `text-2xl` on small.

**Workbench (`src/routes/playground.tsx`)**

- 17-tab tab bar wraps to 4–5 rows on mobile. Replace with a horizontally scrollable strip (`overflow-x-auto flex-nowrap`) + a `<select>` fallback on `<sm`.
- Three-column grid (`260px / 1fr / 260px`) → on mobile becomes a single column with the tray as a collapsible `<details>` accordion at top and meters as a sticky bottom strip.

**Devices (`src/routes/devices.tsx`)**

- Sticky filter bar overlaps content on mobile — make the search full-width on its own row, chips below.
- Card grid: keep 1-col on mobile, but tighten padding from `p-5` to `p-4` and reduce `text-2xl` → `text-xl`.

**Global tokens**

- Add a `--header-h` CSS var so sticky offsets line up; reduce header height on mobile (drop padding from `py-3` to `py-2`).

---

## B. Sim Audit & Repair

Quick triage first by re-testing each sim through the **DeviceEngine** path; the inconsistency is that some sims build their own ad-hoc graph (DeviceChainSim, the Workbench chain) while others use the proven `DeviceEngine`.

**Workbench Chain (the headline bug)** — `src/routes/playground.tsx`

- Symptom: chain rewires, but on add/remove the source occasionally goes silent. Root cause: `bus.disconnect()` severs **all** outgoing edges including the path to `preTap` while the loop scheduler keeps firing into `bus`. Race between scheduler and rewire = dropped audio until the next tick, sometimes permanent if `preTap.gain` ramp is interrupted mid-rewire.
- Fix: replace the manual graph with a single `DeviceEngine` instance that supports a **chain** (extend `DeviceEngine` with `setChain(devices: DeviceNode[])` that does the disconnect/reconnect atomically with a 20ms gain duck on `mix`, not on the moving `preTap`). Source feeds `engine.input` exactly once and never reconnects.
- Also: persist saved chains via Supabase (`workbench_chains` table) in addition to localStorage so they sync across devices.

**DeviceChainSim (`src/components/sims/DeviceChainSim.tsx`)**

- Same root issue + the loop is started on `bus` but the bus gets disconnected on every chain edit — the loop's destination ref is now orphaned. Replace internals with the same `DeviceEngine.setChain` API. One implementation, two mount points.

**EarTrainingSim** — works after the resume fix, but: target sound and choice sound use the **same** seed every render, so the "target" plays a different oscillator timing than the choices, making A/B comparison unreliable. Use a shared, deterministic note + duration per round; only the parameter differs.

**KnobTrainerSim** — RMS-based "match" never converges because the test tone is too short (1.2s) and the cutoff sweep range is log but the slider is linear. Switch slider to log-scale display and bump test tone to 2.5s with a sweep through several notes so the spectral fingerprint is meaningful.

**WarpLabSim** — warped lane renders but the playhead doesn't actually scrub through the warped buffer; it visually lies. Either drive playback through a `playbackRate`-modulated buffer source (proper) or label the lane "Visual preview only" (honest). Plan: do it properly with an `OfflineAudioContext` render of the warped buffer on every marker drag (debounced 150ms).

**SidechainSim** — kick LED + dip waveform now show, but the dip amount doesn't match the audible duck because the gain reduction is read from a separate envelope node, not from the actual compressor's `reduction` property. Read `compressor.reduction` each frame and drive the waveform from that. Adds a visible meter bar.

**RoutingPuzzleSim** — patch-cable view planned but not implemented. Build it: SVG cables from 4 source dots to 2 return dots, click-drag to connect, click cable to delete, mute/solo per source. "HEAR TARGET" plays the goal mix; "HEAR YOURS" plays user mix; score by spectral + level distance.

**MixerSim** — fader inversion works but on mobile the rotated track has hit-target issues (range thumb is rotated too, making touch awkward). Replace rotated `<input>` with a custom vertical fader (pointer events on a div) so touch behaves correctly on iOS.

**Shortcuts (**`src/routes/shortcuts.tsx`**)** — preview toggle works for the first 10; expand to all 100+ with a fallback explainer when no audio preview is meaningful. we dont need to show last shortcut

**Train / Match (`src/routes/train.tsx`, `match.tsx`)** — ear-target buttons fire before audio is unlocked on mobile Safari. Wrap every play call in `await ctx.resume()` and add the global "Tap to enable audio" overlay we added to EarTraining to these routes too.

**MidiVsAudio, BrowserTour, InterfaceTour** — purely visual, low-priority polish: tighten copy, add a "What you just learned" footer.

---

## C. The Missing Layer (what makes it world-class)

1. **Reference Track A/B** — bundle 6 CC0 loops (drums, bass, chords, vox, full mix, master-loud reference). Every device page and Match round gets a "Compare to reference" button that crossfades 1.5s between user output and reference.
2. **Mission "Apply" Step** — after each lesson, a 60-second timed challenge using that mission's device with auto-graded ear-based scoring (reuse the drill engine). Adds real assessment beyond quizzes.
3. **Skill Heatmap** — replace the single XP bar on `/profile` with a 4-quadrant radar: Rhythm · Mixing · Sound Design · Arrangement. Each mission tags 1–2 skills; XP attributes to those skills.
4. **Global Command Palette polish (⌘K)** — already built; add fuzzy match across mission body text and recent-history section.
5. **Onboarding (60-second tour)** — one-time first-load overlay: 5 dot-points highlighting Worlds, Devices, Workbench, Train, ⌘K. Stored in localStorage.
6. **Audio asset toggle** — switch synthesised loops for a small set of real CC0 samples (already partially set up in plan); use behind a "Realistic / Synth" toggle in the transport bar.
7. **Share Card v2** — current canvas works, but add OG-image generation per mission so completed missions get a real shareable URL.
8. **"Why this matters" footers** — every device page ends with a 2-sentence "When you'd reach for this in a real track" block. Currently inconsistent; standardise via a `useCases: string[]` field on `DeviceDef`.
9. **Keyboard-first mode** — Tab/Enter/Arrow navigation through Workbench tabs and chain reorder for accessibility + power users.
10. **Empty-state copy pass** — every "nothing here" state currently says "drop devices…" or similar. Replace with a short explainer + a CTA button.

---

## Technical changes (file list)

- **Edit** `src/components/Header.tsx` — collapse nav, add mobile drawer, remove `/signal-flow` link.
- **Edit** `src/routes/index.tsx` — clamp hero, reduce CTAs.
- **Edit** `src/routes/playground.tsx` — mobile-first layout, swap to `DeviceEngine.setChain`, scrollable tab strip.
- **Edit** `src/routes/devices.tsx` — sticky bar, padding pass.
- **Edit** `src/lib/device-engine.ts` — add `setChain(devices)` API with atomic, ducked rewire.
- **Edit** `src/components/sims/DeviceChainSim.tsx` — rewrite on top of `DeviceEngine.setChain`.
- **Edit** `src/components/sims/EarTrainingSim.tsx` — deterministic round seed.
- **Edit** `src/components/sims/KnobTrainerSim.tsx` — log scale, longer test tone.
- **Edit** `src/components/sims/WarpLabSim.tsx` — OfflineAudioContext warped render.
- **Edit** `src/components/sims/SidechainSim.tsx` — read `compressor.reduction`.
- **Edit** `src/components/sims/RoutingPuzzleSim.tsx` — SVG patch cables.
- **Edit** `src/components/sims/MixerSim.tsx` — custom vertical fader.
- **Edit** `src/routes/train.tsx`, `src/routes/match.tsx` — audio unlock overlay.
- **Edit** `src/routes/glossary.tsx` — embed signal flow section.
- **Create** `src/components/MobileNavDrawer.tsx`, `src/components/Onboarding.tsx`, `src/components/ReferenceCompare.tsx`.
- **Create** `src/lib/skills.ts` (heatmap aggregation).
- **Migration** `workbench_chains` table (id, user_id, name, slugs jsonb, created_at) with RLS.
- **Edit** `src/styles.css` — `--header-h`, mobile tweaks.

---

## Order of execution

1. Header + mobile drawer + remove signal-flow nav (10 min, biggest UX win).
2. `DeviceEngine.setChain` + Workbench rewire (fixes the headline bug).
3. DeviceChainSim port to same API.
4. Sim fixes in priority order: Routing (most broken) → Warp → Sidechain meter → Mixer fader → Knob/Ear deterministic.
5. Polish layer: Reference A/B, Skill heatmap, Onboarding, Apply step.
6. Workbench Supabase chain sync.

I'll commit after each numbered step so you can preview incrementally.