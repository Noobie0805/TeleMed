import React from 'react';
import MissionStatement from '../components/MissionStatement';
import TeamSection from '../components/TeamSection';
import TechOverview from '../components/TechOverview';
import ContactInfo from '../components/ContactInfo';
import Testimonials from '../components/Testimonials';
import { useNavigate } from 'react-router-dom';

function About() {
  const navigate = useNavigate();
  return (
    <>
      <MissionStatement />
      <TeamSection />
      <TechOverview />
      <Testimonials />
      <ContactInfo />
      <div style={{ textAlign: 'center', margin: '2.5rem 0' }}>
        <button
          style={{
            background: '#00bcd4',
            color: '#fff',
            border: 'none',
            borderRadius: '2rem',
            fontSize: '1.1rem',
            fontWeight: 600,
            padding: '0.85rem 2rem',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,188,212,0.10)'
          }}
          onClick={() => navigate('/consult')}
        >
          Try TeleMedix Now
        </button>
      </div>
    </>
  );
}

export default About; 