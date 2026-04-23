import React, { useState } from 'react';
import Layout from './components/Layout';
import BookingModal from './components/BookingModal';
import Dashboard from './views/Dashboard';
import Bookings from './views/Bookings';
import POREditor from './views/POREditor';
import Schedule from './views/Schedule';
import Team from './views/Team';

export default function App() {
  const [view, setView] = useState('dashboard');
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingRefresh, setBookingRefresh] = useState(0);

  const views = {
    dashboard: <Dashboard onLogBooking={() => setBookingModalOpen(true)} />,
    tools:     <Bookings onLogBooking={() => setBookingModalOpen(true)} refresh={bookingRefresh} />,
    por:       <POREditor />,
    schedule:  <Schedule />,
    team:      <Team />,
  };

  return (
    <Layout view={view} setView={setView} onLogBooking={() => setBookingModalOpen(true)}>
      {views[view]}
      <BookingModal
        open={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        onSaved={() => setBookingRefresh(r => r + 1)}
      />
    </Layout>
  );
}
