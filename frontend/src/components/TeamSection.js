import React from 'react';
import './TeamSection.css';
import medicalofficer from '../medicalofficer.png';
import leadengineer from '../leadengineer.png';
import aispecialist from '../aispecialist.png';

const team = [
  { name: 'Dr. Asha Mehta', role: 'Chief Medical Officer', img: medicalofficer, bio: '10+ years in medicine, passionate about digital health and patient care.' },
  { name: 'Rahul Verma', role: 'Lead Engineer', img: leadengineer, bio: 'Full-stack developer with expertise in scalable healthcare platforms.' },
  { name: 'Anjali Tiwari', role: 'AI Specialist', img: aispecialist, bio: 'AI/ML expert focused on medical data and patient safety.' },
];

function TeamSection() {
  return (
    <section className="team-section">
      <h2>Meet Our Team</h2>
      <div className="team-list">
        {team.map((member, idx) => (
          <div className="team-card" key={idx}>
            <img src={member.img} alt={member.name} className="team-img" />
            <h3>{member.name}</h3>
            <p className="team-role">{member.role}</p>
            <p className="team-bio">{member.bio}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default TeamSection; 