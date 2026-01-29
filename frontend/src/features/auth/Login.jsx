// src/features/auth/Login.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import './Login.css';

const redirectForRole = (role) => {
    if (role === "admin") return "/admin/pending-doctors";
    if (role === "doctor") return "/doctor/schedule";
    return "/symptoms";
};

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const user = await login(formData);
            navigate(redirectForRole(user?.role), { replace: true });
        } catch (err) {
            setError(err?.response?.data?.message || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <header className="auth-header">
                    <p className="auth-eyebrow">Welcome back</p>
                    <h1 className="auth-title">Sign in to TeleMedix</h1>
                    <p className="auth-subtitle">
                        New here ? {"  "}
                        <Link to="/register/patient">Create patient account</Link>
                        {" · "}
                        <Link to="/register/doctor">Apply as doctor</Link>
                    </p>
                </header>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="auth-field">
                        <label htmlFor="email" className="auth-label">Email</label>
                        <input
                            id="email"
                            type="email"
                            placeholder="Enter your email"
                            className="auth-input"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>

                    <div className="auth-field">
                        <label htmlFor="password" className="auth-label">Password</label>
                        <input
                            id="password"
                            type="password"
                            placeholder="Enter your password"
                            className="auth-input"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                    </div>

                    {error && <p className="auth-error">{error}</p>}

                    <button type="submit" className="auth-primary-btn" disabled={loading}>
                        {loading ? "Logging in..." : "Sign in"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
