import { useState, useEffect } from "react";
import { THEMES, applyTheme, getStoredTheme, type ThemeId } from "@/lib/theme";

export function ThemeSwitcher({ compact = false }: { compact?: boolean }) {
  const [current, setCurrent] = useState<ThemeId>("brutalist");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setCurrent(getStoredTheme());
    const h = (e: Event) => setCurrent((e as CustomEvent<ThemeId>).detail);
    window.addEventListener("theme:change", h);
    return () => window.removeEventListener("theme:change", h);
  }, []);

  const currentTheme = THEMES.find((t) => t.id === current) ?? THEMES[0];

  if (compact) {
    return (
      <div className="relative">
        <button
          onClick={() => setOpen((v) => !v)}
          className="brutal-border w-8 h-8 flex items-center justify-center brutal-press hover:bg-sun/30"
          title={`Theme: ${currentTheme.name}`}
          aria-label="Switch theme"
        >
          {/* Palette icon */}
          <PaletteIcon preview={currentTheme.preview} />
        </button>

        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <div className="absolute right-0 top-10 z-50 brutal-border bg-bone shadow-lg min-w-[180px]">
              <div className="font-mono text-[9px] uppercase opacity-50 px-3 pt-2 pb-1">THEME</div>
              {THEMES.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => { applyTheme(theme.id); setCurrent(theme.id); setOpen(false); }}
                  className={`w-full text-left px-3 py-2.5 flex items-center gap-2.5 brutal-press font-mono text-xs uppercase hover:bg-sun/30 ${current === theme.id ? "bg-acid text-ink" : ""}`}
                >
                  <PaletteIcon preview={theme.preview} />
                  <div>
                    <div className="font-display text-sm">{theme.name}</div>
                    <div className="opacity-50 text-[9px] normal-case font-mono">{theme.description}</div>
                  </div>
                  {current === theme.id && <span className="ml-auto">✓</span>}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  // Full version for Profile page
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      {THEMES.map((theme) => (
        <button
          key={theme.id}
          onClick={() => { applyTheme(theme.id); setCurrent(theme.id); }}
          className={`brutal-border p-3 text-left brutal-press transition-all ${current === theme.id ? "bg-acid" : "bg-bone hover:bg-sun/30"}`}
        >
          {/* Mini preview */}
          <div
            className="w-full h-8 brutal-border mb-2"
            style={{ background: theme.preview.bg, outline: `3px solid ${theme.preview.accent}`, outlineOffset: "-3px" }}
          />
          <div className="font-display text-base">{theme.name}</div>
          <div className="font-mono text-[9px] opacity-60 leading-tight mt-0.5">{theme.description}</div>
          {current === theme.id && <div className="font-mono text-[9px] mt-1">● ACTIVE</div>}
        </button>
      ))}
    </div>
  );
}

function PaletteIcon({ preview }: { preview: { bg: string; accent: string; text: string } }) {
  return (
    <div className="w-5 h-5 brutal-border shrink-0 relative overflow-hidden" style={{ background: preview.bg }}>
      <div className="absolute inset-0 flex">
        <div className="flex-1 h-full" style={{ background: preview.accent }} />
        <div className="flex-1 h-full" style={{ background: preview.text }} />
      </div>
    </div>
  );
}
