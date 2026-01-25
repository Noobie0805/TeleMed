// src/features/appointments/DoctorList.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import api from '../../services/api';
import './DoctorList.css';

const DoctorList = () => {
    const [doctors, setDoctors] = useState([]);
    const [specialty, setSpecialty] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    // DoctorList.jsx
    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                setError("");
                const { data } = await api.get('/auth/doctors', {
                    params: specialty ? { specialty } : {}
                });
                const list = data?.data?.data || [];
                setDoctors(Array.isArray(list) ? list : []);
            } catch (err) {
                console.error('Doctors fetch failed', err);
                setError(err?.response?.data?.message || "Failed to load doctors");
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
            {error && <p className="error">{error}</p>}
            <div className="doctors-grid">
                {doctors.map((doctor) => (
                    <div key={doctor._id} className="doctor-card">
                        <img src={doctor.profile.avatar || '/default-avatar.png'} alt={doctor.profile.name} />
                        <h3>{doctor.profile.name}</h3>
                        <p>{doctor.profile.specialty || "General"} • {doctor.profile.experience || 0} yrs exp</p>
                        <p>Rating: {doctor.rating || 0}/5 ({doctor.reviewCount || 0} reviews)</p>
                        <button onClick={() => navigate(`/appointments/book?doctorId=${doctor._id}`)}>
                            Book Consultation
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DoctorList;
