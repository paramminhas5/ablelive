import { useEffect, useRef, useState } from "react";
import { getCtx, getMaster, midiToFreq, playKick, playSnare, playHat, playTone } from "@/lib/audio";

const TRACKS = ["KICK", "SNARE", "VOX", "SYNTH"];
const RETURNS = [
  { id: "A", name: "RETURN A · REVERB", color: "bg-volt text-bone" },
  { id: "B", name: "RETURN B · DELAY", color: "bg-hot text-bone" },
];

export function RoutingPuzzleSim() {
  const [sends, setSends] = useState<Record<string, Record<string, number>>>(() => {
    const o: any = {};
    TRACKS.forEach((t) => { o[t] = { A: 0, B: 0 }; });
    return o;
  });
  const [muted, setMuted] = useState<Record<string, boolean>>({});
  const [soloed, setSoloed] = useState<Record<string, boolean>>({});
  const [playing, setPlaying] = useState(false);
  const sendsRef = useRef(sends); sendsRef.current = sends;
  const muteRef = useRef(muted); muteRef.current = muted;
  const soloRef = useRef(soloed); soloRef.current = soloed;
  const refs = useRef<{ trackGain: Record<string, GainNode>; sendA: Record<string, GainNode>; sendB: Record<string, GainNode>; retA: GainNode; retB: GainNode } | null>(null);

  useEffect(() => {
    if (!playing) return;
    const c = getCtx(); if (!c) return;
    const master = getMaster();
    // Returns: A reverb, B delay
    const conv = c.createConvolver();
    const len = 1.6 * c.sampleRate; const ir = c.createBuffer(2, len, c.sampleRate);
    for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2); }
    conv.buffer = ir;
    const retA = c.createGain(); retA.gain.value = 1; conv.connect(retA).connect(master);
    const dl = c.createDelay(1.5); dl.delayTime.value = 0.375;
    const fb = c.createGain(); fb.gain.value = 0.4; dl.connect(fb).connect(dl);
    const retB = c.createGain(); retB.gain.value = 1; dl.connect(retB).connect(master);

    const trackGain: any = {}, sendA: any = {}, sendB: any = {};
    TRACKS.forEach((t) => {
      trackGain[t] = c.createGain(); trackGain[t].gain.value = 0.7; trackGain[t].connect(master);
      sendA[t] = c.createGain(); sendA[t].gain.value = 0; trackGain[t].connect(sendA[t]); sendA[t].connect(conv);
      sendB[t] = c.createGain(); sendB[t].gain.value = 0; trackGain[t].connect(sendB[t]); sendB[t].connect(dl);
    });
    refs.current = { trackGain, sendA, sendB, retA, retB };

    let stopped = false;
    const bpm = 110, beat = 60 / bpm, bar = beat * 4;
    let next = c.currentTime + 0.2;
    const sched = (t: number) => {
      // KICK
      for (let b = 0; b < 4; b++) playKick(t + b * beat - c.currentTime, trackGain.KICK);
      // SNARE 2 & 4
      playSnare(t + beat - c.currentTime, trackGain.SNARE);
      playSnare(t + 3 * beat - c.currentTime, trackGain.SNARE);
      // VOX phrase
      [72, 76, 79, 76].forEach((n, i) => playTone(midiToFreq(n), t + i * beat - c.currentTime, beat * 0.6, "sine", 0.2, trackGain.VOX));
      // SYNTH
      [60, 64, 67, 72].forEach((n, i) => playTone(midiToFreq(n), t + i * beat - c.currentTime, beat * 0.5, "sawtooth", 0.12, trackGain.SYNTH));
    };
    const tick = () => {
      if (stopped) return;
      while (next < c.currentTime + 0.3) { sched(next); next += bar; }
      setTimeout(tick, 60);
    };
    tick();
    return () => {
      stopped = true;
      try { Object.values(trackGain).forEach((g: any) => g.disconnect()); } catch {}
      try { retA.disconnect(); retB.disconnect(); } catch {}
      refs.current = null;
    };
  }, [playing]);

  // apply send levels
  useEffect(() => {
    const r = refs.current; if (!r) return;
    TRACKS.forEach((t) => {
      r.sendA[t].gain.value = sends[t].A;
      r.sendB[t].gain.value = sends[t].B;
    });
  }, [sends]);

  // apply mute/solo
  useEffect(() => {
    const r = refs.current; if (!r) return;
    const anySolo = Object.values(soloed).some(Boolean);
    TRACKS.forEach((t) => {
      const audible = !muted[t] && (!anySolo || soloed[t]);
      r.trackGain[t].gain.value = audible ? 0.7 : 0;
    });
  }, [muted, soloed]);

  const set = (t: string, r: string, v: number) => setSends((s) => ({ ...s, [t]: { ...s[t], [r]: v } }));
  const applyTarget = () => {
    setSends({
      KICK:  { A: 0, B: 0 },
      SNARE: { A: 0, B: 0.4 },
      VOX:   { A: 0.7, B: 0 },
      SYNTH: { A: 0, B: 0 },
    });
  };
  const resetSends = () => {
    setSends({
      KICK: { A: 0, B: 0 }, SNARE: { A: 0, B: 0 }, VOX: { A: 0, B: 0 }, SYNTH: { A: 0, B: 0 },
    });
  };

  // Goal: VOX → Reverb high, SNARE → Delay medium, others 0
  const score = (() => {
    let s = 0;
    s += Math.abs(sends.VOX.A - 0.7);
    s += Math.abs(sends.SNARE.B - 0.4);
    s += sends.KICK.A + sends.KICK.B + sends.SYNTH.A + sends.SYNTH.B;
    return s;
  })();
  const solved = score < 0.4;

  return (
    <div className="space-y-3">
      <div className="flex gap-2 items-center">
        <button onClick={() => setPlaying((p) => !p)} className="brutal-border bg-acid px-4 py-2 font-mono uppercase brutal-press">
          {playing ? "■ Stop" : "▶ Play"}
        </button>
        <span className="font-mono text-xs uppercase opacity-70">Move sliders — hear reverb (A) & delay (B) appear.</span>
      </div>
      <div className="brutal-border bg-card p-3 font-mono text-xs uppercase">
        GOAL: Send VOX heavy to Reverb, Snare medium to Delay, Kick & Synth dry.
      </div>
      <div className="flex gap-2 flex-wrap">
        <button onClick={applyTarget} className="brutal-border bg-sun px-3 py-2 font-mono text-xs uppercase brutal-press">▶ HEAR TARGET MIX</button>
        <button onClick={resetSends} className="brutal-border bg-bone px-3 py-2 font-mono text-xs uppercase brutal-press">↺ RESET YOURS</button>
        <span className="font-mono text-xs uppercase opacity-60 self-center">Then reset and try to recreate it from memory.</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {TRACKS.map((t) => (
          <div key={t} className="brutal-border bg-card p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="font-display text-lg">{t}</div>
              <div className="flex gap-1">
                <button onClick={() => setMuted((m) => ({ ...m, [t]: !m[t] }))}
                  className={`brutal-border font-mono text-[10px] px-2 py-1 ${muted[t] ? "bg-hot text-bone" : "bg-bone"}`}>M</button>
                <button onClick={() => setSoloed((s) => ({ ...s, [t]: !s[t] }))}
                  className={`brutal-border font-mono text-[10px] px-2 py-1 ${soloed[t] ? "bg-acid" : "bg-bone"}`}>S</button>
              </div>
            </div>
            {RETURNS.map((r) => (
              <label key={r.id} className="flex items-center gap-2 mb-2 font-mono text-xs uppercase">
                <span className={`${r.color} brutal-border px-2 py-1 w-40`}>{r.name}</span>
                <input type="range" min={0} max={1} step={0.05} value={sends[t][r.id]} onChange={(e) => set(t, r.id, +e.target.value)} className="flex-1" />
                <span className="brutal-border bg-bone px-2 py-1 w-12 text-center">{Math.round(sends[t][r.id] * 100)}</span>
              </label>
            ))}
          </div>
        ))}
      </div>
      <div className={`brutal-border px-3 py-2 font-mono uppercase inline-block ${solved ? "bg-acid" : "bg-hot text-bone"}`}>
        {solved ? "ROUTING SOLVED" : "KEEP TWEAKING"} · score {score.toFixed(2)}
      </div>
    </div>
  );
}
