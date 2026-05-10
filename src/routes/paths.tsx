import { createFileRoute, Link } from "@tanstack/react-router";
import { PATHS } from "@/content/paths";
import { useProgress } from "@/lib/progress";

export const Route = createFileRoute("/paths")({
  head: () => ({ meta: [
    { title: "Learning Paths — ABLETON.SCHOOL" },
    { name: "description", content: "Curated mission sequences: first beat, mix a track, sound design, live performance." },
  ]}),
  component: PathsIndex,
});

function PathsIndex() {
  const { progress } = useProgress();
  return (
    <div className="max-w-7xl mx-auto p-6 md:p-12 space-y-6">
      <h1 className="text-5xl md:text-8xl">// PATHS</h1>
      <p className="font-mono text-sm max-w-2xl">Curated mission sequences across worlds. Pick one and follow it instead of going world-by-world.</p>
      <div className="grid md:grid-cols-2 gap-4">
        {PATHS.map((p) => {
          const done = p.missionSlugs.filter((s) => progress.completedMissions[s]).length;
          const pct = Math.round((done / p.missionSlugs.length) * 100);
          return (
            <Link key={p.slug} to="/path/$slug" params={{ slug: p.slug }} className={`${p.color} brutal-border p-5 brutal-shadow brutal-press block`}>
              <div className="font-mono text-xs uppercase">PATH · {p.missionSlugs.length} stops</div>
              <div className="font-display text-3xl mt-1">{p.title}</div>
              <div className="font-mono text-sm mt-2">{p.tagline}</div>
              <div className="h-2 brutal-border mt-4 bg-bone overflow-hidden">
                <div className="h-full bg-ink" style={{ width: `${pct}%` }} />
              </div>
              <div className="font-mono text-xs uppercase mt-2">{done}/{p.missionSlugs.length} · {pct}%</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}