import React from 'react';
import './Testimonials.css';
import user1 from '../../assets/user-1-female.png';
import user2 from '../../assets/user-2-female.png';

const testimonials = [
  {
    text: 'The AI symptom checker was so helpful and saved me a trip to the clinic!',
    user: 'Priya S.',
    avatar: user1
  },
  {
    text: 'Booking a video consultation was quick and easy. Highly recommend!',
    user: 'Ramika M.',
    avatar: user2
  }
];

function Testimonials() {
  return (
    <section className="testimonials-section">
      <h2>User Testimonials</h2>
      <div className="testimonials-list">
        {testimonials.map((t, idx) => (
          <div className="testimonial-card" key={idx}>
            <div className="testimonial-avatar" aria-hidden="true">
              <img src={t.avatar} alt={t.user + ' avatar'} className="testimonial-avatar-img" />
            </div>
            <p>{t.text}</p>
            <span>- {t.user}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Testimonials; 