import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PATHS } from "@/content/paths";
import { MISSIONS, missionBySlug } from "@/content/missions";
import { useProgress, DAILY_GOAL_XP, MAX_HEARTS } from "@/lib/progress";
import { useLearnMode, useMode, useIntermediatePath } from "@/lib/mode";
import { isBeginnerComplete } from "@/content/beginner-foundations";
import { INTERMEDIATE_ABLETON_SECTIONS, ADVANCED_ABLETON_SECTIONS } from "@/content/intermediate-paths";
import { useState } from "react";
import { SkillMap } from "@/components/SkillMap";

export const Route = createFileRoute("/learn")({
  head: () => ({
    meta: [
      { title: "Learn — CCD.SCHOOL" },
      {
        name: "description",
        content: "Choose your learning mode and follow a structured path through Ableton Live 12.",
      },
    ],
  }),
  component: LearnPage,
});

type Tab = "paths" | "skills" | "all";

function LearnPage() {
  const { progress } = useProgress();
  const { learnMode, setLearnMode } = useLearnMode();
  const { mode } = useMode();
  const { path: intermediatePath } = useIntermediatePath();
  const beginnerComplete = isBeginnerComplete(progress.completedMissions);
  const showDJPath = mode === "intermediate" && intermediatePath === "dj";
  const [activePath, setActivePath] = useState(PATHS[0].slug);
  const [tab, setTab] = useState<Tab>("paths");

  const path = PATHS.find((p) => p.slug === activePath) ?? PATHS[0];
  const completed = progress.completedMissions;

  const lessons = path.missionSlugs.map((slug, idx) => {
    const m = missionBySlug(slug);
    const prevSlug = path.missionSlugs[idx - 1];
    const prevDone = idx === 0 || !!(prevSlug && completed[prevSlug]);
    const done = !!completed[slug];
    const locked = learnMode === "ccd" && !prevDone && !done;
    return { slug, mission: m, idx, done, locked };
  });

  const totalDone = lessons.filter((l) => l.done).length;
  const pathPct = Math.round((totalDone / lessons.length) * 100);

  // CCD stats
  const allDone = Object.keys(completed).length;
  const totalPct = Math.round((allDone / MISSIONS.length) * 100);

  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-bone animate-fade-in">

      {/* DJ Path redirect banner */}
      {showDJPath && (
        <div className="brutal-border border-x-0 border-t-0 bg-volt text-bone">
          <div className="max-w-5xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="font-display text-2xl">🎧 You're on the DJ Path</div>
              <div className="font-mono text-xs opacity-80 mt-1">
                Your intermediate missions are in the DJ Path — rekordbox, beatmatching, cue points, mixing.
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                to="/dj"
                className="brutal-border bg-acid text-ink px-4 py-2 font-display text-lg brutal-press"
              >
                GO TO DJ PATH →
              </Link>
              <button
                onClick={() => navigate({ to: "/" })}
                className="brutal-border bg-bone text-ink px-3 py-2 font-mono text-xs uppercase brutal-press"
              >
                SWITCH PATH
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Beginner foundations gate */}
      {!beginnerComplete && (
        <div className="brutal-border border-x-0 border-t-0 bg-acid">
          <div className="max-w-5xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
            <div className="font-mono text-xs">
              🌱 <strong>Beginner mode:</strong> Complete foundations first for the best experience.
            </div>
            <Link
              to="/beginner"
              className="brutal-border bg-ink text-bone px-3 py-1.5 font-mono text-[10px] uppercase brutal-press"
            >
              GO TO FOUNDATIONS →
            </Link>
          </div>
        </div>
      )}

      {/* Mode selector — the only place it lives */}
      <section className="brutal-border border-x-0 border-t-0">
        <div className="max-w-5xl mx-auto px-4 py-4 grid md:grid-cols-2 gap-3">
          {/* Classic card */}
          <button
            onClick={() => setLearnMode("classic")}
            className={`brutal-border p-4 text-left transition-all ${
              learnMode === "classic" ? "bg-acid" : "bg-bone hover:bg-sun/30"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="font-display text-2xl">CLASSIC</div>
              {learnMode === "classic" && (
                <span className="font-mono text-[10px] uppercase brutal-border bg-ink text-bone px-2 py-1">
                  ACTIVE
                </span>
              )}
            </div>
            <div className="font-mono text-xs mt-2 leading-relaxed opacity-80">
              All 116 missions open. No locks. No hearts. Explore freely — follow any path or jump
              anywhere.
            </div>
          </button>

          {/* CCD card */}
          <button
            onClick={() => setLearnMode("ccd")}
            className={`brutal-border p-4 text-left transition-all ${
              learnMode === "ccd" ? "bg-hot text-bone" : "bg-bone hover:bg-sun/30"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="font-display text-2xl">CCD MODE</div>
              {learnMode === "ccd" && (
                <span className="font-mono text-[10px] uppercase brutal-border bg-bone text-ink px-2 py-1">
                  ACTIVE
                </span>
              )}
            </div>
            <div className="font-mono text-xs mt-2 leading-relaxed opacity-90">
              Structured. Sequential. Each mission unlocks the next. Wrong quiz answers cost a heart
              ♥. Earn streak shields at 7-day milestones.
            </div>
            {learnMode === "ccd" && (
              <div className="flex gap-2 mt-3 flex-wrap">
                <span className="brutal-border bg-bone text-ink px-2 py-1 font-mono text-[10px] uppercase">
                  ♥ {progress.hearts}/{MAX_HEARTS} hearts
                </span>
                <span className="brutal-border bg-bone text-ink px-2 py-1 font-mono text-[10px] uppercase">
                  🔥 {progress.streakDays}d streak
                </span>
                <span className="brutal-border bg-bone text-ink px-2 py-1 font-mono text-[10px] uppercase">
                  {progress.dailyXp}/{DAILY_GOAL_XP} XP today
                </span>
                {progress.streakShield && (
                  <span className="brutal-border bg-acid text-ink px-2 py-1 font-mono text-[10px] uppercase">
                    🛡 Shield
                  </span>
                )}
              </div>
            )}
          </button>
        </div>
      </section>

      {/* Progress summary */}
      <section className="brutal-border border-x-0 border-t-0 bg-bone">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3 flex-wrap">
          <div className="h-2 brutal-border flex-1 bg-bone overflow-hidden min-w-[120px]">
            <div
              className="h-full bg-acid transition-all duration-500"
              style={{ width: `${totalPct}%` }}
            />
          </div>
          <span className="font-mono text-[10px] uppercase opacity-70 shrink-0">
            {allDone} / {MISSIONS.length} missions · {totalPct}%
          </span>
        </div>
      </section>

      {/* Tab switcher */}
      <div className="max-w-5xl mx-auto px-4 pt-4 flex gap-1">
        {(
          [
            ["paths", "PATHS"],
            ["all", "ALL MISSIONS"],
          ] as [Tab, string][]
        ).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`brutal-border px-4 py-2 font-mono text-xs uppercase brutal-press ${
              tab === id ? "bg-volt text-bone" : "bg-bone"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Intermediate Ableton sections — shown when not DJ path */}
      {!showDJPath && (mode === "intermediate" || mode === "advanced") && tab === "paths" && (
        <section className="max-w-5xl mx-auto px-4 pt-6 pb-4">
          <div className="font-mono text-[10px] uppercase opacity-60 mb-4">
            // {mode === "advanced" ? "ADVANCED" : "INTERMEDIATE"} ABLETON PATH · STRUCTURED SECTIONS
          </div>
          <div className="space-y-3">
            {(mode === "advanced" ? ADVANCED_ABLETON_SECTIONS : INTERMEDIATE_ABLETON_SECTIONS).map((section) => {
              const sectionDone = section.missionSlugs.filter((s) => completed[s]).length;
              const sectionPct = Math.round((sectionDone / section.missionSlugs.length) * 100);
              return (
                <div key={section.title} className={`brutal-border ${section.color} p-4`}>
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <div className="font-display text-2xl leading-none">{section.title}</div>
                      <div className="font-mono text-xs mt-1 opacity-80">{section.tagline}</div>
                      {section.requiresAbleton && (
                        <div className="brutal-border bg-ink text-bone font-mono text-[9px] uppercase px-2 py-0.5 inline-block mt-2">
                          ABLETON RECOMMENDED
                        </div>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-display text-3xl">{sectionDone}/{section.missionSlugs.length}</div>
                      <div className="font-mono text-[9px] uppercase opacity-60">{sectionPct}% done</div>
                    </div>
                  </div>
                  <div className="h-1.5 brutal-border bg-ink/20 mt-3 overflow-hidden">
                    <div className="h-full bg-ink/60 transition-all duration-500" style={{ width: `${sectionPct}%` }} />
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {section.missionSlugs.slice(0, 5).map((slug) => {
                      const isDone = !!completed[slug];
                      return (
                        <Link
                          key={slug}
                          to="/mission/$slug"
                          params={{ slug }}
                          className={`brutal-border px-2 py-1 font-mono text-[9px] uppercase brutal-press ${
                            isDone ? "bg-ink text-bone" : "bg-bone hover:bg-sun"
                          }`}
                        >
                          {isDone ? "✓ " : ""}{slug.replace(/-/g, " ")}
                        </Link>
                      );
                    })}
                    {section.missionSlugs.length > 5 && (
                      <span className="font-mono text-[9px] uppercase opacity-40 self-center">
                        +{section.missionSlugs.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 brutal-border border-ink/20 p-3">
            <div className="font-mono text-[10px] uppercase opacity-60 mb-1">
              Or browse all Ableton paths below ↓
            </div>
          </div>
        </section>
      )}

      {/* PATHS tab */}
      {tab === "paths" && (
        <>
          <section className="max-w-5xl mx-auto px-4 py-4">
            {/* Path selector — horizontal scrolling pills */}
            <div className="flex gap-2 flex-wrap font-mono text-[11px] uppercase mb-4">
              {PATHS.map((p) => {
                const done = p.missionSlugs.filter((s) => completed[s]).length;
                return (
                  <button
                    key={p.slug}
                    onClick={() => setActivePath(p.slug)}
                    className={`brutal-border px-3 py-2 brutal-press flex items-center gap-2 ${
                      activePath === p.slug ? "bg-ink text-bone" : "bg-bone hover:bg-sun"
                    }`}
                  >
                    {p.title}
                    <span
                      className={`text-[9px] ${activePath === p.slug ? "opacity-60" : "opacity-40"}`}
                    >
                      {done}/{p.missionSlugs.length}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Active path description */}
            <div className="brutal-border bg-sun p-3 mb-4">
              <div className="font-display text-xl">{path.title}</div>
              <div className="font-mono text-xs mt-1 opacity-80">{path.description}</div>
              <div className="h-1.5 brutal-border bg-bone mt-3 overflow-hidden">
                <div
                  className="h-full bg-ink transition-all duration-500"
                  style={{ width: `${pathPct}%` }}
                />
              </div>
              <div className="font-mono text-[10px] uppercase mt-1 opacity-60">
                {totalDone} / {lessons.length} complete · {pathPct}%
              </div>
            </div>
          </section>

          {/* Duolingo-style path — vertical snake */}
          <section className="max-w-lg mx-auto px-4 pb-24">
            <ol className="relative space-y-3">
              {lessons.map((l, i) => {
                // Snake: alternating indent pattern
                const col = i % 5;
                const indent = ["ml-0", "ml-8", "ml-16", "ml-8", "ml-0"][col];
                const isCheck = (i + 1) % 5 === 0;
                const xpEarned = completed[l.slug]?.score;
                return (
                  <li key={l.slug} className={`${indent} transition-all`}>
                    <LessonNode
                      num={i + 1}
                      title={l.mission?.title ?? l.slug}
                      slug={l.slug}
                      done={l.done}
                      locked={l.locked}
                      isCheck={isCheck}
                      score={typeof xpEarned === "number" ? Math.round(xpEarned * 100) : undefined}
                    />
                  </li>
                );
              })}

              {/* Crown finish */}
              <li className="ml-0 mt-6">
                <div className="brutal-border bg-sun p-4 text-center">
                  <div className="font-display text-2xl">👑 PATH COMPLETE</div>
                  <div className="font-mono text-[10px] uppercase mt-1 opacity-70">
                    Finish all {lessons.length} missions to earn the {path.title} crown
                  </div>
                </div>
              </li>
            </ol>
          </section>
        </>
      )}

      {/* ALL MISSIONS tab — clean grid, not overwhelming */}
      {tab === "skills" && (
        <section className="max-w-5xl mx-auto px-4 py-4 pb-24">
          <SkillMap />
        </section>
      )}

      {tab === "all" && (
        <section className="max-w-5xl mx-auto px-4 py-4 pb-24">
          <div className="font-mono text-[10px] uppercase opacity-60 mb-3">
            All 116 missions · click to open ·{" "}
            {learnMode === "ccd" ? "CCD locks apply" : "all open"}
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-1">
            {MISSIONS.map((m, i) => {
              const isDone = !!completed[m.slug];
              return (
                <Link
                  key={m.slug}
                  to="/mission/$slug"
                  params={{ slug: m.slug }}
                  title={`${m.number}. ${m.title}`}
                  className={`brutal-border aspect-square flex items-center justify-center font-mono text-[10px] brutal-press transition-colors ${
                    isDone ? "bg-acid text-ink" : "bg-bone hover:bg-sun"
                  }`}
                >
                  {isDone ? "✓" : m.number}
                </Link>
              );
            })}
          </div>
          <div className="mt-4 font-mono text-[10px] uppercase opacity-50">
            Green = completed · hover for title
          </div>
        </section>
      )}
    </main>
  );
}

function LessonNode({
  num,
  title,
  slug,
  done,
  locked,
  isCheck,
  score,
}: {
  num: number;
  title: string;
  slug: string;
  done: boolean;
  locked: boolean;
  isCheck: boolean;
  score?: number;
}) {
  const tone = done
    ? "bg-acid text-ink"
    : locked
      ? "bg-bone opacity-40 cursor-not-allowed"
      : isCheck
        ? "bg-volt text-bone"
        : "bg-bone hover:bg-sun";

  const icon = done ? "✓" : locked ? "🔒" : isCheck ? "◆" : String(num);

  const inner = (
    <div className={`brutal-border px-3 py-2.5 flex items-center gap-3 w-full max-w-xs ${tone}`}>
      <span
        className={`brutal-border w-9 h-9 flex items-center justify-center font-display text-base shrink-0 ${
          done ? "bg-ink text-bone" : isCheck ? "bg-hot text-bone" : "bg-bone text-ink"
        }`}
      >
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <div className="font-display text-sm truncate">{title}</div>
        <div className="font-mono text-[9px] uppercase opacity-60">
          {done && score !== undefined
            ? `${score}% score`
            : locked
              ? "finish previous first"
              : isCheck
                ? "skill check"
                : "lesson"}
        </div>
      </div>
    </div>
  );

  if (locked) return <div>{inner}</div>;
  return (
    <Link to="/mission/$slug" params={{ slug }}>
      {inner}
    </Link>
  );
}
