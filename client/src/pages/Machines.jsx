import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios.js';
import { usePolling } from '../hooks/usePolling.js';
import { useAuth } from '../context/AuthContext.jsx';
import { MachineStatusBadge } from '../components/StatusBadge.jsx';

async function fetchMachines() {
  const { data } = await api.get('/machines');
  return data;
}

const emptyForm = { name: '', type: '', location: '', targetOutput: 100 };

export default function Machines() {
  const { isAdmin } = useAuth();
  const { data: machines, refetch } = usePolling(fetchMachines, { intervalMs: 5000 });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleCreate(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api.post('/machines', { ...form, targetOutput: Number(form.targetOutput) });
      setForm(emptyForm);
      setShowForm(false);
      refetch();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create machine');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Machines</h1>
          <p className="text-sm text-slate-500">All equipment currently registered on the floor.</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowForm((v) => !v)}
            className="rounded-md bg-factory-500 px-3 py-2 text-sm font-medium text-white hover:bg-factory-600"
          >
            {showForm ? 'Cancel' : '+ Add machine'}
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-4">
          <input
            required
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            required
            placeholder="Type (e.g. CNC)"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            required
            placeholder="Location (e.g. Line 1)"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            type="number"
            min="1"
            placeholder="Target output/hr"
            value={form.targetOutput}
            onChange={(e) => setForm({ ...form, targetOutput: e.target.value })}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          {error && <p className="col-span-4 text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="col-span-4 rounded-md bg-factory-500 px-3 py-2 text-sm font-medium text-white hover:bg-factory-600 disabled:opacity-60 sm:col-span-1"
          >
            {submitting ? 'Saving…' : 'Save machine'}
          </button>
        </form>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-100 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Latest Throughput</th>
              <th className="px-4 py-3">Latest Temp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(machines || []).map((m) => (
              <tr key={m._id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <Link to={`/machines/${m._id}`} className="font-medium text-factory-600 hover:underline">
                    {m.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-600">{m.type}</td>
                <td className="px-4 py-3 text-slate-600">{m.location}</td>
                <td className="px-4 py-3"><MachineStatusBadge status={m.status} /></td>
                <td className="px-4 py-3 text-slate-600">{m.latestReading ? m.latestReading.throughput : '—'}</td>
                <td className="px-4 py-3 text-slate-600">
                  {m.latestReading ? `${m.latestReading.temperature}°C` : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {machines && machines.length === 0 && (
          <p className="py-8 text-center text-sm text-slate-400">No machines registered yet.</p>
        )}
      </div>
    </div>
  );
}
