import React, { useEffect, useState } from 'react';
import { api } from '../api';
import Badge from '../components/Badge';

const STATUS_CYCLE = ['not_started','in_progress','needs_booking','done'];

export default function Dashboard({ onLogBooking }) {
  const [data, setData] = useState(null);

  const load = () => api.dashboard().then(setData);
  useEffect(() => { load(); }, []);

  const cycleStatus = async (step) => {
    const i = STATUS_CYCLE.indexOf(step.status);
    const next = STATUS_CYCLE[(i + 1) % STATUS_CYCLE.length];
    await api.steps.update(step.id, { status: next });
    load();
  };

  if (!data) return <div className="text-gray-500 text-sm p-4">Loading…</div>;

  const { total_layers, done_layers, active_layer, active_steps, pending_bookings, operator_load } = data;
  const pct = Math.round((done_layers / Math.max(total_layers, 1)) * 100);

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-semibold">Weekly Dashboard</h1>
        <p className="text-gray-400 text-sm mt-0.5">
          {active_layer ? `Layer ${active_layer.layer_num} — ${active_layer.name}` : 'No active layer'} ·{' '}
          {pending_bookings} tool{pending_bookings !== 1 ? 's' : ''} pending booking
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <StatCard label="Progress" value={`${done_layers} / ${total_layers}`} sub={`${pct}% complete`}>
          <div className="mt-2 bg-gray-800 rounded-full h-1.5"><div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${pct}%` }} /></div>
        </StatCard>
        <StatCard label="Active Layer" value={active_layer ? `L${active_layer.layer_num}` : '—'} sub={active_layer?.name || ''} />
        <StatCard label="Pending Bookings" value={pending_bookings} sub="need UCSB booking" valueColor={pending_bookings > 0 ? 'text-yellow-400' : 'text-green-400'} />
        <StatCard label="Team Active" value={operator_load.filter(m => m.hours_this_week > 0).length} sub={`of ${operator_load.length} members`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {/* Steps table */}
        <div className="lg:col-span-2 rounded-xl overflow-hidden" style={{ background: '#1a1d2e', border: '1px solid #2d3148' }}>
          <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
            <span className="text-sm font-medium">This Week — {active_layer?.name || 'Steps'}</span>
            <span className="text-xs text-gray-500">Click status to update</span>
          </div>
          {active_steps.length === 0 ? (
            <div className="px-4 py-6 text-gray-500 text-sm text-center">No active steps</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-500 uppercase border-b border-gray-800 bg-gray-900/50">
                  <th className="px-4 py-2 text-left w-12">Step</th>
                  <th className="px-4 py-2 text-left">Process</th>
                  <th className="px-4 py-2 text-left">Tool</th>
                  <th className="px-4 py-2 text-left w-16">Time</th>
                  <th className="px-4 py-2 text-left w-24">Status</th>
                </tr>
              </thead>
              <tbody>
                {active_steps.map(step => (
                  <tr key={step.id} className="border-b border-gray-800/50 hover:bg-gray-800/20">
                    <td className="px-4 py-2.5 text-gray-500">{step.step_num}</td>
                    <td className="px-4 py-2.5">{step.process}</td>
                    <td className="px-4 py-2.5 text-gray-400">{step.tool}</td>
                    <td className="px-4 py-2.5 text-gray-400">{step.process_time_hr}h</td>
                    <td className="px-4 py-2.5">
                      <button onClick={() => cycleStatus(step)} className="hover:opacity-80">
                        <Badge status={step.status} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">
          {/* Operator load */}
          <div className="rounded-xl p-4" style={{ background: '#1a1d2e', border: '1px solid #2d3148' }}>
            <div className="text-sm font-medium mb-3">Operator Load</div>
            <div className="space-y-3">
              {operator_load.map(m => {
                const pct = Math.min(Math.round((m.hours_this_week / 20) * 100), 100);
                return (
                  <div key={m.id}>
                    <div className="flex justify-between text-xs mb-1">
                      <span>{m.name}</span>
                      <span className="text-gray-400">{m.hours_this_week}h</span>
                    </div>
                    <div className="bg-gray-800 rounded-full h-1.5">
                      <div className="bg-indigo-400 h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* At-risk */}
          <div className="rounded-xl overflow-hidden" style={{ background: '#1a1d2e', border: '1px solid #2d3148' }}>
            <div className="px-4 py-3 border-b border-gray-800 text-sm font-medium">⚠ At-Risk Items</div>
            {pending_bookings > 0 ? (
              <div className="px-4 py-3 flex gap-3">
                <span className="mt-1 w-2 h-2 rounded-full bg-yellow-500 shrink-0" />
                <div>
                  <div className="text-xs font-medium text-yellow-300">{pending_bookings} step{pending_bookings > 1 ? 's' : ''} need UCSB booking</div>
                  <div className="text-xs text-gray-500 mt-0.5">Book within 2 days on UCSB Signup</div>
                </div>
              </div>
            ) : (
              <div className="px-4 py-3 text-xs text-gray-500">No issues 🎉</div>
            )}
          </div>
        </div>
      </div>

      {pending_bookings > 0 && (
        <div className="rounded-xl p-4 border border-yellow-800 flex items-start gap-3" style={{ background: '#1c1608' }}>
          <span className="text-yellow-400 text-lg">⚠️</span>
          <div className="flex-1">
            <div className="font-medium text-yellow-300 text-sm">{pending_bookings} tool{pending_bookings > 1 ? 's' : ''} unbooked — action required</div>
            <div className="text-xs text-gray-400 mt-0.5">Steps marked "Needs Booking" require tool reservation on UCSB Signup Monkey.</div>
          </div>
          <div className="flex gap-2 shrink-0">
            <a href="https://www.nanotech.ucsb.edu/" target="_blank" rel="noreferrer" className="px-3 py-1.5 bg-yellow-700 hover:bg-yellow-600 rounded-lg text-xs text-white font-medium">UCSB Signup ↗</a>
            <button onClick={onLogBooking} className="px-3 py-1.5 border border-gray-700 hover:border-gray-500 rounded-lg text-xs text-gray-300">Log Booking</button>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, sub, valueColor = 'text-white', children }) {
  return (
    <div className="rounded-xl p-4" style={{ background: '#1a1d2e', border: '1px solid #2d3148' }}>
      <div className="text-gray-500 text-xs uppercase tracking-wide mb-1">{label}</div>
      <div className={`text-2xl font-semibold ${valueColor}`}>{value}</div>
      {children}
      {sub && <div className="text-xs text-gray-500 mt-1">{sub}</div>}
    </div>
  );
}
