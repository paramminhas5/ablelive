import { useEffect, useRef, useState } from "react";
import { playCorrect, playWrong } from "@/lib/audio";
import type { QuizQ } from "@/content/types";

interface Props {
  qs: QuizQ[];
  onComplete: (score: number) => void;
  onWrongAnswer?: () => void;
}

type Phase = "picking" | "feedback" | "done";

export function Quiz({ qs, onComplete, onWrongAnswer }: Props) {
  const [qIdx, setQIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [hintShown, setHint] = useState(false);
  const [phase, setPhase] = useState<Phase>("picking");
  const [animKey, setAnimKey] = useState(0); // bumped on each question → re-triggers CSS animation

  // Ref holds accumulated results — never stale inside closures
  const resultsRef = useRef<boolean[]>([]);
  const autoRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Full reset when question set changes (new mission load)
  useEffect(() => {
    resultsRef.current = [];
    setQIdx(0);
    setPicked(null);
    setHint(false);
    setPhase("picking");
    setAnimKey((k) => k + 1);
    if (autoRef.current) clearTimeout(autoRef.current);
  }, [qs]);

  useEffect(
    () => () => {
      if (autoRef.current) clearTimeout(autoRef.current);
    },
    [],
  );

  const q = qs[qIdx];
  const isLast = qIdx === qs.length - 1;
  const correct = phase === "feedback" ? picked === q?.answer : null;

  if (!q) return null;

  const pick = (optIdx: number) => {
    if (phase !== "picking") return;
    setPicked(optIdx);

    const isPass = optIdx === q.answer;
    const newResults = [...resultsRef.current, isPass];
    resultsRef.current = newResults;

    setPhase("feedback");
    if (isPass) playCorrect();
    else {
      playWrong();
      onWrongAnswer?.();
    }

    // Auto-advance: 1600ms with explanation visible, or 800ms if no explanation
    const delay = q.explain ? 1600 : 900;
    autoRef.current = setTimeout(() => advance(newResults), delay);
  };

  const advance = (results: boolean[]) => {
    if (autoRef.current) {
      clearTimeout(autoRef.current);
      autoRef.current = null;
    }

    if (isLast) {
      const score = results.filter(Boolean).length / qs.length;
      setPhase("done");
      onComplete(score);
    } else {
      // Animate question out then in
      setPhase("picking");
      setQIdx((i) => i + 1);
      setPicked(null);
      setHint(false);
      setAnimKey((k) => k + 1);
    }
  };

  // ── Done screen ──────────────────────────────────────────────────────────
  if (phase === "done") {
    const results = resultsRef.current;
    const passed = results.filter(Boolean).length;
    const pct = Math.round((passed / qs.length) * 100);
    const grade =
      pct === 100
        ? { label: "PERFECT 🎉", color: "bg-acid text-ink" }
        : pct >= 70
          ? { label: "SOLID ✓", color: "bg-volt text-bone" }
          : { label: "RETRY", color: "bg-hot  text-bone" };

    return (
      <div className="space-y-3 animate-slide-up">
        <div className={`${grade.color} brutal-border p-5`}>
          <div className="font-mono text-[10px] uppercase opacity-70">Quiz complete</div>
          <div className="font-display text-5xl mt-1">{grade.label}</div>
          <div className="font-mono text-sm mt-1">
            {passed} / {qs.length} correct · {pct}%
          </div>
        </div>

        <div className="space-y-1 stagger">
          {qs.map((question, i) => (
            <div
              key={i}
              className={`brutal-border p-3 flex items-start gap-3 ${
                results[i] ? "bg-acid/20" : "bg-hot/10"
              }`}
            >
              <span className="font-display text-lg shrink-0 mt-0.5">{results[i] ? "✓" : "✗"}</span>
              <div className="min-w-0">
                <div className="font-mono text-xs leading-relaxed">{question.q}</div>
                <div className="font-mono text-[10px] mt-0.5 opacity-60">
                  {results[i]
                    ? question.options[question.answer]
                    : `Correct: ${question.options[question.answer]}`}
                </div>
                {!results[i] && question.explain && (
                  <div className="font-mono text-[10px] opacity-50 mt-0.5 leading-relaxed italic">
                    {question.explain}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {pct < 70 && (
          <button
            onClick={() => {
              resultsRef.current = [];
              setQIdx(0);
              setPicked(null);
              setHint(false);
              setPhase("picking");
              setAnimKey((k) => k + 1);
            }}
            className="brutal-border bg-ink text-bone px-5 py-3 font-display text-xl brutal-press"
          >
            ↺ RETRY
          </button>
        )}
      </div>
    );
  }

  // ── Active question ──────────────────────────────────────────────────────
  const progressPct = Math.round((resultsRef.current.length / qs.length) * 100);

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div className="space-y-1">
        <div className="flex justify-between font-mono text-[10px] uppercase opacity-60">
          <span>
            Question {qIdx + 1} / {qs.length}
          </span>
          <span>{resultsRef.current.filter(Boolean).length} correct</span>
        </div>
        <div className="h-2 brutal-border bg-bone overflow-hidden">
          <div
            className="h-full bg-acid transition-all duration-500 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Question card — key forces remount/re-animation on every new question */}
      <div key={animKey} className="space-y-3 animate-slide-up">
        <div className="font-display text-xl md:text-2xl leading-snug">{q.q}</div>

        {/* Options */}
        <div className="grid sm:grid-cols-2 gap-2">
          {q.options.map((opt, oi) => {
            const isPicked = picked === oi;
            const isRight = phase === "feedback" && oi === q.answer;
            const isWrong = phase === "feedback" && isPicked && oi !== q.answer;
            const isMissed = phase === "feedback" && !isPicked && oi === q.answer;

            let cls = "bg-bone hover:bg-sun/40 brutal-press cursor-pointer";
            if (isRight || isMissed) cls = "bg-acid text-ink font-bold";
            else if (isWrong) cls = "bg-hot text-bone";
            else if (phase === "feedback") cls = "bg-bone opacity-50 cursor-default";

            return (
              <button
                key={oi}
                onClick={() => pick(oi)}
                disabled={phase === "feedback"}
                className={`brutal-border px-4 py-3 text-left font-mono text-sm transition-all duration-150 ${cls}`}
              >
                <span className="opacity-40 mr-2">{String.fromCharCode(65 + oi)}.</span>
                {opt}
                {isRight && <span className="ml-2">✓</span>}
                {isWrong && <span className="ml-2">✗</span>}
                {isMissed && <span className="ml-2 text-ink opacity-70">← correct</span>}
              </button>
            );
          })}
        </div>

        {/* Hint — only before answering */}
        {phase === "picking" && q.hint && (
          <div className="animate-fade-fast">
            {!hintShown ? (
              <button
                onClick={() => setHint(true)}
                className="font-mono text-[10px] uppercase opacity-40 hover:opacity-70 underline underline-offset-2 transition-opacity"
              >
                Stuck? See a hint
              </button>
            ) : (
              <div className="brutal-border bg-sun/30 px-4 py-3 font-mono text-xs leading-relaxed animate-pop-in">
                <span className="uppercase font-bold mr-2 opacity-60">Hint</span>
                {q.hint}
              </div>
            )}
          </div>
        )}

        {/* Explanation — appears right after picking */}
        {phase === "feedback" && q.explain && (
          <div
            className={`brutal-border px-4 py-3 font-mono text-xs leading-relaxed animate-pop-in ${
              correct ? "bg-volt text-bone" : "bg-ink text-bone"
            }`}
          >
            <span className="font-bold mr-2">{correct ? "✓" : "✗"}</span>
            {q.explain}
          </div>
        )}

        {/* Skip-wait link */}
        {phase === "feedback" && (
          <button
            onClick={() => advance(resultsRef.current)}
            className="font-mono text-[10px] uppercase opacity-30 hover:opacity-60 underline underline-offset-2 transition-opacity block"
          >
            {isLast ? "See results →" : "Next →"}
          </button>
        )}
      </div>
    </div>
  );
}
