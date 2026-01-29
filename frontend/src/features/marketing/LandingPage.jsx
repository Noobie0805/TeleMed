import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSmartphone, FiPhone, FiBarChart2, FiPackage, FiLock, FiCheck, FiStar, FiVideo, FiArrowRight } from 'react-icons/fi';
import { MdMedicalServices } from 'react-icons/md';
import MarketingNavbar from './MarketingNavbar';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();

  const services = [
    {
      icon: <FiSmartphone size={32} />,
      title: 'AI Symptom Checker',
      description: 'Advanced AI analyzes your symptoms and provides preliminary insights with specialist recommendations'
    },
    {
      icon: <FiPhone size={32} />,
      title: 'Video Consultations',
      description: 'Connect with licensed healthcare professionals via secure video calls from anywhere'
    },
    {
      icon: <FiBarChart2 size={32} />,
      title: 'Health Tracking',
      description: 'Monitor vital signs and health metrics with integrated tracking and historical records'
    },
    {
      icon: <FiPackage size={32} />,
      title: 'Prescription Management',
      description: 'Receive and manage prescriptions digitally with easy pharmacy integration'
    }
  ];

  const specialties = [
    { name: 'General Practice', count: '500+ Doctors' },
    { name: 'Cardiology', count: '180+ Specialists' },
    { name: 'Dermatology', count: '220+ Specialists' },
    { name: 'Neurology', count: '140+ Specialists' },
    { name: 'Orthopedics', count: '190+ Specialists' },
    { name: 'Psychiatry', count: '160+ Specialists' }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Patient',
      text: 'The AI symptom checker helped me understand my condition before seeing a doctor. Very accurate and informative!',
      rating: 5
    },
    {
      name: 'Dr. Michael Chen',
      role: 'Healthcare Provider',
      text: 'Excellent platform for patient management. The preliminary data saves consultation time and improves outcomes.',
      rating: 5
    },
    {
      name: 'Emma Davis',
      role: 'Patient',
      text: 'Convenient video consultations saved me a trip to the clinic. The entire process was smooth and professional.',
      rating: 5
    }
  ];

  const pricing = [
    {
      tier: 'Basic',
      price: 'Free',
      description: 'Perfect for getting started',
      features: ['Unlimited symptom checks', 'Health tracking', 'Medical history storage']
    },
    {
      tier: 'Pro',
      price: '$29',
      period: '/month',
      description: 'For regular care needs',
      features: ['Everything in Basic', '4 video consultations/month', 'Priority scheduling', 'Prescription management'],
      highlighted: true
    },
    {
      tier: 'Premium',
      price: '$79',
      period: '/month',
      description: 'For comprehensive care',
      features: ['Everything in Pro', 'Unlimited consultations', 'Specialist access', '24/7 support', 'Health reports']
    }
  ];

  return (
    <div className="landing-page">
      <MarketingNavbar />
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Your Health, Reimagined</h1>
          <p>Get instant AI-powered symptom analysis and connect with healthcare professionals anytime, anywhere</p>
          <div className="hero-ctas">
            <button
              className="btn btn-primary"
              onClick={() => navigate('/symptoms')}
            >
              Start Symptom Check
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => navigate('/appointments')}
            >
              Book a Consultation
            </button>
          </div>
          <div className="trust-badges">
            <div className="badge"><FiLock size={16} aria-hidden /> HIPAA Compliant</div>
            <div className="badge"><FiCheck size={16} aria-hidden /> 256-bit Encryption</div>
            <div className="badge"><FiStar size={16} aria-hidden /> 4.9/5 Rated</div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-graphic">
            <div className="floating-card card-1"><FiSmartphone size={20} aria-hidden /> Symptom Check</div>
            <div className="floating-card card-2"><MdMedicalServices size={20} aria-hidden /> Video Call</div>
            <div className="floating-card card-3"><FiBarChart2 size={20} aria-hidden /> Health Tracking</div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="services">
        <div className="section-header">
          <h2>Comprehensive Healthcare at Your Fingertips</h2>
          <p>Everything you need for modern, accessible healthcare</p>
        </div>
        <div className="services-grid">
          {services.map((service, index) => (
            <div key={index} className="service-card">
              <div className="service-icon">{service.icon}</div>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Symptom Checker CTA */}
      <section className="symptom-cta">
        <div className="cta-content">
          <h2>Not Sure What's Wrong?</h2>
          <p>Our AI analyzes symptoms and provides recommendations in minutes</p>
          <button
            className="btn btn-primary btn-lg"
            onClick={() => navigate('/symptoms')}
          >
            Try Free Symptom Checker <FiArrowRight size={18} aria-hidden />
          </button>
        </div>
        <div className="cta-preview">
          <div className="preview-header">AI Symptom Analysis</div>
          <div className="preview-item"><FiCheck size={16} aria-hidden /> Analyze symptoms</div>
          <div className="preview-item"><FiCheck size={16} aria-hidden /> Get recommendations</div>
          <div className="preview-item"><FiCheck size={16} aria-hidden /> Find specialists</div>
        </div>
      </section>

      {/* Specialties Grid */}
      <section className="specialties">
        <div className="section-header">
          <h2>Access to Multiple Specialties</h2>
          <p>Connect with experts across diverse medical fields</p>
        </div>
        <div className="specialties-grid">
          {specialties.map((specialty, index) => (
            <div key={index} className="specialty-card">
              <h3>{specialty.name}</h3>
              <p>{specialty.count}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      {/* <section className="testimonials">
        <div className="section-header">
          <h2>Trusted by Thousands</h2>
          <p>See what patients and providers say about our platform</p>
        </div>
        <div className="testimonials-grid">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="testimonial-card">
              <div className="stars">
                {Array.from({ length: testimonial.rating }, (_, i) => <FiStar key={i} size={20} aria-hidden />)}
              </div>
              <p className="testimonial-text">"{testimonial.text}"</p>
              <div className="testimonial-author">
                <div className="author-avatar">
                  {testimonial.name.charAt(0)}
                </div>
                <div className="author-info">
                  <p className="author-name">{testimonial.name}</p>
                  <p className="author-role">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section> */}

      {/* Pricing Section */}
      {/* <section className="pricing">
        <div className="section-header">
          <h2>Simple, Transparent Pricing</h2>
          <p>Choose the plan that fits your healthcare needs</p>
        </div>
        <div className="pricing-grid">
          {pricing.map((plan, index) => (
            <div key={index} className={`pricing-card ${plan.highlighted ? 'highlighted' : ''}`}>
              <h3>{plan.tier}</h3>
              <div className="price">
                {plan.price}
                {plan.period && <span className="period">{plan.period}</span>}
              </div>
              <p className="price-description">{plan.description}</p>
              <button className="btn btn-outline">
                Choose Plan
              </button>
              <ul className="features-list">
                {plan.features.map((feature, fIndex) => (
                  <li key={fIndex}><FiCheck size={14} aria-hidden /> {feature}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section> */}

      {/* Final CTA */}
      <section className="final-cta">
        <h2>Start Your Health Journey Today</h2>
        <p>Join thousands using modern telemedicine</p>
        <button
          className="btn btn-primary btn-lg"
          onClick={() => navigate('/auth/signup')}
        >
          Get Started Free <FiArrowRight size={18} aria-hidden />
        </button>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>Telemedix</h4>
            <p>Making healthcare accessible to everyone</p>
          </div>
          <div className="footer-section">
            <h4>Product</h4>
            <ul>
              <li><a href="#features">Features</a></li>
              <li><a href="#pricing">Pricing</a></li>
              <li><a href="#security">Security</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Company</h4>
            <ul>
              <li><a href="#about">About</a></li>
              <li><a href="#blog">Blog</a></li>
              <li><a href="#careers">Careers</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Legal</h4>
            <ul>
              <li><a href="#privacy">Privacy</a></li>
              <li><a href="#terms">Terms</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 Telemedix. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

