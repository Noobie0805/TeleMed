import React from 'react';
import { useNavigate } from 'react-router-dom';
import './AvailableDoctorsList.css';
import doctor1 from '../../assets/doctor1(female).png';
import doctor2 from '../../assets/doctor2(female).png';
import doctor3 from '../../assets/doctor3(female).png';
import doctor4 from '../../assets/doctor4(male).png';

const doctors = [
  { name: 'Dr. Asha Mehta', specialty: 'General Physician', img: doctor1 },
  { name: 'Dr. Rajiv Kumar', specialty: 'Dermatologist', img: doctor4 },
  { name: 'Dr. Neha Singh', specialty: 'Pediatrician', img: doctor2 },
  { name: 'Dr. Priya Sharma', specialty: 'Psychiatrist', img: doctor3 },
];

function AvailableDoctorsList() {
  const navigate = useNavigate();

  const handleBook = (doc) => {
    navigate('/consult', { state: { doctorName: doc.name, specialty: doc.specialty } });
  };

  return (
    <section className="available-doctors">
      <h2>Available Doctors</h2>
      <div className="doctor-list">
        {doctors.map((doc, idx) => (
          <div className="doctor-card" key={idx}>
            <img src={doc.img} alt={doc.name} className="doctor-img" />
            <h3>{doc.name}</h3>
            <p>{doc.specialty}</p>
            <button onClick={() => handleBook(doc)}>Book</button>
          </div>
        ))}
      </div>
    </section>
  );
}

export default AvailableDoctorsList; 