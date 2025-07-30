import React from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <NavLink to="/">TeleMedix</NavLink>
      </div>
      <ul className="navbar-links">
        <li><NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>Home</NavLink></li>
        <li><NavLink to="/consult" className={({ isActive }) => isActive ? 'active' : ''}>Consult</NavLink></li>
        <li><NavLink to="/about" className={({ isActive }) => isActive ? 'active' : ''}>About</NavLink></li>
        <li><NavLink to="/login" className={({ isActive }) => isActive ? 'active' : ''}>Login</NavLink></li>
        <li><NavLink to="/signup" className={({ isActive }) => isActive ? 'active' : ''}>Signup</NavLink></li>
      </ul>
    </nav>
  );
}

export default Navbar; 