// Inline glossary term: dotted underline + hover/tap popover with definition
// and a "View in glossary" link. Works on touch (tap) and desktop (hover).
import { createContext, useContext, useMemo, useRef } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Link } from "@tanstack/react-router";
import {
  lookupTerm,
  slugTerm,
  AUTO_WRAP_KEYS,
  type GlossaryTerm,
} from "@/content/glossary";

export function Term({
  children,
  term,
}: {
  children: React.ReactNode;
  term?: string;
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

// --- Shared dedup scope ----------------------------------------------------
// Wrap a mission/page in <GlossaryScope> so every <Glossarized> below it
// shares one "already seen" set — each term is auto-linked AT MOST ONCE per
// scope, regardless of how many text blocks render it.
type Scope = { seen: Set<string> };
const ScopeCtx = createContext<Scope | null>(null);

export function GlossaryScope({ children, resetKey }: { children: React.ReactNode; resetKey?: string }) {
  // Reset the set whenever resetKey changes (e.g. mission slug).
  const ref = useRef<{ key: string | undefined; scope: Scope }>({
    key: resetKey,
    scope: { seen: new Set() },
  });
  if (ref.current.key !== resetKey) {
    ref.current = { key: resetKey, scope: { seen: new Set() } };
  }
  return <ScopeCtx.Provider value={ref.current.scope}>{children}</ScopeCtx.Provider>;
}

// --- Auto-wrap text --------------------------------------------------------
const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
let CACHED_SRC: string | null = null;
function getReSrc() {
  if (CACHED_SRC) return CACHED_SRC;
  CACHED_SRC = AUTO_WRAP_KEYS.map(escapeRe).join("|");
  return CACHED_SRC;
}

export function Glossarized({ text }: { text: string }) {
  const scope = useContext(ScopeCtx);
  // Fall back to a fresh local set if no scope is present.
  const localScope = useMemo<Scope>(() => ({ seen: new Set() }), [text]);
  const seen = (scope ?? localScope).seen;

  if (!text) return null;
  const re = new RegExp(`\\b(${getReSrc()})\\b`, "gi");
  const out: React.ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = re.exec(text)) !== null) {
    const lower = m[0].toLowerCase();
    if (seen.has(lower)) continue;
    seen.add(lower);
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
