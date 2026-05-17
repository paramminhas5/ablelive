// SubtractiveSynthSim — osc + filter + amp envelope, click keys to trigger.
import { useRef, useState } from "react";
import { getCtx, getMaster } from "@/lib/audio";

type Wave = "sawtooth" | "square" | "triangle" | "sine";

export function SubtractiveSynthSim() {
  const [wave, setWave] = useState<Wave>("sawtooth");
  const [cutoff, setCutoff] = useState(1200);
  const [reso, setReso] = useState(5);
  const [atk, setAtk] = useState(0.01);
  const [rel, setRel] = useState(0.4);

  const note = (semi: number) => {
    const ctx = getCtx(); if (!ctx) return;
    if (ctx.state !== "running") ctx.resume().catch(() => {});
    const t = ctx.currentTime;
    const freq = 261.63 * Math.pow(2, semi / 12);
    const osc = ctx.createOscillator(); osc.type = wave; osc.frequency.value = freq;
    const filt = ctx.createBiquadFilter(); filt.type = "lowpass"; filt.frequency.value = cutoff; filt.Q.value = reso;
    const amp = ctx.createGain(); amp.gain.value = 0;
    osc.connect(filt).connect(amp).connect(getMaster());
    amp.gain.linearRampToValueAtTime(0.4, t + atk);
    amp.gain.linearRampToValueAtTime(0, t + atk + rel);
    osc.start(t); osc.stop(t + atk + rel + 0.05);
  };

  const Knob = ({ label, value, set, min, max, step }: { label: string; value: number; set: (n: number) => void; min: number; max: number; step?: number }) => (
    <label className="font-mono text-[10px] uppercase flex flex-col items-center gap-1">
      {label}
      <input type="range" min={min} max={max} step={step ?? 1} value={value} onChange={(e) => set(+e.target.value)} className="w-20" />
      <span>{value}</span>
    </label>
  );

  return (
    <div className="space-y-3">
      <div className="brutal-border bg-ink text-bone p-3 flex flex-wrap gap-4 items-center">
        <label className="font-mono text-[10px] uppercase flex items-center gap-2">
          OSC
          <select value={wave} onChange={(e) => setWave(e.target.value as Wave)} className="brutal-border bg-bone text-ink px-2 py-1 text-xs">
            <option value="sawtooth">Saw</option><option value="square">Square</option><option value="triangle">Tri</option><option value="sine">Sine</option>
          </select>
        </label>
        <Knob label="CUTOFF" value={cutoff} set={setCutoff} min={80} max={8000} step={20} />
        <Knob label="RES"    value={reso}   set={setReso}   min={0}  max={20} />
        <Knob label="ATK"    value={Math.round(atk*1000)} set={(v)=>setAtk(v/1000)} min={1}  max={500} />
        <Knob label="REL"    value={Math.round(rel*1000)} set={(v)=>setRel(v/1000)} min={50} max={2000} step={10} />
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
      <p className="font-mono text-[10px] uppercase opacity-70">▸ Subtractive synthesis: pick a bright waveform, then carve it with the filter.</p>
    </div>
  );
}
