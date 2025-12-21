import React from 'react';
import { Link } from 'react-router-dom';
import './SignupForm.css';

function SignupForm() {
  return (
    <form className="signup-form">
      <h2>Sign Up</h2>
      <input type="text" placeholder="Full Name" required />
      <input type="email" placeholder="Email" required />
      <input type="password" placeholder="Password" required />
      <input type="password" placeholder="Confirm Password" required />
      <label className="user-type-label">
        I am a : &nbsp; &nbsp;
        <select required>
          <option value="">Select</option>
          <option value="patient">Patient</option>
          <option value="doctor">Doctor</option>
        </select>
      </label>
      <button type="submit">Sign Up</button>
      <p>Already have an account? <Link to="/login">Login</Link></p>
    </form>
  );
}

export default SignupForm; 