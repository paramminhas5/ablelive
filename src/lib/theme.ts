/**
 * Theme system — 4 palettes, CSS variable overrides, persisted to localStorage
 */

export type ThemeId = "brutalist" | "night" | "neon" | "solar";

export type Theme = {
  id: ThemeId;
  name: string;
  description: string;
  preview: { bg: string; accent: string; text: string }; // Tailwind-safe inline style values
  vars: Record<string, string>;
};

// Base palette (oklch values matching styles.css)
const BONE   = "oklch(0.96 0.012 90)";
const INK    = "oklch(0.12 0 0)";
const ACID   = "oklch(0.92 0.24 125)";
const VOLT   = "oklch(0.55 0.27 265)";
const SUN    = "oklch(0.88 0.18 90)";
const HOT    = "oklch(0.66 0.27 0)";
const CREAM  = "oklch(0.97 0.008 90)";
const DEEP   = "oklch(0.08 0 0)";

export const THEMES: Theme[] = [
  {
    id: "brutalist",
    name: "Brutalist",
    description: "The default. Raw, ink-heavy, acid accents.",
    preview: { bg: "#f5f0e8", accent: "#c6ff00", text: "#111" },
    vars: {
      "--bone": BONE, "--ink": INK, "--acid": ACID,
      "--volt": VOLT, "--sun": SUN, "--hot": HOT,
      "--background": BONE, "--foreground": INK,
      "--border": INK, "--input": INK,
    },
  },
  {
    id: "night",
    name: "Night",
    description: "Dark ink surface, volt accents, bone text.",
    preview: { bg: "#111", accent: "#4040ff", text: "#f0ece0" },
    vars: {
      "--bone": INK,
      "--ink": BONE,
      "--acid": VOLT,
      "--volt": ACID,
      "--sun": "oklch(0.4 0.15 90)",
      "--hot": HOT,
      "--background": DEEP,
      "--foreground": BONE,
      "--border": BONE,
      "--input": BONE,
    },
  },
  {
    id: "neon",
    name: "Neon",
    description: "Hot pink brand, cream surface, ink borders.",
    preview: { bg: "#fdf6ec", accent: "#e53030", text: "#111" },
    vars: {
      "--bone": CREAM,
      "--ink": INK,
      "--acid": HOT,
      "--volt": ACID,
      "--sun": SUN,
      "--hot": VOLT,
      "--background": CREAM,
      "--foreground": INK,
      "--border": INK,
      "--input": INK,
    },
  },
  {
    id: "solar",
    name: "Solar",
    description: "Warm sun-yellow surface, orange accents.",
    preview: { bg: "#fde68a", accent: "#f97316", text: "#111" },
    vars: {
      "--bone": SUN,
      "--ink": INK,
      "--acid": "oklch(0.75 0.22 55)",
      "--volt": VOLT,
      "--sun": ACID,
      "--hot": HOT,
      "--background": SUN,
      "--foreground": INK,
      "--border": INK,
      "--input": INK,
    },
  },
];

const THEME_KEY = "ccd.school.theme";

export function getStoredTheme(): ThemeId {
  if (typeof localStorage === "undefined") return "brutalist";
  return (localStorage.getItem(THEME_KEY) as ThemeId) ?? "brutalist";
}

export function applyTheme(id: ThemeId) {
  const theme = THEMES.find((t) => t.id === id) ?? THEMES[0];
  const root = document.documentElement;
  for (const [k, v] of Object.entries(theme.vars)) {
    root.style.setProperty(k, v);
  }
  localStorage.setItem(THEME_KEY, id);
  root.setAttribute("data-theme", id);
  window.dispatchEvent(new CustomEvent("theme:change", { detail: id }));
}

export function initTheme() {
  applyTheme(getStoredTheme());
}
