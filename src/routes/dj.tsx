import { createFileRoute, Link } from "@tanstack/react-router";
import { DJ_MISSIONS, DJ_CORE_SLUGS } from "@/content/dj-missions";
import { useProgress } from "@/lib/progress";
import { useMode } from "@/lib/mode";

export const Route = createFileRoute("/dj")({
  head: () => ({
    meta: [
      { title: "DJ Path — CCD.SCHOOL" },
      {
        name: "description",
        content: "Learn DJing with rekordbox: BPM matching, cue points, mixing, library management.",
      },
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
      {/* Header */}
      <section className="brutal-border border-x-0 border-t-0 bg-volt text-bone">
        <div className="max-w-5xl mx-auto p-6 md:p-10">
          <div className="font-mono text-[10px] uppercase opacity-60 mb-2">
            // DJ PATH · {isAdvanced ? "ADVANCED" : "INTERMEDIATE"} · REKORDBOX
          </div>
          <h1 className="font-display text-5xl md:text-7xl leading-none">
            🎧 DJ
            <br />
            PATH
          </h1>
          <p className="font-mono mt-3 text-sm md:text-base max-w-xl leading-relaxed opacity-80">
            Learn DJing from the ground up. Beatmatching, cue points, transitions, library management
            — built from the rekordbox manual. No hardware required to learn the concepts.
          </p>

          <div className="mt-5 max-w-sm">
            <div className="flex items-center justify-between font-mono text-xs uppercase mb-2 opacity-80">
              <span>
                {done}/{visibleMissions.length} missions
              </span>
              <span>{pct}%</span>
            </div>
            <div className="h-2.5 brutal-border bg-bone/20 overflow-hidden">
              <div
                className="h-full bg-acid transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          {!isAdvanced && (
            <div className="mt-4 brutal-border bg-bone/20 p-3 inline-block">
              <div className="font-mono text-[10px] uppercase opacity-80">
                🔒 {DJ_MISSIONS.filter((m) => m.tier === "advanced").length} Advanced missions unlock
                in Advanced mode
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Source callout */}
      <div className="max-w-5xl mx-auto px-4 md:px-10 pt-6">
        <div className="brutal-border bg-sun p-3 font-mono text-xs opacity-80">
          📖 Content sourced from the <strong>rekordbox 6.0.0 Instruction Manual</strong> (Pioneer
          DJ) and verified DJ education resources. Page references included in each lesson.
        </div>
      </div>

      {/* Missions */}
      <section className="max-w-5xl mx-auto p-4 md:p-10 space-y-3">
        <div className="font-mono text-[10px] uppercase opacity-60 mb-4">
          // {isAdvanced ? "ALL" : "CORE"} MISSIONS
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
              className={`brutal-border p-4 block brutal-press transition-all relative ${
                isDone
                  ? "bg-acid text-ink"
                  : isNext
                    ? "bg-ink text-bone"
                    : "bg-bone hover:bg-sun"
              }`}
            >
              {m.tier === "advanced" && (
                <span className="absolute top-3 right-3 brutal-border bg-hot text-bone font-mono text-[9px] uppercase px-2 py-1">
                  ADVANCED
                </span>
              )}
              {isNext && m.tier === "core" && (
                <span className="absolute top-3 right-3 brutal-border bg-acid text-ink font-mono text-[9px] uppercase px-2 py-1">
                  NEXT
                </span>
              )}
              {isDone && (
                <span className="absolute top-3 right-3 brutal-border bg-ink text-bone font-mono text-[9px] uppercase px-2 py-1">
                  ✓
                </span>
              )}

              <div className="flex items-start gap-3">
                <div
                  className={`brutal-border w-10 h-10 flex items-center justify-center font-display text-lg shrink-0 ${
                    isDone ? "bg-ink text-bone" : isNext ? "bg-acid text-ink" : "bg-bone"
                  }`}
                >
                  {isDone ? "✓" : m.emoji}
                </div>
                <div className="flex-1 min-w-0 pr-16">
                  <div className="font-display text-xl leading-tight">{m.title}</div>
                  <div className="font-mono text-xs mt-1 opacity-70">{m.tagline}</div>
                  <div className="font-mono text-[9px] uppercase mt-2 opacity-50">
                    {m.xp} XP · {m.quiz.length} questions
                    {m.badge ? ` · 🏅 ${m.badge.name}` : ""}
                    {m.sources.length > 0 ? ` · ${m.sources.length} sources` : ""}
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
