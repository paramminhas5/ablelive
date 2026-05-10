import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Simulator } from "@/components/sims/Simulator";
import { DeviceChainSim } from "@/components/sims/DeviceChainSim";
import type { SimType } from "@/content/types";

export const Route = createFileRoute("/playground")({
  head: () => ({ meta: [
    { title: "Workbench — ABLETON.SCHOOL" },
    { name: "description", content: "Build chains, run sims, and learn Live by ear in one place." },
  ]}),
  component: Workbench,
});

const SAMPLES: { id: SampleName; label: string }[] = [
  { id: "drum-loop", label: "DRUMS" },
  { id: "bass-loop", label: "BASS" },
  { id: "chord-pad", label: "CHORDS" },
  { id: "vox-chop", label: "VOX" },
  { id: "full-mix", label: "FULL MIX" },
];

const CATS = ["EQ", "DYNAMICS", "DRIVE", "FILTER", "MOD", "TIME"] as const;

type ChainSlot = { slug: string; node: DeviceNode };

type TabId = "chain" | SimType;
const SIM_TABS: { id: SimType; label: string }[] = [
  { id: "sidechain", label: "Sidechain" },
  { id: "send-return", label: "Sends/Returns" },
  { id: "drum-pad", label: "Drum Rack" },
  { id: "piano-roll", label: "Piano Roll" },
  { id: "mixer", label: "Mixer" },
  { id: "device-chain", label: "Device Chain" },
  { id: "warp-lab", label: "Warp Lab" },
  { id: "knob-trainer", label: "Knob Trainer" },
  { id: "session-grid", label: "Session Grid" },
  { id: "arrangement", label: "Arrangement" },
  { id: "routing-puzzle", label: "Routing" },
  { id: "midi-map", label: "MIDI Map" },
  { id: "ear-training", label: "Ear Training" },
  { id: "midi-vs-audio", label: "MIDI vs Audio" },
  { id: "interface-tour", label: "Interface" },
  { id: "browser-tour", label: "Browser" },
];

function Workbench() {
  const [tab, setTab] = useState<TabId>("chain");
  const [chain, setChain] = useState<ChainSlot[]>([]);
  const [sample, setSample] = useState<SampleName>("drum-loop");
  const [bpm, setBpm] = useState(100);
  const [playing, setPlaying] = useState(false);
  const [savedNames, setSavedNames] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [trayOpen, setTrayOpen] = useState(false);

  const sourceRef = useRef<SourceHandle | null>(null);
  const engineRef = useRef<DeviceEngine | null>(null);

  // Persist saved chain names
  useEffect(() => {
    try {
      const raw = localStorage.getItem("workbench:index");
      if (raw) setSavedNames(JSON.parse(raw));
    } catch {}
  }, []);

  // Build the audio graph ONCE. Source → engine.input → ... → master.
  // The engine handles all rewiring atomically with a ducked mix to prevent clicks.
  useEffect(() => {
    const c = getCtx(); if (!c) return;
    const src = createSource(sample, bpm);
    const engine = new DeviceEngine();
    // Force wet path on (engine defaults to wet=1, dry=0 — perfect)
    src.source.connect(engine.input);
    engineRef.current = engine;
    sourceRef.current = src;
    setAnalyser(engine.analyserOut);
    return () => {
      try { src.stop(); src.source.disconnect(); } catch {}
      try { engine.dispose(); } catch {}
      engineRef.current = null;
      sourceRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Rewire chain via engine.setChain — atomic, ducked, no source orphaning.
  useEffect(() => {
    const eng = engineRef.current; if (!eng) return;
    eng.setChain(chain.map((s) => s.node));
  }, [chain]);

  const togglePlay = async () => {
    const c = getCtx(); if (!c) return;
    if (c.state !== "running") { try { await c.resume(); } catch {} }
    const src = sourceRef.current; if (!src) return;
    if (src.isPlaying()) { src.stop(); setPlaying(false); }
    else { src.start(); setPlaying(true); }
  };

  const changeSample = (s: SampleName) => { setSample(s); sourceRef.current?.setSample(s); };
  const changeBpm = (b: number) => { setBpm(b); sourceRef.current?.setBpm(b); };

  const addDevice = (slug: string) => {
    const def = DEVICES.find((d) => d.slug === slug); if (!def) return;
    let node: DeviceNode;
    try { node = def.factory(); } catch { return; }
    // Apply defaults BEFORE wiring so first frame is silent-safe.
    def.params.forEach((p) => { try { node.set(p.id, p.kind === "knob" ? p.default : (p.default as string)); } catch {} });
    setChain((c) => [...c, { slug, node }]);
  };
  const removeAt = (i: number) => {
    setChain((c) => {
      const removed = c[i];
      try { removed.node.input.disconnect(); removed.node.output.disconnect(); } catch {}
      try { removed.node.dispose(); } catch {}
      return c.filter((_, idx) => idx !== i);
    });
  };
  const move = (i: number, dir: -1 | 1) => {
    setChain((c) => {
      const j = i + dir; if (j < 0 || j >= c.length) return c;
      const next = c.slice(); [next[i], next[j]] = [next[j], next[i]]; return next;
    });
  };
  const clear = () => {
    chain.forEach((s) => { try { s.node.input.disconnect(); s.node.output.disconnect(); } catch {} try { s.node.dispose(); } catch {} });
    setChain([]);
  };

  const save = () => {
    if (!name.trim()) return;
    const slugs = chain.map((s) => s.slug);
    try {
      localStorage.setItem(`workbench:chain:${name}`, JSON.stringify(slugs));
      const idx = Array.from(new Set([...(savedNames), name]));
      localStorage.setItem("workbench:index", JSON.stringify(idx));
      setSavedNames(idx);
    } catch {}
  };
  const load = (n: string) => {
    try {
      const raw = localStorage.getItem(`workbench:chain:${n}`);
      if (!raw) return;
      const slugs: string[] = JSON.parse(raw);
      clear();
      setTimeout(() => slugs.forEach(addDevice), 30);
      setName(n);
    } catch {}
  };
  const del = (n: string) => {
    try {
      localStorage.removeItem(`workbench:chain:${n}`);
      const idx = savedNames.filter((x) => x !== n);
      localStorage.setItem("workbench:index", JSON.stringify(idx));
      setSavedNames(idx);
    } catch {}
  };

  const grouped = useMemo(() => {
    const m: Record<string, typeof DEVICES> = {};
    CATS.forEach((c) => m[c] = []);
    DEVICES.forEach((d) => { (m[d.category] ||= []).push(d); });
    return m;
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-3 md:p-12 space-y-4 md:space-y-6">
      <header>
        <h1 className="text-3xl sm:text-5xl md:text-7xl">// WORKBENCH</h1>
        <p className="font-mono text-xs uppercase opacity-70 mt-2">One transport. Build chains, run sims, learn by ear.</p>
      </header>

      {/* Transport */}
      <div className="brutal-border bg-ink text-bone p-3 flex flex-wrap gap-3 items-center">
        <button onClick={togglePlay} aria-label={playing ? "Stop" : "Play"}
          className={`brutal-border px-5 py-3 font-display text-xl brutal-press ${playing ? "bg-hot text-bone" : "bg-acid text-ink"}`}>
          {playing ? "■ STOP" : "▶ PLAY"}
        </button>
        <div className="flex gap-1 flex-wrap">
          {SAMPLES.map((s) => (
            <button key={s.id} onClick={() => changeSample(s.id)} aria-pressed={sample === s.id}
              className={`brutal-border px-2.5 py-1.5 font-mono text-[11px] uppercase ${sample === s.id ? "bg-acid text-ink" : "bg-bone text-ink"}`}>
              {s.label}
            </button>
          ))}
        </div>
        <label className="font-mono text-[11px] uppercase flex items-center gap-2 ml-auto">
          BPM
          <input type="range" min={60} max={180} value={bpm} onChange={(e) => changeBpm(+e.target.value)} className="w-24" aria-label="BPM" />
          <span className="brutal-border bg-bone text-ink px-2 py-0.5 min-w-[40px] text-center">{bpm}</span>
        </label>
      </div>

      {/* Tab bar — horizontally scrollable on mobile */}
      <div className="brutal-border bg-card p-2 flex gap-1 overflow-x-auto whitespace-nowrap scrollbar-thin">
        <TabBtn id="chain" tab={tab} setTab={setTab} label="CHAIN" />
        {SIM_TABS.map((t) => (
          <TabBtn key={t.id} id={t.id} tab={tab} setTab={setTab} label={t.label.toUpperCase()} />
        ))}
      </div>

      {tab === "chain" ? (
        <div className="grid grid-cols-1 lg:grid-cols-[260px,1fr,260px] gap-3 md:gap-4">
          {/* Mobile tray toggle */}
          <button onClick={() => setTrayOpen((o) => !o)}
            className="lg:hidden brutal-border bg-acid px-3 py-2 font-mono text-xs uppercase brutal-press text-left">
            {trayOpen ? "▼" : "▶"} DEVICE TRAY ({DEVICES.length})
          </button>

          {/* Left rail — device tray */}
          <aside className={`brutal-border bg-card p-3 space-y-3 max-h-[60vh] lg:max-h-[70vh] overflow-y-auto ${trayOpen ? "block" : "hidden lg:block"}`}>
            <div className="font-mono text-xs uppercase">DEVICE TRAY</div>
            {CATS.map((cat) => (
              <div key={cat}>
                <div className="font-mono text-[10px] uppercase opacity-60 mt-2 mb-1">{cat}</div>
                <div className="flex flex-wrap gap-1">
                  {grouped[cat].map((d) => (
                    <button key={d.slug} onClick={() => addDevice(d.slug)}
                      className="brutal-border bg-bone px-2 py-1 font-mono text-[10px] uppercase brutal-press hover:bg-acid"
                      aria-label={`Add ${d.name} to chain`}>
                      + {d.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </aside>

          {/* Center — chain */}
          <main className="space-y-3">
            <div className="brutal-border bg-card p-4 min-h-[200px]">
              <div className="font-mono text-xs uppercase mb-3">SIGNAL CHAIN — SOURCE → … → MASTER</div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="brutal-border bg-ink text-bone px-3 py-2 font-mono text-xs">SOURCE</span>
                {chain.length === 0 && (
                  <span className="font-mono text-xs opacity-60">Add devices from the tray →</span>
                )}
                {chain.map((s, i) => {
                  const def = DEVICES.find((d) => d.slug === s.slug)!;
                  return (
                    <div key={i} className="flex items-center gap-1">
                      <span className="font-mono">→</span>
                      <div className="brutal-border bg-acid p-2 flex flex-col items-center gap-1">
                        <span className="font-mono text-[10px] uppercase">{def.name}</span>
                        <div className="flex gap-1">
                          <button onClick={() => move(i, -1)} className="brutal-border bg-bone px-1 text-[10px]" aria-label="Move left">◀</button>
                          <button onClick={() => move(i, 1)} className="brutal-border bg-bone px-1 text-[10px]" aria-label="Move right">▶</button>
                          <button onClick={() => removeAt(i)} className="brutal-border bg-hot text-bone px-1 text-[10px]" aria-label="Remove">✕</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <span className="font-mono">→</span>
                <span className="brutal-border bg-volt text-bone px-3 py-2 font-mono text-xs">MASTER</span>
              </div>
              {chain.length > 0 && (
                <button onClick={clear} className="mt-3 brutal-border bg-bone px-3 py-1 font-mono text-[10px] uppercase brutal-press">CLEAR ALL</button>
              )}
            </div>

            <div className="brutal-border bg-card p-3 flex flex-wrap items-center gap-2">
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Chain name…"
                className="brutal-border bg-bone px-2 py-1 font-mono text-xs flex-1 min-w-[140px]" />
              <button onClick={save} disabled={!name.trim() || chain.length === 0}
                className="brutal-border bg-acid px-3 py-1 font-mono text-xs uppercase brutal-press disabled:opacity-40">SAVE</button>
              <div className="flex flex-wrap gap-1">
                {savedNames.map((n) => (
                  <span key={n} className="brutal-border bg-bone flex items-center">
                    <button onClick={() => load(n)} className="px-2 py-1 font-mono text-[10px] uppercase">{n}</button>
                    <button onClick={() => del(n)} className="bg-hot text-bone px-1 text-[10px]" aria-label={`Delete ${n}`}>✕</button>
                  </span>
                ))}
              </div>
            </div>

            <div className="brutal-border bg-sun p-3 font-mono text-xs">
              <div className="uppercase mb-1 font-bold">▸ CHALLENGES</div>
              <ul className="space-y-1">
                <li>1. Lo-fi vox: VOX → Saturator → Auto Filter → Reverb.</li>
                <li>2. Punchy drums: DRUMS → EQ Eight → Drum Buss → Glue Compressor.</li>
                <li>3. Dub vibes: CHORDS → Echo (high feedback) → Reverb. Toggle each on/off.</li>
                <li>4. Destruction: FULL MIX → Redux → Erosion → Limiter (rescue it).</li>
              </ul>
            </div>
          </main>

          {/* Right rail — meters */}
          <aside className="space-y-3">
            <div className="brutal-border bg-ink text-bone p-2">
              <div className="font-mono text-[10px] uppercase mb-1">OUTPUT SPECTRUM</div>
              <SpectrumMeter analyser={analyser} height={140} />
            </div>
            <div className="brutal-border bg-bone p-3 font-mono text-[11px]">
              <div className="uppercase mb-1 font-bold">▸ TIPS</div>
              <ul className="space-y-1">
                <li>EQ → Compressor sounds different than Compressor → EQ.</li>
                <li>Time effects (Reverb/Delay) usually go last.</li>
                <li>Drive before EQ smears; EQ before drive shapes.</li>
              </ul>
            </div>
          </aside>
        </div>
      ) : (
        <div className="brutal-border bg-card p-4">
          <Simulator type={tab as SimType} />
        </div>
      )}
    </div>
  );
}

function TabBtn({ id, tab, setTab, label }: { id: TabId; tab: TabId; setTab: (t: TabId) => void; label: string }) {
  const active = tab === id;
  return (
    <button onClick={() => setTab(id)} aria-pressed={active}
      className={`brutal-border px-3 py-1.5 font-mono text-[11px] uppercase brutal-press ${active ? "bg-ink text-bone" : "bg-bone text-ink hover:bg-acid"}`}>
      {label}
    </button>
  );
}
