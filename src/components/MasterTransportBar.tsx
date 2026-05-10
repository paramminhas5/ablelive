// Master status bar — audio unlock + master volume only. NO playback here.
// All actual sound comes from per-module players (SourceBar inside DeviceLab and sims).
import { useEffect, useState } from 'react';
import { getCtx, isAudioUnlocked, onAudioUnlocked, setMasterVolume } from '@/lib/audio';

export function MasterTransportBar() {
  const [unlocked, setUnlocked] = useState(false);
  const [vol, setVol] = useState(0.8);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    setUnlocked(isAudioUnlocked());
    return onAudioUnlocked(() => setUnlocked(true));
  }, []);

  const enable = async () => {
    const c = getCtx();
    if (c && c.state === 'suspended') { try { await c.resume(); } catch {} }
    setUnlocked(isAudioUnlocked());
  };

  if (!unlocked) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-hot text-bone brutal-border border-x-0 border-b-0 p-3 flex items-center justify-between gap-3">
        <div className="font-mono text-[11px] uppercase">🎧 Headphones recommended — click to enable audio (each device & sim has its own ▶ play button)</div>
        <button onClick={enable} className="brutal-border bg-acid text-ink px-4 py-2 font-display brutal-press">▶ ENABLE AUDIO</button>
      </div>
    );
  }

  if (hidden) {
    return (
      <button onClick={() => setHidden(false)}
        className="fixed bottom-3 right-3 z-50 brutal-border bg-ink text-bone px-3 py-1 font-mono text-[10px] brutal-press">
        ♪ AUDIO
      </button>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-ink text-bone brutal-border border-x-0 border-b-0">
      <div className="max-w-7xl mx-auto px-3 py-1.5 flex items-center gap-3">
        <span className="font-mono text-[10px] uppercase text-acid">◆ AUDIO READY</span>
        <span className="font-mono text-[10px] uppercase opacity-70 hidden sm:inline">play sounds inside each device / sim →</span>
        <label className="font-mono text-[10px] uppercase flex items-center gap-2 ml-auto">
          MASTER
          <input type="range" min={0} max={1} step={0.01} value={vol}
            onChange={(e) => { const v = +e.target.value; setVol(v); setMasterVolume(v); }}
            className="w-24" />
        </label>
        <button onClick={() => setHidden(true)}
          className="brutal-border bg-bone text-ink px-2 py-0.5 font-mono text-[10px]">— HIDE</button>
      </div>
    </div>
  );
}
