// src/features/appointments/DoctorList.jsx
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './DoctorList.css';

const DoctorList = () => {
    const [doctors, setDoctors] = useState([]);
    const [specialty, setSpecialty] = useState('');
    const [loading, setLoading] = useState(true);

    // DoctorList.jsx
    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const { data } = await api.get('/doctors', {
                    params: specialty ? { specialty } : {}
                });
                setDoctors(data.data || []);
            } catch (err) {
                console.error('Doctors fetch failed', err);
            } finally {
                setLoading(false);
            }
        };
        fetchDoctors();
    }, [specialty]);


    if (loading) return <div className="loading">Loading doctors...</div>;

    return (
        <div className="doctor-list">
            <h2>Find a Doctor</h2>
            <select onChange={(e) => setSpecialty(e.target.value)} value={specialty}>
                <option value="">All Specialties</option>
                <option value="neurology">Neurology</option>
                <option value="cardiology">Cardiology</option>
            </select>
            <div className="doctors-grid">
                {doctors.map((doctor) => (
                    <div key={doctor._id} className="doctor-card">
                        <img src={doctor.profile.avatar || '/default-avatar.png'} alt={doctor.profile.name} />
                        <h3>{doctor.profile.name}</h3>
                        <p>{doctor.specialty} • {doctor.profile.experience} yrs exp</p>
                        <p>Rating: {doctor.rating}/5 ({doctor.reviewCount} reviews)</p>
                        <button>Book Consultation</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DoctorList;
