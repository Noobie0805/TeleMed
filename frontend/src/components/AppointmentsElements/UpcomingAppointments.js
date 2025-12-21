import React from 'react';
import './UpcomingAppointments.css';

const appointments = [
  { doctor: 'Dr. Asha Mehta', date: '2024-07-20', time: '10:00 AM' },
  { doctor: 'Dr. Rajiv Kumar', date: '2024-07-22', time: '2:30 PM' },
];

function UpcomingAppointments() {
  return (
    <section className="upcoming-appointments">
      <h2>Upcoming Appointments</h2>
      <ul className="appointments-list">
        {appointments.map((appt, idx) => (
          <li key={idx}>
            <strong>{appt.doctor}</strong> - {appt.date} at {appt.time}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default UpcomingAppointments; 