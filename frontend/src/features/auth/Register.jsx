import React, { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import './Register.css';

const redirectForRole = (role) => {
    if (role === "admin") return "/admin/pending-doctors";
    if (role === "doctor") return "/doctor/schedule";
    return "/symptoms";
};

const Register = ({ type = 'patient' }) => {  // patient/doctor
    const [formData, setFormData] = useState({
        email: '', password: '', name: '', phone: '', age: '', gender: '',
        ...(type === 'doctor' && { specialty: '', experience: '', qualifications: '', licenseNumber: '' })
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { registerPatient, registerDoctor } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);
        try {
            if (type === "doctor") {
                const result = await registerDoctor(formData);
                setSuccess(result?.status || "Submitted for verification.");
                navigate("/pending", { state: { email: formData.email }, replace: true });
                return;
            }

            const user = await registerPatient(formData);
            navigate(redirectForRole(user?.role), { replace: true });
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="register-form">
            <h2>{type === 'doctor' ? 'Doctor' : 'Patient'} Registration</h2>
            <input placeholder="Full Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
            <input type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
            <input type="password" placeholder="Password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
            <input placeholder="Phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required />
            <input type="number" placeholder="Age" value={formData.age} onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })} required />
            <select value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })} required>
                <option value="">Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
            </select>

            {type === 'doctor' && (
                <>
                    <input placeholder="Specialty" value={formData.specialty} onChange={(e) => setFormData({ ...formData, specialty: e.target.value })} />
                    <input type="number" placeholder="Experience (years)" value={formData.experience} onChange={(e) => setFormData({ ...formData, experience: Number(e.target.value) })} />
                    <input placeholder="License Number" value={formData.licenseNumber} onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })} />
                </>
            )}

            {error && <p className="error">{error}</p>}
            {success && <p className="success">{success}</p>}
            <button type="submit" disabled={loading}>{loading ? "Submitting..." : "Register"}</button>

            <div style={{ marginTop: 12 }}>
                <Link to="/login">Back to login</Link>
            </div>
        </form>
    );
};

export default Register;
