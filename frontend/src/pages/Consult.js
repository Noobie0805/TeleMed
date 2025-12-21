import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import ConsultationForm from '../components/AppointmentsElements/ConsultationForm';
import AvailableDoctorsList from '../components/AppointmentsElements/AvailableDoctorsList';
import UpcomingAppointments from '../components/AppointmentsElements/UpcomingAppointments';
import VideoCallModule from '../components/AppointmentsElements/VideoCallModule';
import consultimage from '../assets/consultimage.png';

function Consult() {
  const location = useLocation();
  const doctorName = location.state?.doctorName || '';
  const specialty = location.state?.specialty || '';
  const formRef = useRef(null);

  useEffect(() => {
    if (doctorName || specialty) {
      setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [doctorName, specialty]);

  return (
    <>
      <section style={{
        background: 'rgba(0,0,0,0.6)',
        borderRadius: '1.2rem',
        border: '1.5px solid #00bcd4',
        color: '#fff',
        maxWidth: 800,
        margin: '2.5rem auto 1.5rem auto',
        padding: '1.5rem 2rem',
        boxShadow: '0 2px 12px rgba(0,188,212,0.10)',
        display: 'flex',
        alignItems: 'center',
        gap: '2rem',
        textAlign: 'left'
      }}>
        <img src={consultimage} alt="Consultation flexibility" style={{ width: 140, height: 140, borderRadius: '1rem', objectFit: 'cover', flexShrink: 0, background: '#fff', border: '2px solid #00bcd4' }} />
        <div>
          <h2 style={{ color: '#00bcd4', marginBottom: '0.7rem' }}>Flexible Consultations, Anytime</h2>
          <p style={{ fontSize: '1.15rem', color: '#fff', margin: 0 }}>
            Book appointments at your convenience—early morning, late night, or weekends. Our doctors and AI tools are available to fit your schedule, making healthcare easy and accessible whenever you need it.
          </p>
        </div>
      </section>
      <div ref={formRef}>
        <ConsultationForm doctorName={doctorName} specialty={specialty} />
      </div>
      <AvailableDoctorsList />
      <UpcomingAppointments />
      <VideoCallModule />
    </>
  );
}

export default Consult; 