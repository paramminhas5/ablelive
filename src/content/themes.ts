// Theme palettes — applied via `data-theme` on <html>. Each palette overrides
// the six core CCD tokens (--bone, --ink, --acid, --hot, --volt, --sun).
// Inspired by the CCD brand and adapted into named scenes.
export type ThemeId =
  | "ccd-classic"
  | "midnight"
  | "paper-ink"
  | "neon-mint"
  | "sunset"
  | "cherry";

export type ThemeDef = {
  id: ThemeId;
  name: string;
  // Swatch shown in the picker
  swatch: [string, string, string, string];
};

export const THEMES: ThemeDef[] = [
  { id: "ccd-classic", name: "CCD Classic", swatch: ["#F5F0E8", "#0B0B0B", "#C6FF00", "#FF2D2D"] },
  { id: "midnight", name: "Midnight", swatch: ["#0E1020", "#F5F0E8", "#7B2FFF", "#22D3EE"] },
  { id: "paper-ink", name: "Paper & Ink", swatch: ["#F5F3EE", "#0D0D0D", "#FF6B35", "#FFB800"] },
  { id: "neon-mint", name: "Neon Mint", swatch: ["#0F1B2A", "#F0FFF4", "#2DD4A8", "#FF2D6B"] },
  { id: "sunset", name: "Sunset Blaze", swatch: ["#1A0B1F", "#FFE8D6", "#FF6B35", "#E84393"] },
  { id: "cherry", name: "Cherry Blossom", swatch: ["#FEF0F5", "#3B0A2A", "#E88AAB", "#7B2FFF"] },
];

export const DEFAULT_THEME: ThemeId = "ccd-classic";
