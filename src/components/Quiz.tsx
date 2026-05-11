import { useEffect, useRef, useState } from "react";
import { playCorrect, playWrong, playFanfare } from "@/lib/audio";
import type { QuizQ } from "@/content/types";

export interface QuizMeta {
  missionTitle: string;
  missionNumber: number;
  xpEarned: number; // 0 if already completed
  badgeName?: string;
  nextSlug?: string;
  onNavigateNext?: () => void;
}

interface Props {
  qs: QuizQ[];
  meta?: QuizMeta; // optional — shows XP/share if provided
  onComplete: (score: number) => void;
  onWrongAnswer?: () => void;
}

type Phase = "picking" | "feedback" | "done";

function scrollToTop(el: HTMLElement | null) {
  if (!el) return;
  const rect = el.getBoundingClientRect();
  window.scrollTo({ top: rect.top + window.scrollY - 88, behavior: "smooth" });
}

function scrollToCenter(el: HTMLElement | null) {
  if (!el) return;
  const rect = el.getBoundingClientRect();
  const mid = rect.top + window.scrollY + rect.height / 2;
  window.scrollTo({ top: mid - window.innerHeight / 2, behavior: "smooth" });
}

// Pure-CSS confetti — no library, no canvas. 28 pieces, random positions.
function Confetti() {
  const pieces = Array.from({ length: 28 }, (_, i) => ({
    left: `${(i / 28) * 100 + (Math.random() - 0.5) * 8}%`,
    delay: `${(i * 0.04).toFixed(2)}s`,
    dur: `${(0.7 + Math.random() * 0.5).toFixed(2)}s`,
    color: ["#CDFF00", "#FF2D2D", "#7B2FFF", "#FFB800", "#111111"][i % 5],
    size: `${6 + Math.round(Math.random() * 6)}px`,
    rot: `${Math.round(Math.random() * 720)}deg`,
  }));
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
      <style>{`
        @keyframes confetti-fall {
          0%   { transform: translateY(-16px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(340px) rotate(var(--rot)); opacity: 0; }
        }
      `}</style>
      {pieces.map((p, i) => (
        <div
          key={i}
          style={
            {
              position: "absolute",
              left: p.left,
              top: 0,
              width: p.size,
              height: p.size,
              background: p.color,
              "--rot": p.rot,
              animation: `confetti-fall ${p.dur} ${p.delay} ease-in forwards`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

// Inline share card — generates a PNG and shows a download link
function ShareCard({
  meta,
  pct,
  passed,
  total,
}: {
  meta: QuizMeta;
  pct: number;
  passed: number;
  total: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const W = 1200,
      H = 630;
    c.width = W;
    c.height = H;

    // Background
    ctx.fillStyle = pct === 100 ? "#CDFF00" : "#0B0B0B";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = pct === 100 ? "#0B0B0B" : "#F5F0E8";

    // Site name
    ctx.font = "bold 28px monospace";
    ctx.globalAlpha = 0.5;
    ctx.fillText("CCD.SCHOOL", 60, 70);
    ctx.globalAlpha = 1;

    // Mission
    ctx.font = "bold 52px sans-serif";
    ctx.fillText(`#${meta.missionNumber} ${meta.missionTitle}`, 60, 160);

    // Score
    ctx.font = `bold 120px sans-serif`;
    ctx.fillStyle = pct === 100 ? "#7B2FFF" : "#CDFF00";
    ctx.fillText(`${pct}%`, 60, 320);

    ctx.fillStyle = pct === 100 ? "#0B0B0B" : "#F5F0E8";
    ctx.font = "bold 36px monospace";
    ctx.fillText(`${passed}/${total} correct`, 60, 380);

    if (meta.xpEarned > 0) {
      ctx.font = "bold 48px sans-serif";
      ctx.fillStyle = "#FF2D2D";
      ctx.fillText(`+${meta.xpEarned} XP`, 60, 460);
    }

    if (meta.badgeName) {
      ctx.font = "32px monospace";
      ctx.fillStyle = pct === 100 ? "#0B0B0B" : "#F5F0E8";
      ctx.fillText(`🏅 ${meta.badgeName}`, 60, 520);
    }

    ctx.font = "20px monospace";
    ctx.globalAlpha = 0.4;
    ctx.fillStyle = pct === 100 ? "#0B0B0B" : "#F5F0E8";
    ctx.fillText("ccd.school", 60, H - 40);
    ctx.globalAlpha = 1;

    setUrl(c.toDataURL("image/png"));
  }, [meta, pct, passed, total]);

  return (
    <div className="space-y-3">
      <canvas
        ref={canvasRef}
        className="w-full brutal-border"
        style={{ aspectRatio: "1200/630" }}
      />
      {url && (
        <a
          href={url}
          download={`ccd-school-${meta.missionNumber}.png`}
          className="brutal-border bg-acid text-ink px-5 py-3 font-display text-xl brutal-press block text-center"
        >
          ⬇ Download Card
        </a>
      )}
    </div>
  );
}

export function Quiz({ qs, meta, onComplete, onWrongAnswer }: Props) {
  const [qIdx, setQIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [hintShown, setHint] = useState(false);
  const [phase, setPhase] = useState<Phase>("picking");
  const [showShare, setShowShare] = useState(false);

  const resultsRef = useRef<boolean[]>([]);
  const autoRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const explainRef = useRef<HTMLDivElement>(null);
  const doneRef = useRef<HTMLDivElement>(null);
  const quizTopRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    resultsRef.current = [];
    setQIdx(0);
    setPicked(null);
    setHint(false);
    setPhase("picking");
    setShowShare(false);
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
      const passed = resultsRef.current.filter(Boolean).length;
      if (passed === qs.length) playFanfare();
      // Scroll done card into center — wait for it to paint
      requestAnimationFrame(() => requestAnimationFrame(() => scrollToCenter(doneRef.current)));
    } else {
      setQIdx((i) => i + 1);
      setPicked(null);
      setHint(false);
      setPhase("picking");
      requestAnimationFrame(() => requestAnimationFrame(() => scrollToTop(quizTopRef.current)));
    }
  };

  // ── Done screen — inline, no modal overlay ────────────────────────────────
  if (phase === "done") {
    const results = resultsRef.current;
    const passed = results.filter(Boolean).length;
    const pct = Math.round((passed / qs.length) * 100);
    const perfect = pct === 100;
    const grade = perfect
      ? { label: "PERFECT 🎉", color: "bg-acid text-ink" }
      : pct >= 70
        ? { label: "SOLID ✓", color: "bg-volt text-bone" }
        : { label: "RETRY", color: "bg-hot text-bone" };

    return (
      <div ref={doneRef} className="space-y-4 relative">
        {/* Confetti on perfect */}
        {perfect && <Confetti />}

        {/* Grade banner */}
        <div className={`${grade.color} brutal-border p-5 relative overflow-hidden`}>
          <div className="font-mono text-[10px] uppercase opacity-70">Quiz complete</div>
          <div className="font-display text-5xl mt-1">{grade.label}</div>
          <div className="font-mono text-sm mt-2 flex items-center gap-3 flex-wrap">
            <span>
              {passed} / {qs.length} correct · {pct}%
            </span>
            {meta && meta.xpEarned > 0 && (
              <span className="brutal-border bg-bone text-ink px-2 py-1 font-mono text-xs">
                +{meta.xpEarned} XP
              </span>
            )}
            {meta?.badgeName && (
              <span className="brutal-border bg-ink text-bone px-2 py-1 font-mono text-xs">
                🏅 {meta.badgeName}
              </span>
            )}
          </div>
        </div>

        {/* Share card — only on perfect or high score */}
        {pct >= 70 && meta && (
          <div className="space-y-2">
            {!showShare ? (
              <button
                onClick={() => setShowShare(true)}
                className="brutal-border bg-volt text-bone px-5 py-3 font-display text-xl brutal-press"
              >
                {perfect ? "🎉 Share your result" : "Share result"}
              </button>
            ) : (
              <ShareCard meta={meta} pct={pct} passed={passed} total={qs.length} />
            )}
          </div>
        )}

        {/* Per-question recap */}
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

        {/* Actions */}
        <div className="flex gap-3 flex-wrap">
          {pct < 70 && (
            <button
              onClick={() => {
                resultsRef.current = [];
                setQIdx(0);
                setPicked(null);
                setHint(false);
                setPhase("picking");
                setShowShare(false);
                requestAnimationFrame(() =>
                  requestAnimationFrame(() => scrollToTop(quizTopRef.current)),
                );
              }}
              className="brutal-border bg-ink text-bone px-5 py-3 font-display text-xl brutal-press"
            >
              ↺ RETRY
            </button>
          )}
          {meta?.nextSlug && (
            <a
              href={`/mission/${meta.nextSlug}`}
              className="brutal-border bg-acid text-ink px-5 py-3 font-display text-xl brutal-press"
            >
              NEXT MISSION →
            </a>
          )}
        </div>
      </div>
    );
  }

  // ── Active question ───────────────────────────────────────────────────────
  const progressPct = Math.round((resultsRef.current.length / qs.length) * 100);

  return (
    <div ref={quizTopRef} className="space-y-4">
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
            <div className="brutal-border bg-sun/30 px-4 py-3 font-mono text-xs leading-relaxed">
              <span className="uppercase font-bold mr-2 opacity-60">Hint</span>
              {q.hint}
            </div>
          )}
        </div>
      )}

      {/* Explanation — shown immediately after answering */}
      {phase === "feedback" && (
        <div ref={explainRef}>
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
