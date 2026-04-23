import React, { useEffect, useState } from 'react';
import { api } from '../api';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

// Returns the Monday of the week containing `date`
function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun, 1=Mon, ...
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function toDateStr(date) {
  return date.toISOString().slice(0, 10);
}

// Consistent color palette for operators (by id mod N)
const OPERATOR_COLORS = [
  'bg-indigo-900/70 border-indigo-600 text-indigo-200',
  'bg-teal-900/70 border-teal-600 text-teal-200',
  'bg-rose-900/70 border-rose-600 text-rose-200',
  'bg-amber-900/70 border-amber-600 text-amber-200',
  'bg-violet-900/70 border-violet-600 text-violet-200',
  'bg-cyan-900/70 border-cyan-600 text-cyan-200',
  'bg-lime-900/70 border-lime-600 text-lime-200',
  'bg-pink-900/70 border-pink-600 text-pink-200',
];

function operatorColor(operatorId) {
  if (!operatorId) return 'bg-gray-800/40 border-gray-700 text-gray-500';
  return OPERATOR_COLORS[(operatorId - 1) % OPERATOR_COLORS.length];
}

export default function Bookings({ onLogBooking, refresh }) {
  const [bookings, setBookings] = useState([]);
  const [team, setTeam] = useState([]);

  const load = () => Promise.all([api.bookings.list(), api.team.list()]).then(([b, t]) => {
    setBookings(b);
    setTeam(t);
  });

  useEffect(() => { load(); }, [refresh]);

  const getMember = (id) => team.find(m => m.id === id);
  const confirmToggle = async (b) => { await api.bookings.update(b.id, { ucsb_confirmed: !b.ucsb_confirmed }); load(); };
  const deleteBooking = async (id) => { await api.bookings.delete(id); load(); };

  const confirmed = bookings.filter(b => b.ucsb_confirmed);
  const pending = bookings.filter(b => !b.ucsb_confirmed);

  // --- Weekly grid logic ---
  const weekStart = getWeekStart(new Date());
  const weekDates = DAYS.map((_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return toDateStr(d);
  });

  // Filter bookings that fall in this week
  const thisWeekBookings = bookings.filter(b => weekDates.includes(b.date));

  // Unique tools with bookings this week
  const toolsThisWeek = [...new Set(thisWeekBookings.map(b => b.tool))].sort();

  // Map: tool -> day -> booking (first one per slot; could extend to multiple)
  const gridMap = {};
  toolsThisWeek.forEach(tool => {
    gridMap[tool] = {};
    weekDates.forEach(date => {
      gridMap[tool][date] = thisWeekBookings.filter(b => b.tool === tool && b.date === date);
    });
  });

  return (
    <div>
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-xl font-semibold">Tool Bookings</h1>
          <p className="text-gray-400 text-sm mt-0.5">{confirmed.length} confirmed · {pending.length} pending</p>
        </div>
        <div className="flex gap-2">
          <a href="https://www.nanotech.ucsb.edu/" target="_blank" rel="noreferrer" className="px-3 py-2 border border-gray-700 hover:border-indigo-500 rounded-lg text-sm transition-colors">🔗 UCSB Signup</a>
          <button onClick={onLogBooking} className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium">+ Log Booking</button>
        </div>
      </div>

      {/* Weekly Calendar Grid */}
      <div className="rounded-xl overflow-hidden mb-4" style={{ background: '#1a1d2e', border: '1px solid #2d3148' }}>
        <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
          <span className="text-sm font-medium">This Week</span>
          <span className="text-xs text-gray-500">{weekDates[0]} – {weekDates[4]}</span>
        </div>
        {toolsThisWeek.length === 0 ? (
          <div className="px-4 py-6 text-center text-gray-600 text-sm">No bookings this week.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[600px]">
              <thead>
                <tr className="text-gray-500 uppercase border-b border-gray-800 bg-gray-900/50">
                  <th className="px-4 py-2 text-left w-36">Tool</th>
                  {DAYS.map((day, i) => (
                    <th key={day} className="px-2 py-2 text-center">
                      <div className="font-semibold">{day}</div>
                      <div className="text-gray-600 font-normal normal-case">{weekDates[i]?.slice(5)}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {toolsThisWeek.map(tool => (
                  <tr key={tool} className="border-b border-gray-800/50">
                    <td className="px-4 py-2 font-medium text-gray-300 align-top">{tool}</td>
                    {weekDates.map(date => {
                      const slots = gridMap[tool][date] || [];
                      if (slots.length === 0) {
                        return (
                          <td key={date} className="px-2 py-2 align-top">
                            <div className="border border-dashed border-gray-700 rounded p-2 text-center text-gray-600 min-h-[48px] flex items-center justify-center">
                              Open
                            </div>
                          </td>
                        );
                      }
                      return (
                        <td key={date} className="px-2 py-2 align-top">
                          <div className="flex flex-col gap-1">
                            {slots.map(slot => {
                              const member = getMember(slot.booked_by);
                              const colorClass = operatorColor(slot.booked_by);
                              return (
                                <div
                                  key={slot.id}
                                  className={`border rounded p-1.5 min-h-[48px] ${colorClass}`}
                                >
                                  <div className="font-semibold truncate">{member?.name || '—'}</div>
                                  <div className="opacity-80">{slot.start_time} · {slot.duration_hr}h</div>
                                  {slot.layer_step && <div className="opacity-60 truncate">{slot.layer_step}</div>}
                                </div>
                              );
                            })}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* All Bookings Table */}
      <div className="rounded-xl overflow-hidden mb-4" style={{ background: '#1a1d2e', border: '1px solid #2d3148' }}>
        <div className="px-4 py-3 border-b border-gray-800 text-sm font-medium">All Bookings</div>
        {bookings.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-500 text-sm">No bookings yet — log one above.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-500 uppercase border-b border-gray-800 bg-gray-900/50">
                <th className="px-4 py-2 text-left">Tool</th>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Time</th>
                <th className="px-4 py-2 text-left">Duration</th>
                <th className="px-4 py-2 text-left">Booked By</th>
                <th className="px-4 py-2 text-left">Layer / Step</th>
                <th className="px-4 py-2 text-left">UCSB</th>
                <th className="px-4 py-2 text-left"></th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(b => {
                const member = getMember(b.booked_by);
                return (
                  <tr key={b.id} className="border-b border-gray-800/50 hover:bg-gray-800/20">
                    <td className="px-4 py-2.5 font-medium">{b.tool}</td>
                    <td className="px-4 py-2.5 text-gray-400">{b.date}</td>
                    <td className="px-4 py-2.5 text-gray-400">{b.start_time}</td>
                    <td className="px-4 py-2.5 text-gray-400">{b.duration_hr}h</td>
                    <td className="px-4 py-2.5">{member?.name || '—'}</td>
                    <td className="px-4 py-2.5 text-gray-400">{b.layer_step}</td>
                    <td className="px-4 py-2.5">
                      <button onClick={() => confirmToggle(b)} className={`px-2 py-0.5 rounded text-xs ${b.ucsb_confirmed ? 'bg-green-900/60 text-green-400' : 'bg-yellow-900/60 text-yellow-400'}`}>
                        {b.ucsb_confirmed ? '✓ Confirmed' : '⏳ Pending'}
                      </button>
                    </td>
                    <td className="px-4 py-2.5">
                      <button onClick={() => deleteBooking(b.id)} className="text-gray-600 hover:text-red-400 text-xs">✕</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
