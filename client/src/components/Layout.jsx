import React from 'react';

const navItems = [
  { id: 'dashboard', label: '📊 Dashboard' },
  { id: 'tools',     label: '🔧 Tool Bookings' },
  { id: 'por',       label: '📋 POR Editor' },
  { id: 'schedule',  label: '📅 Schedule' },
  { id: 'team',      label: '👥 Team' },
];

export default function Layout({ view, setView, onLogBooking, children }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Topbar */}
      <nav className="sticky top-0 z-40 border-b border-gray-800 px-5 py-3 flex items-center justify-between" style={{ background: '#13162a' }}>
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold text-indigo-400 tracking-tight">⚗️ SnapFab</span>
          <span className="text-gray-600 text-sm hidden sm:block">/ MEMS Fab Project</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <button
            onClick={onLogBooking}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-medium transition-colors"
          >
            + Log Booking
          </button>
        </div>
      </nav>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-44 shrink-0 border-r border-gray-800 p-3 flex flex-col gap-1 text-sm sticky top-[49px] h-[calc(100vh-49px)]" style={{ background: '#13162a' }}>
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`text-left px-3 py-2 rounded-lg font-medium transition-colors ${
                view === item.id ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {item.label}
            </button>
          ))}
          <div className="mt-auto border-t border-gray-800 pt-3">
            <a
              href="https://www.nanotech.ucsb.edu/"
              target="_blank"
              rel="noreferrer"
              className="block text-gray-500 hover:text-white px-3 py-2 rounded-lg text-xs"
            >
              🔗 UCSB Signup
            </a>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-5 min-w-0 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
