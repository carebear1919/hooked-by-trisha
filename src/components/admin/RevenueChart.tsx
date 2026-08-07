"use client";

import { useEffect, useRef, useState } from "react";

type DayPoint = { label: string; date: string; revenue: number; orders: number };

const HEIGHT = 220;
const PADDING_X = 24;
const PADDING_TOP = 32;
const PADDING_BOTTOM = 28;
const DEFAULT_WIDTH = 640;

export default function RevenueChart({ data }: { data: DayPoint[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const [hover, setHover] = useState<number | null>(null);
  const [showTable, setShowTable] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w) setWidth(w);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const max = Math.max(1, ...data.map((d) => d.revenue));
  const plotHeight = HEIGHT - PADDING_TOP - PADDING_BOTTOM;
  const plotWidth = width - PADDING_X * 2;
  const step = data.length > 1 ? plotWidth / (data.length - 1) : 0;
  const baselineY = HEIGHT - PADDING_BOTTOM;
  const labelStep = Math.ceil(data.length / 8);

  const points = data.map((d, i) => ({
    x: PADDING_X + i * step,
    y: baselineY - (d.revenue / max) * plotHeight,
    ...d,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaPath = `${linePath} L${points[points.length - 1]?.x ?? 0},${baselineY} L${points[0]?.x ?? 0},${baselineY} Z`;

  const hovered = hover !== null ? points[hover] : null;

  return (
    <div>
      <div className="flex justify-end mb-2">
        <button
          type="button"
          onClick={() => setShowTable((v) => !v)}
          className="text-label-md font-body text-primary hover:underline"
        >
          {showTable ? "View as chart" : "View as table"}
        </button>
      </div>

      {showTable ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/50">
                <th className="px-4 py-2 font-body text-label-md text-outline uppercase tracking-wider">Day</th>
                <th className="px-4 py-2 font-body text-label-md text-outline uppercase tracking-wider">Revenue</th>
                <th className="px-4 py-2 font-body text-label-md text-outline uppercase tracking-wider">Orders</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {data.map((d) => (
                <tr key={d.date}>
                  <td className="px-4 py-2 font-body text-on-surface">{d.label}</td>
                  <td className="px-4 py-2 font-body text-on-surface">₱{d.revenue.toLocaleString("en-PH")}</td>
                  <td className="px-4 py-2 font-body text-on-surface-variant">{d.orders}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div ref={containerRef} className="relative h-56 sm:h-64 w-full">
          <svg
            viewBox={`0 0 ${width} ${HEIGHT}`}
            className="w-full h-full block"
            role="img"
            aria-label={`Revenue trend over the last ${data.length} days`}
          >
            <defs>
              <linearGradient id="revenue-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.25" />
                <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
              </linearGradient>
            </defs>

            <line
              x1={PADDING_X}
              y1={baselineY}
              x2={width - PADDING_X}
              y2={baselineY}
              className="stroke-outline-variant/40"
              strokeWidth={1}
            />

            <path d={areaPath} fill="url(#revenue-fill)" />
            <path d={linePath} fill="none" stroke="var(--color-primary)" strokeWidth={2} strokeLinejoin="round" />

            {hovered && (
              <line
                x1={hovered.x}
                y1={PADDING_TOP}
                x2={hovered.x}
                y2={baselineY}
                className="stroke-outline-variant/60"
                strokeWidth={1}
                strokeDasharray="3,3"
              />
            )}

            {points.map((p, i) => (
              <circle
                key={p.date}
                cx={p.x}
                cy={p.y}
                r={hover === i ? 5 : 3}
                fill="var(--color-primary)"
                stroke="var(--color-surface-container-lowest, white)"
                strokeWidth={hover === i ? 2 : 0}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                className="cursor-pointer transition-all"
              />
            ))}

            {/* wide invisible hit targets for easier hover */}
            {points.map((p, i) => (
              <rect
                key={`hit-${p.date}`}
                x={p.x - step / 2}
                y={PADDING_TOP}
                width={step || 20}
                height={plotHeight}
                fill="transparent"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
              />
            ))}

            {points.map((p, i) => (
              <text
                key={`label-${p.date}`}
                x={p.x}
                y={HEIGHT - PADDING_BOTTOM + 16}
                textAnchor="middle"
                className="fill-on-surface-variant"
                fontSize={10}
                opacity={i % labelStep === 0 || hover === i ? 1 : 0}
              >
                {p.label}
              </text>
            ))}

            {hovered && (
              <g>
                <rect
                  x={Math.min(Math.max(hovered.x - 44, PADDING_X), width - PADDING_X - 88)}
                  y={hovered.y - 34}
                  width={88}
                  height={26}
                  rx={6}
                  className="fill-on-surface"
                />
                <text
                  x={Math.min(Math.max(hovered.x, PADDING_X + 44), width - PADDING_X - 44)}
                  y={hovered.y - 16}
                  textAnchor="middle"
                  className="fill-surface"
                  fontSize={12}
                  fontWeight={700}
                >
                  ₱{hovered.revenue.toLocaleString("en-PH")}
                </text>
              </g>
            )}
          </svg>
        </div>
      )}
    </div>
  );
}
