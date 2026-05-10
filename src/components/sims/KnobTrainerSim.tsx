// Musical knob trainer — match a target sound by ear, not by number.
// Modes: cutoff (lowpass), attack (compressor), decay (reverb tail).
import { useEffect, useRef, useState } from "react";
import { getCtx, getMaster, startLoop, type LoopHandle } from "@/lib/audio";

type Mode = "cutoff" | "attack" | "decay";
const MODE_META: Record<Mode, { label: string; unit: string; min: number; max: number; format: (v: number) => string }> = {
  cutoff: { label: "LOWPASS CUTOFF", unit: "Hz", min: 200, max: 12000, format: (v) => `${v.toFixed(0)} Hz` },
  attack: { label: "COMP ATTACK",    unit: "ms", min: 1,   max: 80,    format: (v) => `${v.toFixed(0)} ms` },
  decay:  { label: "REVERB DECAY",   unit: "s",  min: 0.3, max: 4.0,   format: (v) => `${v.toFixed(2)} s` },
};

export function KnobTrainerSim({ preset }: { preset?: Record<string, unknown> }) {
  const initialMode = ((preset?.mode as Mode) ?? "cutoff");
  const [mode, setMode] = useState<Mode>(initialMode);
  const meta = MODE_META[mode];
  const [target, setTarget] = useState(() => randInRange(meta.min, meta.max, mode));
  const [val, setVal] = useState(() => (meta.min + meta.max) / 2);
  const [revealed, setRevealed] = useState(false);
  const [tries, setTries] = useState(0);
  const [hits, setHits] = useState(0);
  const loopRef = useRef<LoopHandle | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  const stopAll = () => {
    loopRef.current?.stop(); loopRef.current = null;
    cleanupRef.current?.(); cleanupRef.current = null;
  };
  useEffect(() => () => stopAll(), []);

  const playOne = async (which: "target" | "user") => {
    stopAll();
    const c = getCtx(); if (!c) return;
    if (c.state !== "running") { try { await c.resume(); } catch {} }
    const v = which === "target" ? target : val;
    const out = c.createGain(); out.gain.value = 0.7; out.connect(getMaster());
    let inputNode: AudioNode = out;
    let sampleName: "drum-loop" | "bass-loop" | "chord-pad" = "chord-pad";

    if (mode === "cutoff") {
      const lp = c.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = v; lp.Q.value = 1;
      lp.connect(out); inputNode = lp;
      sampleName = "chord-pad";
    } else if (mode === "attack") {
      const comp = c.createDynamicsCompressor();
      comp.threshold.value = -28; comp.ratio.value = 8;
      comp.attack.value = v / 1000; comp.release.value = 0.12; comp.knee.value = 4;
      const make = c.createGain(); make.gain.value = 1.6;
      comp.connect(make).connect(out); inputNode = comp;
      sampleName = "drum-loop";
    } else {
      const len = Math.max(0.1, v);
      const ir = c.createBuffer(2, c.sampleRate * len, c.sampleRate);
      for (let ch = 0; ch < 2; ch++) {
        const d = ir.getChannelData(ch);
        for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 2.4);
      }
      const conv = c.createConvolver(); conv.buffer = ir;
      const dry = c.createGain(); dry.gain.value = 0.3;
      const wet = c.createGain(); wet.gain.value = 0.9;
      const split = c.createGain();
      split.connect(dry).connect(out);
      split.connect(conv).connect(wet).connect(out);
      inputNode = split;
      sampleName = "drum-loop";
    }
    loopRef.current = startLoop(sampleName, 100, inputNode);
    cleanupRef.current = () => { try { out.disconnect(); } catch {} };
  };

  const lock = () => {
    setTries((t) => t + 1);
    const tol = mode === "cutoff" ? 0.15 : mode === "attack" ? 6 : 0.4;
    const dist = mode === "cutoff" ? Math.abs(Math.log2(val / target)) : Math.abs(val - target);
    if (dist < tol) {
      setHits((h) => h + 1); setRevealed(true);
    } else {
      setRevealed(true);
    }
    stopAll();
  };
  const next = () => {
    stopAll();
    setTarget(randInRange(meta.min, meta.max, mode));
    setVal((meta.min + meta.max) / 2);
    setRevealed(false);
  };
  const switchMode = (m: Mode) => {
    stopAll();
    const mm = MODE_META[m];
    setMode(m);
    setTarget(randInRange(mm.min, mm.max, m));
    setVal((mm.min + mm.max) / 2);
    setRevealed(false);
  };

  return (
    <div className="space-y-3">
      <div className="brutal-border bg-ink text-bone p-3 flex flex-wrap gap-2 items-center">
        {(Object.keys(MODE_META) as Mode[]).map((m) => (
          <button key={m} onClick={() => switchMode(m)}
            className={`brutal-border px-3 py-2 font-mono text-xs uppercase brutal-press ${mode === m ? "bg-acid text-ink" : "bg-bone text-ink"}`}>
            {MODE_META[m].label}
          </button>
        ))}
        <span className="ml-auto font-mono text-xs uppercase">HITS {hits}/{tries}</span>
      </div>

      <div className="brutal-border bg-card p-4 grid md:grid-cols-2 gap-3">
        <button onClick={() => playOne("target")}
          className="brutal-border bg-hot text-bone p-4 brutal-press font-display text-xl">
          ▶ TARGET
        </button>
        <button onClick={() => playOne("user")}
          className="brutal-border bg-acid text-ink p-4 brutal-press font-display text-xl">
          ▶ YOUR SOUND
        </button>
      </div>

      <div className="brutal-border bg-bone p-4 space-y-2">
        <div className="font-mono text-xs uppercase flex justify-between">
          <span>{meta.label}</span>
          <span>{meta.format(val)}</span>
        </div>
        <input type="range" min={meta.min} max={meta.max}
          step={mode === "decay" ? 0.01 : 1}
          value={val} onChange={(e) => setVal(+e.target.value)} className="w-full" />
        <div className="flex gap-2 mt-2 flex-wrap">
          <button onClick={lock} className="brutal-border bg-volt text-bone px-4 py-2 font-mono text-xs uppercase brutal-press">LOCK ANSWER</button>
          <button onClick={next} className="brutal-border bg-bone px-4 py-2 font-mono text-xs uppercase brutal-press">NEW ROUND</button>
          {tries >= 2 && !revealed && (
            <button onClick={() => setRevealed(true)} className="brutal-border bg-sun px-4 py-2 font-mono text-xs uppercase brutal-press">
              💡 HINT (reveal target)
            </button>
          )}
        </div>
        {revealed && (
          <div className="brutal-border bg-acid p-3 font-mono text-xs uppercase mt-2">
            TARGET WAS {meta.format(target)} · YOU PICKED {meta.format(val)}
          </div>
        )}
      </div>

      <div className="brutal-border bg-card p-3 font-mono text-xs">
        <b>HOW:</b> Tap TARGET, then tap YOUR SOUND. Move the slider until they sound the same. Tap LOCK ANSWER.
      </div>
    </div>
  );
}

function randInRange(min: number, max: number, mode: Mode) {
  if (mode === "cutoff") {
    // log random
    const r = Math.random();
    return Math.round(min * Math.pow(max / min, r));
  }
  return +(min + Math.random() * (max - min)).toFixed(2);
}
