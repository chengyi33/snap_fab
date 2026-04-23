import React, { useEffect, useState } from 'react';
import { api } from '../api';
import Badge from '../components/Badge';

export default function POREditor() {
  const [layers, setLayers] = useState([]);
  const [activeLayerId, setActiveLayerId] = useState(null);
  const [steps, setSteps] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');

  const loadLayers = () => api.layers.list().then(l => {
    const sorted = [...l].sort((a, b) => a.layer_num - b.layer_num);
    setLayers(sorted);
    if (!activeLayerId && sorted.length) {
      const active = sorted.find(l => l.status === 'active') || sorted[0];
      setActiveLayerId(active.id);
    }
  });

  const loadSteps = (lid) => lid && api.steps.list(lid).then(s => setSteps([...s].sort((a, b) => String(a.step_num).localeCompare(String(b.step_num)))));

  useEffect(() => { loadLayers(); }, []);
  useEffect(() => { loadSteps(activeLayerId); }, [activeLayerId]);

  const updateStep = async (id, patch) => {
    await api.steps.update(id, patch);
    loadSteps(activeLayerId);
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setUploadMsg('');
    try {
      const result = await api.upload.process(file);
      setUploadMsg(`✓ Imported ${result.layers} layers, ${result.steps} steps`);
      loadLayers();
    } catch (err) {
      setUploadMsg('✗ Upload failed: ' + err.message);
    }
    setUploading(false);
  };

  const activeLayer = layers.find(l => l.id === activeLayerId);

  return (
    <div>
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-xl font-semibold">POR Editor</h1>
          <p className="text-gray-400 text-sm mt-0.5">Edit process times and slot lengths. Changes cascade to schedule and bookings.</p>
        </div>
        <div className="flex gap-2 items-center">
          <label className="px-3 py-2 border border-gray-700 hover:border-gray-500 rounded-lg text-sm cursor-pointer transition-colors">
            {uploading ? 'Importing…' : '⬆ Import Excel'}
            <input type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleUpload} />
          </label>
        </div>
      </div>

      {uploadMsg && <div className={`mb-4 p-3 rounded-lg text-sm ${uploadMsg.startsWith('✓') ? 'bg-green-900/30 text-green-400 border border-green-800' : 'bg-red-900/30 text-red-400 border border-red-800'}`}>{uploadMsg}</div>}

      <div className="rounded-xl p-3 border border-blue-800/50 mb-4 text-sm text-blue-300" style={{ background: '#0c1a2e' }}>
        💡 <strong>Process time</strong> = how long the chemistry runs. <strong>Slot length</strong> = how long to reserve the tool (includes setup + buffer). Book the slot length on UCSB.
      </div>

      {/* Layer selector */}
      <div className="rounded-xl p-4 mb-4" style={{ background: '#1a1d2e', border: '1px solid #2d3148' }}>
        <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Select Layer</div>
        <div className="flex flex-wrap gap-2">
          {layers.map(l => (
            <button
              key={l.id}
              onClick={() => setActiveLayerId(l.id)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                l.id === activeLayerId ? 'bg-indigo-600 text-white' :
                l.status === 'done' ? 'bg-gray-800 text-green-400 hover:bg-gray-700' :
                l.status === 'active' ? 'bg-indigo-900/50 text-indigo-300 hover:bg-indigo-900' :
                'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {l.status === 'done' ? '✓ ' : l.status === 'active' ? '▶ ' : ''}L{l.layer_num}
            </button>
          ))}
        </div>
      </div>

      {activeLayer && (
        <div className="rounded-xl overflow-hidden" style={{ background: '#1a1d2e', border: '1px solid #2d3148' }}>
          <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
            <span className="text-sm font-medium">L{activeLayer.layer_num} — {activeLayer.name}</span>
            <Badge status={activeLayer.status} />
          </div>
          {steps.length === 0 ? (
            <div className="px-4 py-6 text-center text-gray-500 text-sm">No steps defined for this layer yet.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-500 uppercase border-b border-gray-800 bg-gray-900/50">
                  <th className="px-4 py-2 text-left w-12">Step</th>
                  <th className="px-4 py-2 text-left">Process</th>
                  <th className="px-4 py-2 text-left">Tool</th>
                  <th className="px-4 py-2 text-left w-36">Process Time (hr)</th>
                  <th className="px-4 py-2 text-left w-36">Slot Length (hr)</th>
                  <th className="px-4 py-2 text-left w-28">Status</th>
                </tr>
              </thead>
              <tbody>
                {steps.map(step => (
                  <tr key={step.id} className="border-b border-gray-800/50 hover:bg-gray-800/20">
                    <td className="px-4 py-2.5 text-gray-500">{step.step_num}</td>
                    <td className="px-4 py-2.5">{step.process}</td>
                    <td className="px-4 py-2.5 text-gray-400">{step.tool || '—'}</td>
                    <td className="px-4 py-2.5">
                      <select
                        className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-xs w-full"
                        value={step.process_time_hr}
                        onChange={e => updateStep(step.id, { process_time_hr: Number(e.target.value) })}
                      >
                        {[0.5,1,1.5,2,3,4,5,6,8,10,12].map(h => <option key={h} value={h}>{h}h</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-2.5">
                      <select
                        className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-xs w-full"
                        value={step.slot_time_hr}
                        onChange={e => updateStep(step.id, { slot_time_hr: Number(e.target.value) })}
                      >
                        {[0.5,1,1.5,2,3,4,5,6,8,10,12].map(h => <option key={h} value={h}>{h}h</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-2.5"><Badge status={step.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
