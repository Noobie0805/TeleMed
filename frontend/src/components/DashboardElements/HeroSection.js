import React from 'react';
import './HeroSection.css';

function HeroSection() {
  return (
    <section className="hero-section">
      <h1>Welcome to TeleMedix</h1>
      <p>Accessible, AI-powered healthcare from the comfort of your home.</p>
      <a href="/consult" className="cta-button">Start Consultation</a>
    </section>
  );
}

export default HeroSection; 