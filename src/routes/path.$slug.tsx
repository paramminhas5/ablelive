import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { pathBySlug, type LearningPath } from "@/content/paths";
import { MISSIONS } from "@/content/missions";
import type { Mission } from "@/content/types";
import { useProgress } from "@/lib/progress";

export const Route = createFileRoute("/path/$slug")({
  head: ({ params }) => {
    const p = pathBySlug(params.slug);
    return { meta: [
      { title: `${p?.title ?? "Path"} — CCD.SCHOOL` },
      { name: "description", content: p?.tagline ?? "Learning path" },
    ]};
  },
  loader: ({ params }) => {
    const p = pathBySlug(params.slug);
    if (!p) throw notFound();
    return p;
  },
  component: PathPage,
  notFoundComponent: () => <div className="p-12 font-mono">Path not found.</div>,
});

function PathPage() {
  const p = Route.useLoaderData() as LearningPath;
  const { progress } = useProgress();
  const items = p.missionSlugs
    .map((s: string) => MISSIONS.find((m) => m.slug === s))
    .filter((m): m is Mission => !!m);
  const done = items.filter((m) => progress.completedMissions[m.slug]).length;
  const next = items.find((m) => !progress.completedMissions[m.slug]);
  return (
    <div className="max-w-5xl mx-auto p-6 md:p-12 space-y-6">
      <Link to="/paths" className="font-mono text-xs uppercase underline">← All paths</Link>
      <div className={`${p.color} brutal-border p-6 brutal-shadow`}>
        <div className="font-mono text-xs uppercase">PATH</div>
        <h1 className="text-4xl md:text-6xl">{p.title}</h1>
        <p className="font-mono mt-2 max-w-2xl">{p.description}</p>
        <div className="flex flex-wrap gap-3 mt-4 items-center">
          <span className="brutal-border bg-bone text-ink px-3 py-1 font-mono text-xs uppercase">{done}/{items.length} done</span>
          {next && (
            <Link to="/mission/$slug" params={{ slug: next.slug }} className="brutal-border bg-ink text-bone px-4 py-2 font-mono text-xs uppercase brutal-press">▶ Continue → {next.title}</Link>
          )}
        </div>
      </div>
      <ol className="space-y-2">
        {items.map((m: Mission, i: number) => {
          const ok = !!progress.completedMissions[m.slug];
          return (
            <li key={m.slug}>
              <Link to="/mission/$slug" params={{ slug: m.slug }} className={`brutal-border p-3 flex items-center gap-3 brutal-press block ${ok ? "bg-acid" : "bg-card"}`}>
                <span className="font-display text-2xl w-10 text-center">{ok ? "✓" : i + 1}</span>
                <span className="font-display text-xl flex-1">{m.title}</span>
                <span className="font-mono text-xs uppercase">{m.xp} XP</span>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}