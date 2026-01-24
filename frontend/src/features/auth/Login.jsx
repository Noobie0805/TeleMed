// src/features/auth/Login.jsx
import React, { useState } from 'react';
import api from '../../services/api';
import './Login.css';

const Login = ({ onLogin }) => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.post('/auth/login', formData);
            // Extract correctly from your backend structure
            const accessToken = data.data.tokens.accessToken;
            const userData = data.data.user;

            localStorage.setItem('token', accessToken);
            localStorage.setItem('user', JSON.stringify(userData));

            onLogin(userData);
        } catch (err) {
            setError('Invalid credentials');
        }

    };

    return (
        <form onSubmit={handleSubmit} className="login-form">
            <input type="email" placeholder="Email" onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            <input type="password" placeholder="Password" onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
            {error && <p className="error">{error}</p>}
            <button type="submit">Login</button>
        </form>
    );
};

export default Login;
