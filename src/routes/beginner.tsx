import { createFileRoute, Link } from "@tanstack/react-router";
import { BEGINNER_MISSIONS, BEGINNER_SLUGS } from "@/content/beginner-foundations";
import { useProgress } from "@/lib/progress";

export const Route = createFileRoute("/beginner")({
  head: () => ({
    meta: [
      { title: "Beginner Foundations — CCD.SCHOOL" },
      { name: "description", content: "Learn music from scratch — sound, rhythm, melody, DAWs." },
    ],
  }),
  component: BeginnerPage,
});

function BeginnerPage() {
  const { progress } = useProgress();
  const completed = progress.completedMissions;
  const done = BEGINNER_SLUGS.filter((s) => !!completed[s]).length;
  const pct = Math.round((done / BEGINNER_MISSIONS.length) * 100);

  return (
    <main className="min-h-screen bg-bone">
      <section className="brutal-border border-x-0 border-t-0 bg-acid">
        <div className="max-w-3xl mx-auto p-6 md:p-10">
          <div className="font-mono text-[10px] uppercase opacity-60 mb-2">
            // BEGINNER · {BEGINNER_MISSIONS.length} FOUNDATIONS · NO PRIOR KNOWLEDGE NEEDED
          </div>
          <h1 className="font-display text-5xl md:text-7xl leading-none">
            🌱 MUSIC<br />FOUNDATIONS
          </h1>
          <p className="font-mono mt-3 text-sm max-w-xl leading-relaxed opacity-80">
            Sound, rhythm, melody, harmony, DAWs, MIDI, samples, mixing and genres — explained
            simply with cited sources.
          </p>
          <div className="mt-4 max-w-xs">
            <div className="flex justify-between font-mono text-xs uppercase mb-1.5">
              <span>{done}/{BEGINNER_MISSIONS.length} complete</span>
              <span>{pct}%</span>
            </div>
            <div className="h-2.5 brutal-border bg-ink/10 overflow-hidden">
              <div className="h-full bg-ink transition-all" style={{ width: `${pct}%` }} />
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-3xl mx-auto p-4 md:p-10">
        <div className="font-mono text-[10px] uppercase opacity-50 mb-4">
          // THE 10 FOUNDATIONS — COMPLETE IN ORDER
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          {BEGINNER_MISSIONS.map((m, idx) => {
            const isDone = !!completed[m.slug];
            const prevDone = idx === 0 || !!completed[BEGINNER_MISSIONS[idx - 1].slug];
            const isNext = !isDone && prevDone;
            return (
              <Link
                key={m.slug}
                to="/beginner/$slug"
                params={{ slug: m.slug }}
                className={`brutal-border p-4 block brutal-press relative ${
                  isDone ? "bg-acid" : isNext ? "bg-ink text-bone" : "bg-bone hover:bg-sun"
                }`}
              >
                {isNext && (
                  <span className="absolute top-3 right-3 brutal-border bg-acid text-ink font-mono text-[9px] uppercase px-2 py-0.5">
                    NEXT
                  </span>
                )}
                {isDone && (
                  <span className="absolute top-3 right-3 brutal-border bg-ink text-bone font-mono text-[9px] uppercase px-2 py-0.5">
                    ✓
                  </span>
                )}
                <div className="flex gap-3 items-start pr-16">
                  <div className={`brutal-border w-10 h-10 flex items-center justify-center font-display text-base shrink-0 ${isDone ? "bg-ink text-bone" : isNext ? "bg-acid text-ink" : "bg-bone"}`}>
                    {isDone ? "✓" : m.number}
                  </div>
                  <div>
                    <div className="font-display text-lg leading-tight">{m.emoji} {m.title}</div>
                    <div className="font-mono text-[10px] mt-0.5 opacity-60">{m.tagline}</div>
                    <div className="font-mono text-[9px] uppercase mt-1.5 opacity-40">
                      {m.xp} XP · {m.quiz.length} quiz Qs{m.badge ? ` · 🏅 ${m.badge.name}` : ""}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
