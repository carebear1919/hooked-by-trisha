type Row = { label: string; value: number; display: string; colorClass: string };

export default function BreakdownBars({ rows }: { rows: Row[] }) {
  const max = Math.max(1, ...rows.map((r) => r.value));

  if (rows.length === 0) {
    return <p className="font-body text-body-md text-on-surface-variant">No data yet.</p>;
  }

  return (
    <div className="space-y-4">
      {rows.map((row) => (
        <div key={row.label}>
          <div className="flex justify-between mb-1">
            <span className="font-body text-body-md text-on-surface capitalize">{row.label}</span>
            <span className="font-body text-body-md text-on-surface-variant">{row.display}</span>
          </div>
          <div className="h-2.5 rounded-full bg-surface-container-low overflow-hidden">
            <div
              className={`h-full rounded-full ${row.colorClass}`}
              style={{ width: `${Math.max((row.value / max) * 100, 3)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
