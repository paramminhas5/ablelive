// Ear training drill — real answer flow:
//   1. Play TARGET
//   2. Audition options (does NOT lock the answer)
//   3. Tap "PICK" on the option you think is the target
//   4. SUBMIT → see correct / wrong → Next Round
import { useEffect, useRef, useState } from "react";
import { getCtx } from "@/lib/audio";

export function EarTrainingSim({ preset }: { preset?: Record<string, unknown> }) {
  const mode = (preset?.mode as string) || "eq";
  const target = useRef<number>(0);
  const choices = useRef<number[]>([]);
  const [picked, setPicked] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState<null | "right" | "wrong">(null);
  const [streak, setStreak] = useState(0);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState({ right: 0, total: 0 });

  const setup = () => {
    const opts =
      mode === "eq" ? [200, 800, 2500, 6000] :
      mode === "comp" ? [1, 4, 8, 20] :
      mode === "reverb" ? [0.3, 1.0, 2.5, 5.0] :
      mode === "sat" ? [0, 0.3, 0.6, 0.9] :
      [0, 0.3, 0.6, 0.9];
    choices.current = opts;
    target.current = opts[Math.floor(Math.random() * opts.length)];
    setPicked(null);
    setSubmitted(null);
    setRound((r) => r + 1);
  };
  useEffect(setup, [mode]);

  const playWith = async (val: number) => {
    const ctx = getCtx(); if (!ctx) return;
    if (ctx.state !== "running") { try { await ctx.resume(); } catch {} }
    const t = ctx.currentTime + 0.05;
    const osc = ctx.createOscillator(); osc.type = "sawtooth"; osc.frequency.value = 220;
    const g = ctx.createGain(); g.gain.value = 0.0001;
    g.gain.exponentialRampToValueAtTime(0.2, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);
    let chain: AudioNode = osc;
    if (mode === "eq") {
      const f = ctx.createBiquadFilter(); f.type = "peaking"; f.frequency.value = val; f.Q.value = 4; f.gain.value = -18;
      chain.connect(f); chain = f;
    } else if (mode === "comp") {
      const c = ctx.createDynamicsCompressor(); c.threshold.value = -30; c.ratio.value = val; c.attack.value = 0.01; c.release.value = 0.2;
      chain.connect(c); chain = c;
    } else if (mode === "reverb") {
      const conv = ctx.createConvolver();
      const len = Math.max(0.1, val) * ctx.sampleRate;
      const ir = ctx.createBuffer(2, len, ctx.sampleRate);
      for (let ch = 0; ch < 2; ch++) {
        const d = ir.getChannelData(ch);
        for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2);
      }
      conv.buffer = ir; chain.connect(conv); chain = conv;
    } else {
      const ws = ctx.createWaveShaper();
      const k = val * 50 + 1;
      const curve = new Float32Array(1024);
      for (let i = 0; i < 1024; i++) { const x = (i / 512) - 1; curve[i] = ((1 + k) * x) / (1 + k * Math.abs(x)); }
      ws.curve = curve; chain.connect(ws); chain = ws;
    }
    chain.connect(g).connect(ctx.destination);
    osc.start(t); osc.stop(t + 1.3);
  };

  const submit = () => {
    if (picked === null) return;
    const right = picked === target.current;
    setSubmitted(right ? "right" : "wrong");
    setScore((s) => ({ right: s.right + (right ? 1 : 0), total: s.total + 1 }));
    if (right) setStreak((s) => s + 1); else setStreak(0);
  };

  const fmt = (v: number) =>
    mode === "eq" ? `${v} Hz` :
    mode === "comp" ? `${v}:1` :
    mode === "reverb" ? `${v}s` :
    `${Math.round(v * 100)}%`;

  return (
    <div className="space-y-3">
      <div className="brutal-border bg-ink text-bone p-3 flex flex-wrap items-center gap-2">
        <button onClick={() => playWith(target.current)}
          className="brutal-border bg-hot text-bone px-3 py-2 font-mono uppercase brutal-press">▶ Play TARGET</button>
        <span className="font-mono text-[10px] uppercase opacity-80">Listen to the target, audition each option, then PICK + SUBMIT.</span>
        <span className="ml-auto brutal-border bg-acid text-ink px-3 py-1 font-mono uppercase">Streak {streak}</span>
        <span className="brutal-border bg-bone text-ink px-3 py-1 font-mono uppercase">{score.right}/{score.total}</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {choices.current.map((v, i) => {
          const isPicked = picked === v;
          const correct = submitted && v === target.current;
          const wrong = submitted === "wrong" && isPicked;
          const tone =
            correct ? "bg-acid" :
            wrong ? "bg-hot text-bone" :
            isPicked ? "bg-volt text-bone" :
            "bg-card";
          return (
            <div key={v} className={`brutal-border p-3 space-y-2 ${tone}`}>
              <div className="font-mono text-xs uppercase">Option {String.fromCharCode(65 + i)}</div>
              <div className="font-display text-2xl">{fmt(v)}</div>
              <div className="flex gap-1">
                <button
                  onClick={() => playWith(v)}
                  className="brutal-border bg-bone text-ink px-2 py-1 font-mono text-[10px] uppercase brutal-press flex-1"
                >▶ Audition</button>
                <button
                  disabled={!!submitted}
                  onClick={() => setPicked(v)}
                  className={`brutal-border px-2 py-1 font-mono text-[10px] uppercase brutal-press flex-1 ${
                    isPicked ? "bg-ink text-bone" : "bg-sun"
                  } disabled:opacity-40`}
                >{isPicked ? "✓ Picked" : "Pick"}</button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-2 items-center">
        <button
          disabled={picked === null || !!submitted}
          onClick={submit}
          className="brutal-border bg-acid px-4 py-2 font-display text-lg brutal-press disabled:opacity-40"
        >SUBMIT</button>
        <button
          onClick={setup}
          className="brutal-border bg-bone px-3 py-2 font-mono uppercase brutal-press"
        >Next Round ▶</button>
        {submitted === "right" && (
          <span className="brutal-border bg-acid px-3 py-1 font-mono text-xs uppercase">✓ Correct</span>
        )}
        {submitted === "wrong" && (
          <span className="brutal-border bg-hot text-bone px-3 py-1 font-mono text-xs uppercase">
            ✗ Was {fmt(target.current)}
          </span>
        )}
        <span className="ml-auto font-mono text-[10px] uppercase opacity-60">Round #{round}</span>
      </div>
    </div>
  );
}
