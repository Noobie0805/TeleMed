import React from "react";
import "./HeroSection.css";
import { Link } from "react-router-dom";

function HeroSection() {
  return (
    <section className="hero-section">
      <h1>Welcome to TeleMedix</h1>
      <p>Accessible, AI-powered healthcare from the comfort of your home.</p>
      <Link to="/login" className="cta-button">
        Get Started
      </Link>
    </section>
  );
}

export default HeroSection;

