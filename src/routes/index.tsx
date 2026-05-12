import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMode, useIntermediatePath, type Mode } from "@/lib/mode";
import { useProgress } from "@/lib/progress";
import { MISSIONS } from "@/content/missions";
import { BEGINNER_SLUGS, isBeginnerComplete } from "@/content/beginner-foundations";
import { DJ_CORE_SLUGS } from "@/content/dj-missions";
import { useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CCD.SCHOOL — Learn Music Production & DJing" },
      {
        name: "description",
        content:
          "Three modes: Beginner foundations, Intermediate (DJ or Ableton), Advanced. Gamified, structured, no fluff.",
      },
    ],
  }),
  component: Home,
});

type Panel = "beginner" | "intermediate" | "advanced";

function Home() {
  const { mode, setMode } = useMode();
  const { path: intermediatePath, setPath } = useIntermediatePath();
  const { progress } = useProgress();
  const navigate = useNavigate();
  const [hovered, setHovered] = useState<Panel | null>(null);

  const beginnerDone = BEGINNER_SLUGS.filter((s) => !!progress.completedMissions[s]).length;
  const beginnerComplete = isBeginnerComplete(progress.completedMissions);
  const djDone = DJ_CORE_SLUGS.filter((s) => !!progress.completedMissions[s]).length;
  const abletonDone = Object.keys(progress.completedMissions).filter(
    (s) => !BEGINNER_SLUGS.includes(s) && !DJ_CORE_SLUGS.includes(s),
  ).length;

  const handleModeSelect = (m: Mode) => {
    setMode(m);
    if (m === "beginner") navigate({ to: "/beginner" });
    else if (m === "intermediate") navigate({ to: "/learn" });
    else navigate({ to: "/learn" });
  };

  const panels: {
    id: Panel;
    label: string;
    sub: string;
    color: string;
    textColor: string;
    accent: string;
    emoji: string;
    desc: string;
    locked: boolean;
    lockedMsg?: string;
    cta: string;
    progress?: { done: number; total: number };
  }[] = [
    {
      id: "beginner",
      label: "BEGINNER",
      sub: "Start from scratch",
      color: "bg-acid",
      textColor: "text-ink",
      accent: "bg-ink text-bone",
      emoji: "🌱",
      desc: "No music knowledge needed. Learn sound, rhythm, melody, harmony, what a DAW is — all explained like you're 5. Complete all 10 to unlock Intermediate.",
      locked: false,
      cta: beginnerDone > 0 ? "CONTINUE →" : "START HERE →",
      progress: { done: beginnerDone, total: BEGINNER_SLUGS.length },
    },
    {
      id: "intermediate",
      label: "INTERMEDIATE",
      sub: "Choose your path",
      color: "bg-volt",
      textColor: "text-bone",
      accent: "bg-acid text-ink",
      emoji: "⚡",
      desc: "Two paths: learn DJing with rekordbox (no software required upfront) or dive into Ableton Live (works without downloading it too). Builds on Beginner concepts.",
      locked: !beginnerComplete,
      lockedMsg: `Complete ${BEGINNER_SLUGS.length - beginnerDone} more beginner missions to unlock`,
      cta: "CHOOSE PATH →",
      progress: { done: djDone + abletonDone, total: 20 },
    },
    {
      id: "advanced",
      label: "ADVANCED",
      sub: "Instruments recommended",
      color: "bg-hot",
      textColor: "text-bone",
      accent: "bg-bone text-ink",
      emoji: "🔥",
      desc: "Advanced DJ (harmonic mixing, set design, effects) or Advanced Ableton (sound design, modulation, full production). Instruments strongly recommended.",
      locked: !beginnerComplete,
      lockedMsg: beginnerComplete
        ? "Complete some Intermediate missions to unlock"
        : `Complete ${BEGINNER_SLUGS.length - beginnerDone} more beginner missions first`,
      cta: "GO DEEP →",
    },
  ];

  return (
    <div className="min-h-screen bg-bone">
      {/* Hero */}
      <section className="brutal-border border-x-0 border-t-0 bg-ink text-bone">
        <div className="max-w-7xl mx-auto p-6 md:p-12">
          <div className="font-mono text-[10px] uppercase opacity-50 mb-3 tracking-widest">
            // CCD.SCHOOL · MUSIC EDUCATION · NO FLUFF
          </div>
          <h1 className="text-5xl sm:text-7xl md:text-9xl leading-none font-display">
            MAKE
            <br />
            MUSIC.
            <br />
            <span className="text-acid">BRUTALLY.</span>
          </h1>
          <p className="font-mono mt-4 max-w-2xl text-sm md:text-base opacity-70 leading-relaxed">
            Three modes. Beginner learns music from absolute zero — sound, rhythm, melody, DAWs.
            Intermediate chooses: DJ (with rekordbox) or Ableton producer. Advanced goes as deep as
            it gets.
          </p>
        </div>
      </section>

      {/* 3-Mode Selector */}
      <section className="max-w-7xl mx-auto p-4 md:p-12">
        <div className="font-mono text-xs uppercase mb-4 opacity-60">// CHOOSE YOUR MODE</div>
        <div className="grid md:grid-cols-3 gap-3 md:gap-4">
          {panels.map((panel) => {
            const isActive = mode === panel.id;
            const isHovered = hovered === panel.id;
            return (
              <button
                key={panel.id}
                onClick={() => !panel.locked && handleModeSelect(panel.id as Mode)}
                onMouseEnter={() => setHovered(panel.id)}
                onMouseLeave={() => setHovered(null)}
                disabled={panel.locked}
                className={`
                  brutal-border text-left p-5 md:p-6 transition-all duration-150 relative
                  ${panel.locked ? "opacity-50 cursor-not-allowed bg-bone" : `${panel.color} ${panel.textColor} cursor-pointer brutal-press`}
                  ${isActive ? "brutal-shadow-lg" : ""}
                `}
              >
                {/* Active badge */}
                {isActive && (
                  <div
                    className={`absolute top-3 right-3 ${panel.accent} font-mono text-[9px] uppercase px-2 py-1 brutal-border`}
                  >
                    ACTIVE
                  </div>
                )}

                {/* Lock badge */}
                {panel.locked && (
                  <div className="absolute top-3 right-3 bg-ink text-bone font-mono text-[9px] uppercase px-2 py-1 brutal-border">
                    🔒 LOCKED
                  </div>
                )}

                <div className="text-3xl mb-2">{panel.emoji}</div>
                <div className="font-display text-3xl md:text-4xl leading-none">{panel.label}</div>
                <div className="font-mono text-[10px] uppercase opacity-70 mt-1">{panel.sub}</div>

                <div
                  className={`font-mono text-xs mt-3 leading-relaxed ${panel.locked ? "opacity-50" : "opacity-80"}`}
                >
                  {panel.locked ? panel.lockedMsg : panel.desc}
                </div>

                {/* Progress bar */}
                {panel.progress && !panel.locked && (
                  <div className="mt-4">
                    <div className="h-1.5 brutal-border bg-ink/20 overflow-hidden">
                      <div
                        className="h-full bg-ink/60 transition-all duration-500"
                        style={{
                          width: `${Math.round((panel.progress.done / panel.progress.total) * 100)}%`,
                        }}
                      />
                    </div>
                    <div className="font-mono text-[9px] uppercase mt-1 opacity-60">
                      {panel.progress.done}/{panel.progress.total} complete
                    </div>
                  </div>
                )}

                {!panel.locked && (
                  <div
                    className={`font-display text-lg mt-4 ${isHovered || isActive ? "opacity-100" : "opacity-60"}`}
                  >
                    {panel.cta}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Intermediate path choice — shown when intermediate mode active */}
        {mode === "intermediate" && (
          <div className="mt-6 brutal-border bg-bone p-5">
            <div className="font-mono text-xs uppercase mb-4 opacity-60">// CHOOSE YOUR PATH</div>
            <div className="grid md:grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setPath("dj");
                  navigate({ to: "/learn" });
                }}
                className={`brutal-border p-4 text-left brutal-press transition-all ${
                  intermediatePath === "dj" ? "bg-acid" : "bg-bone hover:bg-sun"
                }`}
              >
                {intermediatePath === "dj" && (
                  <span className="font-mono text-[9px] uppercase brutal-border bg-ink text-bone px-2 py-1 float-right">
                    ACTIVE
                  </span>
                )}
                <div className="text-2xl mb-1">🎧</div>
                <div className="font-display text-2xl">DJ PATH</div>
                <div className="font-mono text-xs mt-2 opacity-70 leading-relaxed">
                  Learn DJing with rekordbox. BPM matching, cue points, mixing, library management.
                  No software required to start — but you'll want it soon.
                </div>
                <div className="font-mono text-[9px] uppercase mt-3 opacity-50">
                  {DJ_CORE_SLUGS.filter((s) => !!progress.completedMissions[s]).length}/
                  {DJ_CORE_SLUGS.length} core missions · rekordbox (Pioneer DJ)
                </div>
              </button>

              <button
                onClick={() => {
                  setPath("ableton");
                  navigate({ to: "/learn" });
                }}
                className={`brutal-border p-4 text-left brutal-press transition-all ${
                  intermediatePath === "ableton" ? "bg-volt text-bone" : "bg-bone hover:bg-sun"
                }`}
              >
                {intermediatePath === "ableton" && (
                  <span className="font-mono text-[9px] uppercase brutal-border bg-bone text-ink px-2 py-1 float-right">
                    ACTIVE
                  </span>
                )}
                <div className="text-2xl mb-1">🎹</div>
                <div className="font-display text-2xl">ABLETON PATH</div>
                <div className="font-mono text-xs mt-2 opacity-80 leading-relaxed">
                  Learn Ableton Live 12: sessions, clips, devices, mixing, arrangement. Works
                  conceptually without Ableton — but having it open supercharges learning.
                </div>
                <div className="font-mono text-[9px] uppercase mt-3 opacity-60">
                  42+ missions · Ableton Live 12
                </div>
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Quick stats */}
      <section className="max-w-7xl mx-auto px-4 md:px-12 pb-12">
        <div className="brutal-border border-x-0 border-b-0 grid grid-cols-3 md:grid-cols-6">
          {[
            { v: progress.xp, l: "XP" },
            {
              v: Object.keys(progress.completedMissions).length,
              l: "Done",
            },
            { v: progress.streakDays, l: "Streak" },
            { v: `${beginnerDone}/${BEGINNER_SLUGS.length}`, l: "Beginner" },
            { v: `${djDone}/${DJ_CORE_SLUGS.length}`, l: "DJ Core" },
            {
              v: `${MISSIONS.filter((m) => !!progress.completedMissions[m.slug]).length}/${MISSIONS.length}`,
              l: "Ableton",
            },
          ].map((s) => (
            <div key={s.l} className="brutal-border border-x-0 border-t-0 p-4 text-center">
              <div className="font-display text-2xl md:text-3xl">{s.v}</div>
              <div className="font-mono text-[9px] uppercase opacity-50 mt-1">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick nav */}
      <section className="max-w-7xl mx-auto px-4 md:px-12 pb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link
            to="/beginner"
            className="brutal-border bg-acid p-4 brutal-press block"
          >
            <div className="font-mono text-[10px] uppercase opacity-60">Foundations</div>
            <div className="font-display text-xl mt-1">Beginner Mode</div>
          </Link>
          <Link
            to="/learn"
            className="brutal-border bg-volt text-bone p-4 brutal-press block"
          >
            <div className="font-mono text-[10px] uppercase opacity-60">Paths</div>
            <div className="font-display text-xl mt-1">Learn</div>
          </Link>
          <Link
            to="/devices"
            className="brutal-border bg-sun p-4 brutal-press block"
          >
            <div className="font-mono text-[10px] uppercase opacity-60">Reference</div>
            <div className="font-display text-xl mt-1">Devices</div>
          </Link>
          <Link
            to="/playground"
            className="brutal-border bg-hot text-bone p-4 brutal-press block"
          >
            <div className="font-mono text-[10px] uppercase opacity-60">Experiment</div>
            <div className="font-display text-xl mt-1">Workbench</div>
          </Link>
        </div>
      </section>
    </div>
  );
}
