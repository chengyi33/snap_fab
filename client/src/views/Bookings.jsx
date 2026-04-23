import React, { useEffect, useState } from 'react';
import { api } from '../api';

const DAYS = ['Mon','Tue','Wed','Thu','Fri'];

export default function Bookings({ onLogBooking, refresh }) {
  const [bookings, setBookings] = useState([]);
  const [team, setTeam] = useState([]);

  const load = () => Promise.all([api.bookings.list(), api.team.list()]).then(([b, t]) => { setBookings(b); setTeam(t); });
  useEffect(() => { load(); }, [refresh]);

  const getMember = (id) => team.find(m => m.id === id);
  const confirmToggle = async (b) => { await api.bookings.update(b.id, { ucsb_confirmed: !b.ucsb_confirmed }); load(); };
  const deleteBooking = async (id) => { await api.bookings.delete(id); load(); };

  const confirmed = bookings.filter(b => b.ucsb_confirmed);
  const pending = bookings.filter(b => !b.ucsb_confirmed);

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
