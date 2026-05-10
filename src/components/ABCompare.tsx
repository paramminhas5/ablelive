import { useState } from "react";

// A/B compare — simple click toggle. A = dry/bypassed, B = wet/processed.
export function ABCompare({ onBypass }: { onBypass: (b: boolean) => void }) {
  const [bypassed, setBypassed] = useState(false);
  const toggle = () => {
    const next = !bypassed;
    setBypassed(next);
    onBypass(next);
  };
  return (
    <button
      onClick={toggle}
      className={`brutal-border px-4 py-3 font-display text-xl brutal-press select-none ${
        bypassed ? "bg-bone text-ink" : "bg-acid text-ink"
      }`}
      title="Click to switch between dry (A) and processed (B) audio"
    >
      {bypassed ? "A · DRY" : "B · WET"}
    </button>
  );
}
