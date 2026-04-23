import React from 'react';

const styles = {
  done:         'bg-green-900/60 text-green-400',
  in_progress:  'bg-blue-900/60 text-blue-400',
  needs_booking:'bg-yellow-900/60 text-yellow-400',
  not_started:  'bg-gray-800 text-gray-400',
  active:       'bg-blue-900/60 text-blue-400',
  upcoming:     'bg-gray-800 text-gray-400',
  future:       'bg-gray-800/40 text-gray-600',
};

const labels = {
  done:         '✓ Done',
  in_progress:  '▶ In Progress',
  needs_booking:'⏳ Needs Booking',
  not_started:  '○ Not Started',
  active:       '▶ Active',
  upcoming:     'Upcoming',
  future:       'Future',
};

export default function Badge({ status, className = '' }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles.not_started} ${className}`}>
      {labels[status] || status}
    </span>
  );
}
