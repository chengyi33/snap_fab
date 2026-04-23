import React, { useState, useEffect } from 'react';
import { api } from '../api';

export default function BookingModal({ open, onClose, onSaved }) {
  const [tools, setTools] = useState([]);
  const [team, setTeam] = useState([]);
  const [form, setForm] = useState({
    tool: '', date: '', start_time: '09:00', duration_hr: 3,
    booked_by: '', layer_step: '', ucsb_confirmed: false, notes: '',
  });

  useEffect(() => {
    api.tools.list().then(setTools);
    api.team.list().then(setTeam);
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    await api.bookings.create({ ...form, booked_by: Number(form.booked_by), duration_hr: Number(form.duration_hr) });
    onSaved?.();
    onClose();
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="rounded-xl p-6 w-full max-w-md" style={{ background: '#1a1d2e', border: '1px solid #2d3148' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Log Tool Booking</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xl leading-none">×</button>
        </div>
        <div className="space-y-3 text-sm">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Tool</label>
            <select className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm" value={form.tool} onChange={e => set('tool', e.target.value)}>
              <option value="">Select tool…</option>
              {tools.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Date</label>
              <input type="date" className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm" value={form.date} onChange={e => set('date', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Start Time</label>
              <input type="time" className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm" value={form.start_time} onChange={e => set('start_time', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Duration (hrs)</label>
            <select className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm" value={form.duration_hr} onChange={e => set('duration_hr', e.target.value)}>
              {[1,2,3,4,5,6,8].map(h => <option key={h} value={h}>{h} hr</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Booked By</label>
            <select className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm" value={form.booked_by} onChange={e => set('booked_by', e.target.value)}>
              <option value="">Select person…</option>
              {team.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">For Layer / Step</label>
            <input type="text" className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm" placeholder="e.g. L7.3 Pattern etch" value={form.layer_step} onChange={e => set('layer_step', e.target.value)} />
          </div>
          <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
            <input type="checkbox" className="accent-indigo-500" checked={form.ucsb_confirmed} onChange={e => set('ucsb_confirmed', e.target.checked)} />
            Already confirmed on UCSB Signup Monkey
          </label>
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onClose} className="px-4 py-2 border border-gray-700 rounded-lg text-sm text-gray-400 hover:border-gray-500">Cancel</button>
          <button onClick={save} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium">Save Booking</button>
        </div>
      </div>
    </div>
  );
}
