import { createFileRoute, Link } from "@tanstack/react-router";
import { PATHS } from "@/content/paths";
import { missionBySlug } from "@/content/missions";
import { useProgress } from "@/lib/progress";
import { useLearnMode } from "@/lib/mode";
import { useState } from "react";
import { JourneyMap } from "@/components/JourneyMap";

export const Route = createFileRoute("/learn")({
  head: () => ({ meta: [
    { title: "Skill Tree — ABLETON.SCHOOL" },
    { name: "description", content: "A gated, Duolingo-style skill tree for music production. Learn Live one lesson at a time." },
    { property: "og:title", content: "Skill Tree — ABLETON.SCHOOL" },
    { property: "og:description", content: "Hearts, streaks, XP. A learning loop built for music production." },
  ]}),
  component: LearnPage,
});

const MARQUEE_PATH = "first-beat"; // First Beat is the marquee CCD path

function LearnPage() {
  const { progress } = useProgress();
  const { learnMode, setLearnMode } = useLearnMode();
  const [activePath, setActivePath] = useState(MARQUEE_PATH);

  const path = PATHS.find((p) => p.slug === activePath) ?? PATHS[0];
  const completed = progress.completedMissions;

  // Compute unlock state for each lesson (CCD mode only).
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
      {/* CCD header */}
      <section className="brutal-border border-x-0 border-t-0 bg-acid">
        <div className="max-w-5xl mx-auto px-4 py-6 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-display text-3xl md:text-5xl">SKILL TREE</h1>
            <p className="font-mono text-xs uppercase mt-1">
              Mode: <strong>{learnMode === "ccd" ? "CCD (gated)" : "CLASSIC (open)"}</strong> — switch any time
            </p>
          </div>
          <div className="flex gap-2 font-mono text-xs">
            <button
              onClick={() => setLearnMode("classic")}
              className={`brutal-border px-3 py-2 brutal-press ${learnMode === "classic" ? "bg-ink text-bone" : "bg-bone"}`}
            >CLASSIC</button>
            <button
              onClick={() => setLearnMode("ccd")}
              className={`brutal-border px-3 py-2 brutal-press ${learnMode === "ccd" ? "bg-hot text-bone" : "bg-bone"}`}
            >CCD MODE</button>
          </div>
        </div>
      </section>

      {/* Engagement strip */}
      <section className="brutal-border border-x-0 border-t-0 bg-bone">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3 flex-wrap font-mono text-xs uppercase">
          <span className="brutal-border bg-hot text-bone px-3 py-1.5">🔥 {progress.streakDays} day streak</span>
          <span className="brutal-border bg-acid px-3 py-1.5">XP {progress.xp}</span>
          <span className="brutal-border bg-volt text-bone px-3 py-1.5">❤️ ❤️ ❤️ ❤️ ❤️ generous</span>
          <span className="brutal-border bg-sun px-3 py-1.5">{totalDone}/{lessons.length} this path · {pct}%</span>
        </div>
      </section>

      {/* Path picker */}
      <section className="max-w-5xl mx-auto px-4 py-5">
        <div className="flex gap-2 flex-wrap font-mono text-xs uppercase">
          {PATHS.map((p) => (
            <button
              key={p.slug}
              onClick={() => setActivePath(p.slug)}
              className={`brutal-border px-3 py-2 brutal-press ${activePath === p.slug ? "bg-ink text-bone" : "bg-bone"}`}
            >
              {p.slug === MARQUEE_PATH ? "★ " : ""}{p.title}
            </button>
          ))}
        </div>
        <p className="font-mono text-xs mt-3 opacity-70">{path.description}</p>
      </section>

      {/* Tree */}
      <section className="max-w-3xl mx-auto px-4 pb-20">
        <ol className="relative">
          {lessons.map((l, i) => {
            const offset = i % 4; // serpentine
            const ml = ["ml-0", "ml-12 md:ml-24", "ml-24 md:ml-48", "ml-12 md:ml-24"][offset];
            const isCheck = (i + 1) % 5 === 0;
            return (
              <li key={l.slug} className={`flex items-center gap-4 my-3 ${ml}`}>
                <Connector last={i === lessons.length - 1} />
                <LessonNode
                  num={i + 1}
                  title={l.mission?.title ?? l.slug}
                  slug={l.slug}
                  done={l.done}
                  locked={l.locked}
                  isCheck={isCheck}
                  ccd={learnMode === "ccd"}
                />
              </li>
            );
          })}
        </ol>

        {/* End cap */}
        <div className="mt-8 brutal-border bg-sun p-5 text-center">
          <div className="font-display text-2xl">PATH COMPLETE → CROWN</div>
          <p className="font-mono text-xs mt-1 uppercase">
            Finish all {lessons.length} lessons to earn the {path.title} crown.
          </p>
        </div>
      </section>
    </main>
  );
}

function Connector({ last }: { last: boolean }) {
  if (last) return null;
  return <span className="font-mono text-xs opacity-40">↓</span>;
}

function LessonNode({
  num, title, slug, done, locked, isCheck, ccd,
}: {
  num: number; title: string; slug: string;
  done: boolean; locked: boolean; isCheck: boolean; ccd: boolean;
}) {
  const base = "brutal-border px-4 py-3 brutal-press flex items-center gap-3 min-w-[260px] max-w-[420px]";
  const tone = done ? "bg-acid"
              : locked ? "bg-bone opacity-40 cursor-not-allowed"
              : isCheck ? "bg-volt text-bone"
              : "bg-bone hover:bg-sun";

  const inner = (
    <>
      <span className={`brutal-border w-10 h-10 flex items-center justify-center font-display text-lg shrink-0 ${
        done ? "bg-ink text-bone" : isCheck ? "bg-hot text-bone" : "bg-bone"
      }`}>
        {done ? "✓" : isCheck ? "◆" : num}
      </span>
      <span className="flex-1 min-w-0">
        <div className="font-display text-base truncate">{title}</div>
        <div className="font-mono text-[10px] uppercase opacity-70">
          {locked ? "LOCKED · finish previous lesson" : isCheck ? "SKILL CHECK · 5 questions" : "LESSON"}
        </div>
      </span>
    </>
  );

  if (locked) {
    return <div className={`${base} ${tone}`} title="Locked — complete the previous lesson">{inner}</div>;
  }

  // CCD mode → /lesson/$slug (focused single-exercise screen, future)
  // Classic mode → /mission/$slug (full brutalist mission page, today)
  // For now both go to mission/$slug since the dedicated lesson screen lands in step 4.
  const to = ccd ? "/mission/$slug" : "/mission/$slug";
  return (
    <Link to={to} params={{ slug }} className={`${base} ${tone}`}>{inner}</Link>
  );
}
