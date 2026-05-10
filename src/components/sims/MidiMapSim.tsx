import { useEffect, useRef, useState } from "react";
import { getCtx, getMaster, midiToFreq, playTone } from "@/lib/audio";

export function MidiMapSim() {
  const [mapping, setMapping] = useState<{ param: string | null; min: number; max: number; cc: number }>({ param: null, min: 0, max: 100, cc: 0 });
  const [knob, setKnob] = useState(0);
  const [playing, setPlaying] = useState(false);
  const params = ["Filter Cutoff", "Reverb Wet", "Delay Feedback", "Volume"];
  const value = mapping.param ? mapping.min + (knob / 127) * (mapping.max - mapping.min) : null;

  // audio chain: source -> filter -> delay(fb) -> reverb(wet) -> volume -> master
  const refs = useRef<{ filter: BiquadFilterNode; delay: DelayNode; fb: GainNode; revWet: GainNode; vol: GainNode } | null>(null);

  useEffect(() => {
    if (!playing) return;
    const c = getCtx(); if (!c) return;
    const filter = c.createBiquadFilter(); filter.type = "lowpass"; filter.frequency.value = 1500; filter.Q.value = 4;
    const delay = c.createDelay(1.0); delay.delayTime.value = 0.28;
    const fb = c.createGain(); fb.gain.value = 0.2;
    delay.connect(fb).connect(delay);
    const conv = c.createConvolver();
    const len = 1.5 * c.sampleRate;
    const ir = c.createBuffer(2, len, c.sampleRate);
    for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.2); }
    conv.buffer = ir;
    const revWet = c.createGain(); revWet.gain.value = 0.2;
    const vol = c.createGain(); vol.gain.value = 0.6;
    filter.connect(delay); filter.connect(vol);
    delay.connect(vol); delay.connect(conv); conv.connect(revWet).connect(vol);
    vol.connect(getMaster());
    refs.current = { filter, delay, fb, revWet, vol };

    let stopped = false;
    const bpm = 110, beat = 60 / bpm;
    const pat = [60, 64, 67, 72, 67, 64];
    let i = 0; let next = c.currentTime + 0.2;
    const tick = () => {
      if (stopped) return;
      while (next < c.currentTime + 0.3) {
        playTone(midiToFreq(pat[i % pat.length]), next - c.currentTime, beat * 0.9, "sawtooth", 0.2, filter);
        i++; next += beat;
      }
      setTimeout(tick, 60);
    };
    tick();
    return () => {
      stopped = true;
      try { vol.disconnect(); } catch {}
      refs.current = null;
    };
  }, [playing]);

  // Apply mapped value to actual audio param
  useEffect(() => {
    const r = refs.current; if (!r || !mapping.param || value == null) return;
    const norm = (value - mapping.min) / Math.max(0.0001, (mapping.max - mapping.min));
    if (mapping.param === "Filter Cutoff") r.filter.frequency.value = 100 + norm * 7000;
    if (mapping.param === "Reverb Wet")    r.revWet.gain.value = norm * 0.8;
    if (mapping.param === "Delay Feedback") r.fb.gain.value = norm * 0.85;
    if (mapping.param === "Volume")        r.vol.gain.value = norm;
  }, [knob, mapping, value]);

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="brutal-border bg-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-display text-xl">MIDI CONTROLLER</h4>
          <button onClick={() => setPlaying((p) => !p)} className="brutal-border bg-acid px-3 py-1 font-mono text-xs uppercase brutal-press">
            {playing ? "■" : "▶ PLAY"}
          </button>
        </div>
        <input type="range" min={0} max={127} value={knob} onChange={(e) => setKnob(+e.target.value)} className="w-full" />
        <div className="font-mono text-xs">CC #{mapping.cc} VALUE: {knob}</div>
      </div>
      <div className="brutal-border bg-card p-4 space-y-3">
        <h4 className="font-display text-xl">PARAMETERS</h4>
        <div className="flex flex-wrap gap-2">
          {params.map((p) => (
            <button key={p} onClick={() => setMapping({ ...mapping, param: p })}
              className={`brutal-border px-2 py-1 font-mono text-xs uppercase ${mapping.param === p ? "bg-acid" : "bg-bone"}`}>
              {p}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          <label className="font-mono text-xs uppercase block">MIN
            <input type="range" min={0} max={100} value={mapping.min} onChange={(e) => setMapping({ ...mapping, min: +e.target.value })} className="w-full" />
            <span>{mapping.min}</span>
          </label>
          <label className="font-mono text-xs uppercase block">MAX
            <input type="range" min={0} max={100} value={mapping.max} onChange={(e) => setMapping({ ...mapping, max: +e.target.value })} className="w-full" />
            <span>{mapping.max}</span>
          </label>
        </div>
        {mapping.param && (
          <div className="brutal-border bg-acid p-2 font-mono text-xs uppercase">
            {mapping.param} = {value!.toFixed(1)}
          </div>
        )}
      </div>
    </div>
  );
}
