import React from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Navbar.css";

export default function Navbar() {
  const { user, role, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">TeleMedix</Link>
      </div>
      <ul className="navbar-links">
        {!isAuthenticated ? (
          <>
            <li>
              <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : "")}>
                Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/login" className={({ isActive }) => (isActive ? "active" : "")}>
                Login
              </NavLink>
            </li>
          </>
        ) : (
          <>
            {role === "patient" && (
              <>
                <li>
                  <NavLink to="/symptoms" className={({ isActive }) => (isActive ? "active" : "")}>
                    Symptoms
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
                  <NavLink to="/vitals" className={({ isActive }) => (isActive ? "active" : "")}>
                    Vitals
                  </NavLink>
                </li>
              </>
            )}

            {role === "doctor" && (
              <>
                <li>
                  <NavLink to="/doctor/schedule" className={({ isActive }) => (isActive ? "active" : "")}>
                    Schedule
                  </NavLink>
                </li>
              </>
            )}

            {role === "admin" && (
              <>
                <li>
                  <NavLink to="/admin/pending-doctors" className={({ isActive }) => (isActive ? "active" : "")}>
                    Pending Doctors
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/admin/overview" className={({ isActive }) => (isActive ? "active" : "")}>
                    Overview
                  </NavLink>
                </li>
              </>
            )}

            <li className="navbar-user">
              <span className="navbar-user-info">
                {user?.email} {role ? `(${role})` : ""}
              </span>
              <button onClick={handleLogout} className="navbar-logout">
                Logout
              </button>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}
