import { useEffect, useRef, useState } from "react";
import { playCorrect, playWrong } from "@/lib/audio";
import type { QuizQ } from "@/content/types";

interface Props {
  qs: QuizQ[];
  onComplete: (score: number) => void;
  onWrongAnswer?: () => void;
}

type Phase = "picking" | "feedback" | "done";

// Scroll so element top sits just below the sticky header
function scrollToTop(el: HTMLElement | null) {
  if (!el) return;
  const rect = el.getBoundingClientRect();
  window.scrollTo({ top: rect.top + window.scrollY - 88, behavior: "smooth" });
}

// Scroll so element is vertically centered in the viewport
function scrollToCenter(el: HTMLElement | null) {
  if (!el) return;
  const rect = el.getBoundingClientRect();
  const elementMid = rect.top + window.scrollY + rect.height / 2;
  const viewportMid = window.innerHeight / 2;
  window.scrollTo({ top: elementMid - viewportMid, behavior: "smooth" });
}

export function Quiz({ qs, onComplete, onWrongAnswer }: Props) {
  const [qIdx, setQIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [hintShown, setHint] = useState(false);
  const [phase, setPhase] = useState<Phase>("picking");

  const resultsRef = useRef<boolean[]>([]);
  const autoRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const explainRef = useRef<HTMLDivElement>(null);
  const doneRef = useRef<HTMLDivElement>(null);
  const quizTopRef = useRef<HTMLDivElement>(null);

  // Reset when mission changes
  useEffect(() => {
    resultsRef.current = [];
    setQIdx(0);
    setPicked(null);
    setHint(false);
    setPhase("picking");
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
  const correct = phase === "feedback" && picked !== null ? picked === q?.answer : null;

  if (!q) return null;

  const pick = (optIdx: number) => {
    if (phase !== "picking") return;
    setPicked(optIdx);
    const isPass = optIdx === q.answer;
    resultsRef.current = [...resultsRef.current, isPass];
    setPhase("feedback");
    if (isPass) playCorrect();
    else {
      playWrong();
      onWrongAnswer?.();
    }

    // Scroll explanation into view — wait two frames for React to paint it
    requestAnimationFrame(() => requestAnimationFrame(() => scrollToCenter(explainRef.current)));

    const delay = q.explain ? 3500 : 1400;
    autoRef.current = setTimeout(() => advance(), delay);
  };

  const advance = () => {
    if (autoRef.current) {
      clearTimeout(autoRef.current);
      autoRef.current = null;
    }
    if (isLast) {
      const score = resultsRef.current.filter(Boolean).length / qs.length;
      setPhase("done");
      onComplete(score);
      // Scroll to results — two frames after state update paints the done screen
      requestAnimationFrame(() => requestAnimationFrame(() => scrollToCenter(doneRef.current)));
    } else {
      setQIdx((i) => i + 1);
      setPicked(null);
      setHint(false);
      setPhase("picking");
      requestAnimationFrame(() => requestAnimationFrame(() => scrollToTop(quizTopRef.current)));
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
          : { label: "RETRY", color: "bg-hot text-bone" };
    return (
      <div ref={doneRef} className="space-y-3" style={{ scrollMarginTop: "88px" }}>
        {/* Grade banner */}
        <div className={`${grade.color} brutal-border p-5`}>
          <div className="font-mono text-[10px] uppercase opacity-70">Quiz complete</div>
          <div className="font-display text-5xl mt-1">{grade.label}</div>
          <div className="font-mono text-sm mt-2">
            {passed} / {qs.length} correct · {pct}%
          </div>
        </div>

        {/* Per-question recap with explanations */}
        <div className="space-y-2">
          {qs.map((question, i) => (
            <div
              key={i}
              className={`brutal-border p-3 flex items-start gap-3 ${results[i] ? "bg-acid/20" : "bg-hot/10"}`}
            >
              <span className="font-display text-lg shrink-0 mt-0.5">{results[i] ? "✓" : "✗"}</span>
              <div className="min-w-0">
                <div className="font-mono text-xs leading-relaxed">{question.q}</div>
                <div className="font-mono text-[10px] mt-1 font-bold">
                  {results[i]
                    ? `✓ ${question.options[question.answer]}`
                    : `Correct: ${question.options[question.answer]}`}
                </div>
                {question.explain && (
                  <div className="font-mono text-[10px] mt-1 leading-relaxed opacity-80">
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
              requestAnimationFrame(() =>
                requestAnimationFrame(() => scrollToTop(quizTopRef.current)),
              );
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
    <div ref={quizTopRef} className="space-y-4" style={{ scrollMarginTop: "88px" }}>
      {/* Progress */}
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

      {/* Question */}
      <div className="font-display text-xl md:text-2xl leading-snug">{q.q}</div>

      {/* Options */}
      <div className="grid sm:grid-cols-2 gap-2">
        {q.options.map((opt, oi) => {
          const isPicked = picked === oi;
          const isRight = phase === "feedback" && oi === q.answer;
          const isWrong = phase === "feedback" && isPicked && !isRight;
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
              className={`brutal-border px-4 py-3 text-left font-mono text-sm transition-colors ${cls}`}
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
        <div>
          {!hintShown ? (
            <button
              onClick={() => setHint(true)}
              className="font-mono text-[10px] uppercase opacity-40 hover:opacity-70 underline underline-offset-2"
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

      {/* ─── EXPLANATION — always visible immediately after answering ─── */}
      {phase === "feedback" && (
        <div ref={explainRef} style={{ scrollMarginTop: "88px" }}>
          {/* Big coloured result bar — impossible to miss */}
          <div
            className={`brutal-border px-4 py-4 ${correct ? "bg-volt text-bone" : "bg-ink text-bone"}`}
          >
            <div className="font-display text-2xl mb-1">{correct ? "✓ CORRECT" : "✗ WRONG"}</div>
            {!correct && (
              <div className="font-mono text-xs opacity-80 mb-2">
                Correct answer: <strong>{q.options[q.answer]}</strong>
              </div>
            )}
            {q.explain && (
              <div className="font-mono text-sm leading-relaxed border-t border-current/20 pt-2 mt-1">
                {q.explain}
              </div>
            )}
          </div>

          {/* Skip wait */}
          <button
            onClick={() => advance()}
            className="mt-2 font-mono text-[10px] uppercase opacity-40 hover:opacity-80 underline underline-offset-2 block transition-opacity"
          >
            {isLast ? "See results →" : "Next question →"}
          </button>
        </div>
      )}
    </div>
  );
}
