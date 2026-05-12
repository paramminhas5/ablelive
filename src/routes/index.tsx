import { createFileRoute, Link } from "@tanstack/react-router";
import { useMode, useIntermediatePath, type Mode } from "@/lib/mode";
import { useProgress } from "@/lib/progress";
import { MISSIONS } from "@/content/missions";
import { BEGINNER_SLUGS } from "@/content/beginner-foundations";
import { DJ_CORE_SLUGS } from "@/content/dj-missions";
import { PATHS } from "@/content/paths";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CCD.SCHOOL — Learn Music Production & DJing" },
      {
        name: "description",
        content:
          "Learn music from scratch. Beginner foundations, DJ path (rekordbox), Ableton Live. No fluff.",
      },
    ],
  }),
  component: Home,
});

const MODES: { id: Mode; label: string; desc: string; color: string; active: string }[] = [
  {
    id: "beginner",
    label: "Beginner",
    desc: "Concepts explained simply",
    color: "bg-bone hover:bg-acid",
    active: "bg-acid text-ink",
  },
  {
    id: "intermediate",
    label: "Intermediate",
    desc: "Full content depth",
    color: "bg-bone hover:bg-volt/20",
    active: "bg-volt text-bone",
  },
  {
    id: "advanced",
    label: "Advanced",
    desc: "Deep dives + pro tips",
    color: "bg-bone hover:bg-hot/20",
    active: "bg-hot text-bone",
  },
];

function Home() {
  const { mode, setMode } = useMode();
  const { progress } = useProgress();

  const beginnerDone = BEGINNER_SLUGS.filter((s) => !!progress.completedMissions[s]).length;
  const djDone = DJ_CORE_SLUGS.filter((s) => !!progress.completedMissions[s]).length;
  const abletonDone = MISSIONS.filter((m) => !!progress.completedMissions[m.slug]).length;

  // First incomplete beginner slug for the Start/Resume button
  const firstBeginnerIncomplete = BEGINNER_SLUGS.find((s) => !progress.completedMissions[s]);
  const beginnerCta = firstBeginnerIncomplete
    ? beginnerDone > 0
      ? "RESUME"
      : "START HERE"
    : "REVIEW";
  const firstDjIncomplete = DJ_CORE_SLUGS.find((s) => !progress.completedMissions[s]);
  const djCta = firstDjIncomplete ? (djDone > 0 ? "CONTINUE" : "START") : "REVIEW";

  return (
    <div className="min-h-screen bg-bone">
      {/* Hero */}
      <section className="brutal-border border-x-0 border-t-0 bg-ink text-bone">
        <div className="max-w-7xl mx-auto p-6 md:p-12">
          <div className="font-mono text-[10px] uppercase opacity-50 mb-3 tracking-widest">
            // CCD.SCHOOL · MUSIC EDUCATION · NO FLUFF
          </div>
          <h1 className="text-5xl sm:text-7xl md:text-9xl leading-none font-display">
            LEARN
            <br />
            MUSIC.
            <br />
            <span className="text-acid">BRUTALLY.</span>
          </h1>
          <p className="font-mono mt-4 max-w-2xl text-sm md:text-base opacity-60 leading-relaxed">
            Music foundations from zero. DJ skills via rekordbox. Ableton Live production.
            Structured paths, gamified missions, real sources.
          </p>

          {/* Content depth toggle — not a lock, just adjusts how content is shown */}
          <div className="mt-6">
            <div className="font-mono text-[9px] uppercase opacity-40 mb-2">
              CONTENT DEPTH — changes how concepts are explained
            </div>
            <div className="brutal-border inline-flex">
              {MODES.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className={`px-4 py-2 font-mono text-xs uppercase transition-colors ${
                    mode === m.id ? m.active : m.color
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
            <div className="font-mono text-[9px] uppercase opacity-40 mt-1">
              Currently: {MODES.find((m) => m.id === mode)?.desc}
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <div className="brutal-border border-x-0 border-t-0 bg-bone">
        <div className="max-w-7xl mx-auto grid grid-cols-4 divide-x divide-ink">
          {[
            { v: progress.xp, l: "XP" },
            { v: Object.keys(progress.completedMissions).length, l: "Missions done" },
            { v: progress.streakDays, l: "Day streak" },
            { v: `🔥`, l: progress.streakDays > 0 ? "On a roll" : "Start streak" },
          ].map((s) => (
            <div key={s.l} className="px-4 py-3 text-center">
              <div className="font-display text-2xl">{s.v}</div>
              <div className="font-mono text-[9px] uppercase opacity-40">{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* All paths */}
      <section className="max-w-7xl mx-auto p-4 md:p-12">
        <div className="font-mono text-[10px] uppercase opacity-50 mb-5">// CHOOSE YOUR PATH</div>

        {/* Beginner + DJ — top two featured paths */}
        <div className="grid md:grid-cols-2 gap-3 mb-3">
          {/* Beginner Foundations */}
          <div className="brutal-border bg-acid p-5 flex flex-col gap-4">
            <div>
              <div className="font-mono text-[9px] uppercase opacity-60">
                PATH · {BEGINNER_SLUGS.length} MISSIONS · ALL LEVELS
              </div>
              <div className="font-display text-3xl mt-1">🌱 Music Foundations</div>
              <div className="font-mono text-xs mt-2 opacity-80 leading-relaxed">
                No music knowledge needed. Sound, rhythm, melody, chords, DAWs, MIDI, samples,
                mixing — all explained simply with sources. Complete before anything else.
              </div>
            </div>
            <div>
              <div className="h-2 brutal-border bg-ink/10 overflow-hidden mb-1">
                <div
                  className="h-full bg-ink transition-all"
                  style={{ width: `${Math.round((beginnerDone / BEGINNER_SLUGS.length) * 100)}%` }}
                />
              </div>
              <div className="font-mono text-[9px] uppercase opacity-50">
                {beginnerDone}/{BEGINNER_SLUGS.length} complete
              </div>
            </div>
            <Link
              to="/beginner"
              className="brutal-border bg-ink text-bone px-5 py-3 font-display text-xl brutal-press text-center self-start"
            >
              {beginnerCta} →
            </Link>
          </div>

          {/* DJ Path */}
          <div className="brutal-border bg-volt text-bone p-5 flex flex-col gap-4">
            <div>
              <div className="font-mono text-[9px] uppercase opacity-60">
                PATH · {DJ_CORE_SLUGS.length} CORE MISSIONS · REKORDBOX
              </div>
              <div className="font-display text-3xl mt-1">🎧 DJ Path</div>
              <div className="font-mono text-xs mt-2 opacity-80 leading-relaxed">
                Learn DJing with rekordbox. BPM matching, cue points, the mixer, transitions,
                library management, reading the crowd. Sourced from the rekordbox manual.
              </div>
            </div>
            <div>
              <div className="h-2 brutal-border bg-bone/20 overflow-hidden mb-1">
                <div
                  className="h-full bg-acid transition-all"
                  style={{ width: `${Math.round((djDone / DJ_CORE_SLUGS.length) * 100)}%` }}
                />
              </div>
              <div className="font-mono text-[9px] uppercase opacity-60">
                {djDone}/{DJ_CORE_SLUGS.length} complete · No hardware needed to learn
              </div>
            </div>
            <Link
              to="/dj"
              className="brutal-border bg-acid text-ink px-5 py-3 font-display text-xl brutal-press text-center self-start"
            >
              {djCta} →
            </Link>
          </div>
        </div>

        {/* Ableton paths grid */}
        <div className="font-mono text-[9px] uppercase opacity-40 mb-3 mt-6">
          // ABLETON LIVE 12 PATHS
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {PATHS.map((p) => {
            const done = p.missionSlugs.filter((s) => !!progress.completedMissions[s]).length;
            const pct = Math.round((done / p.missionSlugs.length) * 100);
            const firstIncomplete = p.missionSlugs.find((s) => !progress.completedMissions[s]);
            return (
              <Link
                key={p.slug}
                to="/path/$slug"
                params={{ slug: p.slug }}
                className={`${p.color} brutal-border p-4 brutal-press block`}
              >
                <div className="font-mono text-[9px] uppercase opacity-60">
                  PATH · {p.missionSlugs.length} MISSIONS
                </div>
                <div className="font-display text-2xl mt-1">{p.title}</div>
                <div className="font-mono text-xs mt-1 opacity-70">{p.tagline}</div>
                <div className="h-1.5 brutal-border bg-ink/10 mt-3 overflow-hidden">
                  <div className="h-full bg-ink/50 transition-all" style={{ width: `${pct}%` }} />
                </div>
                <div className="font-mono text-[9px] uppercase opacity-50 mt-1">
                  {done}/{p.missionSlugs.length} · {pct}%
                </div>
              </Link>
            );
          })}
        </div>

        {/* Quick nav */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8">
          {[
            { to: "/learn", label: "All Paths", color: "bg-bone" },
            { to: "/devices", label: "Devices", color: "bg-bone" },
            { to: "/playground", label: "Workbench", color: "bg-bone" },
            { to: "/glossary", label: "Glossary", color: "bg-bone" },
          ].map((l) => (
            <Link
              key={l.to}
              to={l.to as any}
              className={`brutal-border ${l.color} p-3 font-display text-lg brutal-press text-center block`}
            >
              {l.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
