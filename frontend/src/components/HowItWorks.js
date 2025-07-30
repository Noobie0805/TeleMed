import React from 'react';
import './HowItWorks.css';
import howItWorksImg from '../howItWorks.png';

function HowItWorks() {
  return (
    <section className="how-it-works-redesign">
      <div className="how-steps-content">
        <div className="how-steps-left">
          <h2 className="how-title">Four easy steps</h2>
          <div className="steps-list">
            <div className="step-item">
              <div className="step-number">1</div>
              <div>
                <div className="step-title">Sign Up or Login</div>
                <div className="step-desc">Create your account or log in to get started.</div>
              </div>
            </div>
            <div className="step-item">
              <div className="step-number">2</div>
              <div>
                <div className="step-title">Describe Your Symptoms</div>
                <div className="step-desc">Use our AI Symptom Checker or go straight to booking a consultation.</div>
              </div>
            </div>
            <div className="step-item">
              <div className="step-number">3</div>
              <div>
                <div className="step-title">Book a Consultation</div>
                <div className="step-desc">Choose a doctor and schedule your appointment online.</div>
              </div>
            </div>
            <div className="step-item">
              <div className="step-number">4</div>
              <div>
                <div className="step-title">Get Medical Advice</div>
                <div className="step-desc">Consult with a certified doctor via chat or video call.</div>
              </div>
            </div>
          </div>
        </div>
        <div className="how-steps-right">
          <a href="/signup" className="get-started-btn">Get Started</a>
          <div className="how-img-wrapper">
            <img src={howItWorksImg} alt="How it works screenshot" className="how-img" />
          </div>
        </div>
      </div>
    </section>
  );
}

export default HowItWorks; 