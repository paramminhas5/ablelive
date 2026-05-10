// SidechainSim — kick triggers a real ducking compressor on a pad.
// Visualises gain reduction synced to the kick.
import { useEffect, useRef, useState } from "react";
import { getCtx, getMaster, midiToFreq, playKick, playTone } from "@/lib/audio";

const BPM = 100;
const BEAT = 60 / BPM;

export function SidechainSim() {
  const [playing, setPlaying] = useState(false);
  const [sc, setSc] = useState(true);
  const [amount, setAmount] = useState(0.85); // 0..1 duck depth
  const [release, setRelease] = useState(0.18);
  const [gr, setGr] = useState(0);
  const [kickFlash, setKickFlash] = useState(0);
  const historyRef = useRef<number[]>(new Array(120).fill(1));
  const [, force] = useState(0);
  const padGainRef = useRef<GainNode | null>(null);
  const stopRef = useRef<(() => void) | null>(null);
  const rafRef = useRef<number>(0);

  const stop = () => {
    stopRef.current?.();
    stopRef.current = null;
    cancelAnimationFrame(rafRef.current);
    setPlaying(false);
  };

  const play = () => {
    const c = getCtx(); if (!c) return;
    const dest = getMaster();
    const padGain = c.createGain(); padGain.gain.value = 1; padGain.connect(dest);
    padGainRef.current = padGain;
    let stopped = false;
    let next = c.currentTime + 0.15;
    const tick = () => {
      if (stopped) return;
      while (next < c.currentTime + 0.4) {
        // kick on every beat
        for (let b = 0; b < 4; b++) {
          const t = next + b * BEAT;
          playKick(t - c.currentTime, dest);
          // schedule the LED flash to fire at the kick time
          const ms = (t - c.currentTime) * 1000;
          setTimeout(() => setKickFlash(Date.now()), Math.max(0, ms));
          // schedule sidechain duck if enabled
          if (sc) {
            const g = padGain.gain;
            g.cancelScheduledValues(t);
            g.setValueAtTime(g.value, t);
            g.linearRampToValueAtTime(1 - amount, t + 0.01);
            g.linearRampToValueAtTime(1, t + 0.01 + release);
          }
        }
        // pad chord on bar
        [60, 64, 67].forEach((n) =>
          playTone(midiToFreq(n), next - c.currentTime, BEAT * 4 * 0.95, "sawtooth", 0.12, padGain),
        );
        next += BEAT * 4;
      }
      const grVal = (1 - padGain.gain.value);
      setGr(grVal);
      // push to scrolling history
      const h = historyRef.current;
      h.push(padGain.gain.value);
      if (h.length > 120) h.shift();
      force((x) => (x + 1) % 1000);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    stopRef.current = () => { stopped = true; try { padGain.disconnect(); } catch {} };
    setPlaying(true);
  };

  useEffect(() => () => stop(), []);

  return (
    <div className="space-y-3">
      <div className="brutal-border bg-ink text-bone p-3 flex flex-wrap items-center gap-3">
        <button onClick={() => playing ? stop() : play()}
          className={`brutal-border px-4 py-2 font-display text-lg brutal-press ${playing ? "bg-hot text-bone" : "bg-acid text-ink"}`}>
          {playing ? "■ STOP" : "▶ PLAY"}
        </button>
        <button onClick={() => setSc((s) => !s)}
          className={`brutal-border px-3 py-2 font-mono text-xs uppercase ${sc ? "bg-volt text-bone" : "bg-bone text-ink"}`}>
          SIDECHAIN: {sc ? "ON" : "OFF"}
        </button>
        <button onClick={() => { setAmount(1); setRelease(0.35); }}
          className="brutal-border bg-sun px-3 py-2 font-mono text-xs uppercase brutal-press">
          BIG CONTRAST PRESET
        </button>
        <span className={`brutal-border px-3 py-2 font-mono text-xs uppercase transition-colors ${Date.now() - kickFlash < 80 ? "bg-hot text-bone" : "bg-bone text-ink"}`}>
          ● KICK
        </span>
        <label className="font-mono text-xs uppercase flex items-center gap-2">
          AMOUNT
          <input type="range" min={0} max={1} step={0.01} value={amount} onChange={(e) => setAmount(+e.target.value)} className="w-32" />
          <span className="w-10 text-right">{Math.round(amount * 100)}</span>
        </label>
        <label className="font-mono text-xs uppercase flex items-center gap-2">
          RELEASE
          <input type="range" min={0.02} max={0.6} step={0.01} value={release} onChange={(e) => setRelease(+e.target.value)} className="w-32" />
          <span className="w-12 text-right">{(release * 1000).toFixed(0)}ms</span>
        </label>
      </div>
      <div className="brutal-border bg-bone p-4">
        <div className="font-mono text-xs uppercase mb-2">PAD VOLUME (kick ducks it)</div>
        <div className="h-6 brutal-border bg-ink overflow-hidden">
          <div className="h-full bg-acid transition-none" style={{ width: `${(1 - gr) * 100}%` }} />
        </div>
        <div className="font-mono text-xs mt-2">Gain reduction: -{(gr * 24).toFixed(1)} dB</div>
        {/* Scrolling pad-level history — you can SEE the dips on every kick */}
        <div className="font-mono text-[10px] uppercase mt-3 opacity-70">PAD LEVEL — last 2s scrolling</div>
        <svg viewBox="0 0 240 60" className="w-full h-16 brutal-border bg-card mt-1">
          <polyline
            fill="none"
            stroke="#FF2E88"
            strokeWidth="2"
            points={historyRef.current.map((v, i) => `${(i / 120) * 240},${60 - v * 56 - 2}`).join(" ")}
          />
        </svg>
      </div>
      <p className="font-mono text-xs uppercase opacity-70">▶ Toggle sidechain off → kick & pad fight. On → pad ducks under each kick. That's the pump.</p>
    </div>
  );
}
