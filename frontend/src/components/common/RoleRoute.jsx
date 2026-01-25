import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function RoleRoute({ allow = [], children }) {
  const { role, loading } = useAuth();

  if (loading) return <div className="loading-overlay">Loading...</div>;
  if (!allow.includes(role)) return <Navigate to="/" replace />;
  return children;
}

