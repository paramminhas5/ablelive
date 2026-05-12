import { createFileRoute } from "@tanstack/react-router";
import { DJ_MISSIONS, DJ_CORE_SLUGS, type DJMission } from "@/content/dj-missions";
import { useProgress } from "@/lib/progress";
import { useMode } from "@/lib/mode";
import { useState } from "react";

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
  const [active, setActive] = useState<DJMission | null>(null);

  if (active) {
    return (
      <DJMissionDetail
        mission={active}
        visibleMissions={visibleMissions}
        isAdvanced={isAdvanced}
        alreadyDone={!!completed[active.slug]}
        onBack={() => setActive(null)}
      />
    );
  }

  return (
    <main className="min-h-screen bg-bone">
      <section className="brutal-border border-x-0 border-t-0 bg-volt text-bone">
        <div className="max-w-3xl mx-auto p-6 md:p-10">
          <div className="font-mono text-[9px] uppercase opacity-60 mb-2">
            // DJ PATH · {visibleMissions.length} MISSIONS · REKORDBOX (PIONEER DJ)
          </div>
          <h1 className="font-display text-5xl md:text-7xl leading-none">🎧 DJ<br />PATH</h1>
          <p className="font-mono mt-3 text-sm max-w-xl leading-relaxed opacity-80">
            Beatmatching, cue points, the mixer, transitions, library management. Built from the rekordbox 6.0.0 manual.
          </p>
          <div className="mt-4 max-w-xs">
            <div className="flex justify-between font-mono text-xs uppercase mb-1.5 opacity-80">
              <span>{done}/{visibleMissions.length} complete</span><span>{pct}%</span>
            </div>
            <div className="h-2.5 brutal-border bg-bone/20 overflow-hidden">
              <div className="h-full bg-acid transition-all" style={{ width: `${pct}%` }} />
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-3xl mx-auto p-4 md:p-10 space-y-2">
        <div className="font-mono text-[9px] uppercase opacity-40 mb-3">// CLICK A MISSION TO BEGIN</div>
        {visibleMissions.map((m, idx) => {
          const isDone = !!completed[m.slug];
          const prevDone = idx === 0 || !!completed[visibleMissions[idx - 1].slug];
          const isNext = !isDone && prevDone;
          return (
            <button
              key={m.slug}
              onClick={() => setActive(m)}
              className={`brutal-border p-4 text-left block w-full brutal-press relative ${
                isDone ? "bg-acid" : isNext ? "bg-ink text-bone" : "bg-bone hover:bg-sun"
              }`}
            >
              {m.tier === "advanced" && <span className="absolute top-3 right-3 brutal-border bg-hot text-bone font-mono text-[9px] uppercase px-2 py-0.5">ADV</span>}
              {isNext && m.tier !== "advanced" && <span className="absolute top-3 right-3 brutal-border bg-acid text-ink font-mono text-[9px] uppercase px-2 py-0.5">NEXT</span>}
              {isDone && <span className="absolute top-3 right-3 brutal-border bg-ink text-bone font-mono text-[9px] uppercase px-2 py-0.5">✓</span>}
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
            </button>
          );
        })}
      </section>
    </main>
  );
}

// ── Inline DJ mission detail ──────────────────────────────────────────────────
type Phase = "learn" | "quiz" | "done";

function DJMissionDetail({ mission, visibleMissions, isAdvanced, alreadyDone, onBack }: {
  mission: DJMission;
  visibleMissions: DJMission[];
  isAdvanced: boolean;
  alreadyDone: boolean;
  onBack: () => void;
}) {
  const { completeMission } = useProgress();
  const [phase, setPhase] = useState<Phase>("learn");
  const [showPractical, setShowPractical] = useState(false);
  const [showAdv, setShowAdv] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [quizIdx, setQuizIdx] = useState(0);
  const [answers, setAnswers] = useState<{ correct: boolean }[]>([]);
  const [showHint, setShowHint] = useState(false);

  const mIdx = visibleMissions.findIndex((m) => m.slug === mission.slug);
  const next = visibleMissions[mIdx + 1];
  const prev = visibleMissions[mIdx - 1];
  const q = mission.quiz[quizIdx];
  const isLastQ = quizIdx === mission.quiz.length - 1;

  const handleAnswer = (idx: number) => { if (selected !== null) return; setSelected(idx); };
  const handleNext = () => {
    if (selected === null) return;
    const correct = selected === q.answer;
    const na = [...answers, { correct }];
    setAnswers(na);
    setSelected(null);
    setShowHint(false);
    if (!isLastQ) { setQuizIdx((i) => i + 1); }
    else {
      const score = na.filter((a) => a.correct).length / mission.quiz.length;
      completeMission(mission.slug, mission.xp, score, score >= 0.6 ? mission.badge?.slug : undefined);
      setPhase("done");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-10 space-y-5">
      <button onClick={onBack} className="font-mono text-xs uppercase opacity-50 hover:opacity-100 brutal-border px-3 py-1.5 bg-bone brutal-press">
        ← Back to DJ Path
      </button>

      <header className="brutal-border bg-volt text-bone p-5">
        <div className="font-mono text-[9px] uppercase opacity-60">DJ PATH · {mission.tier.toUpperCase()} · {mission.xp} XP</div>
        <h1 className="font-display text-4xl mt-1">{mission.emoji} {mission.title}</h1>
        <p className="font-mono text-sm mt-1 opacity-70">{mission.tagline}</p>
        {alreadyDone && <div className="mt-2 brutal-border bg-acid text-ink font-mono text-[9px] uppercase px-2 py-1 inline-block">✓ Completed</div>}
      </header>

      {phase === "learn" && (
        <>
          <div className="font-mono text-[9px] uppercase opacity-40">// THE CONCEPT</div>
          {mission.explainer.map((p, i) => <p key={i} className="text-base leading-relaxed">{p}</p>)}

          {mission.practical && mission.practical.length > 0 && (
            <>
              <button onClick={() => setShowPractical((s) => !s)} className="brutal-border bg-acid text-ink px-4 py-2 font-mono text-xs uppercase brutal-press hover:bg-sun">
                {showPractical ? "▲ HIDE IN REKORDBOX" : "▼ IN REKORDBOX (PRACTICAL)"}
              </button>
              {showPractical && (
                <div className="brutal-border p-4 bg-sun space-y-3">
                  <div className="font-mono text-[9px] uppercase opacity-60 mb-1">🎛️ IN REKORDBOX</div>
                  {mission.practical.map((step, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="brutal-border bg-ink text-bone w-6 h-6 flex items-center justify-center font-mono text-[10px] shrink-0">{i + 1}</div>
                      <p className="font-mono text-xs leading-relaxed opacity-80">{step}</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {isAdvanced && mission.advanced && mission.advanced.length > 0 && (
            <>
              <button onClick={() => setShowAdv((s) => !s)} className="brutal-border bg-hot text-bone px-4 py-2 font-mono text-xs uppercase brutal-press">
                {showAdv ? "▲ HIDE ADVANCED" : "▼ ADVANCED DEEP-DIVE"}
              </button>
              {showAdv && (
                <div className="brutal-border p-4 bg-bone space-y-2">
                  <div className="font-mono text-[9px] uppercase opacity-40 mb-1">🔥 ADVANCED</div>
                  {mission.advanced.map((p, i) => <p key={i} className="text-sm leading-relaxed opacity-80">{p}</p>)}
                </div>
              )}
            </>
          )}

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

          <button onClick={() => setPhase("quiz")} className="brutal-border bg-ink text-bone px-6 py-3 font-display text-xl brutal-press w-full">
            TAKE THE QUIZ →
          </button>
        </>
      )}

      {phase === "quiz" && (
        <div className="space-y-4">
          <div className="brutal-border bg-volt text-bone p-4">
            <div className="font-mono text-[9px] uppercase opacity-60 mb-1">QUESTION {quizIdx + 1}/{mission.quiz.length}</div>
            <p className="text-lg font-semibold">{q.q}</p>
          </div>
          <div className="space-y-2">
            {q.options.map((opt, i) => {
              const revealed = selected !== null;
              const isCorrect = i === q.answer;
              const isWrong = selected === i && !isCorrect;
              return (
                <button key={i} onClick={() => handleAnswer(i)} disabled={revealed}
                  className={`w-full brutal-border px-4 py-3 text-left text-sm brutal-press ${revealed ? isCorrect ? "bg-acid" : isWrong ? "bg-hot text-bone" : "bg-bone opacity-40" : "bg-bone hover:bg-sun"}`}>
                  <span className="font-mono text-[9px] uppercase opacity-40 mr-2">{String.fromCharCode(65 + i)}.</span>{opt}
                </button>
              );
            })}
          </div>
          {selected === null && !showHint && <button onClick={() => setShowHint(true)} className="font-mono text-[10px] uppercase opacity-40 hover:opacity-80 underline">Show hint</button>}
          {showHint && selected === null && <div className="brutal-border bg-sun p-3 font-mono text-xs">💡 {q.hint}</div>}
          {selected !== null && (
            <>
              <div className={`brutal-border p-3 font-mono text-xs ${selected === q.answer ? "bg-acid" : "bg-hot text-bone"}`}>
                {selected === q.answer ? "✓ CORRECT! " : "✗ NOT QUITE. "}{q.explain}
              </div>
              <button onClick={handleNext} className="w-full brutal-border bg-ink text-bone px-4 py-3 font-display text-lg brutal-press">
                {isLastQ ? "FINISH →" : "NEXT →"}
              </button>
            </>
          )}
        </div>
      )}

      {phase === "done" && (
        <div className="space-y-4">
          <div className="brutal-border bg-acid p-6 text-center">
            <div className="font-display text-5xl">✓</div>
            <div className="font-display text-3xl mt-2">MISSION DONE</div>
            <div className="font-mono text-sm mt-1 opacity-70">
              {answers.filter((a) => a.correct).length}/{mission.quiz.length} correct · +{mission.xp} XP
            </div>
            {mission.badge && <div className="mt-3 brutal-border bg-ink text-bone font-mono text-xs uppercase px-3 py-1 inline-block">🏅 {mission.badge.name}</div>}
          </div>
          <div className="flex gap-3">
            {prev && (
              <button onClick={() => { setPhase("learn"); setQuizIdx(0); setAnswers([]); setSelected(null); }}
                className="flex-1 brutal-border bg-bone px-4 py-3 font-display text-lg brutal-press text-center">← PREV</button>
            )}
            <button onClick={onBack}
              className="flex-1 brutal-border bg-ink text-bone px-4 py-3 font-display text-lg brutal-press text-center">
              {next ? "NEXT MISSION →" : "ALL DONE ✓"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
