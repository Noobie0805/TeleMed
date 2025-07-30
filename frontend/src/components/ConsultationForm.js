import React, { useState, useEffect } from 'react';
import './ConsultationForm.css';

function ConsultationForm({ doctorName = '', specialty = '' }) {
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [name, setName] = useState('');

  useEffect(() => {
    setSelectedSpecialty(specialty || '');
    setName(doctorName || '');
  }, [specialty, doctorName]);

  return (
    <form className="consultation-form">
      <h2>Book a Consultation</h2>
      <label>
        Doctor:
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Select a doctor or leave blank for any"
          readOnly={!!doctorName}
        />
      </label>
      <label>
        Specialty:
        <select
          required
          value={selectedSpecialty}
          onChange={e => setSelectedSpecialty(e.target.value)}
        >
          <option value="">Select specialty</option>
          <option value="General Physician">General Physician</option>
          <option value="Dermatologist">Dermatologist</option>
          <option value="Pediatrician">Pediatrician</option>
          <option value="Psychiatrist">Psychiatrist</option>
        </select>
      </label>
      <label>
        Date:
        <input type="date" required />
      </label>
      <label>
        Time:
        <input type="time" required />
      </label>
      <label>
        Symptoms:
        <textarea placeholder="Describe your symptoms..." required />
      </label>
      <button type="submit">Book Appointment</button>
    </form>
  );
}

export default ConsultationForm; 