import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { DEVICES, type DeviceDef } from "@/content/devices";
import { DeviceChainSim } from "@/components/sims/DeviceChainSim";

export const Route = createFileRoute("/devices")({
  head: () => ({ meta: [
    { title: "Device Lab — ABLETON.SCHOOL" },
    { name: "description", content: "Real, working device emulations. Hear what every parameter does." },
  ]}),
  component: DevicesIndex,
});

const CATEGORIES = ["ALL", "EQ", "DYNAMICS", "DRIVE", "TIME", "MOD", "FILTER"] as const;
type Cat = (typeof CATEGORIES)[number];

const CAT_COLOR: Record<DeviceDef["category"], string> = {
  EQ: "bg-acid",
  DYNAMICS: "bg-hot text-bone",
  DRIVE: "bg-sun",
  TIME: "bg-volt text-bone",
  MOD: "bg-bone",
  FILTER: "bg-acid",
};

function DevicesIndex() {
  const [cat, setCat] = useState<Cat>("ALL");
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    return DEVICES.filter((d) => cat === "ALL" || d.category === cat).filter(
      (d) =>
        !q ||
        d.name.toLowerCase().includes(q.toLowerCase()) ||
        d.tagline.toLowerCase().includes(q.toLowerCase()),
    );
  }, [cat, q]);
  return (
    <div className="max-w-7xl mx-auto p-3 md:p-12">
      <div className="brutal-border bg-volt text-bone p-4 md:p-6 brutal-shadow mb-4 md:mb-6">
        <div className="font-mono text-xs uppercase">// DEVICE LAB</div>
        <h1 className="text-3xl sm:text-5xl md:text-7xl mt-2">EVERY KNOB, AUDIBLE.</h1>
        <p className="font-mono mt-2 text-sm md:text-base">{DEVICES.length} working device emulations. Real loops. A/B on every device.</p>
      </div>

      <div className="brutal-border bg-card p-4 mb-6">
        <div className="font-mono text-xs uppercase mb-1 font-bold">▸ BUILD A CHAIN — hear order matter in real time</div>
        <p className="font-mono text-xs opacity-70 mb-3">Stack devices left to right on a live drum loop. Try EQ → Comp vs Comp → EQ.</p>
        <DeviceChainSim />
      </div>

      <div className="brutal-border bg-card p-2 md:p-3 mb-4 sticky top-12 md:top-14 z-30">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="SEARCH DEVICES…"
          className="brutal-border bg-bone px-3 py-2 font-mono text-sm uppercase w-full mb-2"
        />
        <div className="flex flex-wrap gap-1.5 items-center">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`brutal-border px-2.5 py-1.5 font-mono text-[11px] uppercase brutal-press ${
              cat === c ? "bg-acid" : "bg-bone"
            }`}
          >
            {c}
          </button>
        ))}
        <span className="font-mono text-xs uppercase ml-auto">{filtered.length} devices</span>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {filtered.map((d) => (
          <Link key={d.slug} to="/device/$slug" params={{ slug: d.slug }}
            className="brutal-border bg-card p-4 brutal-shadow-sm brutal-press block">
            <div className={`inline-block brutal-border ${CAT_COLOR[d.category]} px-2 py-0.5 font-mono text-[10px] uppercase`}>{d.category}</div>
            <div className="font-display text-xl md:text-2xl mt-1">{d.name}</div>
            <div className="font-mono text-xs md:text-sm mt-1">{d.tagline}</div>
            <div className="font-mono text-xs uppercase mt-4 brutal-border bg-acid inline-block px-2 py-1">OPEN LAB →</div>
          </Link>
        ))}
        {filtered.length === 0 && (
          <div className="brutal-border bg-hot text-bone p-4 font-mono col-span-full">No devices match. Try a different search or category.</div>
        )}
      </div>
    </div>
  );
}
