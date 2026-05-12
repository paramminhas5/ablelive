import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  BEGINNER_MISSIONS,
  beginnerMissionBySlug,
  isBeginnerComplete,
} from "@/content/beginner-foundations";
import { useProgress } from "@/lib/progress";
import { useState } from "react";

export const Route = createFileRoute("/beginner/$slug")({
  head: ({ params }) => {
    const m = beginnerMissionBySlug(params.slug);
    return {
      meta: [
        { title: `${m?.title ?? "Lesson"} — Beginner · CCD.SCHOOL` },
        { name: "description", content: m?.tagline ?? "" },
      ],
    };
  },
  component: BeginnerMissionPage,
  notFoundComponent: () => <div className="p-12 font-mono">Lesson not found.</div>,
});

type Phase = "learn" | "quiz" | "done";

function BeginnerMissionPage() {
  const { slug } = Route.useParams();
  const mission = beginnerMissionBySlug(slug);
  if (!mission) throw notFound();

  const { progress, completeMission } = useProgress();
  const [phase, setPhase] = useState<Phase>("learn");
  const [showDeeper, setShowDeeper] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [quizIdx, setQuizIdx] = useState(0);
  const [answers, setAnswers] = useState<{ correct: boolean }[]>([]);
  const [showHint, setShowHint] = useState(false);

  const mIdx = BEGINNER_MISSIONS.findIndex((m) => m.slug === slug);
  const next = BEGINNER_MISSIONS[mIdx + 1];
  const prev = BEGINNER_MISSIONS[mIdx - 1];
  const alreadyDone = !!progress.completedMissions[slug];
  const allDone = isBeginnerComplete(progress.completedMissions);

  const q = mission.quiz[quizIdx];
  const isLastQ = quizIdx === mission.quiz.length - 1;

  const handleAnswer = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
  };

  const handleNext = () => {
    if (selected === null) return;
    const correct = selected === q.answer;
    const newAnswers = [...answers, { correct }];
    setAnswers(newAnswers);
    setSelected(null);
    setShowHint(false);

    if (!isLastQ) {
      setQuizIdx((i) => i + 1);
    } else {
      const score = newAnswers.filter((a) => a.correct).length / mission.quiz.length;
      completeMission(slug, mission.xp, score, score >= 0.6 ? mission.badge?.slug : undefined);
      setPhase("done");
    }
  };

  const scoreDisplay = () => {
    const correct = answers.filter((a) => a.correct).length;
    return `${correct}/${mission.quiz.length}`;
  };

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-10 space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 font-mono text-xs uppercase opacity-60">
        <Link to="/beginner" className="hover:opacity-100">
          ← Beginner
        </Link>
        <span>/</span>
        <span>
          {mission.number}. {mission.title}
        </span>
      </nav>

      {/* Mission header */}
      <header className="brutal-border bg-acid p-5">
        <div className="font-mono text-[10px] uppercase opacity-60">
          FOUNDATION {mission.number}/{BEGINNER_MISSIONS.length} · {mission.xp} XP
        </div>
        <h1 className="font-display text-4xl md:text-5xl mt-1 leading-none">
          {mission.emoji} {mission.title}
        </h1>
        <p className="font-mono text-sm mt-2 opacity-70">{mission.tagline}</p>
        {alreadyDone && (
          <div className="mt-3 brutal-border bg-ink text-bone font-mono text-[10px] uppercase px-3 py-1.5 inline-block">
            ✓ Completed
          </div>
        )}
      </header>

      {/* LEARN PHASE */}
      {phase === "learn" && (
        <>
          {/* Simple explanation */}
          <section className="space-y-4">
            <div className="font-mono text-[10px] uppercase opacity-50">// THE SIMPLE VERSION</div>
            {mission.simple.map((para, i) => (
              <p key={i} className="font-sans text-base leading-relaxed">
                {para}
              </p>
            ))}
          </section>

          {/* Analogy */}
          <div className="brutal-border bg-sun p-4">
            <div className="font-mono text-[10px] uppercase opacity-60 mb-2">💡 ANALOGY</div>
            <p className="font-sans text-sm leading-relaxed">{mission.analogy}</p>
          </div>

          {/* Deeper toggle */}
          <div>
            <button
              onClick={() => setShowDeeper((d) => !d)}
              className="brutal-border bg-bone px-4 py-2 font-mono text-xs uppercase brutal-press hover:bg-sun"
            >
              {showDeeper ? "▲ HIDE DEEPER DIVE" : "▼ GO DEEPER (optional)"}
            </button>
            {showDeeper && (
              <div className="brutal-border mt-3 p-4 bg-bone space-y-3">
                <div className="font-mono text-[10px] uppercase opacity-50 mb-3">
                  // THE DEEPER VERSION
                </div>
                {mission.deeper.map((para, i) => (
                  <p key={i} className="font-sans text-sm leading-relaxed opacity-80">
                    {para}
                  </p>
                ))}
              </div>
            )}
          </div>

          {/* Sources */}
          <div className="brutal-border border-ink/20 p-3">
            <div className="font-mono text-[9px] uppercase opacity-40 mb-2">SOURCES</div>
            <div className="flex flex-wrap gap-2">
              {mission.sources.map((s, i) => (
                <a
                  key={i}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="brutal-border bg-bone px-2 py-1 font-mono text-[9px] uppercase opacity-60 hover:opacity-100 hover:bg-sun transition-all"
                >
                  ↗ {s.label}
                </a>
              ))}
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={() => setPhase("quiz")}
            className="brutal-border bg-ink text-bone px-6 py-3 font-display text-xl brutal-press brutal-shadow w-full"
          >
            TAKE THE QUIZ →
          </button>
        </>
      )}

      {/* QUIZ PHASE */}
      {phase === "quiz" && (
        <div className="space-y-4">
          <div className="brutal-border bg-volt text-bone p-4">
            <div className="font-mono text-[10px] uppercase opacity-70 mb-1">
              QUESTION {quizIdx + 1}/{mission.quiz.length}
            </div>
            <p className="font-sans text-lg font-semibold leading-snug">{q.q}</p>
          </div>

          <div className="space-y-2">
            {q.options.map((opt, i) => {
              const revealed = selected !== null;
              const isCorrect = i === q.answer;
              const isWrong = selected === i && !isCorrect;
              return (
                <button
                  key={i}
                  onClick={() => handleAnswer(i)}
                  disabled={revealed}
                  className={`w-full brutal-border px-4 py-3 text-left font-sans text-sm transition-all brutal-press ${
                    revealed
                      ? isCorrect
                        ? "bg-acid text-ink"
                        : isWrong
                          ? "bg-hot text-bone"
                          : "bg-bone opacity-50"
                      : "bg-bone hover:bg-sun"
                  }`}
                >
                  <span className="font-mono text-[9px] uppercase opacity-50 mr-2">
                    {String.fromCharCode(65 + i)}.
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>

          {/* Hint */}
          {selected === null && !showHint && (
            <button
              onClick={() => setShowHint(true)}
              className="font-mono text-[10px] uppercase opacity-40 hover:opacity-80 underline"
            >
              Show hint
            </button>
          )}
          {showHint && selected === null && (
            <div className="brutal-border bg-sun p-3 font-mono text-xs opacity-80">
              💡 {q.hint}
            </div>
          )}

          {/* Explanation after answer */}
          {selected !== null && (
            <>
              <div
                className={`brutal-border p-3 font-mono text-xs ${
                  selected === q.answer ? "bg-acid" : "bg-hot text-bone"
                }`}
              >
                {selected === q.answer ? "✓ CORRECT! " : "✗ NOT QUITE. "}
                {q.explain}
              </div>
              <button
                onClick={handleNext}
                className="w-full brutal-border bg-ink text-bone px-4 py-3 font-display text-lg brutal-press"
              >
                {isLastQ ? "FINISH →" : "NEXT →"}
              </button>
            </>
          )}
        </div>
      )}

      {/* DONE PHASE */}
      {phase === "done" && (
        <div className="space-y-4">
          <div className="brutal-border bg-acid p-6 text-center">
            <div className="font-display text-5xl">🎉</div>
            <div className="font-display text-3xl mt-2">COMPLETE!</div>
            <div className="font-mono text-sm mt-2 opacity-70">
              Score: {scoreDisplay()} · +{mission.xp} XP
            </div>
            {mission.badge && (
              <div className="mt-3 brutal-border bg-ink text-bone font-mono text-xs uppercase px-3 py-1.5 inline-block">
                🏅 Badge earned: {mission.badge.name}
              </div>
            )}
          </div>

          {allDone && (
            <div className="brutal-border bg-ink text-bone p-5">
              <div className="font-display text-2xl">🔓 INTERMEDIATE UNLOCKED!</div>
              <div className="font-mono text-sm mt-2 opacity-80">
                You've completed all Beginner foundations. Time to choose your path.
              </div>
              <Link
                to="/"
                className="brutal-border bg-acid text-ink px-4 py-2 font-display text-lg mt-3 inline-block brutal-press"
              >
                CHOOSE YOUR PATH →
              </Link>
            </div>
          )}

          <div className="flex gap-3">
            {prev && (
              <Link
                to="/beginner/$slug"
                params={{ slug: prev.slug }}
                className="flex-1 brutal-border bg-bone px-4 py-3 font-display text-lg brutal-press text-center"
              >
                ← PREV
              </Link>
            )}
            {next && (
              <Link
                to="/beginner/$slug"
                params={{ slug: next.slug }}
                className="flex-1 brutal-border bg-ink text-bone px-4 py-3 font-display text-lg brutal-press text-center"
              >
                NEXT →
              </Link>
            )}
            {!next && !allDone && (
              <Link
                to="/beginner"
                className="flex-1 brutal-border bg-volt text-bone px-4 py-3 font-display text-lg brutal-press text-center"
              >
                BACK TO LIST
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Prev/Next nav (learn phase) */}
      {phase === "learn" && (
        <div className="flex gap-3 pt-4 border-t brutal-border border-x-0 border-b-0">
          {prev && (
            <Link
              to="/beginner/$slug"
              params={{ slug: prev.slug }}
              className="brutal-border bg-bone px-4 py-2 font-mono text-xs uppercase brutal-press"
            >
              ← {prev.title}
            </Link>
          )}
          {next && (
            <Link
              to="/beginner/$slug"
              params={{ slug: next.slug }}
              className="ml-auto brutal-border bg-bone px-4 py-2 font-mono text-xs uppercase brutal-press"
            >
              {next.title} →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
