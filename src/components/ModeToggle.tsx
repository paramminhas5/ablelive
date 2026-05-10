import { useMode } from "@/lib/mode";

export function ModeToggle() {
  const { mode, setMode } = useMode();
  return (
    <div className="brutal-border bg-bone flex items-stretch font-mono text-[10px] uppercase">
      <button
        onClick={() => setMode("beginner")}
        aria-pressed={mode === "beginner"}
        className={`px-2 py-1 ${mode === "beginner" ? "bg-acid text-ink" : "text-ink/60"}`}
      >
        Beginner
      </button>
      <button
        onClick={() => setMode("advanced")}
        aria-pressed={mode === "advanced"}
        className={`px-2 py-1 brutal-border border-y-0 border-r-0 ${mode === "advanced" ? "bg-volt text-bone" : "text-ink/60"}`}
      >
        Advanced
      </button>
    </div>
  );
}