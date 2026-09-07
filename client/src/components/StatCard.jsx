export default function StatCard({ label, value, unit, accent, sub }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 flex items-baseline gap-1">
        <span className="text-2xl font-semibold text-slate-900" style={accent ? { color: accent } : undefined}>
          {value}
        </span>
        {unit && <span className="text-sm text-slate-500">{unit}</span>}
      </p>
      {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
    </div>
  );
}
