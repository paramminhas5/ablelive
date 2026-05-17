# Make Foundations world-class

Five workstreams, each independently shippable. I'll execute in the order below and stop after each batch so you can sanity-check before I burn more turns.

## 1. Glossary-linked jargon (highest leverage)

Build a `<Term>` inline component that wraps any jargon word in mission prose. On desktop: dotted underline + hover popover with the glossary definition. On mobile: tap to open a small sheet, "Open in glossary" link inside.

Mechanism:
- Build `src/lib/glossary-index.ts` — keyed lookup from the existing `TERMS` array in `src/routes/glossary.tsx` (extract `TERMS` into `src/content/glossary.ts` so both the route and the tooltip share one source).
- New component `src/components/Term.tsx` using Radix Popover (works for hover *and* tap, already in the project via shadcn).
- Update the lesson renderer (the component that renders `beginner.what`, `advanced.what`, `walkthrough`, etc. inside `src/routes/mission.$slug.tsx`) to auto-wrap matches against the glossary index. Match longest-term-first, case-insensitive, word-boundary, skip inside code blocks. Cap at first 2 occurrences per page per term so it doesn't get noisy.
- Add ~30 missing terms the audit surfaces (transient detection, Camelot, formant, key-lock, quantize launch, etc.).

## 2. Mobile audio fix

Symptom: nothing plays on iOS Safari / Android Chrome despite the unlock overlay.

Likely causes in `src/lib/audio.ts` and sim files:
- `AudioContext` created at module scope before any gesture on iOS (the auto-listener helps but `getCtx()` is also called during render in some sims, creating the ctx in a non-gesture frame).
- `exponentialRampToValueAtTime(0.0001, ...)` is fine, but several sims call `osc.start()` with a past timestamp on slow phones → silent.
- `MasterTransportBar` overlay only shows if `isAudioUnlocked()` is false — but `unlocked` flips to true the moment ctx is created in suspended state on iOS (false positive).

Fix plan:
- Don't construct `AudioContext` until first user gesture. Replace module-load listener with a strict `ensureCtx()` that only runs inside a verified gesture handler.
- Gate `unlocked = true` on `ctx.state === "running"` *after* a successful `resume()` resolves, not on `getCtx()` calls.
- Add iOS-specific silent-buffer prime (play 1 sample of silence on resume) — known fix for Safari muting subsequent nodes.
- Audit each sim's "Play" button to call `await ensureCtx()` before scheduling, and schedule with `Math.max(now + 0.02, when)`.
- Verify on the in-tool mobile viewport (390x844) by visiting `/mission/drums-101` and tapping the pad.

## 3. Advanced-content depth audit on Foundations

The audit script (`scripts/audit.mjs`) already flags jargon, thin paragraphs, missing edge cases. Run it scoped to `world: "foundations"`, then for each flagged mission:
- Rewrite `advanced.what` so every jargon term is *defined in plain English on first use*, then the term is used. Pattern: "The buffer size (how many samples Live processes between each callback) determines latency…"
- Add 3+ `edgeCases` per mission (currently many have 0–1).
- Add `engineerNotes` with numeric specifics (sample rate, dB values, ms timings).
- Keep beginner track untouched — it's already strong from prior batches.

Target: 0 "advanced-thin" / "jargon" / "edgeCases" flags for foundations missions.

## 4. Sim-fit audit

For all 42 foundations missions, score sim fit and re-route mis-matches. Examples I already see:
- `bpm-tap` → fine for "tempo & BPM" mission
- `ear-training` is used 8× — some are right (intervals, chord quality), some are lazy fallbacks (e.g. "what is sound" probably wants a waveform visualizer, not an interval guesser)
- `none` is used 4× — every one of those is a missed teaching moment

Deliverable: a table (`/dev-server/.lovable/sim-audit.md`) listing slug → current sim → recommended sim → rationale. Then update `missions-foundations.ts` for the ~10 most impactful swaps. If a needed sim doesn't exist (e.g. "waveform-explorer"), I'll flag it but not build it in this pass.

## 5. "Pay immediately" polish

Concrete, low-risk additions ordered by impact:
1. **Progress receipts**: after each mission completion, a shareable card already exists (`ShareCard.tsx`) — wire it into the completion modal with a "Save image" + "Copy link" button.
2. **Mastery badges with real criteria**: replace participation badges with "Perfect quiz on hard mode" / "Built the walkthrough end-to-end in <2min" criteria.
3. **Daily drill** on `/train`: 3 quiz questions sampled from completed missions, streak counter in `localStorage`.
4. **Search**: `CommandPalette.tsx` exists — add glossary terms + missions + devices as searchable entries (cmd-K).
5. **Print-friendly lesson page**: `@media print` styles so users can save a PDF cheat sheet per mission — high perceived value, ~30 lines of CSS.
6. **Empty-state on `/profile`**: show what unlocks at each tier ("Complete Foundations → unlock Producer World"). Currently no aspirational hook.

## Execution order (so you can stop me anytime)

1. Extract glossary, build `<Term>` component, wire into mission renderer. *(1 turn)*
2. Mobile audio fix + verify on mobile viewport. *(1 turn)*
3. Foundations advanced-content rewrite, batch of 14 missions. *(1 turn)*  → STOP, you review tone
4. Remaining 28 foundations missions. *(2 turns)*
5. Sim-fit audit doc + top-10 swaps. *(1 turn)*
6. Polish bundle: ShareCard wiring, CommandPalette search, daily drill, print CSS. *(1 turn)*

## Out of scope this round

- New simulators (flagged in §4 but not built)
- DJ/Producer/Synths content audits (same treatment, separate plan once Foundations lands)
- Auth/paywall — only mentioned as "world-class" target; gating logic is a separate ask
