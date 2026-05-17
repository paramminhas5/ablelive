// Inline glossary term: dotted underline + hover/tap popover with definition
// and a "View in glossary" link. Works on touch (tap) and desktop (hover).
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Link } from "@tanstack/react-router";
import { lookupTerm, slugTerm, type GlossaryTerm } from "@/content/glossary";

export function Term({
  children,
  term,
}: {
  children: React.ReactNode;
  term?: string; // explicit lookup key; otherwise uses children text
}) {
  const key = term ?? (typeof children === "string" ? children : "");
  const found: GlossaryTerm | undefined = lookupTerm(key);
  if (!found) return <>{children}</>;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="underline decoration-dotted decoration-2 underline-offset-2 cursor-help bg-acid/30 hover:bg-acid/60 px-0.5 rounded-sm font-semibold transition-colors"
        >
          {children}
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="start"
        className="w-72 brutal-border bg-card p-3 font-mono text-xs space-y-2"
      >
        <div className="flex items-baseline justify-between gap-2">
          <div className="font-display text-base">{found.term}</div>
          <span className="brutal-border bg-volt text-bone px-1.5 py-0.5 text-[9px] uppercase">
            {found.cat}
          </span>
        </div>
        <div className="leading-relaxed">{found.def}</div>
        <Link
          to="/glossary"
          hash={slugTerm(found.term)}
          className="brutal-border bg-acid text-ink px-2 py-1 text-[10px] uppercase brutal-press inline-block"
        >
          → Open in glossary
        </Link>
      </PopoverContent>
    </Popover>
  );
}

// Auto-wrap a string with <Term> components for any glossary matches.
// Caps occurrences per term per render to avoid noise (first match wins).
import { AUTO_WRAP_KEYS } from "@/content/glossary";

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Build the megaregex once.
let CACHED_RE: RegExp | null = null;
function getRe() {
  if (CACHED_RE) return CACHED_RE;
  const pattern = AUTO_WRAP_KEYS.map(escapeRe).join("|");
  CACHED_RE = new RegExp(`\\b(${pattern})\\b`, "gi");
  return CACHED_RE;
}

export function Glossarized({
  text,
  maxPerTerm = 1,
}: {
  text: string;
  maxPerTerm?: number;
}) {
  if (!text) return null;
  const re = new RegExp(getRe().source, "gi");
  const seen = new Map<string, number>();
  const out: React.ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = re.exec(text)) !== null) {
    const lower = m[0].toLowerCase();
    const count = seen.get(lower) ?? 0;
    if (count >= maxPerTerm) continue;
    seen.set(lower, count + 1);
    if (m.index > last) out.push(text.slice(last, m.index));
    out.push(
      <Term key={`t${key++}`} term={lower}>
        {m[0]}
      </Term>,
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return <>{out}</>;
}
