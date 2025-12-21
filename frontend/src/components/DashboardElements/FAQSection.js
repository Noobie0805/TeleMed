import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './FAQSection.css';

const faqs = [
  {
    question: 'How does the AI consultation work?',
    answer: 'Our AI analyzes your symptoms and medical history to provide preliminary advice. You can then connect with a certified doctor for further consultation.'
  },
  {
    question: 'Is my health data safe and private?',
    answer: 'Yes, we use advanced encryption and follow strict privacy protocols to ensure your health data is secure and confidential.'
  },
  {
    question: 'How do I book an appointment with a doctor?',
    answer: 'After your AI assessment, you can view available doctors and book an appointment directly through our platform.'
  },
  {
    question: 'What should I do if I face technical issues?',
    answer: 'If you encounter any technical problems, please contact our support team via the live chat or email us at support@ai-telemed.com.'
  }
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);
  const navigate = useNavigate();

  const toggleFAQ = idx => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  const handleConsultClick = () => {
    navigate('/consult');
  };

  return (
    <div className="faq-section-bg">
      <div className="faq-card">
        <div className="faq-image" />
        <div className="faq-content">
          <h2>Frequently Asked Questions From Patients</h2>
          <ul className="faq-list">
            {faqs.map((faq, idx) => (
              <li key={idx} className={openIndex === idx ? 'open' : ''}>
                <button className="faq-question" onClick={() => toggleFAQ(idx)}>
                  {faq.question}
                  <span className="faq-toggle">{openIndex === idx ? '-' : '+'}</span>
                </button>
                {openIndex === idx && (
                  <div className="faq-answer">{faq.answer}</div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
      {/* <div className="faq-cta-card">
        <div className="faq-cta-content">
          <span className="faq-cta-label">Change Your Life</span>
          <h3>Find Your Inner Peace & Happiness</h3>
        </div>
        <button className="faq-cta-btn" onClick={handleConsultClick}>Book Consultation</button>
      </div> */}
    </div>
  );
} 