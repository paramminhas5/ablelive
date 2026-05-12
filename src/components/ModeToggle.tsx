import { useMode, useIntermediatePath, type Mode } from "@/lib/mode";

export function ModeToggle() {
  const { mode, setMode } = useMode();
  const { path, setPath } = useIntermediatePath();

  const modes: { id: Mode; label: string; color: string; activeColor: string }[] = [
    { id: "beginner", label: "Beginner", color: "text-ink/60", activeColor: "bg-acid text-ink" },
    {
      id: "intermediate",
      label: "Inter.",
      color: "text-ink/60",
      activeColor: "bg-volt text-bone",
    },
    { id: "advanced", label: "Advanced", color: "text-ink/60", activeColor: "bg-hot text-bone" },
  ];

  return (
    <div className="flex items-stretch font-mono text-[10px] uppercase">
      <div className="brutal-border flex items-stretch">
        {modes.map((m, i) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            aria-pressed={mode === m.id}
            className={`px-2 py-1 transition-colors ${
              mode === m.id ? m.activeColor : m.color
            } ${i > 0 ? "brutal-border border-y-0 border-r-0" : ""}`}
          >
            {m.label}
          </button>
        ))}
      </div>
      {/* Path sub-toggle for intermediate */}
      {mode === "intermediate" && (
        <div className="brutal-border border-l-0 flex items-stretch">
          <button
            onClick={() => setPath("dj")}
            aria-pressed={path === "dj"}
            className={`px-2 py-1 font-mono text-[10px] transition-colors ${
              path === "dj" ? "bg-acid text-ink" : "text-ink/40"
            }`}
          >
            🎧 DJ
          </button>
          <button
            onClick={() => setPath("ableton")}
            aria-pressed={path === "ableton"}
            className={`px-2 py-1 brutal-border border-y-0 border-r-0 font-mono text-[10px] transition-colors ${
              path === "ableton" ? "bg-volt text-bone" : "text-ink/40"
            }`}
          >
            🎹 Live
          </button>
        </div>
      )}
    </div>
  );
}
