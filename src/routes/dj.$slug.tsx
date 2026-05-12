import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { DJ_MISSIONS, djMissionBySlug } from "@/content/dj-missions";
import { useProgress } from "@/lib/progress";
import { useMode } from "@/lib/mode";
import { useState } from "react";

export const Route = createFileRoute("/dj/$slug")({
  head: ({ params }) => {
    const m = djMissionBySlug(params.slug);
    return {
      meta: [
        { title: `${m?.title ?? "DJ Lesson"} — DJ Path · CCD.SCHOOL` },
        { name: "description", content: m?.tagline ?? "" },
      ],
    };
  },
  component: DJMissionPage,
  notFoundComponent: () => <div className="p-12 font-mono">Lesson not found.</div>,
});

type Phase = "learn" | "quiz" | "done";

function DJMissionPage() {
  const { slug } = Route.useParams();
  const mission = djMissionBySlug(slug);
  if (!mission) throw notFound();

  const { mode } = useMode();
  const isAdvanced = mode === "advanced";
  const { progress, completeMission } = useProgress();
  const [phase, setPhase] = useState<Phase>("learn");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showPractical, setShowPractical] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [quizIdx, setQuizIdx] = useState(0);
  const [answers, setAnswers] = useState<{ correct: boolean }[]>([]);
  const [showHint, setShowHint] = useState(false);

  const alreadyDone = !!progress.completedMissions[slug];

  // Find visible missions for prev/next
  const visibleMissions = isAdvanced ? DJ_MISSIONS : DJ_MISSIONS.filter((m) => m.tier === "core");
  const mIdx = visibleMissions.findIndex((m) => m.slug === slug);
  const next = visibleMissions[mIdx + 1];
  const prev = visibleMissions[mIdx - 1];

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

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-10 space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 font-mono text-xs uppercase opacity-60">
        <Link to="/dj" className="hover:opacity-100">
          ← DJ Path
        </Link>
        <span>/</span>
        <span>{mission.title}</span>
      </nav>

      {/* Header */}
      <header className="brutal-border bg-volt text-bone p-5">
        <div className="font-mono text-[10px] uppercase opacity-60">
          DJ PATH · {mission.tier.toUpperCase()} · {mission.xp} XP
        </div>
        <h1 className="font-display text-4xl md:text-5xl mt-1 leading-none">
          {mission.emoji} {mission.title}
        </h1>
        <p className="font-mono text-sm mt-2 opacity-70">{mission.tagline}</p>
        {alreadyDone && (
          <div className="mt-3 brutal-border bg-acid text-ink font-mono text-[10px] uppercase px-3 py-1.5 inline-block">
            ✓ Completed
          </div>
        )}
      </header>

      {/* LEARN PHASE */}
      {phase === "learn" && (
        <>
          {/* Main explainer */}
          <section className="space-y-4">
            <div className="font-mono text-[10px] uppercase opacity-50">// THE CONCEPT</div>
            {mission.explainer.map((para, i) => (
              <p key={i} className="font-sans text-base leading-relaxed">
                {para}
              </p>
            ))}
          </section>

          {/* Practical steps (from rekordbox manual) */}
          {mission.practical && mission.practical.length > 0 && (
            <div>
              <button
                onClick={() => setShowPractical((s) => !s)}
                className="brutal-border bg-acid text-ink px-4 py-2 font-mono text-xs uppercase brutal-press hover:bg-sun"
              >
                {showPractical ? "▲ HIDE IN REKORDBOX" : "▼ IN REKORDBOX (PRACTICAL)"}
              </button>
              {showPractical && (
                <div className="brutal-border mt-3 p-4 bg-sun space-y-3">
                  <div className="font-mono text-[10px] uppercase opacity-60 mb-2">
                    🎛️ HOW TO DO IT IN REKORDBOX
                  </div>
                  {mission.practical.map((step, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="brutal-border bg-ink text-bone w-6 h-6 flex items-center justify-center font-mono text-[10px] shrink-0 mt-0.5">
                        {i + 1}
                      </div>
                      <p className="font-mono text-xs leading-relaxed opacity-80">{step}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Advanced content */}
          {mission.advanced && mission.advanced.length > 0 && (
            <div>
              <button
                onClick={() => setShowAdvanced((s) => !s)}
                className="brutal-border bg-hot text-bone px-4 py-2 font-mono text-xs uppercase brutal-press"
              >
                {showAdvanced ? "▲ HIDE ADVANCED" : "▼ GO ADVANCED"}
              </button>
              {showAdvanced && (
                <div className="brutal-border mt-3 p-4 bg-bone space-y-3">
                  <div className="font-mono text-[10px] uppercase opacity-50 mb-2">
                    🔥 ADVANCED DEEP-DIVE
                  </div>
                  {mission.advanced.map((para, i) => (
                    <p key={i} className="font-sans text-sm leading-relaxed opacity-80">
                      {para}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Sources */}
          <div className="brutal-border border-ink/20 p-3">
            <div className="font-mono text-[9px] uppercase opacity-40 mb-2">SOURCES</div>
            <div className="flex flex-wrap gap-2">
              {mission.sources.map((s, i) => (
                <div key={i} className="brutal-border bg-bone px-2 py-1 font-mono text-[9px] uppercase opacity-60">
                  📖 {s.label}{s.section ? ` (${s.section})` : ""}
                </div>
              ))}
            </div>
          </div>

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
            <div className="font-display text-5xl">✓</div>
            <div className="font-display text-3xl mt-2">MISSION COMPLETE</div>
            <div className="font-mono text-sm mt-2 opacity-70">
              {answers.filter((a) => a.correct).length}/{mission.quiz.length} correct · +{mission.xp} XP
            </div>
            {mission.badge && (
              <div className="mt-3 brutal-border bg-ink text-bone font-mono text-xs uppercase px-3 py-1.5 inline-block">
                🏅 {mission.badge.name}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            {prev && (
              <Link
                to="/dj/$slug"
                params={{ slug: prev.slug }}
                className="flex-1 brutal-border bg-bone px-4 py-3 font-display text-lg brutal-press text-center"
              >
                ← PREV
              </Link>
            )}
            {next ? (
              <Link
                to="/dj/$slug"
                params={{ slug: next.slug }}
                className="flex-1 brutal-border bg-ink text-bone px-4 py-3 font-display text-lg brutal-press text-center"
              >
                NEXT →
              </Link>
            ) : (
              <Link
                to="/dj"
                className="flex-1 brutal-border bg-volt text-bone px-4 py-3 font-display text-lg brutal-press text-center"
              >
                BACK TO DJ PATH
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Prev/Next (learn phase) */}
      {phase === "learn" && (prev || next) && (
        <div className="flex gap-3 pt-4 brutal-border border-x-0 border-b-0">
          {prev && (
            <Link
              to="/dj/$slug"
              params={{ slug: prev.slug }}
              className="brutal-border bg-bone px-4 py-2 font-mono text-xs uppercase brutal-press"
            >
              ← {prev.title}
            </Link>
          )}
          {next && (
            <Link
              to="/dj/$slug"
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
