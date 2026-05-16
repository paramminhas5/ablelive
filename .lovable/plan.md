## 1. Routing perf (priority fix)

**Symptom:** clicks show same page, then redirect a beat later.

Causes I'll address:

- `defaultPreloadStaleTime: 0` + no `defaultPreload` → every nav refetches loaders cold. Set `defaultPreload: "intent"` and bump stale time to ~30s.
- `mission.$slug.tsx` / `beginner.$slug.tsx` likely run heavy work in component body on every nav. Wrap derivations in `useMemo`, key sims/quiz by slug (already done) but ensure parent doesn't re-mount the layout.
- Header re-renders on every route change due to `useMode` + `useProgress` zustand selectors pulling whole state — switch to narrow selectors.
- Verify no `<Navigate>` redirect chains in route loaders (the "shows same page then redirects" symptom). Audit `index.tsx`, `learn.tsx`, `paths.tsx` for redirect-on-mount patterns and replace with proper `redirect()` in `beforeLoad`.

## 2. Breadcrumb fix on Foundations

`beginner.$slug.tsx` line 79 breadcrumb uses `<Link to="/beginner">` — verify `/beginner` route still exists & renders. Add a real Breadcrumb component (shadcn one is already in `src/components/ui/breadcrumb.tsx`) and reuse on mission/device/dj pages so it's consistent and clickable.

## 3. Homepage rebuild

Replace `src/routes/index.tsx` (currently just shows Foundations + DJ rails) with a proper marketing landing:

```text
[ Hero ]          big mark, tagline, primary CTA → /learn, secondary → /login
[ How it works ]  3 steps: Pick a path · Do missions · Build muscle
[ Choose your    grid of all worlds (Foundations, DJ, Two Views, MIDI,
  world ]         Devices, Mixing, Performance, MIDI Inst, Live 12)
[ Paths & chapters ] horizontal rail of curated paths w/ chapter counts
[ FAQ ]          6-8 Qs in accordion
[ Get started ]  big CTA band
```

When `progress.xp > 0` OR user is authed → redirect home content to a **Dashboard** layout (Continue learning, streak, XP, recent missions, daily challenge, review queue) — essentially today's `/profile` widgets surfaced as the logged-in home. Use `beforeLoad` for the auth-aware redirect, not client-side.

## 4. CCD visual language (full adopt)

Pull from `github.com/paramminhas5/ccdfinal`:

- Typography stack (display + mono + body).
- Spacing/border/shadow tokens.
- Motion timing (page transitions, hover lifts).
- 4-6 palettes registered as data-theme attributes on `<html>`.

Implementation:

- Add palettes to `src/styles.css` via `[data-theme="..."]` blocks of oklch tokens.
- Build `ThemePicker` (header dropdown) writing to localStorage + `<html data-theme>`.
- Refactor existing brutal-* utility usage to read from new tokens so the switch actually re-skins everything.
- Restyle header, cards, buttons, mission tiles, journey map to match CCD's rhythm — keep brutalist edge but lift typographic hierarchy, breathing room, and motion polish.

## 5. Replace emoji labels with custom glyphs

- Create `src/components/glyphs/` — one tiny inline SVG per world & chapter (geometric monoline marks, 24×24, currentColor).
- Map `worldSlug → Glyph` and `chapterSlug → Glyph`.
- Remove emoji from `worlds.ts`, `beginner-foundations.ts`, `dj-missions.ts`, `paths.ts` headers; replace with `<Glyph name="..." />`.
- Mission numerals stay typographic.

## 6. Foundations & DJ content content extention

Source structure from learningmusic.ableton.com chapters (Beat, Notes & Scales, Chords, Basslines, Melodies, Song Structure) and rekordbox manual sections (Browse, Hot Cues, Beatgrid, Sync, Loops, FX, Recording). I'll mirror their **structure and exercise types** (interactive grids, build-a-beat, scale player, beat-match drill) but write all copy in our voice and design our own exercises (some improved/extended). If cant be improved copy exactly as is

Per mission: `hook → simple → analogy → interactive exercise → deeper → quiz`. Bump quiz quality: 4 well-explained Qs per mission instead of generic ones. Make the quiz **Next button** bigger/sticky (`bg-ink text-bone` full-width, shadow, h-14).

New/upgraded exercises to add:

- Beat builder (4-on-the-floor → break → fill)
- Scale explorer (root + mode, hear intervals)
- Chord stacker (triads → 7ths)
- Beatmatch trainer (two decks, nudge to align)
- Hot-cue drill (memory test)
- Loop-roll drill

## 7. Beginner/Advanced scoping

- Delete global `<ModeToggle>` from any remaining spot.
- Delete `useMode` global store usage from `index.tsx` etc; keep only as a per-mission local state.
- On mission/chapter pages: render the toggle **only** when `LessonDeep` has both `beginner` and `advanced` blocks. Otherwise show single-track content.
- Audit which missions deserve an advanced track — output a `needs-advanced.md` checklist after build so we can fill in over time. Initial candidates: compression, eq, sidechain, warp-modes, midi-quantize, sampler, drum-rack, mixer-routing, send-return, group-tracks, arrangement-automation.

## 8. Verification pass

- Click through `/`, `/learn`, a beginner mission, a regular mission, a DJ mission, `/devices/wavetable` — confirm: no double-render redirect, breadcrumb works, beginner/advanced only where it matters, glyphs render, theme picker re-skins everything, quiz Next is prominent.
- Mobile (390px) walkthrough.
- Run audit script if present.

## Technical details

- Files touched: `src/router.tsx`, `src/routes/index.tsx`, `src/routes/beginner.$slug.tsx`, `src/routes/mission.$slug.tsx`, `src/routes/dj.$slug.tsx`, `src/components/Header.tsx`, `src/components/Quiz.tsx`, `src/styles.css`, `src/lib/mode.ts`, `src/content/{worlds,paths,beginner-foundations,dj-missions,missions}.ts`.
- New files: `src/components/ThemePicker.tsx`, `src/components/Breadcrumbs.tsx`, `src/components/glyphs/*.tsx` + `index.ts`, `src/components/home/{Hero,HowItWorks,WorldGrid,PathsRail,FAQ,CTA,Dashboard}.tsx`, `src/content/themes.ts`, `src/content/exercises/*`.
- Keep diffs surgical — no rewrites of files I don't need to touch.

Scope note: rewriting all Foundations + DJ missions is large; I'll do a complete first pass for Foundations (10 chapters) and DJ core (12 missions). The remaining 73 world missions stay as-is in this turn and are flagged for follow-up.