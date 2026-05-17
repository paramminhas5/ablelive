// FilterEnvelopeSim — ADSR-controlled lowpass cutoff. Click keys to play.
// Original implementation.
import { useEffect, useRef, useState } from "react";
import { getCtx, getMaster } from "@/lib/audio";

export function FilterEnvelopeSim() {
  const [atk, setAtk] = useState(0.02);
  const [dec, setDec] = useState(0.4);
  const [sus, setSus] = useState(0.3); // 0..1
  const [rel, setRel] = useState(0.5);
  const [base, setBase] = useState(200); // Hz
  const [amount, setAmount] = useState(4000); // Hz added at peak
  const [reso, setReso] = useState(8);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // draw the envelope curve
  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const g = c.getContext("2d"); if (!g) return;
    const W = c.width, H = c.height;
    g.fillStyle = "#0a0a0a"; g.fillRect(0, 0, W, H);
    const total = atk + dec + 0.6 + rel; // include held sustain time
    const scale = W / total;
    const yFor = (v: number) => H - 6 - v * (H - 12);
    g.strokeStyle = "#ff3366"; g.lineWidth = 2; g.beginPath();
    g.moveTo(0, yFor(0));
    g.lineTo(atk * scale, yFor(1));
    g.lineTo((atk + dec) * scale, yFor(sus));
    g.lineTo((atk + dec + 0.6) * scale, yFor(sus));
    g.lineTo((atk + dec + 0.6 + rel) * scale, yFor(0));
    g.stroke();
    // labels
    g.fillStyle = "#888"; g.font = "10px monospace";
    g.fillText("A", atk * scale * 0.4, 12);
    g.fillText("D", (atk + dec * 0.4) * scale, 12);
    g.fillText("S", (atk + dec + 0.2) * scale, 12);
    g.fillText("R", (atk + dec + 0.6 + rel * 0.4) * scale, 12);
  }, [atk, dec, sus, rel]);

  const note = (semi: number) => {
    const ctx = getCtx(); if (!ctx) return;
    if (ctx.state !== "running") ctx.resume().catch(() => {});
    const t = ctx.currentTime;
    const freq = 130.81 * Math.pow(2, semi / 12);
    const osc = ctx.createOscillator(); osc.type = "sawtooth"; osc.frequency.value = freq;
    const filt = ctx.createBiquadFilter(); filt.type = "lowpass"; filt.Q.value = reso;
    filt.frequency.setValueAtTime(base, t);
    filt.frequency.linearRampToValueAtTime(base + amount, t + atk);
    filt.frequency.linearRampToValueAtTime(base + amount * sus, t + atk + dec);
    filt.frequency.setValueAtTime(base + amount * sus, t + atk + dec + 0.6);
    filt.frequency.linearRampToValueAtTime(base, t + atk + dec + 0.6 + rel);
    const amp = ctx.createGain();
    amp.gain.setValueAtTime(0, t);
    amp.gain.linearRampToValueAtTime(0.35, t + 0.005);
    amp.gain.setValueAtTime(0.35, t + atk + dec + 0.6);
    amp.gain.linearRampToValueAtTime(0, t + atk + dec + 0.6 + rel);
    osc.connect(filt).connect(amp).connect(getMaster());
    osc.start(t); osc.stop(t + atk + dec + 0.6 + rel + 0.05);
  };

  const Knob = ({ label, value, set, min, max, step, unit }: { label: string; value: number; set: (n: number) => void; min: number; max: number; step?: number; unit?: string }) => (
    <label className="font-mono text-[10px] uppercase flex flex-col items-center gap-1">
      {label}
      <input type="range" min={min} max={max} step={step ?? 1} value={value} onChange={(e) => set(+e.target.value)} className="w-20" />
      <span>{value}{unit}</span>
    </label>
  );

  return (
    <div className="space-y-3">
      <div className="brutal-border bg-ink text-bone p-3 space-y-3">
        <canvas ref={canvasRef} width={560} height={90} className="w-full brutal-border bg-bone" />
        <div className="flex flex-wrap gap-3">
          <Knob label="ATK ms" value={Math.round(atk * 1000)} set={(v) => setAtk(v / 1000)} min={1} max={1000} />
          <Knob label="DEC ms" value={Math.round(dec * 1000)} set={(v) => setDec(v / 1000)} min={10} max={2000} />
          <Knob label="SUS %"  value={Math.round(sus * 100)} set={(v) => setSus(v / 100)} min={0} max={100} />
          <Knob label="REL ms" value={Math.round(rel * 1000)} set={(v) => setRel(v / 1000)} min={10} max={3000} />
          <Knob label="BASE Hz" value={base} set={setBase} min={60} max={2000} step={20} />
          <Knob label="ENV →" value={amount} set={setAmount} min={0} max={8000} step={100} />
          <Knob label="RES" value={reso} set={setReso} min={0} max={20} />
        </div>
      </div>
      <div className="brutal-border bg-bone p-3 flex gap-0.5">
        {Array.from({ length: 13 }).map((_, i) => {
          const isBlack = [1,3,6,8,10].includes(i);
          return (
            <button key={i} onMouseDown={() => note(i)}
              className={`brutal-border ${isBlack ? "h-16 w-7 bg-ink text-bone" : "h-24 w-10 bg-bone text-ink"} brutal-press`} />
          );
        })}
      </div>
      <p className="font-mono text-[10px] uppercase opacity-70">▸ The envelope opens the filter on attack, settles at sustain, closes on release. Big ENV + short DEC = the classic synth pluck.</p>
    </div>
  );
}
