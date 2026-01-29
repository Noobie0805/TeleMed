import React from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./MarketingNavbar.css";

function MarketingNavbar() {
  const { user, role, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">TeleMedix</Link>
      </div>
      <ul className="navbar-links">
        <li>
          <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : "")}>
            Home
          </NavLink>
        </li>
        {isAuthenticated && role === "patient" && (
          <>
            <li>
              <NavLink to="/symptoms" className={({ isActive }) => (isActive ? "active" : "")}>
                Symptom checker
              </NavLink>
            </li>
            <li>
              <NavLink to="/doctors" className={({ isActive }) => (isActive ? "active" : "")}>
                Doctors
              </NavLink>
            </li>
            <li>
              <NavLink to="/appointments" className={({ isActive }) => (isActive ? "active" : "")}>
                Appointments
              </NavLink>
            </li>
          </>
        )}
        {!isAuthenticated && (
          <>
            <li>
              <NavLink to="/symptoms" className={({ isActive }) => (isActive ? "active" : "")}>
                Symptom checker
              </NavLink>
            </li>
            <li>
              <NavLink to="/doctors" className={({ isActive }) => (isActive ? "active" : "")}>
                Doctors
              </NavLink>
            </li>
            <li>
              <NavLink to="/appointments" className={({ isActive }) => (isActive ? "active" : "")}>
                Appointments
              </NavLink>
            </li>
            <li>
              <NavLink to="/about" className={({ isActive }) => (isActive ? "active" : "")}>
                About
              </NavLink>
            </li>
          </>
        )}
        {isAuthenticated ? (
          <li className="navbar-user">
            <span className="navbar-user-info">
              {user?.email} {role ? `(${role})` : ""}
            </span>
            <button onClick={handleLogout} className="navbar-logout">
              Logout
            </button>
          </li>
        ) : (
          <li>
            <NavLink to="/login" className={({ isActive }) => (isActive ? "active" : "")}>
              Login
            </NavLink>
          </li>
        )}
      </ul>
    </nav>
  );
}

export default MarketingNavbar;

