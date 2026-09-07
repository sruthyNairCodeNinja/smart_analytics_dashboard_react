import { useState } from 'react';
import api from '../api/axios.js';
import { usePolling } from '../hooks/usePolling.js';
import { useAuth } from '../context/AuthContext.jsx';
import { SeverityBadge } from '../components/StatusBadge.jsx';

const FILTERS = [
  { label: 'Active', value: 'false' },
  { label: 'Resolved', value: 'true' },
  { label: 'All', value: '' },
];

export default function Alerts() {
  const { isAdmin } = useAuth();
  const [filter, setFilter] = useState('false');
  const [resolvingId, setResolvingId] = useState(null);

  const { data: alerts, refetch } = usePolling(
    async () => {
      const params = filter === '' ? {} : { resolved: filter };
      const { data } = await api.get('/alerts', { params });
      return data;
    },
    { intervalMs: 5000, deps: [filter] }
  );

  async function handleResolve(id) {
    setResolvingId(id);
    try {
      await api.patch(`/alerts/${id}/resolve`);
      refetch();
    } finally {
      setResolvingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Alerts</h1>
        <p className="text-sm text-slate-500">Threshold breaches and downtime events across the floor.</p>
      </div>

      <div className="flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.label}
            onClick={() => setFilter(f.value)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${
              filter === f.value ? 'bg-factory-500 text-white' : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-100 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Machine</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Severity</th>
              <th className="px-4 py-3">Message</th>
              <th className="px-4 py-3">Time</th>
              {isAdmin && <th className="px-4 py-3">Action</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(alerts || []).map((a) => (
              <tr key={a._id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-800">{a.machine?.name || '—'}</td>
                <td className="px-4 py-3 capitalize text-slate-600">{a.type.replace('_', ' ')}</td>
                <td className="px-4 py-3"><SeverityBadge severity={a.severity} /></td>
                <td className="px-4 py-3 text-slate-600">{a.message}</td>
                <td className="px-4 py-3 text-slate-500">{new Date(a.createdAt).toLocaleString()}</td>
                {isAdmin && (
                  <td className="px-4 py-3">
                    {!a.resolved ? (
                      <button
                        onClick={() => handleResolve(a._id)}
                        disabled={resolvingId === a._id}
                        className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-factory-600 hover:bg-factory-50 disabled:opacity-60"
                      >
                        {resolvingId === a._id ? 'Resolving…' : 'Resolve'}
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400">Resolved</span>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {alerts && alerts.length === 0 && (
          <p className="py-8 text-center text-sm text-slate-400">No alerts to show for this filter.</p>
        )}
      </div>
    </div>
  );
}
