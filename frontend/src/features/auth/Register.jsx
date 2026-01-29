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
    const isDoctor = type === 'doctor';

    const [formData, setFormData] = useState({
        email: '', password: '', name: '', phone: '', age: '', gender: '',
        ...(isDoctor && { specialty: '', experience: '', qualifications: '', licenseNumber: '' })
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
            if (isDoctor) {
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

    const title = isDoctor ? "Apply as a doctor" : "Create patient account";
    const subtitle = isDoctor
        ? (
            <>
                Already have an account? <Link to="/login">Log in</Link>
            </>
        )
        : (
            <>
                Already a member? <Link to="/login">Log in</Link>
            </>
        );

    return (
        <div className="auth-page-reg">
            <div className="auth-card-reg">
                <header className="auth-header-reg">
                    <p className="auth-eyebrow-reg">Start for free</p>
                    <h1 className="auth-title-reg">{title}</h1>
                    <p className="auth-subtitle-reg">{subtitle}</p>
                </header>

                <form onSubmit={handleSubmit} className="auth-form-reg">
                    <div className="auth-field-reg">
                        <label htmlFor="name" className="auth-label-reg">Full name</label>
                        <input
                            id="name"
                            placeholder="Enter your full name"
                            className="auth-input-reg"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>

                    <div className="auth-grid-2-reg">
                        <div className="auth-field-reg">
                            <label htmlFor="email" className="auth-label-reg">Email</label>
                            <input
                                id="email"
                                type="email"
                                placeholder="Email address"
                                className="auth-input-reg"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>
                        <div className="auth-field-reg">
                            <label htmlFor="phone" className="auth-label-reg">Phone</label>
                            <input
                                id="phone"
                                placeholder="Mobile number"
                                className="auth-input-reg"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="auth-grid-2-reg">
                        <div className="auth-field-reg">
                            <label htmlFor="password" className="auth-label-reg">Password</label>
                            <input
                                id="password"
                                type="password"
                                placeholder="Create a password"
                                className="auth-input-reg"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                            />
                        </div>
                        <div className="auth-field-reg">
                            <label htmlFor="age" className="auth-label-reg">Age</label>
                            <input
                                id="age"
                                type="number"
                                min="0"
                                placeholder="Age"
                                className="auth-input-reg"
                                value={formData.age}
                                onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                                required
                            />
                        </div>
                    </div>

                    <div className="auth-field-reg">
                        <label htmlFor="gender" className="auth-label-reg">Gender</label>
                        <select
                            id="gender"
                            className="auth-input-reg auth-select-reg"
                            value={formData.gender}
                            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                            required
                        >
                            <option value="">Select gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    {isDoctor && (
                        <>
                            <div className="auth-grid-2-reg">
                                <div className="auth-field-reg">
                                    <label htmlFor="specialty" className="auth-label-reg">Specialty</label>
                                    <input
                                        id="specialty"
                                        placeholder="e.g. Cardiologist"
                                        className="auth-input-reg"
                                        value={formData.specialty}
                                        onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                                    />
                                </div>
                                <div className="auth-field-reg">
                                    <label htmlFor="experience" className="auth-label-reg">Experience (years)</label>
                                    <input
                                        id="experience"
                                        type="number"
                                        min="0"
                                        placeholder="Years of practice"
                                        className="auth-input-reg"
                                        value={formData.experience}
                                        onChange={(e) => setFormData({ ...formData, experience: Number(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div className="auth-field-reg">
                                <label htmlFor="license" className="auth-label-reg">License number</label>
                                <input
                                    id="license"
                                    placeholder="Registration / license number"
                                    className="auth-input-reg"
                                    value={formData.licenseNumber}
                                    onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                                />
                            </div>
                        </>
                    )}

                    {error && <p className="auth-error-reg">{error}</p>}
                    {success && <p className="auth-success-reg">{success}</p>}

                    <div className="auth-actions-reg">
                        <button
                            type="button"
                            className="auth-secondary-btn-reg"
                            onClick={() => navigate('/login')}
                        >
                            Back
                        </button>
                        <button type="submit" className="auth-primary-btn-reg" disabled={loading}>
                            {loading ? "Submitting..." : isDoctor ? "Submit application" : "Create account"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;
