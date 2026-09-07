import { useParams, Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts';
import api from '../api/axios.js';
import { usePolling } from '../hooks/usePolling.js';
import { MachineStatusBadge } from '../components/StatusBadge.jsx';
import StatCard from '../components/StatCard.jsx';
import { CATEGORICAL, INK } from '../theme/colors.js';

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function MachineDetail() {
  const { id } = useParams();

  const { data: machine } = usePolling(
    async () => (await api.get(`/machines/${id}`)).data,
    { intervalMs: 5000, deps: [id] }
  );

  const { data: readings } = usePolling(
    async () => (await api.get(`/machines/${id}/readings`, { params: { hours: 3 } })).data,
    { intervalMs: 5000, deps: [id] }
  );

  const chartData = (readings || []).map((r) => ({
    time: formatTime(r.timestamp),
    throughput: r.throughput,
    temperature: r.temperature,
    vibration: r.vibration,
  }));

  const latest = readings && readings.length ? readings[readings.length - 1] : null;

  return (
    <div className="space-y-6">
      <div>
        <Link to="/machines" className="text-xs font-medium text-factory-600 hover:underline">
          ← All machines
        </Link>
        <div className="mt-1 flex items-center gap-3">
          <h1 className="text-xl font-semibold text-slate-900">{machine ? machine.name : 'Loading…'}</h1>
          {machine && <MachineStatusBadge status={machine.status} />}
        </div>
        {machine && (
          <p className="text-sm text-slate-500">{machine.type} · {machine.location} · target {machine.targetOutput} units/hr</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Throughput" value={latest ? latest.throughput : '—'} unit="units/tick" />
        <StatCard label="Temperature" value={latest ? latest.temperature : '—'} unit="°C" />
        <StatCard label="Vibration" value={latest ? latest.vibration : '—'} unit="mm/s" />
        <StatCard label="Defects" value={latest ? latest.defectCount : '—'} unit="last tick" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Throughput (last 3h)">
          <LineChart data={chartData} margin={{ left: 4, right: 12, top: 8 }}>
            <CartesianGrid stroke={INK.gridline} vertical={false} />
            <XAxis dataKey="time" stroke={INK.muted} fontSize={11} minTickGap={30} />
            <YAxis stroke={INK.muted} fontSize={11} />
            <Tooltip />
            <Line type="monotone" dataKey="throughput" stroke={CATEGORICAL[0]} strokeWidth={2} dot={false} name="Throughput" />
          </LineChart>
        </ChartCard>

        <ChartCard title="Temperature (last 3h)">
          <LineChart data={chartData} margin={{ left: 4, right: 12, top: 8 }}>
            <CartesianGrid stroke={INK.gridline} vertical={false} />
            <XAxis dataKey="time" stroke={INK.muted} fontSize={11} minTickGap={30} />
            <YAxis stroke={INK.muted} fontSize={11} unit="°C" />
            <Tooltip />
            <Line type="monotone" dataKey="temperature" stroke={CATEGORICAL[1]} strokeWidth={2} dot={false} name="Temperature" />
            {machine && (
              <ReferenceLine
                y={machine.thresholds.temperature}
                stroke={INK.baseline}
                strokeDasharray="4 4"
                label={{ value: 'Threshold', position: 'insideTopRight', fill: INK.muted, fontSize: 11 }}
              />
            )}
          </LineChart>
        </ChartCard>
      </div>

      {chartData.length === 0 && (
        <p className="text-center text-sm text-slate-400">
          No readings yet for this machine — the simulation engine writes a new one every few seconds.
        </p>
      )}
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-700">{title}</h2>
      <div className="mt-2 h-64">
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
