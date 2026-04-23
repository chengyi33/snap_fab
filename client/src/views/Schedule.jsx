import React, { useEffect, useState } from 'react';
import { api } from '../api';
import Badge from '../components/Badge';

export default function Schedule() {
  const [layers, setLayers] = useState([]);
  const [durations, setDurations] = useState({});
  const [uploading, setUploading] = useState(false);

  const load = () => api.layers.list().then(l => {
    const sorted = [...l].sort((a, b) => a.layer_num - b.layer_num);
    setLayers(sorted);
    const d = {};
    sorted.forEach(layer => { d[layer.id] = 5; });
    setDurations(d);
  });

  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    await api.layers.update(id, { status });
    load();
  };

  const done = layers.filter(l => l.status === 'done').length;
  const active = layers.find(l => l.status === 'active');
  const total = layers.length;

  return (
    <div>
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-xl font-semibold">Master Schedule</h1>
          <p className="text-gray-400 text-sm mt-0.5">{total} layers · baseline 1 week/layer</p>
        </div>
        <button disabled className="px-3 py-2 border border-gray-700 rounded-lg text-sm text-gray-600 cursor-not-allowed">⬆ Import MS Project</button>
      </div>

      {/* Timeline */}
      {layers.length > 0 && (
        <div className="rounded-xl p-4 mb-4" style={{ background: '#1a1d2e', border: '1px solid #2d3148' }}>
          <div className="flex gap-0.5 h-7 mb-2">
            {layers.map(l => (
              <div
                key={l.id}
                title={`L${l.layer_num} — ${l.name}`}
                className={`flex-1 rounded-sm transition-all ${
                  l.status === 'done' ? 'bg-green-600' :
                  l.status === 'active' ? 'bg-indigo-500' : 'bg-gray-700'
                }`}
              />
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>L1 · Start</span>
            {active && <span className="text-indigo-400 font-medium">L{active.layer_num} · Now</span>}
            <span>L{total} · End</span>
          </div>
          <div className="flex gap-4 mt-3 text-xs text-gray-500">
            <span><span className="inline-block w-3 h-2 rounded bg-green-600 mr-1" />Complete ({done})</span>
            <span><span className="inline-block w-3 h-2 rounded bg-indigo-500 mr-1" />Active</span>
            <span><span className="inline-block w-3 h-2 rounded bg-gray-700 mr-1" />Planned ({total - done - (active ? 1 : 0)})</span>
          </div>
        </div>
      )}

      {/* Sliders for upcoming layers */}
      {layers.filter(l => l.status === 'upcoming' || l.status === 'active').slice(0, 5).length > 0 && (
        <div className="rounded-xl p-4 mb-4" style={{ background: '#1a1d2e', border: '1px solid #2d3148' }}>
          <div className="text-sm font-medium mb-3 text-gray-300">Per-Layer Duration (days)</div>
          <div className="space-y-3">
            {layers.filter(l => l.status === 'upcoming' || l.status === 'active').slice(0, 5).map(l => (
              <div key={l.id} className="flex items-center gap-3 text-sm">
                <span className="w-12 text-gray-500 text-xs shrink-0">L{l.layer_num}</span>
                <input
                  type="range" min="3" max="14" step="1"
                  value={durations[l.id] || 5}
                  onChange={e => setDurations(d => ({ ...d, [l.id]: Number(e.target.value) }))}
                  className="flex-1 accent-indigo-500"
                />
                <span className="w-14 text-right text-xs font-medium text-gray-300">{durations[l.id] || 5} days</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Layer table */}
      <div className="rounded-xl overflow-hidden" style={{ background: '#1a1d2e', border: '1px solid #2d3148' }}>
        {layers.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-500 text-sm">No layers yet. Upload a spreadsheet in POR Editor to add layers.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-500 uppercase border-b border-gray-800 bg-gray-900/50">
                <th className="px-4 py-2 text-left w-12">#</th>
                <th className="px-4 py-2 text-left">Layer</th>
                <th className="px-4 py-2 text-left">Target Week</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Notes</th>
              </tr>
            </thead>
            <tbody>
              {layers.map(l => (
                <tr key={l.id} className={`border-b border-gray-800/50 hover:bg-gray-800/20 ${l.status === 'active' ? 'bg-indigo-950/30' : ''}`}>
                  <td className="px-4 py-2.5 text-gray-500">L{l.layer_num}</td>
                  <td className="px-4 py-2.5 font-medium">{l.name}</td>
                  <td className="px-4 py-2.5 text-gray-400">{l.target_week || '—'}</td>
                  <td className="px-4 py-2.5">
                    <select
                      className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-xs"
                      value={l.status}
                      onChange={e => updateStatus(l.id, e.target.value)}
                    >
                      <option value="done">Done</option>
                      <option value="active">Active</option>
                      <option value="upcoming">Upcoming</option>
                      <option value="future">Future</option>
                    </select>
                  </td>
                  <td className="px-4 py-2.5 text-gray-500 text-xs">{l.notes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
