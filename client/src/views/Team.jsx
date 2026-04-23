import React, { useEffect, useState } from 'react';
import { api } from '../api';

const COLORS = ['bg-indigo-600','bg-blue-600','bg-green-600','bg-purple-600','bg-pink-600'];

export default function Team() {
  const [team, setTeam] = useState([]);
  const [steps, setSteps] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', role: '', trained_tools: [] });

  const load = () => Promise.all([api.team.list(), api.steps.list()]).then(([t, s]) => { setTeam(t); setSteps(s); });
  useEffect(() => { load(); }, []);

  const getMemberSteps = (memberId) => steps.filter(s => s.operator_id === memberId && s.status !== 'done');
  const getTotalHrs = (memberId) => steps.filter(s => s.operator_id === memberId).reduce((sum, s) => sum + (s.slot_time_hr || 0), 0);

  const addMember = async () => {
    await api.team.create({ ...newMember, trained_tools: newMember.trained_tools.split(',').map(t => t.trim()).filter(Boolean) });
    setShowAdd(false);
    setNewMember({ name: '', role: '', trained_tools: [] });
    load();
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-xl font-semibold">Team</h1>
          <p className="text-gray-400 text-sm mt-0.5">{team.length} members</p>
        </div>
        <button onClick={() => setShowAdd(s => !s)} className="px-3 py-2 border border-gray-700 hover:border-indigo-500 rounded-lg text-sm transition-colors">+ Add Member</button>
      </div>

      {showAdd && (
        <div className="rounded-xl p-4 mb-4" style={{ background: '#1a1d2e', border: '1px solid #2d3148' }}>
          <div className="text-sm font-medium mb-3">New Team Member</div>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div>
              <label className="text-xs text-gray-400 block mb-1">Name</label>
              <input type="text" className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm" value={newMember.name} onChange={e => setNewMember(m => ({ ...m, name: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Role</label>
              <input type="text" className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm" value={newMember.role} onChange={e => setNewMember(m => ({ ...m, role: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Trained Tools (comma-separated)</label>
              <input type="text" className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm" placeholder="PECVD, RIE, Furnace" value={newMember.trained_tools} onChange={e => setNewMember(m => ({ ...m, trained_tools: e.target.value }))} />
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={addMember} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium">Add</button>
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 border border-gray-700 rounded-lg text-sm text-gray-400">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {team.map((m, i) => {
          const memberSteps = getMemberSteps(m.id);
          const hrs = getTotalHrs(m.id);
          const pct = Math.min(Math.round((hrs / 20) * 100), 100);
          const color = COLORS[i % COLORS.length];
          return (
            <div key={m.id} className="rounded-xl p-4" style={{ background: '#1a1d2e', border: '1px solid #2d3148' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-9 h-9 rounded-full ${color} flex items-center justify-center font-bold text-sm`}>
                  {m.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-medium text-sm">{m.name}</div>
                  <div className="text-xs text-gray-500">{m.role || 'Team Member'}</div>
                </div>
              </div>

              <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Active Steps</div>
              {memberSteps.length === 0 ? (
                <div className="text-xs text-gray-600 mb-3">No active assignments</div>
              ) : (
                <div className="space-y-1 mb-3">
                  {memberSteps.slice(0, 3).map(s => (
                    <div key={s.id} className="text-xs text-gray-300">{s.step_num} {s.process}</div>
                  ))}
                  {memberSteps.length > 3 && <div className="text-xs text-gray-600">+{memberSteps.length - 3} more</div>}
                </div>
              )}

              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Load — {hrs}h</div>
              <div className="bg-gray-800 rounded-full h-1.5 mb-3">
                <div className="bg-indigo-400 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
              </div>

              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Trained On</div>
              <div className="flex flex-wrap gap-1">
                {(m.trained_tools || []).map(t => (
                  <span key={t} className="px-1.5 py-0.5 bg-gray-800 rounded text-xs text-gray-400">{t}</span>
                ))}
                {(!m.trained_tools || m.trained_tools.length === 0) && <span className="text-xs text-gray-600">—</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
