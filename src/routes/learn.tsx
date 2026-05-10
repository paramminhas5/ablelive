import { createFileRoute, Link } from "@tanstack/react-router";
import { PATHS } from "@/content/paths";
import { missionBySlug } from "@/content/missions";
import { useProgress } from "@/lib/progress";
import { useLearnMode } from "@/lib/mode";
import { useState } from "react";
import { JourneyMap } from "@/components/JourneyMap";

export const Route = createFileRoute("/learn")({
  head: () => ({ meta: [
    { title: "Learn — ABLETON.SCHOOL" },
    { name: "description", content: "Paths, skill map and journey — pick a learning path or explore the whole map." },
    { property: "og:title", content: "Learn — ABLETON.SCHOOL" },
    { property: "og:description", content: "Hearts, streaks, XP. A learning loop built for music production." },
  ]}),
  component: LearnPage,
});

const MARQUEE_PATH = "first-beat";
type Tab = "paths" | "skills" | "journey";

function LearnPage() {
  const { progress } = useProgress();
  const { learnMode, setLearnMode } = useLearnMode();
  const [activePath, setActivePath] = useState(MARQUEE_PATH);
  const [tab, setTab] = useState<Tab>("paths");

  const path = PATHS.find((p) => p.slug === activePath) ?? PATHS[0];
  const completed = progress.completedMissions;

  const lessons = path.missionSlugs.map((slug, idx) => {
    const m = missionBySlug(slug);
    const prevSlug = path.missionSlugs[idx - 1];
    const prevDone = idx === 0 || (prevSlug && completed[prevSlug] && completed[prevSlug].score >= 0.6);
    const done = !!completed[slug];
    const locked = learnMode === "ccd" ? !prevDone : false;
    return { slug, mission: m, idx, done, locked };
  });

  const totalDone = lessons.filter((l) => l.done).length;
  const pct = Math.round((totalDone / lessons.length) * 100);

  return (
    <main className="min-h-screen bg-bone">
      {/* Hero */}
      <section className="brutal-border border-x-0 border-t-0 bg-acid">
        <div className="max-w-5xl mx-auto px-4 py-5 md:py-6 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-display text-3xl md:text-5xl">LEARN</h1>
            <p className="font-mono text-[11px] md:text-xs uppercase mt-1">
              Paths, skill map, journey — pick how you explore.
            </p>
          </div>
          <div className="flex gap-2 font-mono text-[11px] md:text-xs">
            <button onClick={() => setLearnMode("classic")} className={`brutal-border px-3 py-2 brutal-press ${learnMode === "classic" ? "bg-ink text-bone" : "bg-bone"}`}>CLASSIC</button>
            <button onClick={() => setLearnMode("ccd")} className={`brutal-border px-3 py-2 brutal-press ${learnMode === "ccd" ? "bg-hot text-bone" : "bg-bone"}`}>CCD MODE</button>
          </div>
        </div>
      </section>

      {/* Engagement strip */}
      <section className="brutal-border border-x-0 border-t-0 bg-bone">
        <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center gap-2 flex-wrap font-mono text-[10px] md:text-xs uppercase">
          <span className="brutal-border bg-hot text-bone px-2 py-1">🔥 {progress.streakDays}d</span>
          <span className="brutal-border bg-acid px-2 py-1">XP {progress.xp}</span>
          <span className="brutal-border bg-sun px-2 py-1">{totalDone}/{lessons.length} on path · {pct}%</span>
        </div>
      </section>

      {/* Tabs */}
      <section className="max-w-5xl mx-auto px-4 pt-4">
        <div className="flex gap-1 font-mono text-xs uppercase">
          {([
            { id: "paths", label: "PATHS" },
            { id: "skills", label: "SKILL MAP" },
            { id: "journey", label: "JOURNEY" },
          ] as { id: Tab; label: string }[]).map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`brutal-border px-3 py-2 brutal-press flex-1 md:flex-none ${tab === t.id ? "bg-volt text-bone" : "bg-bone"}`}>
              {t.label}
            </button>
          ))}
        </div>
      </section>

      {tab === "paths" && (
        <>
          <section className="max-w-5xl mx-auto px-4 py-4">
            <div className="flex gap-2 flex-wrap font-mono text-[11px] uppercase">
              {PATHS.map((p) => (
                <button key={p.slug} onClick={() => setActivePath(p.slug)}
                  className={`brutal-border px-3 py-2 brutal-press ${activePath === p.slug ? "bg-ink text-bone" : "bg-bone"}`}>
                  {p.slug === MARQUEE_PATH ? "★ " : ""}{p.title}
                </button>
              ))}
            </div>
            <p className="font-mono text-xs mt-3 opacity-70">{path.description}</p>
          </section>

          <section className="max-w-3xl mx-auto px-4 pb-20">
            <ol className="relative">
              {lessons.map((l, i) => {
                const offset = i % 4;
                const ml = ["ml-0", "ml-6 md:ml-24", "ml-12 md:ml-48", "ml-6 md:ml-24"][offset];
                const isCheck = (i + 1) % 5 === 0;
                return (
                  <li key={l.slug} className={`flex items-center gap-3 my-3 ${ml}`}>
                    <LessonNode
                      num={i + 1}
                      title={l.mission?.title ?? l.slug}
                      slug={l.slug}
                      done={l.done}
                      locked={l.locked}
                      isCheck={isCheck}
                    />
                  </li>
                );
              })}
            </ol>

            <div className="mt-8 brutal-border bg-sun p-4 md:p-5 text-center">
              <div className="font-display text-xl md:text-2xl">PATH COMPLETE → CROWN</div>
              <p className="font-mono text-[11px] md:text-xs mt-1 uppercase">
                Finish all {lessons.length} lessons to earn the {path.title} crown.
              </p>
            </div>
          </section>
        </>
      )}

      {tab === "skills" && (
        <section className="max-w-6xl mx-auto px-4 py-4 pb-20 space-y-3">
          <div className="font-mono text-[11px] uppercase opacity-70">
            ▸ Every path as a wrapping lane. Cross-paths share stops where skills overlap.
          </div>
          {PATHS.map((p) => {
            const doneCount = p.missionSlugs.filter((s) => progress.completedMissions[s]).length;
            return (
              <div key={p.slug} className="brutal-border bg-card p-2 md:p-3">
                <button onClick={() => { setActivePath(p.slug); setTab("paths"); }}
                  className={`${p.color} brutal-border px-2 py-1.5 font-mono text-[10px] uppercase brutal-press text-left mb-2 inline-flex items-center gap-2`}>
                  <span className="font-display text-sm">{p.title}</span>
                  <span className="opacity-80">{doneCount}/{p.missionSlugs.length}</span>
                </button>
                <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 gap-1">
                  {p.missionSlugs.map((slug, idx) => {
                    const m = missionBySlug(slug);
                    const isDone = !!progress.completedMissions[slug];
                    const prevDone = idx === 0 || (progress.completedMissions[p.missionSlugs[idx - 1]]?.score ?? 0) >= 0.6;
                    const locked = learnMode === "ccd" && !prevDone && !isDone;
                    const tone = isDone ? "bg-acid text-ink"
                              : locked ? "bg-bone opacity-40"
                              : "bg-bone text-ink hover:bg-sun";
                    return (
                      <Link key={slug} to="/mission/$slug" params={{ slug }}
                        title={`${m?.title ?? slug}${locked ? " — LOCKED" : ""}`}
                        aria-disabled={locked || undefined}
                        onClick={(e) => { if (locked) e.preventDefault(); }}
                        className={`${tone} brutal-border aspect-square flex items-center justify-center font-mono text-[10px] brutal-press`}>
                        {isDone ? "✓" : locked ? "🔒" : idx + 1}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </section>
      )}

      {tab === "journey" && (
        <section className="max-w-6xl mx-auto px-4 py-4 pb-20">
          <JourneyMap />
        </section>
      )}
    </main>
  );
}

function LessonNode({ num, title, slug, done, locked, isCheck }: {
  num: number; title: string; slug: string;
  done: boolean; locked: boolean; isCheck: boolean;
}) {
  const base = "brutal-border px-3 py-2.5 brutal-press flex items-center gap-3 min-w-[220px] max-w-[420px] w-full md:w-auto";
  const tone = done ? "bg-acid"
              : locked ? "bg-bone opacity-40 cursor-not-allowed"
              : isCheck ? "bg-volt text-bone"
              : "bg-bone hover:bg-sun";

  const inner = (
    <>
      <span className={`brutal-border w-9 h-9 flex items-center justify-center font-display text-base shrink-0 ${
        done ? "bg-ink text-bone" : isCheck ? "bg-hot text-bone" : "bg-bone"
      }`}>
        {done ? "✓" : isCheck ? "◆" : num}
      </span>
      <span className="flex-1 min-w-0">
        <div className="font-display text-sm md:text-base truncate">{title}</div>
        <div className="font-mono text-[9px] md:text-[10px] uppercase opacity-70">
          {locked ? "LOCKED · finish previous" : isCheck ? "SKILL CHECK" : "LESSON"}
        </div>
      </span>
    </>
  );

  if (locked) return <div className={`${base} ${tone}`}>{inner}</div>;
  return <Link to="/mission/$slug" params={{ slug }} className={`${base} ${tone}`}>{inner}</Link>;
}
