import { createFileRoute, Link } from "@tanstack/react-router";
import { PATHS } from "@/content/paths";
import { MISSIONS, missionBySlug } from "@/content/missions";
import { useProgress, DAILY_GOAL_XP, MAX_HEARTS } from "@/lib/progress";
import { useLearnMode } from "@/lib/mode";
import { useState } from "react";
import { SkillMap } from "@/components/SkillMap";
import { BEGINNER_MISSIONS, BEGINNER_SLUGS } from "@/content/beginner-foundations";
import { DJ_MISSIONS, DJ_CORE_SLUGS } from "@/content/dj-missions";

export const Route = createFileRoute("/learn")({
  head: () => ({
    meta: [
      { title: "Learn — CCD.SCHOOL" },
      {
        name: "description",
        content: "All learning paths: Beginner foundations, DJ path, and Ableton Live missions.",
      },
    ],
  }),
  component: LearnPage,
});

type Tab = "paths" | "all";

function LearnPage() {
  const { progress } = useProgress();
  const { learnMode, setLearnMode } = useLearnMode();
  const [activePath, setActivePath] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("paths");

  const completed = progress.completedMissions;

  // Beginner stats
  const beginnerDone = BEGINNER_SLUGS.filter((s) => !!completed[s]).length;
  const beginnerPct = Math.round((beginnerDone / BEGINNER_SLUGS.length) * 100);

  // DJ stats
  const djCoreDone = DJ_CORE_SLUGS.filter((s) => !!completed[s]).length;
  const djPct = Math.round((djCoreDone / DJ_CORE_SLUGS.length) * 100);

  // Ableton path
  const activeAbletonPath = activePath ? PATHS.find((p) => p.slug === activePath) ?? PATHS[0] : PATHS[0];
  const lessons = activeAbletonPath.missionSlugs.map((slug, idx) => {
    const m = missionBySlug(slug);
    const prevSlug = activeAbletonPath.missionSlugs[idx - 1];
    const prevDone = idx === 0 || !!(prevSlug && completed[prevSlug]);
    const done = !!completed[slug];
    const locked = learnMode === "ccd" && !prevDone && !done;
    return { slug, mission: m, idx, done, locked };
  });
  const totalDone = lessons.filter((l) => l.done).length;
  const pathPct = Math.round((totalDone / lessons.length) * 100);

  const allDone = Object.keys(completed).length;
  const totalPct = Math.round((allDone / MISSIONS.length) * 100);

  return (
    <main className="min-h-screen bg-bone">
      {/* CCD mode selector */}
      <section className="brutal-border border-x-0 border-t-0">
        <div className="max-w-5xl mx-auto px-4 py-4 grid md:grid-cols-2 gap-3">
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
              All missions open. No locks. Explore freely — follow any path or jump anywhere.
            </div>
          </button>
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
              Sequential. Each mission unlocks the next. Wrong answers cost a ♥.
            </div>
            {learnMode === "ccd" && (
              <div className="flex gap-2 mt-3 flex-wrap">
                <span className="brutal-border bg-bone text-ink px-2 py-1 font-mono text-[10px] uppercase">
                  ♥ {progress.hearts}/{MAX_HEARTS}
                </span>
                <span className="brutal-border bg-bone text-ink px-2 py-1 font-mono text-[10px] uppercase">
                  🔥 {progress.streakDays}d streak
                </span>
                <span className="brutal-border bg-bone text-ink px-2 py-1 font-mono text-[10px] uppercase">
                  {progress.dailyXp}/{DAILY_GOAL_XP} XP today
                </span>
              </div>
            )}
          </button>
        </div>
      </section>

      {/* Tab switcher */}
      <div className="max-w-5xl mx-auto px-4 pt-4 flex gap-1">
        {(["paths", "all"] as Tab[]).map((id) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`brutal-border px-4 py-2 font-mono text-xs uppercase brutal-press ${
              tab === id ? "bg-volt text-bone" : "bg-bone"
            }`}
          >
            {id === "paths" ? "ALL PATHS" : "ALL MISSIONS"}
          </button>
        ))}
      </div>

      {/* PATHS TAB */}
      {tab === "paths" && (
        <section className="max-w-5xl mx-auto px-4 py-4 space-y-6 pb-24">

          {/* Beginner Foundations path card */}
          <div>
            <div className="font-mono text-[9px] uppercase opacity-40 mb-2">// START HERE</div>
            <div className="brutal-border bg-acid p-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="font-mono text-[9px] uppercase opacity-60">
                    PATH · {BEGINNER_SLUGS.length} MISSIONS · NO PRIOR KNOWLEDGE NEEDED
                  </div>
                  <div className="font-display text-3xl mt-1">🌱 Music Foundations</div>
                  <div className="font-mono text-xs mt-2 opacity-80 leading-relaxed max-w-lg">
                    Sound, rhythm, melody, harmony, DAWs, MIDI, samples, mixing — explained simply
                    with cited sources. The vocabulary you need for everything else.
                  </div>
                  <div className="h-2 brutal-border bg-ink/10 mt-3 overflow-hidden max-w-xs">
                    <div
                      className="h-full bg-ink transition-all"
                      style={{ width: `${beginnerPct}%` }}
                    />
                  </div>
                  <div className="font-mono text-[9px] uppercase opacity-50 mt-1">
                    {beginnerDone}/{BEGINNER_SLUGS.length} complete · {beginnerPct}%
                  </div>
                </div>
                <Link
                  to="/beginner"
                  className="brutal-border bg-ink text-bone px-5 py-3 font-display text-xl brutal-press shrink-0"
                >
                  {beginnerDone > 0 ? "RESUME →" : "START →"}
                </Link>
              </div>

              {/* Mission chips */}
              <div className="flex flex-wrap gap-1.5 mt-4">
                {BEGINNER_MISSIONS.map((m) => {
                  const isDone = !!completed[m.slug];
                  return (
                    <Link
                      key={m.slug}
                      to="/beginner/$slug"
                      params={{ slug: m.slug }}
                      className={`brutal-border px-2 py-1 font-mono text-[9px] uppercase brutal-press ${
                        isDone ? "bg-ink text-bone" : "bg-bone hover:bg-sun"
                      }`}
                    >
                      {isDone ? "✓ " : ""}{m.emoji} {m.title}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* DJ Path card */}
          <div>
            <div className="font-mono text-[9px] uppercase opacity-40 mb-2">// DJ PATH</div>
            <div className="brutal-border bg-volt text-bone p-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="font-mono text-[9px] uppercase opacity-60">
                    PATH · {DJ_CORE_SLUGS.length} CORE MISSIONS · REKORDBOX (PIONEER DJ)
                  </div>
                  <div className="font-display text-3xl mt-1">🎧 DJ Path</div>
                  <div className="font-mono text-xs mt-2 opacity-80 leading-relaxed max-w-lg">
                    What is DJing, equipment, BPM & beatmatching, cue points, the mixer,
                    transitions, library management, reading the crowd. Sourced from rekordbox 6.0 manual.
                  </div>
                  <div className="h-2 brutal-border bg-bone/20 mt-3 overflow-hidden max-w-xs">
                    <div
                      className="h-full bg-acid transition-all"
                      style={{ width: `${djPct}%` }}
                    />
                  </div>
                  <div className="font-mono text-[9px] uppercase opacity-60 mt-1">
                    {djCoreDone}/{DJ_CORE_SLUGS.length} complete · {djPct}%
                  </div>
                </div>
                <Link
                  to="/dj"
                  className="brutal-border bg-acid text-ink px-5 py-3 font-display text-xl brutal-press shrink-0"
                >
                  {djCoreDone > 0 ? "CONTINUE →" : "START →"}
                </Link>
              </div>

              {/* Mission chips */}
              <div className="flex flex-wrap gap-1.5 mt-4">
                {DJ_MISSIONS.filter((m) => m.tier === "core").map((m) => {
                  const isDone = !!completed[m.slug];
                  return (
                    <Link
                      key={m.slug}
                      to="/dj/$slug"
                      params={{ slug: m.slug }}
                      className={`brutal-border px-2 py-1 font-mono text-[9px] uppercase brutal-press ${
                        isDone ? "bg-acid text-ink" : "bg-bone/20 hover:bg-bone/40"
                      }`}
                    >
                      {isDone ? "✓ " : ""}{m.emoji} {m.title}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Ableton paths */}
          <div>
            <div className="font-mono text-[9px] uppercase opacity-40 mb-2">// ABLETON LIVE 12 PATHS</div>

            {/* Path pills */}
            <div className="flex gap-2 flex-wrap font-mono text-[11px] uppercase mb-4">
              {PATHS.map((p) => {
                const done = p.missionSlugs.filter((s) => completed[s]).length;
                const isActive = (activePath ?? PATHS[0].slug) === p.slug;
                return (
                  <button
                    key={p.slug}
                    onClick={() => setActivePath(p.slug)}
                    className={`brutal-border px-3 py-2 brutal-press flex items-center gap-2 ${
                      isActive ? "bg-ink text-bone" : "bg-bone hover:bg-sun"
                    }`}
                  >
                    {p.title}
                    <span className={`text-[9px] ${isActive ? "opacity-60" : "opacity-40"}`}>
                      {done}/{p.missionSlugs.length}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Active path info */}
            <div className="brutal-border bg-sun p-3 mb-4">
              <div className="font-display text-xl">{activeAbletonPath.title}</div>
              <div className="font-mono text-xs mt-1 opacity-80">{activeAbletonPath.description}</div>
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
          </div>

          {/* Duolingo-style snake */}
          <div className="max-w-lg mx-auto">
            <ol className="relative space-y-3">
              {lessons.map((l, i) => {
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
              <li className="ml-0 mt-6">
                <div className="brutal-border bg-sun p-4 text-center">
                  <div className="font-display text-2xl">👑 PATH COMPLETE</div>
                  <div className="font-mono text-[10px] uppercase mt-1 opacity-70">
                    Finish all {lessons.length} missions
                  </div>
                </div>
              </li>
            </ol>
          </div>
        </section>
      )}

      {/* ALL MISSIONS tab */}
      {tab === "all" && (
        <section className="max-w-5xl mx-auto px-4 py-4 pb-24">
          <div className="font-mono text-[10px] uppercase opacity-60 mb-3">
            {MISSIONS.length} Ableton missions · {totalPct}% done
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-1">
            {MISSIONS.map((m) => {
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
