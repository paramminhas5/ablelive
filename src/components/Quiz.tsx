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
  const [animKey, setAnimKey] = useState(0);

  const resultsRef = useRef<boolean[]>([]);
  const autoRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const explainRef = useRef<HTMLDivElement>(null); // scroll target after answering
  const doneRef = useRef<HTMLDivElement>(null); // scroll target on results
  const containerRef = useRef<HTMLDivElement>(null);

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

    // Scroll explanation into view after a short paint delay
    setTimeout(() => {
      explainRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 80);

    const delay = q.explain ? 3200 : 1200;
    autoRef.current = setTimeout(() => advance(newResults), delay);
  };

  const advance = (results: boolean[]) => {
    if (autoRef.current) {
      clearTimeout(autoRef.current);
      autoRef.current = null;
    }
    if (isLast) {
      setPhase("done");
      onComplete(results.filter(Boolean).length / qs.length);
      // Scroll to results card
      setTimeout(() => doneRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
    } else {
      setPhase("picking");
      setQIdx((i) => i + 1);
      setPicked(null);
      setHint(false);
      setAnimKey((k) => k + 1);
      // Scroll back to top of quiz on new question
      setTimeout(
        () => containerRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }),
        60,
      );
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
      <div ref={doneRef} className="space-y-3 animate-slide-up scroll-mt-4">
        <div className={`${grade.color} brutal-border p-5`}>
          <div className="font-mono text-[10px] uppercase opacity-70">Quiz complete</div>
          <div className="font-display text-5xl mt-1">{grade.label}</div>
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
              <span className="font-display text-lg shrink-0 mt-0.5">{results[i] ? "✓" : "✗"}</span>
              <div className="min-w-0">
                <div className="font-mono text-xs leading-relaxed">{question.q}</div>
                <div className="font-mono text-[10px] mt-0.5 font-bold">
                  {results[i]
                    ? `✓ ${question.options[question.answer]}`
                    : `Correct: ${question.options[question.answer]}`}
                </div>
                {question.explain && (
                  <div
                    className={`font-mono text-[10px] mt-1 leading-relaxed ${results[i] ? "opacity-60" : "opacity-80"}`}
                  >
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
              setTimeout(
                () => containerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
                60,
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
    <div ref={containerRef} className="space-y-4 scroll-mt-4">
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

      <div key={animKey} className="space-y-3 animate-slide-up">
        <div className="font-display text-xl md:text-2xl leading-snug">{q.q}</div>

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

        {/* Hint */}
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
              <div className="brutal-border bg-sun/30 px-4 py-3 font-mono text-xs leading-relaxed animate-pop-in">
                <span className="uppercase font-bold mr-2 opacity-60">Hint</span>
                {q.hint}
              </div>
            )}
          </div>
        )}

        {/* Explanation — scroll ref attached here */}
        {phase === "feedback" && (
          <div ref={explainRef} className="scroll-mt-4">
            {q.explain ? (
              <div
                className={`brutal-border px-4 py-3 font-mono text-sm leading-relaxed animate-pop-in ${correct ? "bg-volt text-bone" : "bg-ink text-bone"}`}
              >
                <span className="font-bold mr-2 text-base">{correct ? "✓" : "✗"}</span>
                {q.explain}
              </div>
            ) : (
              <div
                className={`brutal-border px-4 py-2 font-mono text-sm animate-pop-in ${correct ? "bg-acid text-ink" : "bg-hot text-bone"}`}
              >
                {correct ? "✓ Correct" : `✗ Correct answer: ${q.options[q.answer]}`}
              </div>
            )}
            <button
              onClick={() => advance(resultsRef.current)}
              className="mt-2 font-mono text-[10px] uppercase opacity-30 hover:opacity-60 underline underline-offset-2 block"
            >
              {isLast ? "See results →" : "Next →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
