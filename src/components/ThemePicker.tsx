import { useEffect, useState } from "react";
import { THEMES, DEFAULT_THEME, type ThemeId } from "@/content/themes";

const KEY = "ccd.theme";

function applyTheme(id: ThemeId) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", id);
}

export function ThemePicker() {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<ThemeId>(DEFAULT_THEME);

  useEffect(() => {
    const saved = (typeof localStorage !== "undefined" && (localStorage.getItem(KEY) as ThemeId)) || DEFAULT_THEME;
    setTheme(saved);
    applyTheme(saved);
  }, []);

  const choose = (id: ThemeId) => {
    setTheme(id);
    applyTheme(id);
    if (typeof localStorage !== "undefined") localStorage.setItem(KEY, id);
    setOpen(false);
  };

  const current = THEMES.find((t) => t.id === theme) ?? THEMES[0];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="true"
        aria-expanded={open}
        title={`Theme: ${current.name}`}
        className="brutal-border bg-bone px-2 py-1.5 hover:bg-sun flex items-center gap-1.5 font-mono text-[10px] uppercase"
      >
        <span className="flex gap-0.5">
          {current.swatch.map((c, i) => (
            <span
              key={i}
              className="w-2 h-2 brutal-border"
              style={{ background: c, borderWidth: 1 }}
            />
          ))}
        </span>
        <span className="hidden lg:inline">{current.name}</span>
        <span className="opacity-60">▾</span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 brutal-border bg-bone z-50 min-w-[200px] brutal-shadow-sm">
            {THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => choose(t.id)}
                className={`w-full px-3 py-2 flex items-center gap-2 font-mono text-[10px] uppercase brutal-border border-x-0 border-t-0 hover:bg-sun text-left ${
                  t.id === theme ? "bg-acid" : ""
                }`}
              >
                <span className="flex gap-0.5">
                  {t.swatch.map((c, i) => (
                    <span
                      key={i}
                      className="w-3 h-3 brutal-border"
                      style={{ background: c, borderWidth: 1 }}
                    />
                  ))}
                </span>
                <span className="flex-1">{t.name}</span>
                {t.id === theme && <span>✓</span>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
