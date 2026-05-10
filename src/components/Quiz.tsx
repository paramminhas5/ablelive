import { useState } from "react";
import type { QuizQ } from "@/content/types";

interface Props {
  qs: QuizQ[];
  onComplete: (score: number) => void;
  onWrongAnswer?: () => void; // CCD mode: called on each wrong submission
}

export function Quiz({ qs, onComplete, onWrongAnswer }: Props) {
  const [qIdx, setQIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [hintShown, setHintShown] = useState(false);
  const [results, setResults] = useState<boolean[]>([]);
  const [done, setDone] = useState(false);

  const q = qs[qIdx];
  const correct = revealed ? picked === q.answer : null;

  const submit = () => {
    if (picked === null || revealed) return;
    const pass = picked === q.answer;
    setRevealed(true);
    setResults((r) => [...r, pass]);
    if (!pass) onWrongAnswer?.();
  };

  const next = () => {
    const isLast = qIdx === qs.length - 1;
    if (isLast) {
      const score = [...results].filter(Boolean).length / qs.length;
      setDone(true);
      onComplete(score);
    } else {
      setQIdx((i) => i + 1);
      setPicked(null);
      setRevealed(false);
      setHintShown(false);
    }
  };

  // --- Results screen ---
  if (done) {
    const passed = results.filter(Boolean).length;
    const pct = Math.round((passed / qs.length) * 100);
    const grade =
      pct === 100
        ? { label: "PERFECT", color: "bg-acid text-ink" }
        : pct >= 70
          ? { label: "SOLID", color: "bg-volt text-bone" }
          : { label: "RETRY?", color: "bg-hot text-bone" };

    return (
      <div className="brutal-border p-6 space-y-4">
        <div className={`${grade.color} brutal-border p-4`}>
          <div className="font-mono text-[10px] uppercase mb-1">Quiz complete</div>
          <div className="font-display text-5xl">{grade.label}</div>
          <div className="font-mono text-sm mt-1">
            {passed} / {qs.length} correct · {pct}%
          </div>
        </div>

        <div className="space-y-2">
          {qs.map((question, i) => (
            <div
              key={i}
              className={`brutal-border p-3 flex items-start gap-3 ${results[i] ? "bg-acid/20" : "bg-hot/10"}`}
            >
              <span className="font-display text-xl shrink-0">{results[i] ? "✓" : "✗"}</span>
              <div>
                <div className="font-mono text-xs">{question.q}</div>
                {!results[i] && (
                  <div className="font-mono text-[10px] opacity-70 mt-1">
                    Correct: {question.options[question.answer]}
                    {question.explain && <> — {question.explain}</>}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {pct < 70 && (
          <button
            onClick={() => {
              setQIdx(0);
              setPicked(null);
              setRevealed(false);
              setHintShown(false);
              setResults([]);
              setDone(false);
            }}
            className="brutal-border bg-ink text-bone px-5 py-3 font-display text-xl brutal-press"
          >
            ↺ RETRY QUIZ
          </button>
        )}
      </div>
    );
  }

  // --- Single question ---
  const progressPct = Math.round((qIdx / qs.length) * 100);

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div className="space-y-1">
        <div className="flex justify-between font-mono text-[10px] uppercase opacity-60">
          <span>
            Question {qIdx + 1} of {qs.length}
          </span>
          <span>{results.filter(Boolean).length} correct so far</span>
        </div>
        <div className="h-2 brutal-border bg-bone overflow-hidden">
          <div
            className="h-full bg-acid transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="brutal-border bg-card p-5 brutal-shadow-sm space-y-4">
        <div className="font-display text-xl leading-snug">{q.q}</div>

        <div className="grid sm:grid-cols-2 gap-2">
          {q.options.map((opt, oi) => {
            const isPicked = picked === oi;
            const isRight = revealed && oi === q.answer;
            const isWrong = revealed && isPicked && oi !== q.answer;
            const isMissed = revealed && !isPicked && oi === q.answer;
            return (
              <button
                key={oi}
                disabled={revealed}
                onClick={() => setPicked(oi)}
                className={[
                  "brutal-border px-3 py-3 text-left font-mono text-sm transition-colors",
                  isRight || isMissed
                    ? "bg-acid text-ink font-bold"
                    : isWrong
                      ? "bg-hot text-bone"
                      : isPicked
                        ? "bg-sun text-ink"
                        : "bg-bone hover:bg-sun/30",
                  revealed ? "cursor-default" : "brutal-press",
                ].join(" ")}
                aria-pressed={isPicked}
              >
                <span className="opacity-50 mr-2">{String.fromCharCode(65 + oi)}.</span>
                {opt}
                {isRight && <span className="ml-2">✓</span>}
                {isWrong && <span className="ml-2">✗</span>}
                {isMissed && !isPicked && <span className="ml-2 opacity-70">← correct</span>}
              </button>
            );
          })}
        </div>

        {/* Hint */}
        {!revealed && q.hint && (
          <div>
            {!hintShown ? (
              <button
                onClick={() => setHintShown(true)}
                className="font-mono text-[10px] uppercase opacity-50 hover:opacity-100 underline underline-offset-2"
              >
                Stuck? See a hint
              </button>
            ) : (
              <div className="brutal-border bg-sun/40 p-3 font-mono text-xs leading-relaxed">
                <span className="uppercase font-bold mr-2">Hint:</span>
                {q.hint}
              </div>
            )}
          </div>
        )}

        {/* Explanation */}
        {revealed && q.explain && (
          <div
            className={`brutal-border p-3 font-mono text-xs leading-relaxed ${correct ? "bg-volt text-bone" : "bg-ink text-bone"}`}
          >
            <span className="uppercase font-bold mr-2">▸</span>
            {q.explain}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 items-center">
        {!revealed ? (
          <button
            onClick={submit}
            disabled={picked === null}
            className="brutal-border bg-acid px-5 py-3 font-display text-xl brutal-press disabled:opacity-40"
          >
            SUBMIT
          </button>
        ) : (
          <button
            onClick={next}
            className="brutal-border bg-ink text-bone px-5 py-3 font-display text-xl brutal-press"
          >
            {qIdx === qs.length - 1 ? "SEE RESULTS →" : "NEXT QUESTION →"}
          </button>
        )}

        {revealed && (
          <div
            className={`brutal-border px-4 py-2 font-mono text-sm uppercase ${correct ? "bg-acid text-ink" : "bg-hot text-bone"}`}
          >
            {correct ? "✓ Correct" : "✗ Wrong"}
          </div>
        )}
      </div>
    </div>
  );
}
