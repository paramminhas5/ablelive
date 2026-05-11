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

  // Use a ref for results so the score calc in the completion handler
  // always reads the current accumulated values, never stale closures.
  const resultsRef = useRef<boolean[]>([]);
  const [resultsLen, setResultsLen] = useState(0); // just to trigger re-renders

  const autoRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset fully when the question set changes (new mission)
  useEffect(() => {
    resultsRef.current = [];
    setResultsLen(0);
    setQIdx(0);
    setPicked(null);
    setHint(false);
    setPhase("picking");
    if (autoRef.current) clearTimeout(autoRef.current);
  }, [qs]);

  // Clean up timer on unmount
  useEffect(
    () => () => {
      if (autoRef.current) clearTimeout(autoRef.current);
    },
    [],
  );

  const q = qs[qIdx];
  if (!q) return null;

  const isLast = qIdx === qs.length - 1;
  const pass = picked !== null ? picked === q.answer : null;
  const correct = phase === "feedback" ? pass : null;

  // --- Pick an answer → immediately show feedback ---
  const pick = (optIdx: number) => {
    if (phase !== "picking") return;
    setPicked(optIdx);

    const isPass = optIdx === q.answer;
    const newResults = [...resultsRef.current, isPass];
    resultsRef.current = newResults;
    setResultsLen(newResults.length);

    setPhase("feedback");

    if (isPass) playCorrect();
    else {
      playWrong();
      onWrongAnswer?.();
    }

    // Auto-advance after 1400ms (enough to read explanation)
    autoRef.current = setTimeout(() => advance(newResults), 1400);
  };

  const advance = (results: boolean[]) => {
    if (autoRef.current) clearTimeout(autoRef.current);
    if (isLast) {
      const score = results.filter(Boolean).length / qs.length;
      setPhase("done");
      onComplete(score);
    } else {
      setQIdx((i) => i + 1);
      setPicked(null);
      setHint(false);
      setPhase("picking");
    }
  };

  // --- Done screen ---
  if (phase === "done") {
    const results = resultsRef.current;
    const passed = results.filter(Boolean).length;
    const pct = Math.round((passed / qs.length) * 100);
    const grade =
      pct === 100
        ? { label: "PERFECT", color: "bg-acid text-ink" }
        : pct >= 70
          ? { label: "SOLID", color: "bg-volt text-bone" }
          : { label: "RETRY", color: "bg-hot text-bone" };

    return (
      <div className="space-y-3">
        {/* Grade card */}
        <div className={`${grade.color} brutal-border p-5`}>
          <div className="font-mono text-[10px] uppercase opacity-80">Quiz complete</div>
          <div className="font-display text-5xl mt-1">{grade.label}</div>
          <div className="font-mono text-sm mt-1">
            {passed} / {qs.length} correct · {pct}%
          </div>
        </div>

        {/* Per-question recap */}
        <div className="space-y-1">
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
                <div className="font-mono text-[10px] opacity-70 mt-0.5">
                  {results[i]
                    ? question.options[question.answer]
                    : `Correct: ${question.options[question.answer]}`}
                </div>
                {!results[i] && question.explain && (
                  <div className="font-mono text-[10px] opacity-60 mt-0.5 leading-relaxed">
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
              setResultsLen(0);
              setQIdx(0);
              setPicked(null);
              setHint(false);
              setPhase("picking");
            }}
            className="brutal-border bg-ink text-bone px-5 py-3 font-display text-xl brutal-press"
          >
            ↺ RETRY
          </button>
        )}
      </div>
    );
  }

  // --- Active question ---
  const progressPct = Math.round((resultsLen / qs.length) * 100);

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
            className="h-full bg-acid transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Question text */}
      <div className="font-display text-xl md:text-2xl leading-snug">{q.q}</div>

      {/* Options — clicking one IS the submission */}
      <div className="grid sm:grid-cols-2 gap-2">
        {q.options.map((opt, oi) => {
          const isPicked = picked === oi;
          const isRight = phase === "feedback" && oi === q.answer;
          const isWrong = phase === "feedback" && isPicked && oi !== q.answer;
          const isMissed = phase === "feedback" && !isPicked && oi === q.answer;

          let bg = "bg-bone hover:bg-sun/40 brutal-press";
          if (isRight || isMissed) bg = "bg-acid text-ink font-bold";
          else if (isWrong) bg = "bg-hot text-bone";
          else if (phase === "feedback") bg = "bg-bone opacity-60";

          return (
            <button
              key={oi}
              onClick={() => pick(oi)}
              disabled={phase === "feedback"}
              className={`brutal-border px-4 py-3 text-left font-mono text-sm transition-colors ${bg}`}
              aria-pressed={isPicked}
            >
              <span className="opacity-40 mr-2">{String.fromCharCode(65 + oi)}.</span>
              {opt}
              {isRight && <span className="ml-2 text-ink">✓</span>}
              {isWrong && <span className="ml-2">✗</span>}
              {isMissed && <span className="ml-2 opacity-70 text-ink">← correct</span>}
            </button>
          );
        })}
      </div>

      {/* Hint — only shown before answering */}
      {phase === "picking" && q.hint && (
        <div>
          {!hintShown ? (
            <button
              onClick={() => setHint(true)}
              className="font-mono text-[10px] uppercase opacity-40 hover:opacity-80 underline underline-offset-2 transition-opacity"
            >
              Stuck? See a hint
            </button>
          ) : (
            <div className="brutal-border bg-sun/30 px-4 py-3 font-mono text-xs leading-relaxed">
              <span className="uppercase font-bold mr-2 opacity-60">Hint</span>
              {q.hint}
            </div>
          )}
        </div>
      )}

      {/* Explanation — appears instantly after answering */}
      {phase === "feedback" && q.explain && (
        <div
          className={`brutal-border px-4 py-3 font-mono text-xs leading-relaxed ${
            correct ? "bg-volt text-bone" : "bg-ink text-bone"
          }`}
        >
          <span className="uppercase font-bold mr-2 opacity-70">{correct ? "✓" : "✗"}</span>
          {q.explain}
        </div>
      )}

      {/* Manual next button — safety valve if user doesn't want to wait */}
      {phase === "feedback" && (
        <button
          onClick={() => advance(resultsRef.current)}
          className="font-mono text-[10px] uppercase opacity-40 hover:opacity-80 underline underline-offset-2 transition-opacity"
        >
          {isLast ? "See results →" : "Next →"}
        </button>
      )}
    </div>
  );
}
