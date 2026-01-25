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
        <div>
            <form onSubmit={handleSubmit} className="login-form">
                <input
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                />
                {error && <p className="error">{error}</p>}
                <button type="submit" disabled={loading}>{loading ? "Logging in..." : "Login"}</button>
            </form>

            <div style={{ marginTop: 12 }}>
                <Link to="/register/patient">Create patient account</Link>
                {" · "}
                <Link to="/register/doctor">Apply as doctor</Link>
            </div>
        </div>
    );
};

export default Login;
