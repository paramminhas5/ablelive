// SignalFlowSVG — render a textual "A → B → C" pipeline as boxes + arrows.
// Falls back gracefully when the input is just one chunk.

export function SignalFlowSVG({ flow }: { flow: string }) {
  // Split on arrow glyphs; trim noise.
  const stages = flow
    .split(/→|->/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (stages.length === 0) return null;

  const boxW = 130;
  const boxH = 44;
  const gap = 22;
  const totalW = stages.length * boxW + (stages.length - 1) * gap;
  const h = boxH + 24;

  return (
    <div className="brutal-border bg-bone p-3 overflow-x-auto">
      <div className="font-mono text-[10px] uppercase mb-2 opacity-70">▸ SIGNAL FLOW</div>
      <svg
        width={totalW}
        height={h}
        viewBox={`0 0 ${totalW} ${h}`}
        className="block"
        role="img"
        aria-label={flow}
      >
        {stages.map((s, i) => {
          const x = i * (boxW + gap);
          const fillCls =
            i === 0
              ? "fill-[hsl(var(--ink))]"
              : i === stages.length - 1
                ? "fill-[hsl(var(--volt))]"
                : "fill-[hsl(var(--acid))]";
          const textFill = i === 0 || i === stages.length - 1 ? "#FAF9F6" : "#0A0A0A";
          return (
            <g key={i}>
              <rect
                x={x}
                y={12}
                width={boxW}
                height={boxH}
                className={`${fillCls} stroke-[hsl(var(--ink))]`}
                strokeWidth={3}
              />
              <text
                x={x + boxW / 2}
                y={12 + boxH / 2 + 4}
                textAnchor="middle"
                fill={textFill}
                style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 700 }}
              >
                {truncate(s, 16)}
              </text>
              {i < stages.length - 1 && (
                <g>
                  <line
                    x1={x + boxW}
                    y1={12 + boxH / 2}
                    x2={x + boxW + gap - 6}
                    y2={12 + boxH / 2}
                    stroke="#0A0A0A"
                    strokeWidth={2}
                  />
                  <polygon
                    points={`${x + boxW + gap - 6},${12 + boxH / 2 - 5} ${x + boxW + gap},${12 + boxH / 2} ${x + boxW + gap - 6},${12 + boxH / 2 + 5}`}
                    fill="#0A0A0A"
                  />
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}