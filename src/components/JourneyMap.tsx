import { Link } from "@tanstack/react-router";
import { MISSIONS } from "@/content/missions";
import { WORLDS } from "@/content/worlds";
import { useProgress } from "@/lib/progress";

// Subway-style journey map: each WORLD is a lane (line) with stops (missions).
// Completed stops fill in, current pulses, future are open circles.
// Connector strokes change color per world for an Ableton-like routing feel.
const WORLD_LINE: Record<string, { bg: string; stroke: string; ring: string; label: string }> = {
  acid: { bg: "bg-acid",         stroke: "stroke-acid",  ring: "ring-acid",  label: "text-ink" },
  hot:  { bg: "bg-hot",          stroke: "stroke-hot",   ring: "ring-hot",   label: "text-bone" },
  volt: { bg: "bg-volt",         stroke: "stroke-volt",  ring: "ring-volt",  label: "text-bone" },
  sun:  { bg: "bg-sun",          stroke: "stroke-sun",   ring: "ring-sun",   label: "text-ink" },
  bone: { bg: "bg-bone",         stroke: "stroke-ink",   ring: "ring-ink",   label: "text-ink" },
  ink:  { bg: "bg-ink",          stroke: "stroke-ink",   ring: "ring-ink",   label: "text-bone" },
};

export function JourneyMap({ currentSlug }: { currentSlug?: string }) {
  const { progress } = useProgress();
  const done = progress.completedMissions;
  const totalDone = Object.keys(done).length;

  return (
    <div className="brutal-border bg-card p-4 brutal-shadow-sm overflow-x-auto">
      <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
        <div className="font-mono text-xs uppercase">
          // JOURNEY MAP — {totalDone}/{MISSIONS.length} stops · {WORLDS.length} lines
        </div>
        <div className="flex gap-2 font-mono text-[10px] uppercase">
          <span className="brutal-border bg-bone px-2 py-0.5">○ open</span>
          <span className="brutal-border bg-hot text-bone px-2 py-0.5">● current</span>
          <span className="brutal-border bg-acid px-2 py-0.5">✓ done</span>
        </div>
      </div>

      <div className="space-y-3 min-w-max">
        {WORLDS.map((w) => {
          const ms = MISSIONS.filter((m) => m.world === w.slug);
          const line = WORLD_LINE[w.color] ?? WORLD_LINE.bone;
          const worldDone = ms.filter((m) => done[m.slug]).length;
          return (
            <div key={w.slug} className="flex items-center gap-2">
              <div className={`${line.bg} ${line.label} brutal-border px-2 py-2 font-mono text-[10px] uppercase w-28 shrink-0 leading-tight`}>
                <div className="font-display text-sm">W{w.number}</div>
                <div className="truncate">{w.title}</div>
                <div className="opacity-70">{worldDone}/{ms.length}</div>
              </div>

              {/* Rail */}
              <div className="relative flex items-center gap-0 py-3">
                {/* baseline */}
                <div className={`absolute left-3 right-3 h-1 ${line.bg} brutal-border border-x-0`} aria-hidden />
                {ms.map((m, idx) => {
                  const isDone = !!done[m.slug];
                  const isCur = m.slug === currentSlug;
                  const tone = isCur ? "bg-hot text-bone animate-pulse"
                            : isDone ? "bg-acid text-ink"
                            : "bg-bone text-ink";
                  return (
                    <Link
                      key={m.slug}
                      to="/mission/$slug"
                      params={{ slug: m.slug }}
                      title={`#${m.number} ${m.title}`}
                      className="relative z-10 mx-1"
                    >
                      <span className={`${tone} brutal-border w-8 h-8 flex items-center justify-center font-mono text-[10px] brutal-press`}>
                        {isDone ? "✓" : m.number}
                      </span>
                      {/* tick label every 5 stops */}
                      {(idx + 1) % 5 === 0 && (
                        <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 font-mono text-[9px] uppercase opacity-60">
                          {idx + 1}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 font-mono text-[10px] uppercase opacity-60">
        ▸ Each lane is a WORLD. Each circle is a mission stop. Click to jump on.
      </div>
    </div>
  );
}
