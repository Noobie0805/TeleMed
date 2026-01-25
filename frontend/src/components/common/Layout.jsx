import React from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Layout() {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div>
      <header style={{ padding: "12px 16px", borderBottom: "1px solid #eee" }}>
        <nav style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Link to="/">Telemed</Link>

          {role === "patient" && (
            <>
              <Link to="/symptoms">Symptoms</Link>
              <Link to="/doctors">Doctors</Link>
              <Link to="/appointments">My Appointments</Link>
              <Link to="/vitals">Vitals</Link>
              <Link to="/chat">Chat</Link>
            </>
          )}

          {role === "doctor" && (
            <>
              <Link to="/doctor/schedule">Schedule</Link>
              <Link to="/chat">Chat</Link>
            </>
          )}

          {role === "admin" && (
            <>
              <Link to="/admin/pending-doctors">Pending Doctors</Link>
              <Link to="/admin/overview">Overview</Link>
            </>
          )}

          <div style={{ marginLeft: "auto", display: "flex", gap: 12, alignItems: "center" }}>
            <span style={{ fontSize: 12, opacity: 0.7 }}>
              {user?.email} {role ? `(${role})` : ""}
            </span>
            <button onClick={onLogout}>Logout</button>
          </div>
        </nav>
      </header>

      <main style={{ padding: 16 }}>
        <Outlet />
      </main>
    </div>
  );
}

