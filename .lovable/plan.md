# Audit + Fix Chain + Duolingo Mode (alongside brutalist)

Three things, one shipment. Keep the existing brutalist site exactly as it is, and add a parallel **Duolingo Mode** layered on top of one path. Skill tree = the existing Worlds/Paths data, just rendered as a gated tree when Duo Mode is on.

---

## 1. Audit (what works / what's broken)

I'll produce a single report at `/mnt/documents/audit.md` covering every route + sim. For each: ✅ works / ⚠️ partial / ❌ broken, what I tested, root cause, fix size.

What I already see from reading the code (no fixes applied yet, just findings):

**The chain bug (root cause located).** `src/lib/device-engine.ts` line 50:

```
ACTIVE_ENGINES.forEach((e) => { if (e !== this) e.dispose(); });
```

Every new `DeviceEngine()` calls `dispose()` on every other live engine, which permanently severs `input/dry/wet/mix`. The Workbench creates one engine on mount; the moment the user opens any sim tab that mounts `DeviceChainSim` (or any other future engine consumer), the Workbench's engine is killed silently — chain stops passing audio "completely". This is the headline bug.

**Other findings from the code:**

- `playground.tsx` `useEffect([chain])` runs on mount with `[]` and ducks the mix on every render — harmless but flickery.
- `src/lib/audio.ts` scheduled notes connect transient oscillators directly to the `dest` GainNode (the engine's `input`), so they survive setChain rewires — good, no fix needed there.
- iOS Safari audio unlock missing on `train.tsx` and `match.tsx` — known.
- 17-tab Workbench tab strip overwhelms mobile.
- Sims mostly call `getMaster()` directly, so they don't share the Workbench transport — known limitation.

**Deliverable:** `audit.md` with the full per-route/per-sim status + a prioritised fix list.

---

## 2. Fix the chain

Three small, surgical edits in `src/lib/device-engine.ts` and `src/routes/playground.tsx`:

1. **Remove the cross-instance dispose.** Drop the `ACTIVE_ENGINES.forEach(e.dispose())` line. Each engine owns its own subgraph; multiple engines coexist.
2. **Make `setChain` idempotent.** If devices ref-equal the previous chain, no-op (no duck, no rewire).
3. **Workbench audio status pill.** A small badge in the transport bar showing `CTX: running/suspended · ENGINE: ok · CHAIN: N`. Click to force `ctx.resume()`. Cheap, makes future regressions obvious.
4. **A/B button** (uses existing `ABCompare.tsx`) wired to `engine.setBypass(b)` so users can flip the chain on/off in one click.

That's it for the chain. No DeviceChainSim rewrite needed once #1 lands.

---

## 3. Duolingo Mode (additive — does not replace the brutalist site)

### 3.1 The toggle

Re-use the existing `useMode()` hook (currently `beginner` / `advanced`). Extend with a separate, orthogonal flag: `**learnMode**` = `classic` | `duolingo`, persisted in localStorage.

Add a tab to the Header (top right, next to streak/avatar):

```text
[ CLASSIC ]  [ DUOLINGO ]
```

- `classic` = today's site, untouched.
- `duolingo` = the gated tree experience, lives at `/learn`.

When `duolingo` is active, the home `/` redirects to `/learn` and the marquee/big nav is replaced by the Duo header (streak, hearts, XP). When `classic` is active, `/learn` is still reachable but the rest of the site renders normally.

### 3.2 Skill tree = Paths + Worlds, merged

We don't need new content. The skill tree IS the existing structure, just rendered as a gated tree:

```text
                    ┌─ World 1: First Contact ─┐
                    │                          │
              [ Path: First Beat ]  ←  the Duo path (default)
                    │
                    ●  Lesson 1 (unlocked)
                    │
                    ●  Lesson 2 (locked until L1 ≥ 80%)
                    │
                    ●  Lesson 3
                    │
                    ◆  Skill Check (5 questions, timed)
                    │
                    ●  Lesson 4 …
```

Mapping rule:

- **One Path → one branch of the tree.** First beat → "Beats" branch, Mix a track → "Mixing" branch, Sound design → "Sound Design", Live performance → "Performance".
- **Each mission in `path.missionSlugs` → one tree node.** Re-uses existing `mission/$slug` content.
- **Skill Check** = an auto-generated 5-question quiz pulled from the missions in that segment, inserted every ~5 nodes.
- **Worlds** become section headers between branches (purely cosmetic grouping inside the tree).

No content rewrite. The tree is a new view over `PATHS` and `MISSIONS`.

### 3.3 Gating (Duolingo mode only)

- Locked lessons: visually dim, tapping opens a tooltip "Complete previous lesson to unlock".
- Unlock rule: previous lesson `mission_completions.score ≥ 0.8`.
- Skill Check: locked until all preceding lessons in the segment are complete; passing it adds a "crown" to the tree.
- **Classic mode ignores all gating** — every mission is freely accessible, exactly like today.

### 3.4 Engagement loop (Duo mode only)

- **Hearts (5 max).** Wrong answer in a lesson = -1 heart. Out of hearts = wait 30 min OR perfect-score a previous lesson to refill 1. Stored in localStorage + synced to a new `hearts_state` table.
- **Streak.** Already in `progress.streak_days`. Surface the flame in the Duo header. Add a "streak freeze" inventory item (1/week).
- **XP and daily goal.** Reuse `progress.xp`. Onboarding asks "5 / 10 / 15 / 20 min/day". Goal ring fills as XP accrues today.
- **Daily quests.** 3 rotating goals on `/learn` ("Earn 30 XP", "Complete 1 lesson", "Practice yesterday's lesson").
- **SRS review.** Already-completed lessons re-surface based on the existing `review_schedule` table. Top of `/learn`: "5 reviews due" badge. Tapping runs a 5-question quiz drawn from those missions.
- **Mistakes pool.** Wrong quiz answers go into a per-user pool; "Practice mistakes" button on `/learn`.

### 3.5 Lesson screen (Duo mode only — `/lesson/$slug`)

A focused, single-purpose screen rendered ONLY when `learnMode === 'duolingo'`. In classic mode, `/mission/$slug` continues to render the existing rich page.

The Duo lesson:

- Top: progress bar + heart counter + close (X).
- One exercise per screen, "Continue" advances:
  1. **LISTEN** — auto-plays a short clip, "Continue".
  2. **MULTIPLE_CHOICE** — pulled from `mission.quiz`.
  3. **EAR_PICK** — A/B/C "which one has more compression?" (graded by RMS+spectral distance, reuses `audio.ts`).
  4. **MATCH_PAIRS** — drag term ↔ definition (from the glossary).
  5. **BUILD_CHAIN** — drag 3 of 6 devices into the right order (re-uses `DeviceEngine.setChain`).
  6. **KNOB_MATCH** — turn a knob until your sound matches the target (reuses KnobTrainerSim logic).
  7. **TAP_RHYTHM** — tap 4 bars in time.
- End screen: stars (1–3), XP earned, hearts remaining, "Continue".

Per-mission Duo content is generated mostly automatically:

- Quizzes → MULTIPLE_CHOICE.
- If `mission.sim.type` is one of `ear-training | knob-trainer | device-chain | drum-pad` → use that sim as one of the exercises.
- Otherwise insert a generic LISTEN + MULTIPLE_CHOICE pair.
- A small `lesson-duo.ts` overlay file lets us hand-author better exercise sequences for the marquee path (First Beat) without touching `missions.ts`.

### 3.6 Onboarding (first time Duo mode is enabled)

90-second flow:

1. "Tap to enable sound" (unlocks ctx)
2. Play a 4-bar loop → "Did you hear that?" (diagnostic + audio unlock)
3. Pick a goal: Beats / Mixing / Sound Design / Performance → seeds which path opens first
4. Pick daily goal: 5/10/15/20 min
5. First exercise — guaranteed-win EAR_PICK so the user gets +10 XP in their first 30 seconds.

### 3.7 Backend (Lovable Cloud)

Existing tables already cover most of this (`progress`, `mission_completions`, `review_schedule`, `badges`, `drill_scores`). Only new tables:

- `hearts_state` — `user_id`, `hearts`, `last_refill_at`, `streak_freezes` (RLS: own rows).
- `daily_quests` — `user_id`, `date`, `quests jsonb`, `progress jsonb` (RLS: own rows).

Both with own-row RLS, INSERT/SELECT/UPDATE for the user.

---

## 4. Order of execution

I'll commit after each numbered step:

1. **Audit report** + chain fix (remove `ACTIVE_ENGINES` dispose, idempotent `setChain`, status pill, A/B button).
2. **Mode toggle + `/learn` skill-tree home** (read-only over existing PATHS/MISSIONS, no gating yet, classic mode unchanged).
3. **Gating + hearts + daily quest + streak surfacing** (Duo mode only).
4. `**/lesson/$slug` Duo lesson screen** with auto-generated exercise sequences from existing mission data.
5. **Onboarding flow** (first Duo enable).
6. `**lesson-duo.ts` hand-authored sequences for the First Beat path** (marquee path quality bar).
7. **SRS review queue surfacing on `/learn**` (uses existing `review_schedule`).
8. **Polish: skill heatmap on profile, crowns, streak freezes.**

---

## 5. Files touched

- **Edit** `src/lib/device-engine.ts` — drop cross-dispose, idempotent setChain.
- **Edit** `src/routes/playground.tsx` — status pill, A/B button.
- **Edit** `src/lib/mode.ts` — add `learnMode` flag.
- **Edit** `src/components/Header.tsx` — Classic/Duolingo tab, conditional Duo header (hearts/streak/XP).
- **Create** `src/routes/learn.tsx` — skill tree home.
- **Create** `src/routes/lesson.$slug.tsx` — Duo lesson screen (only used in Duo mode).
- **Create** `src/components/SkillTree.tsx`, `src/components/HeartsBar.tsx`, `src/components/DailyQuest.tsx`, `src/components/Onboarding.tsx`.
- **Create** `src/components/exercises/{Listen,MultipleChoice,EarPick,MatchPairs,BuildChain,KnobMatch,TapRhythm}.tsx`.
- **Create** `src/lib/duo.ts` — exercise generator from a `Mission`, gating logic, hearts logic.
- **Create** `src/content/lesson-duo.ts` — optional hand-authored overlays.
- **Migration**: `hearts_state`, `daily_quests` tables with own-row RLS.

The brutalist site (`/`, `/worlds`, `/world/$slug`, `/paths`, `/path/$slug`, `/mission/$slug`, `/devices`, `/glossary`, `/playground`, etc.) is **not** touched by Duo work — it keeps rendering exactly as it does today when `learnMode === 'classic'`.

---

## What I need from you to proceed

Two quick choices (everything else has a sensible default):

1. **Which path becomes the marquee Duolingo path** — *First Beat* (recommended, broadest beginner appeal), *Mix a Track*, *Sound Design*, or *Live Performance*?
2. **Hearts model** — classic Duo (5 hearts, lose on wrong answers, 30-min refill) or generous (always practice, hearts purely cosmetic)?

I'll ask these as a follow-up after you approve the plan, then start with step 1 (audit + chain fix) in the first commit.  
  
First beat should be the marquee path. Hearts model is generous., dont call it duolingo or duo mode call it ccd mode. The skills tree should be in brutalist/classic mode too. 