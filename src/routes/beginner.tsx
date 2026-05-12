import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { BEGINNER_MISSIONS, isBeginnerComplete } from "@/content/beginner-foundations";
import { useProgress } from "@/lib/progress";
import { useState } from "react";

export const Route = createFileRoute("/beginner")({
  head: () => ({
    meta: [
      { title: "Beginner Foundations — CCD.SCHOOL" },
      {
        name: "description",
        content:
          "Learn music from absolute zero — sound, rhythm, melody, DAWs — explained like you're 5.",
      },
    ],
  }),
  component: BeginnerPage,
});

function BeginnerPage() {
  const { progress } = useProgress();
  const navigate = useNavigate();
  const completed = progress.completedMissions;
  const done = BEGINNER_MISSIONS.filter((m) => !!completed[m.slug]).length;
  const pct = Math.round((done / BEGINNER_MISSIONS.length) * 100);
  const allDone = isBeginnerComplete(completed);

  return (
    <main className="min-h-screen bg-bone">
      {/* Header */}
      <section className="brutal-border border-x-0 border-t-0 bg-acid">
        <div className="max-w-5xl mx-auto p-6 md:p-10">
          <div className="font-mono text-[10px] uppercase opacity-60 mb-2">
            // BEGINNER MODE · MUSIC FROM SCRATCH
          </div>
          <h1 className="font-display text-5xl md:text-7xl leading-none">
            MUSIC
            <br />
            FOUNDATIONS
          </h1>
          <p className="font-mono mt-3 text-sm md:text-base max-w-xl leading-relaxed opacity-80">
            No music knowledge needed. Everything explained like you're 5. Complete all{" "}
            {BEGINNER_MISSIONS.length} missions to unlock Intermediate mode.
          </p>

          {/* Progress */}
          <div className="mt-5 max-w-sm">
            <div className="flex items-center justify-between font-mono text-xs uppercase mb-2">
              <span>{done}/{BEGINNER_MISSIONS.length} complete</span>
              <span>{pct}%</span>
            </div>
            <div className="h-3 brutal-border bg-ink/10 overflow-hidden">
              <div
                className="h-full bg-ink transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          {/* Unlock callout */}
          {allDone ? (
            <div className="mt-5 brutal-border bg-ink text-bone p-4 max-w-sm">
              <div className="font-display text-xl">✓ FOUNDATIONS COMPLETE!</div>
              <div className="font-mono text-xs mt-1 opacity-80">
                Intermediate mode unlocked. Choose your path.
              </div>
              <Link
                to="/"
                className="brutal-border bg-acid text-ink px-4 py-2 font-display text-base mt-3 inline-block brutal-press"
              >
                CHOOSE PATH →
              </Link>
            </div>
          ) : (
            <div className="mt-5 brutal-border bg-ink/10 p-4 max-w-sm">
              <div className="font-mono text-xs opacity-70">
                🔒 Intermediate unlocks after all {BEGINNER_MISSIONS.length} missions —{" "}
                {BEGINNER_MISSIONS.length - done} left
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Mission grid */}
      <section className="max-w-5xl mx-auto p-4 md:p-10">
        <div className="font-mono text-[10px] uppercase opacity-60 mb-4">// THE 10 FOUNDATIONS</div>
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
                className={`brutal-border p-4 block brutal-press transition-all relative ${
                  isDone
                    ? "bg-acid text-ink"
                    : isNext
                      ? "bg-ink text-bone"
                      : "bg-bone hover:bg-sun"
                }`}
              >
                {isNext && (
                  <span className="absolute top-3 right-3 brutal-border bg-acid text-ink font-mono text-[9px] uppercase px-2 py-1">
                    NEXT
                  </span>
                )}
                {isDone && (
                  <span className="absolute top-3 right-3 brutal-border bg-ink text-bone font-mono text-[9px] uppercase px-2 py-1">
                    ✓ DONE
                  </span>
                )}

                <div className="flex items-start gap-3">
                  <div
                    className={`brutal-border w-10 h-10 flex items-center justify-center font-display text-lg shrink-0 ${
                      isDone ? "bg-ink text-bone" : isNext ? "bg-acid text-ink" : "bg-bone"
                    }`}
                  >
                    {isDone ? "✓" : m.number}
                  </div>
                  <div>
                    <div className="font-display text-xl leading-tight">
                      {m.emoji} {m.title}
                    </div>
                    <div className="font-mono text-xs mt-1 opacity-70">{m.tagline}</div>
                    <div className="font-mono text-[9px] uppercase mt-2 opacity-50">
                      {m.xp} XP · {m.quiz.length} questions
                      {m.badge ? ` · 🏅 ${m.badge.name}` : ""}
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
