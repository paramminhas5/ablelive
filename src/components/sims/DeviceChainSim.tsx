import { useEffect, useRef, useState } from "react";
import { getCtx, startLoop, type LoopHandle } from "@/lib/audio";
import { DeviceEngine } from "@/lib/device-engine";
import type { DeviceNode } from "@/lib/audio-bus";

const POOL = [
  { id: "eq",     label: "EQ EIGHT",   desc: "Lowpass at 800 Hz",          color: "bg-acid" },
  { id: "comp",   label: "COMPRESSOR", desc: "Squashes loud peaks",        color: "bg-hot text-bone" },
  { id: "reverb", label: "REVERB",     desc: "Adds room reflections",      color: "bg-volt text-bone" },
  { id: "delay",  label: "DELAY",      desc: "1/4-note echoes",            color: "bg-sun" },
  { id: "sat",    label: "SATURATOR",  desc: "Drives the signal hot",      color: "bg-bone" },
];

import { makeEQ8, makeComp, makeReverb, makeDelay, makeSat } from "@/lib/audio-bus";

function buildNode(id: string): DeviceNode | null {
  try {
    if (id === "eq") { const n = makeEQ8(); n.set("b1g", -12); n.set("b2g", -8); return n; }
    if (id === "comp") { return makeComp(); }
    if (id === "reverb") { const n = makeReverb(); n.set("wet", 0.6); return n; }
    if (id === "delay") { const n = makeDelay(); n.set("wet", 0.5); n.set("feedback", 0.45); return n; }
    if (id === "sat") { const n = makeSat(); n.set("drive", 18); return n; }
  } catch {}
  return null;
}

export function DeviceChainSim() {
  const [chain, setChain] = useState<{ id: string; node: DeviceNode }[]>([]);
  const [playing, setPlaying] = useState(false);
  const engineRef = useRef<DeviceEngine | null>(null);
  const loopRef = useRef<LoopHandle | null>(null);

  // Single engine instance for the lifetime of the component
  useEffect(() => {
    const c = getCtx(); if (!c) return;
    const engine = new DeviceEngine();
    engineRef.current = engine;
    return () => {
      try { loopRef.current?.stop(); } catch {}
      try { engine.dispose(); } catch {}
      engineRef.current = null;
    };
  }, []);

  // Rewire chain via engine.setChain whenever chain state changes
  useEffect(() => {
    const eng = engineRef.current; if (!eng) return;
    eng.setChain(chain.map((s) => s.node));
  }, [chain]);

  // Loop feeds engine.input — once started, never reconnected.
  useEffect(() => {
    if (!playing) { loopRef.current?.stop(); loopRef.current = null; return; }
    const eng = engineRef.current; if (!eng) return;
    loopRef.current = startLoop("drum-loop", 110, eng.input);
    return () => { loopRef.current?.stop(); loopRef.current = null; };
  }, [playing]);

  const add = (id: string) => {
    const node = buildNode(id); if (!node) return;
    setChain((c) => [...c, { id, node }]);
  };
  const rm = (i: number) => {
    setChain((c) => {
      const removed = c[i];
      try { removed.node.dispose(); } catch {}
      return c.filter((_, idx) => idx !== i);
    });
  };
  return (
    <div className="space-y-3">
      <div className="flex gap-2 items-center">
        <button onClick={() => setPlaying((p) => !p)} className="brutal-border bg-acid px-4 py-2 font-mono uppercase brutal-press">
          {playing ? "■ Stop" : "▶ Play Loop"}
        </button>
        <span className="font-mono text-xs uppercase opacity-70">Add devices — hear them shape the drum loop in real time.</span>
      </div>
      <div>
        <h4 className="font-display text-xl mb-2">DEVICE POOL</h4>
        <div className="flex flex-wrap gap-2">
          {POOL.map((d) => (
            <button key={d.id} onClick={() => add(d.id)} title={d.desc} className={`${d.color} brutal-border px-3 py-2 font-mono text-xs uppercase brutal-press`}>
              + {d.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <h4 className="font-display text-xl mb-2">SIGNAL CHAIN (LEFT → RIGHT)</h4>
        <div className="brutal-border bg-card p-3 min-h-[120px] flex items-center gap-2 overflow-x-auto">
          <div className="brutal-border bg-ink text-bone px-3 py-2 font-mono text-xs">IN</div>
          {chain.length === 0 && <div className="font-mono text-xs opacity-60">drop devices…</div>}
          {chain.map((s, i) => {
            const d = POOL.find((p) => p.id === s.id)!;
            return (
              <div key={i} className="flex items-center gap-2">
                <span className="font-mono">→</span>
                <button onClick={() => rm(i)} className={`${d.color} brutal-border px-3 py-2 font-mono text-xs uppercase`}>{d.label} ✕</button>
              </div>
            );
          })}
          <span className="font-mono">→</span>
          <div className="brutal-border bg-ink text-bone px-3 py-2 font-mono text-xs">OUT</div>
        </div>
        <p className="font-mono text-xs uppercase opacity-70 mt-2">Order matters: EQ → Comp is different than Comp → EQ.</p>
      </div>
    </div>
  );
}
