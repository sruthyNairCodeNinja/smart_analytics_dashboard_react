import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer } from 'recharts';
import api from '../api/axios.js';
import { usePolling } from '../hooks/usePolling.js';
import StatCard from '../components/StatCard.jsx';
import { MachineStatusBadge, SeverityBadge } from '../components/StatusBadge.jsx';
import { STATUS, INK } from '../theme/colors.js';

async function fetchOverview() {
  const { data } = await api.get('/stats/overview');
  return data;
}

async function fetchMachines() {
  const { data } = await api.get('/machines');
  return data;
}

async function fetchRecentAlerts() {
  const { data } = await api.get('/alerts', { params: { resolved: false } });
  return data.slice(0, 5);
}

export default function Dashboard() {
  const { data: overview } = usePolling(fetchOverview, { intervalMs: 5000 });
  const { data: machines } = usePolling(fetchMachines, { intervalMs: 5000 });
  const { data: alerts } = usePolling(fetchRecentAlerts, { intervalMs: 5000 });

  const statusChartData = overview
    ? [
        { name: 'Running', value: overview.running, key: 'running' },
        { name: 'Idle', value: overview.idle, key: 'idle' },
        { name: 'Down', value: overview.down, key: 'down' },
      ]
    : [];

  const statusColor = { running: STATUS.good, idle: STATUS.warning, down: STATUS.critical };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Factory Overview</h1>
        <p className="text-sm text-slate-500">Live-simulated metrics, refreshed every few seconds.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Uptime" value={overview ? `${overview.uptimePercent}%` : '—'} accent={STATUS.good} />
        <StatCard label="Throughput (1h)" value={overview ? overview.totalThroughputLastHour : '—'} unit="units" />
        <StatCard label="Avg Temperature" value={overview ? overview.avgTemperature : '—'} unit="°C" />
        <StatCard label="Defects (1h)" value={overview ? overview.totalDefectsLastHour : '—'} unit="units" />
        <StatCard
          label="Active Alerts"
          value={overview ? overview.activeAlerts : '—'}
          accent={overview?.criticalAlerts ? STATUS.critical : undefined}
          sub={overview?.criticalAlerts ? `${overview.criticalAlerts} critical` : undefined}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:col-span-1">
          <h2 className="text-sm font-semibold text-slate-700">Machine Status</h2>
          <div className="mt-2 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusChartData} layout="vertical" margin={{ left: 8, right: 16 }}>
                <CartesianGrid horizontal={false} stroke={INK.gridline} />
                <XAxis type="number" allowDecimals={false} stroke={INK.muted} fontSize={12} />
                <YAxis type="category" dataKey="name" stroke={INK.muted} fontSize={12} width={70} />
                <Tooltip />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={28}>
                  {statusChartData.map((entry) => (
                    <Cell key={entry.key} fill={statusColor[entry.key]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700">Machines</h2>
            <Link to="/machines" className="text-xs font-medium text-factory-600 hover:underline">
              View all
            </Link>
          </div>
          <div className="mt-3 divide-y divide-slate-100">
            {(machines || []).slice(0, 6).map((m) => (
              <Link
                key={m._id}
                to={`/machines/${m._id}`}
                className="flex items-center justify-between py-2.5 text-sm hover:bg-slate-50"
              >
                <div>
                  <p className="font-medium text-slate-800">{m.name}</p>
                  <p className="text-xs text-slate-400">{m.location} · {m.type}</p>
                </div>
                <div className="flex items-center gap-4 text-right">
                  <span className="text-xs text-slate-500">
                    {m.latestReading ? `${m.latestReading.throughput} units/tick` : 'no data yet'}
                  </span>
                  <MachineStatusBadge status={m.status} />
                </div>
              </Link>
            ))}
            {machines && machines.length === 0 && (
              <p className="py-6 text-center text-sm text-slate-400">
                No machines yet — seed the database or add one from the Machines page.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700">Recent Alerts</h2>
          <Link to="/alerts" className="text-xs font-medium text-factory-600 hover:underline">
            View all
          </Link>
        </div>
        <div className="mt-3 divide-y divide-slate-100">
          {(alerts || []).map((a) => (
            <div key={a._id} className="flex items-center justify-between py-2.5 text-sm">
              <div>
                <p className="text-slate-800">{a.message}</p>
                <p className="text-xs text-slate-400">{a.machine?.name} · {new Date(a.createdAt).toLocaleTimeString()}</p>
              </div>
              <SeverityBadge severity={a.severity} />
            </div>
          ))}
          {alerts && alerts.length === 0 && (
            <p className="py-6 text-center text-sm text-slate-400">No active alerts. Everything is nominal.</p>
          )}
        </div>
      </div>
    </div>
  );
}
