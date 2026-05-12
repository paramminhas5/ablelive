import { createFileRoute, Link } from "@tanstack/react-router";
import { DJ_MISSIONS, DJ_CORE_SLUGS } from "@/content/dj-missions";
import { useProgress } from "@/lib/progress";
import { useMode } from "@/lib/mode";

export const Route = createFileRoute("/dj")({
  head: () => ({
    meta: [
      { title: "DJ Path — CCD.SCHOOL" },
      { name: "description", content: "Learn DJing: BPM matching, cue points, mixing, rekordbox." },
    ],
  }),
  component: DJPage,
});

function DJPage() {
  const { progress } = useProgress();
  const { mode } = useMode();
  const completed = progress.completedMissions;
  const isAdvanced = mode === "advanced";
  const visibleMissions = isAdvanced ? DJ_MISSIONS : DJ_MISSIONS.filter((m) => m.tier === "core");
  const done = visibleMissions.filter((m) => !!completed[m.slug]).length;
  const pct = Math.round((done / visibleMissions.length) * 100);

  return (
    <main className="min-h-screen bg-bone">
      <section className="brutal-border border-x-0 border-t-0 bg-volt text-bone">
        <div className="max-w-3xl mx-auto p-6 md:p-10">
          <div className="font-mono text-[9px] uppercase opacity-60 mb-2">
            // DJ PATH · {visibleMissions.length} MISSIONS · REKORDBOX (PIONEER DJ)
          </div>
          <h1 className="font-display text-5xl md:text-7xl leading-none">🎧 DJ<br />PATH</h1>
          <p className="font-mono mt-3 text-sm max-w-xl leading-relaxed opacity-80">
            Beatmatching, cue points, the mixer, transitions, library management, reading the crowd.
            Built from the rekordbox 6.0.0 manual. No hardware required to start.
          </p>
          <div className="mt-4 max-w-xs">
            <div className="flex justify-between font-mono text-xs uppercase mb-1.5 opacity-80">
              <span>{done}/{visibleMissions.length} complete</span>
              <span>{pct}%</span>
            </div>
            <div className="h-2.5 brutal-border bg-bone/20 overflow-hidden">
              <div className="h-full bg-acid transition-all" style={{ width: `${pct}%` }} />
            </div>
          </div>
          <div className="mt-3 brutal-border bg-bone/10 px-3 py-2 inline-block font-mono text-[9px] uppercase opacity-70">
            📖 Sourced from rekordbox 6.0.0 Instruction Manual (Pioneer DJ)
          </div>
        </div>
      </section>

      <section className="max-w-3xl mx-auto p-4 md:p-10 space-y-2">
        <div className="font-mono text-[9px] uppercase opacity-40 mb-3">
          // {isAdvanced ? "ALL MISSIONS (CORE + ADVANCED)" : "CORE MISSIONS"}
          {!isAdvanced && ` · Switch to Advanced mode to unlock ${DJ_MISSIONS.filter(m => m.tier === "advanced").length} more`}
        </div>
        {visibleMissions.map((m, idx) => {
          const isDone = !!completed[m.slug];
          const prevDone = idx === 0 || !!completed[visibleMissions[idx - 1].slug];
          const isNext = !isDone && prevDone;
          return (
            <Link
              key={m.slug}
              to="/dj/$slug"
              params={{ slug: m.slug }}
              className={`brutal-border p-4 block brutal-press relative ${
                isDone ? "bg-acid" : isNext ? "bg-ink text-bone" : "bg-bone hover:bg-sun"
              }`}
            >
              {m.tier === "advanced" && (
                <span className="absolute top-3 right-3 brutal-border bg-hot text-bone font-mono text-[9px] uppercase px-2 py-0.5">ADV</span>
              )}
              {isNext && m.tier !== "advanced" && (
                <span className="absolute top-3 right-3 brutal-border bg-acid text-ink font-mono text-[9px] uppercase px-2 py-0.5">NEXT</span>
              )}
              {isDone && (
                <span className="absolute top-3 right-3 brutal-border bg-ink text-bone font-mono text-[9px] uppercase px-2 py-0.5">✓</span>
              )}
              <div className="flex gap-3 items-start pr-16">
                <div className={`brutal-border w-10 h-10 flex items-center justify-center font-display text-base shrink-0 ${isDone ? "bg-ink text-bone" : isNext ? "bg-acid text-ink" : "bg-bone"}`}>
                  {isDone ? "✓" : m.emoji}
                </div>
                <div>
                  <div className="font-display text-lg leading-tight">{m.title}</div>
                  <div className="font-mono text-[10px] mt-0.5 opacity-60">{m.tagline}</div>
                  <div className="font-mono text-[9px] uppercase mt-1.5 opacity-40">
                    {m.xp} XP · {m.quiz.length} questions{m.badge ? ` · 🏅 ${m.badge.name}` : ""}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </section>
    </main>
  );
}
