// ChordStackerSim — pick root + quality, see chord tones on a keyboard, hear them.
import { useState } from "react";
import { getMaster, triggerSample } from "@/lib/audio";

const NOTES = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
const QUALITIES: Record<string, number[]> = {
  "Major":      [0,4,7],
  "Minor":      [0,3,7],
  "Diminished": [0,3,6],
  "Augmented":  [0,4,8],
  "Sus4":       [0,5,7],
  "Maj7":       [0,4,7,11],
  "Min7":       [0,3,7,10],
  "Dom7":       [0,4,7,10],
  "Maj9":       [0,4,7,11,14],
};

export function ChordStackerSim() {
  const [root, setRoot] = useState(0);
  const [quality, setQuality] = useState<keyof typeof QUALITIES>("Major");

  const tones = QUALITIES[quality].map((iv) => (root + iv) % 12);
  const chordName = `${NOTES[root]} ${quality}`;

  const playChord = () => {
    const ctx = getMaster();
    if (!ctx) return;
    QUALITIES[quality].forEach((iv, i) => {
      setTimeout(() => triggerSample("piano-c", ctx, 0.4, Math.pow(2, (root + iv) / 12)), i * 10);
    });
  };

  const keys = Array.from({ length: 24 }, (_, i) => i);
  return (
    <div className="space-y-3">
      <div className="brutal-border bg-ink text-bone p-3 flex flex-wrap gap-3 items-center">
        <label className="font-mono text-[10px] uppercase flex items-center gap-2">
          ROOT
          <select value={root} onChange={(e) => setRoot(+e.target.value)} className="brutal-border bg-bone text-ink px-2 py-1 text-xs">
            {NOTES.map((n, i) => <option key={n} value={i}>{n}</option>)}
          </select>
        </label>
        <label className="font-mono text-[10px] uppercase flex items-center gap-2">
          QUALITY
          <select value={quality} onChange={(e) => setQuality(e.target.value as keyof typeof QUALITIES)} className="brutal-border bg-bone text-ink px-2 py-1 text-xs">
            {Object.keys(QUALITIES).map((q) => <option key={q}>{q}</option>)}
          </select>
        </label>
        <button onClick={playChord} className="brutal-border bg-acid text-ink px-3 py-1 font-mono text-[10px] uppercase brutal-press">▶ STRUM</button>
        <span className="ml-auto font-display text-lg">{chordName}</span>
      </div>

      <div className="brutal-border bg-bone p-3 flex gap-0.5">
        {keys.map((n) => {
          const pc = n % 12;
          const isBlack = [1,3,6,8,10].includes(pc);
          const lit = tones.includes(pc);
          return (
            <div key={n}
              className={`brutal-border ${isBlack ? "h-16 w-6 bg-ink text-bone" : "h-24 w-8 bg-bone text-ink"} ${lit ? (isBlack ? "!bg-volt" : "!bg-acid") : ""} flex flex-col items-end justify-end p-1 font-mono text-[8px]`}>
              {pc === root ? "R" : ""}
            </div>
          );
        })}
      </div>
      <p className="font-mono text-[10px] uppercase opacity-70">▸ A chord = root + intervals stacked above. Switch quality and watch the upper notes shift.</p>
    </div>
  );
}
