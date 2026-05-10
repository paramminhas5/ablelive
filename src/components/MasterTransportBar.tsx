// Master bar — audio unlock prompt ONLY.
// Each device / sim owns its own play button & audio path; no shared transport.
import { useEffect, useState } from 'react';
import { getCtx, isAudioUnlocked, onAudioUnlocked } from '@/lib/audio';

export function MasterTransportBar() {
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    setUnlocked(isAudioUnlocked());
    return onAudioUnlocked(() => setUnlocked(true));
  }, []);

  const enable = async () => {
    const c = getCtx();
    if (c && c.state === 'suspended') { try { await c.resume(); } catch {} }
    setUnlocked(isAudioUnlocked());
  };

  if (unlocked) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-hot text-bone brutal-border border-x-0 border-b-0 p-3 flex items-center justify-between gap-3">
      <div className="font-mono text-[11px] uppercase">🎧 Headphones recommended — click to enable audio (each device & sim has its own ▶ play button)</div>
      <button onClick={enable} className="brutal-border bg-acid text-ink px-4 py-2 font-display brutal-press">▶ ENABLE AUDIO</button>
    </div>
  );
}
