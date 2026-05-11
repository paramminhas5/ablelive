import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useProgress, DAILY_GOAL_XP, MAX_HEARTS, HEART_REFILL_SECS } from "@/lib/progress";
import { useAuth, signOut } from "@/lib/auth";
import { RankBadge } from "./HomeWidgets";
import { useLearnMode } from "@/lib/mode";
import { PALETTE_OPEN_EVENT } from "./CommandPalette";

const PRIMARY = [
  { to: "/learn", label: "Learn", hover: "hover:bg-hot hover:text-bone" },
  { to: "/worlds", label: "Worlds", hover: "hover:bg-acid" },
  { to: "/devices", label: "Devices", hover: "hover:bg-volt hover:text-bone" },
  { to: "/playground", label: "Workbench", hover: "hover:bg-hot hover:text-bone" },
] as const;

const MORE = [
  { to: "/train", label: "Train" },
  { to: "/match", label: "Match" },
  { to: "/leaderboard", label: "Leaderboard" },
  { to: "/glossary", label: "Glossary" },
  { to: "/shortcuts", label: "Shortcuts" },
  { to: "/profile", label: "Profile" },
] as const;

// --- Dark mode hook ---
function useDarkMode() {
  const [dark, setDark] = useState(() => {
    if (typeof localStorage === "undefined") return false;
    return localStorage.getItem("ableton.school.dark") === "1";
  });
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("ableton.school.dark", dark ? "1" : "0");
  }, [dark]);
  return { dark, toggle: () => setDark((d) => !d) };
}

// --- Daily goal ring — 24px SVG circle progress ---
function GoalRing({ pct, done }: { pct: number; done: boolean }) {
  const r = 9;
  const circ = 2 * Math.PI * r;
  const dash = circ * pct;
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      aria-label={`Daily goal ${Math.round(pct * 100)}%`}
    >
      <circle
        cx="12"
        cy="12"
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        opacity="0.2"
      />
      <circle
        cx="12"
        cy="12"
        r={r}
        fill="none"
        stroke={done ? "#7B2FFF" : "#CDFF00"}
        strokeWidth="2.5"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 12 12)"
        style={{ transition: "stroke-dasharray 0.4s" }}
      />
      {done && (
        <text x="12" y="16" textAnchor="middle" fontSize="10" fill="#7B2FFF" fontWeight="bold">
          ✓
        </text>
      )}
    </svg>
  );
}

// --- Hearts display with live countdown timer ---
function Hearts({ count, refillSeconds }: { count: number; refillSeconds: number }) {
  const [secs, setSecs] = useState(refillSeconds);
  useEffect(() => {
    setSecs(refillSeconds);
  }, [refillSeconds]);
  useEffect(() => {
    if (count >= MAX_HEARTS || secs <= 0) return;
    const id = setInterval(() => setSecs((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [count, secs]);
  const mm = String(Math.floor(secs / 60)).padStart(2, "0");
  const ss = String(secs % 60).padStart(2, "0");
  return (
    <div className="flex items-center gap-1" aria-label={`${count} hearts remaining`}>
      {Array.from({ length: MAX_HEARTS }).map((_, i) => (
        <span key={i} className={`text-base leading-none ${i < count ? "text-hot" : "opacity-20"}`}>
          ♥
        </span>
      ))}
      {count < MAX_HEARTS && secs > 0 && (
        <span className="font-mono text-[9px] opacity-60 ml-0.5">
          +♥ {mm}:{ss}
        </span>
      )}
    </div>
  );
}

export function Header() {
  const { progress, dailyGoalPct, dailyGoalDone, heartRefillSeconds } = useProgress();
  const { dark, toggle: toggleDark } = useDarkMode();
  const { user } = useAuth();
  const { learnMode, setLearnMode } = useLearnMode();
  const [moreOpen, setMoreOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMoreOpen(false);
        setDrawerOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const openSearch = () => window.dispatchEvent(new Event(PALETTE_OPEN_EVENT));

  return (
    <header className="brutal-border border-x-0 border-t-0 bg-bone sticky top-0 z-40">
      <div className="flex items-stretch h-12 md:h-14">
        {/* Logo */}
        <Link
          to="/"
          className="brutal-border border-y-0 border-l-0 px-3 md:px-4 flex items-center font-display text-lg md:text-2xl bg-acid hover-glitch shrink-0"
        >
          ABLETON.SCHOOL
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex flex-1 items-stretch font-mono uppercase text-sm">
          {PRIMARY.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`px-4 flex items-center brutal-border border-y-0 border-l-0 ${l.hover}`}
            >
              {l.label}
            </Link>
          ))}
          <div className="relative flex items-stretch">
            <button
              onClick={() => setMoreOpen((o) => !o)}
              aria-expanded={moreOpen}
              className="px-4 flex items-center brutal-border border-y-0 border-l-0 hover:bg-sun"
            >
              MORE ▾
            </button>
            {moreOpen && (
              <div className="absolute top-full left-0 mt-0 brutal-border bg-bone min-w-[160px] z-50 shadow-lg">
                {MORE.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    onClick={() => setMoreOpen(false)}
                    className="block px-4 py-2 font-mono uppercase text-xs hover:bg-acid brutal-border border-x-0 border-t-0"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        <div className="flex-1 md:flex-none" />

        {/* Desktop right cluster */}
        <div className="hidden md:flex items-center gap-2 px-3 font-mono text-xs">
          {/* Search button */}
          <button
            onClick={openSearch}
            className="brutal-border bg-bone px-2 py-1 hover:bg-sun"
            title="Search (⌘K)"
            aria-label="Open search"
          >
            ⌘K
          </button>

          {/* Dark mode toggle */}
          <button
            onClick={toggleDark}
            className="brutal-border bg-bone px-2 py-1 hover:bg-sun"
            title="Toggle dark mode"
            aria-label="Toggle dark mode"
          >
            {dark ? "☀" : "☾"}
          </button>

          {/* Mode toggle */}
          <div className="brutal-border flex">
            <button
              onClick={() => setLearnMode("classic")}
              className={`px-2 py-1 ${learnMode === "classic" ? "bg-ink text-bone" : "bg-bone"}`}
              title="Open, brutalist site"
            >
              CLASSIC
            </button>
            <button
              onClick={() => setLearnMode("ccd")}
              className={`px-2 py-1 ${learnMode === "ccd" ? "bg-hot text-bone" : "bg-bone"}`}
              title="Gated skill tree, hearts, XP"
            >
              CCD
            </button>
          </div>

          {/* CCD hearts */}
          {learnMode === "ccd" && (
            <Hearts count={progress.hearts} refillSeconds={heartRefillSeconds} />
          )}

          {/* Daily goal ring */}
          <div
            className="flex items-center gap-1"
            title={`Daily goal: ${progress.dailyXp}/${DAILY_GOAL_XP} XP`}
          >
            <GoalRing pct={dailyGoalPct} done={dailyGoalDone} />
          </div>

          <RankBadge compact />
          <span className="brutal-border bg-acid px-2 py-1">XP {progress.xp}</span>
          <span className="brutal-border bg-hot text-bone px-2 py-1">
            🔥 {progress.streakDays}
            {progress.streakShield ? " 🛡" : ""}
          </span>

          {user ? (
            <button
              onClick={() => signOut()}
              className="brutal-border bg-bone px-2 py-1 brutal-press"
              title={user.email ?? "Account"}
            >
              Sign out
            </button>
          ) : (
            <Link to="/login" className="brutal-border bg-volt text-bone px-2 py-1 brutal-press">
              Sign in
            </Link>
          )}
        </div>

        {/* Mobile compact row */}
        <div className="md:hidden flex items-center gap-1.5 px-2">
          {learnMode === "ccd" && (
            <Hearts count={progress.hearts} refillSeconds={heartRefillSeconds} />
          )}
          <div title={`Daily goal: ${progress.dailyXp}/${DAILY_GOAL_XP} XP`}>
            <GoalRing pct={dailyGoalPct} done={dailyGoalDone} />
          </div>
          <span className="brutal-border bg-acid px-2 py-1 font-mono text-[10px]">
            {progress.xp}xp · 🔥{progress.streakDays}
            {progress.streakShield ? "🛡" : ""}
          </span>
          {/* Mobile search button */}
          <button
            onClick={openSearch}
            aria-label="Search"
            className="brutal-border bg-bone px-2.5 py-1.5 font-mono text-base brutal-press"
          >
            🔍
          </button>
          {/* Hamburger */}
          <button
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
            className="brutal-border bg-ink text-bone px-3 py-1.5 font-display text-lg brutal-press"
          >
            ≡
          </button>
        </div>
      </div>

      {/* Marquee — desktop only */}
      <div className="hidden md:block">
        <Marquee />
      </div>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-ink/80"
          onClick={() => setDrawerOpen(false)}
        >
          <div
            className="absolute right-0 top-0 bottom-0 w-[78%] max-w-[320px] bg-bone brutal-border border-y-0 border-r-0 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-3 brutal-border border-x-0 border-t-0 bg-acid">
              <span className="font-display text-lg">MENU</span>
              <button
                onClick={() => setDrawerOpen(false)}
                className="brutal-border bg-ink text-bone px-3 py-1 font-mono text-xs"
              >
                CLOSE ✕
              </button>
            </div>

            {/* Search in drawer */}
            <button
              onClick={() => {
                setDrawerOpen(false);
                openSearch();
              }}
              className="w-full text-left px-4 py-3 brutal-border border-x-0 border-t-0 hover:bg-sun font-mono uppercase text-sm flex items-center gap-2"
            >
              <span>🔍</span> Search missions &amp; devices
            </button>

            <nav className="flex flex-col font-mono uppercase text-sm">
              {[...PRIMARY, ...MORE].map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setDrawerOpen(false)}
                  className="px-4 py-3 brutal-border border-x-0 border-t-0 hover:bg-acid"
                >
                  {l.label}
                </Link>
              ))}
            </nav>

            <div className="p-3 space-y-2">
              {/* Dark mode */}
              <button
                onClick={toggleDark}
                className="w-full brutal-border bg-bone px-3 py-2 font-mono text-xs uppercase text-left"
              >
                {dark ? "☀ Light Mode" : "☾ Dark Mode"}
              </button>

              {/* Mode toggle in drawer */}
              <div className="brutal-border flex font-mono text-xs">
                <button
                  onClick={() => setLearnMode("classic")}
                  className={`flex-1 py-2 ${learnMode === "classic" ? "bg-ink text-bone" : "bg-bone"}`}
                >
                  CLASSIC
                </button>
                <button
                  onClick={() => setLearnMode("ccd")}
                  className={`flex-1 py-2 ${learnMode === "ccd" ? "bg-hot text-bone" : "bg-bone"}`}
                >
                  CCD
                </button>
              </div>

              {user ? (
                <button
                  onClick={() => {
                    signOut();
                    setDrawerOpen(false);
                  }}
                  className="w-full brutal-border bg-bone px-3 py-2 brutal-press text-left font-mono text-xs uppercase"
                >
                  Sign out
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setDrawerOpen(false)}
                  className="block brutal-border bg-volt text-bone px-3 py-2 brutal-press font-mono text-xs uppercase text-center"
                >
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function Marquee() {
  const items = [
    "LIVE 12",
    "WARP MARKERS",
    "MAX FOR LIVE",
    "SESSION VIEW",
    "SIDECHAIN",
    "PUSH 3",
    "MIDI TRANSFORMS",
    "MELD",
    "ROAR",
    "DRUM RACK",
    "ABLETON LINK",
    "CV TOOLS",
  ];
  const row = [...items, ...items];
  return (
    <div className="brutal-border border-x-0 border-b-0 bg-ink text-bone overflow-hidden">
      <div className="flex animate-marquee whitespace-nowrap py-1 font-mono text-xs uppercase tracking-widest">
        {row.map((t, i) => (
          <span key={i} className="px-6">
            ★ {t}
          </span>
        ))}
      </div>
    </div>
  );
}
