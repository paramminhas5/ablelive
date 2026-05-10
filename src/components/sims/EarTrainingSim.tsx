// Ear Training Sim — randomised options, varied source material, difficulty levels.
// Flow: Play TARGET → Audition options (no lock) → Pick → Submit → See result → Next.
import { useEffect, useRef, useState, useCallback } from "react";
import { getCtx } from "@/lib/audio";

// --- Config per mode ---------------------------------------------------------
// Each mode has a pool of values; each round picks 4 random ones (or all if ≤4),
// then selects 1 as the target. This prevents memorisation of a fixed set.

type Mode = "eq" | "comp" | "reverb" | "sat";

interface ModeConfig {
  label: string;
  unit: (v: number) => string;
  pool: number[];
  // Optional explanation per value — shown on correct answer
  explain: (v: number) => string;
  // What the user should listen for
  cue: string;
  // Source tones to rotate (so it's never always the same sawtooth)
  sources: { freq: number; type: OscillatorType; label: string }[];
}

const CONFIGS: Record<Mode, ModeConfig> = {
  eq: {
    label: "EQ Frequency",
    unit: (v) => (v >= 1000 ? `${v / 1000}kHz` : `${v}Hz`),
    pool: [80, 150, 200, 400, 800, 1200, 2500, 4000, 6000, 10000],
    explain: (v) =>
      v <= 150
        ? "Low-end — controls muddiness/warmth (kick, bass fundamentals)."
        : v <= 400
          ? "Low-mids — boxy buildup often cut here for clarity."
          : v <= 1200
            ? "Mids — presence, where most instruments live."
            : v <= 4000
              ? "Upper-mids — attack and clarity of guitars, vocals."
              : v <= 8000
                ? "Air/presence — cymbals, sibilance, vocal sparkle."
                : "High-shelf — adds 'shine', can cause harshness.",
    cue: "Listen for which frequency range gets a -18dB notch. A notch sounds like a dull hollow in the sound.",
    sources: [
      { freq: 220, type: "sawtooth", label: "Sawtooth 220Hz" },
      { freq: 440, type: "sawtooth", label: "Sawtooth 440Hz" },
      { freq: 110, type: "square", label: "Square 110Hz" },
      { freq: 330, type: "triangle", label: "Triangle 330Hz" },
    ],
  },
  comp: {
    label: "Compression Ratio",
    unit: (v) => `${v}:1`,
    pool: [1, 2, 4, 6, 8, 12, 20],
    explain: (v) =>
      v === 1
        ? "1:1 = no compression at all. Flat."
        : v <= 4
          ? "Light ratio — gentle dynamic control, transparent."
          : v <= 8
            ? "Medium ratio — noticeable pump, used on drums/bass."
            : v <= 12
              ? "Heavy ratio — very squashed, aggressive glue sound."
              : "Limiting — almost brickwall, audio slams into ceiling.",
    cue: "Higher ratios flatten dynamics. Listen for how much the loud hits drop in volume vs the quiet parts.",
    sources: [
      { freq: 220, type: "sawtooth", label: "Sawtooth 220Hz" },
      { freq: 440, type: "square", label: "Square 440Hz" },
    ],
  },
  reverb: {
    label: "Reverb Decay",
    unit: (v) => `${v}s`,
    pool: [0.2, 0.5, 1.0, 1.5, 2.5, 4.0, 6.0],
    explain: (v) =>
      v <= 0.5
        ? "Short room — sounds like a tight studio, close-miked feel."
        : v <= 1.5
          ? "Medium hall — natural ambience, good for most mix elements."
          : v <= 3.0
            ? "Long hall — big, cathedral-like, needs careful mixing."
            : "Epic reverb — useful for pads and FX, will blur fast material.",
    cue: "Listen for how long the 'tail' rings out after the sound stops. Short = room, long = cathedral.",
    sources: [
      { freq: 880, type: "sine", label: "Sine 880Hz" },
      { freq: 440, type: "triangle", label: "Triangle 440Hz" },
    ],
  },
  sat: {
    label: "Saturation Amount",
    unit: (v) => `${Math.round(v * 100)}%`,
    pool: [0, 0.1, 0.25, 0.4, 0.6, 0.8, 1.0],
    explain: (v) =>
      v === 0
        ? "Clean — no saturation applied, linear signal."
        : v <= 0.25
          ? "Subtle — adds warmth and tiny harmonics, very natural."
          : v <= 0.5
            ? "Moderate — clearly thickens the tone, harmonics audible."
            : v <= 0.75
              ? "Heavy — gritty, distorted character."
              : "Full drive — full overdrive, very coloured.",
    cue: "Saturation adds harmonics above the fundamental — listen for the sound getting 'richer' or 'grittier' as intensity increases.",
    sources: [
      { freq: 220, type: "sine", label: "Sine 220Hz" },
      { freq: 110, type: "triangle", label: "Triangle 110Hz" },
    ],
  },
};

// Pick N random unique items from an array
function sample<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(n, arr.length));
}

// --- Audio helpers -----------------------------------------------------------

async function playWithEffect(
  ctx: AudioContext,
  mode: Mode,
  val: number,
  source: { freq: number; type: OscillatorType },
) {
  if (ctx.state !== "running") {
    try {
      await ctx.resume();
    } catch {}
  }
  const t = ctx.currentTime + 0.05;
  const dur = 1.4;

  const osc = ctx.createOscillator();
  osc.type = source.type;
  osc.frequency.value = source.freq;

  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.22, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);

  let chain: AudioNode = osc;

  if (mode === "eq") {
    const f = ctx.createBiquadFilter();
    f.type = "peaking";
    f.frequency.value = val;
    f.Q.value = 4;
    f.gain.value = -18;
    chain.connect(f);
    chain = f;
  } else if (mode === "comp") {
    const c = ctx.createDynamicsCompressor();
    c.threshold.value = -24;
    c.ratio.value = val;
    c.attack.value = 0.005;
    c.release.value = 0.15;
    chain.connect(c);
    chain = c;
  } else if (mode === "reverb") {
    const conv = ctx.createConvolver();
    const len = Math.max(0.1, val) * ctx.sampleRate;
    const ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = ir.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.5);
    }
    conv.buffer = ir;
    const wet = ctx.createGain();
    wet.gain.value = 0.6;
    const dry = ctx.createGain();
    dry.gain.value = 0.4;
    chain.connect(dry);
    dry.connect(g);
    chain.connect(conv);
    conv.connect(wet);
    wet.connect(g);
    osc.start(t);
    osc.stop(t + dur + 0.1);
    g.connect(ctx.destination);
    return; // early return — dry/wet handled separately
  } else {
    // Saturation via waveshaper
    const ws = ctx.createWaveShaper();
    const k = val * 60 + 1;
    const curve = new Float32Array(1024);
    for (let i = 0; i < 1024; i++) {
      const x = i / 512 - 1;
      curve[i] = ((1 + k) * x) / (1 + k * Math.abs(x));
    }
    ws.curve = curve;
    chain.connect(ws);
    chain = ws;
  }

  chain.connect(g).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + dur + 0.1);
}

// --- Component ---------------------------------------------------------------

export function EarTrainingSim({ preset }: { preset?: Record<string, unknown> }) {
  const mode = ((preset?.mode as string) || "eq") as Mode;
  const cfg = CONFIGS[mode];

  // Round state
  const [choices, setChoices] = useState<number[]>([]);
  const [target, setTarget] = useState(0);
  const [sourceIdx, setSourceIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState<"right" | "wrong" | null>(null);
  const [round, setRound] = useState(0);
  const [playing, setPlaying] = useState<number | null>(null); // value being auditioning, for UI feedback

  // Stats
  const [score, setScore] = useState({ right: 0, total: 0 });
  const [streak, setStreak] = useState(0);

  const newRound = useCallback(() => {
    const picked4 = sample(cfg.pool, 4);
    const tgt = picked4[Math.floor(Math.random() * picked4.length)];
    const nextSrc = Math.floor(Math.random() * cfg.sources.length);
    setChoices(picked4);
    setTarget(tgt);
    setSourceIdx(nextSrc);
    setPicked(null);
    setSubmitted(null);
    setPlaying(null);
    setRound((r) => r + 1);
  }, [cfg]);

  useEffect(() => {
    newRound();
  }, [newRound]);

  const audition = async (val: number) => {
    const ctx = getCtx();
    if (!ctx) return;
    setPlaying(val);
    await playWithEffect(ctx, mode, val, cfg.sources[sourceIdx]);
    // Visual feedback cleared after playback
    setTimeout(() => setPlaying((p) => (p === val ? null : p)), 1600);
  };

  const submit = () => {
    if (picked === null || submitted) return;
    const right = picked === target;
    setSubmitted(right ? "right" : "wrong");
    setScore((s) => ({ right: s.right + (right ? 1 : 0), total: s.total + 1 }));
    setStreak((s) => (right ? s + 1 : 0));
  };

  const accuracy = score.total > 0 ? Math.round((score.right / score.total) * 100) : 0;
  const sorted = [...choices].sort((a, b) => a - b);

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="brutal-border bg-ink text-bone p-3 flex flex-wrap items-center gap-2">
        <div className="font-mono text-xs uppercase flex-1">
          <span className="opacity-60">Mode:</span> {cfg.label}
          <span className="mx-2 opacity-30">|</span>
          <span className="opacity-60">Source:</span> {cfg.sources[sourceIdx].label}
          <span className="mx-2 opacity-30">|</span>
          Round #{round}
        </div>
        <div className="flex gap-2">
          {streak >= 3 && (
            <span className="brutal-border bg-acid text-ink px-2 py-1 font-mono text-[10px] uppercase animate-pulse">
              {streak}🔥 Streak
            </span>
          )}
          <span className="brutal-border bg-volt text-bone px-2 py-1 font-mono text-[10px] uppercase">
            {score.right}/{score.total} · {accuracy}%
          </span>
        </div>
      </div>

      {/* Cue */}
      <div className="brutal-border bg-sun/30 p-3 font-mono text-[10px] uppercase leading-relaxed">
        <span className="font-bold">What to listen for: </span>
        {cfg.cue}
      </div>

      {/* Play target */}
      <button
        onClick={() => audition(target)}
        className={`brutal-border px-5 py-3 font-display text-xl brutal-press w-full text-left ${playing === target ? "bg-hot text-bone" : "bg-hot text-bone"}`}
      >
        {playing === target ? "▶ PLAYING TARGET..." : "▶ PLAY TARGET"}
        <span className="font-mono text-[10px] ml-3 opacity-70">
          Play this first. Then audition the options below.
        </span>
      </button>

      {/* Option grid */}
      <div className="grid grid-cols-2 gap-2">
        {sorted.map((v, i) => {
          const isPicked = picked === v;
          const isTarget = submitted && v === target;
          const isWrong = submitted === "wrong" && isPicked && v !== target;
          const isPlaying = playing === v;

          const bg = isTarget
            ? "bg-acid text-ink"
            : isWrong
              ? "bg-hot text-bone"
              : isPlaying
                ? "bg-sun text-ink"
                : isPicked
                  ? "bg-volt text-bone"
                  : "bg-card";

          return (
            <div key={v} className={`brutal-border p-3 space-y-2 ${bg} transition-colors`}>
              <div className="font-mono text-[10px] uppercase opacity-70">
                Option {String.fromCharCode(65 + i)}
              </div>
              <div className="font-display text-2xl">{cfg.unit(v)}</div>
              {submitted && v === target && (
                <div className="font-mono text-[10px]">{cfg.explain(v)}</div>
              )}
              <div className="flex gap-1">
                <button
                  onClick={() => audition(v)}
                  className="brutal-border bg-bone text-ink px-2 py-1 font-mono text-[10px] uppercase brutal-press flex-1"
                >
                  {isPlaying ? "▶ Playing" : "▶ Audition"}
                </button>
                <button
                  disabled={!!submitted}
                  onClick={() => setPicked(v)}
                  className={`brutal-border px-2 py-1 font-mono text-[10px] uppercase brutal-press flex-1 disabled:opacity-40 ${isPicked ? "bg-ink text-bone" : "bg-bone text-ink"}`}
                >
                  {isPicked ? "✓ Picked" : "Pick"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions row */}
      <div className="flex gap-2 items-center flex-wrap">
        <button
          disabled={picked === null || !!submitted}
          onClick={submit}
          className="brutal-border bg-acid text-ink px-4 py-2 font-display text-lg brutal-press disabled:opacity-40"
        >
          SUBMIT
        </button>

        <button
          onClick={newRound}
          className="brutal-border bg-bone px-3 py-2 font-mono text-xs uppercase brutal-press"
        >
          Next Round ▶
        </button>

        {submitted === "right" && (
          <span className="brutal-border bg-acid text-ink px-3 py-1 font-mono text-xs uppercase">
            ✓ Correct! {streak >= 3 ? "🔥" : ""}
          </span>
        )}
        {submitted === "wrong" && (
          <span className="brutal-border bg-hot text-bone px-3 py-1 font-mono text-xs uppercase">
            ✗ Was {cfg.unit(target)}
          </span>
        )}
      </div>

      {/* Contextual explanation after wrong answer */}
      {submitted === "wrong" && (
        <div className="brutal-border bg-ink text-bone p-3 font-mono text-xs leading-relaxed">
          <span className="text-acid font-bold uppercase">Correct answer: </span>
          {cfg.unit(target)} — {cfg.explain(target)}
        </div>
      )}
    </div>
  );
}
