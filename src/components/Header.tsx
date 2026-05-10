import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useProgress } from "@/lib/progress";
import { useAuth, signOut } from "@/lib/auth";
import { RankBadge } from "./HomeWidgets";
import { useLearnMode } from "@/lib/mode";

const PRIMARY = [
  { to: "/learn", label: "Learn", hover: "hover:bg-hot hover:text-bone" },
  { to: "/worlds", label: "Worlds", hover: "hover:bg-acid" },
  { to: "/devices", label: "Devices", hover: "hover:bg-volt hover:text-bone" },
  { to: "/playground", label: "Workbench", hover: "hover:bg-hot hover:text-bone" },
] as const;

const MORE = [
  { to: "/train", label: "Train" },
  { to: "/match", label: "Match" },
  { to: "/glossary", label: "Glossary" },
  { to: "/shortcuts", label: "Shortcuts" },
  { to: "/profile", label: "Profile" },
] as const;

export function Header() {
  const { progress } = useProgress();
  const { user } = useAuth();
  const { learnMode, setLearnMode } = useLearnMode();
  const [moreOpen, setMoreOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Close menus on route change / escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setMoreOpen(false); setDrawerOpen(false); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="brutal-border border-x-0 border-t-0 bg-bone sticky top-0 z-40">
      <div className="flex items-stretch h-12 md:h-14">
        <Link to="/" className="brutal-border border-y-0 border-l-0 px-3 md:px-4 flex items-center font-display text-lg md:text-2xl bg-acid hover-glitch shrink-0">
          ABLETON.SCHOOL
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex flex-1 items-stretch font-mono uppercase text-sm">
          {PRIMARY.map((l) => (
            <Link key={l.to} to={l.to} className={`px-4 flex items-center brutal-border border-y-0 border-l-0 ${l.hover}`}>{l.label}</Link>
          ))}
          <div className="relative flex items-stretch">
            <button onClick={() => setMoreOpen((o) => !o)} aria-expanded={moreOpen}
              className="px-4 flex items-center brutal-border border-y-0 border-l-0 hover:bg-sun">
              MORE ▾
            </button>
            {moreOpen && (
              <div className="absolute top-full left-0 mt-0 brutal-border bg-bone min-w-[160px] z-50 shadow-lg">
                {MORE.map((l) => (
                  <Link key={l.to} to={l.to} onClick={() => setMoreOpen(false)}
                    className="block px-4 py-2 font-mono uppercase text-xs hover:bg-acid brutal-border border-x-0 border-t-0">
                    {l.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        <div className="flex-1 md:flex-none" />

        {/* Right cluster — desktop */}
        <div className="hidden md:flex items-center gap-1.5 px-3 font-mono text-xs">
          <div className="brutal-border flex">
            <button
              onClick={() => setLearnMode("classic")}
              className={`px-2 py-1 ${learnMode === "classic" ? "bg-ink text-bone" : "bg-bone"}`}
              title="Open, brutalist site"
            >CLASSIC</button>
            <button
              onClick={() => setLearnMode("ccd")}
              className={`px-2 py-1 ${learnMode === "ccd" ? "bg-hot text-bone" : "bg-bone"}`}
              title="Gated skill tree, hearts, XP"
            >CCD</button>
          </div>
          {/* ModeToggle removed — now contextual (per mission/device) */}
          <RankBadge compact />
          <span className="brutal-border bg-acid px-2 py-1">XP {progress.xp}</span>
          <span className="brutal-border bg-hot text-bone px-2 py-1">🔥 {progress.streakDays}</span>
          {user ? (
            <button onClick={() => signOut()} className="brutal-border bg-bone px-2 py-1 brutal-press" title={user.email ?? "Account"}>
              Sign out
            </button>
          ) : (
            <Link to="/login" className="brutal-border bg-volt text-bone px-2 py-1 brutal-press">Sign in</Link>
          )}
        </div>

        {/* Mobile compact pill + hamburger */}
        <div className="md:hidden flex items-center gap-2 px-2">
          <span className="brutal-border bg-acid px-2 py-1 font-mono text-[10px]">{progress.xp}xp · 🔥{progress.streakDays}</span>
          <button onClick={() => setDrawerOpen(true)} aria-label="Open menu"
            className="brutal-border bg-ink text-bone px-3 py-1.5 font-display text-lg brutal-press">≡</button>
        </div>
      </div>

      {/* Marquee — desktop only */}
      <div className="hidden md:block">
        <Marquee />
      </div>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-ink/80" onClick={() => setDrawerOpen(false)}>
          <div className="absolute right-0 top-0 bottom-0 w-[78%] max-w-[320px] bg-bone brutal-border border-y-0 border-r-0 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-3 brutal-border border-x-0 border-t-0 bg-acid">
              <span className="font-display text-lg">MENU</span>
              <button onClick={() => setDrawerOpen(false)} className="brutal-border bg-ink text-bone px-3 py-1 font-mono text-xs">CLOSE ✕</button>
            </div>
            <nav className="flex flex-col font-mono uppercase text-sm">
              {[...PRIMARY, ...MORE].map((l) => (
                <Link key={l.to} to={l.to} onClick={() => setDrawerOpen(false)}
                  className="px-4 py-3 brutal-border border-x-0 border-t-0 hover:bg-acid">
                  {l.label}
                </Link>
              ))}
              <div className="p-3 flex flex-col gap-2">
                {user ? (
                  <button onClick={() => { signOut(); setDrawerOpen(false); }} className="brutal-border bg-bone px-3 py-2 brutal-press text-left">Sign out</button>
                ) : (
                  <Link to="/login" onClick={() => setDrawerOpen(false)} className="brutal-border bg-volt text-bone px-3 py-2 brutal-press">Sign in</Link>
                )}
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}

function Marquee() {
  const items = [
    "LIVE 12", "WARP MARKERS", "MAX FOR LIVE", "SESSION VIEW", "SIDECHAIN", "PUSH 3",
    "MIDI TRANSFORMS", "MELD", "ROAR", "DRUM RACK", "ABLETON LINK", "CV TOOLS",
  ];
  const row = [...items, ...items];
  return (
    <div className="brutal-border border-x-0 border-b-0 bg-ink text-bone overflow-hidden">
      <div className="flex animate-marquee whitespace-nowrap py-1 font-mono text-xs uppercase tracking-widest">
        {row.map((t, i) => (
          <span key={i} className="px-6">★ {t}</span>
        ))}
      </div>
    </div>
  );
}
