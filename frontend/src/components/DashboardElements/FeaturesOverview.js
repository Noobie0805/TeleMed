import React from 'react';
import './FeaturesOverview.css';

function FeaturesOverview() {
  return (
    <section className="features-overview">
      <h2>Platform Features</h2>
      <div className="features-list">
        <div className="feature-card">
          <h3>AI Symptom Checker</h3>
          <p>Describe your symptoms and get instant AI-powered health insights.</p>
        </div>
        <div className="feature-card">
          <h3>Consult a Doctor</h3>
          <p>Book appointments and consult with certified medical professionals online.</p>
        </div>
        <div className="feature-card">
          <h3>Secure Messaging</h3>
          <p>Communicate securely with doctors and receive medical advice.</p>
        </div>
      </div>
    </section>
  );
}

export default FeaturesOverview; 