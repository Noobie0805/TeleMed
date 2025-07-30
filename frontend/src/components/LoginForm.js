import React from 'react';
import { Link } from 'react-router-dom';
import './LoginForm.css';

function LoginForm() {
  return (
    <form className="login-form">
      <h2>Login</h2>
      <input type="email" placeholder="Email" required />
      <input type="password" placeholder="Password" required />
      <button type="submit">Login</button>
      <p>Don't have an account? <Link to="/signup">Sign up</Link></p>
    </form>
  );
}

export default LoginForm; 