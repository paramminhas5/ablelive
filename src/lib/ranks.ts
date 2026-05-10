export type Rank = { slug: string; name: string; minXp: number; color: string; tagline: string };

export const RANKS: Rank[] = [
  { slug: "bedroom",   name: "Bedroom Producer",   minXp: 0,    color: "bg-bone",            tagline: "Day one. Headphones on." },
  { slug: "demo",      name: "Demo Tape",          minXp: 200,  color: "bg-acid",            tagline: "First loops out the door." },
  { slug: "studio",    name: "Studio Resident",    minXp: 500,  color: "bg-sun",             tagline: "You know where the gain stage is." },
  { slug: "engineer",  name: "Mix Engineer",       minXp: 1000, color: "bg-volt text-bone",  tagline: "Sidechain, sends, surgery." },
  { slug: "touring",   name: "Touring Artist",     minXp: 1700, color: "bg-hot text-bone",   tagline: "Push, Link, no laptop drop." },
  { slug: "mastering", name: "Mastering Engineer", minXp: 2500, color: "bg-ink text-bone",   tagline: "True-peak, LUFS, last word." },
];

export function rankFor(xp: number): { current: Rank; next: Rank | null; progress: number } {
  let current = RANKS[0];
  for (const r of RANKS) if (xp >= r.minXp) current = r;
  const idx = RANKS.indexOf(current);
  const next = RANKS[idx + 1] ?? null;
  const progress = next ? (xp - current.minXp) / (next.minXp - current.minXp) : 1;
  return { current, next, progress: Math.max(0, Math.min(1, progress)) };
}