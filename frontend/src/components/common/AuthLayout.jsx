import React from "react";
import Navbar from "../layout/Navbar";
import Footer from "../layout/Footer";
import "./AuthLayout.css";

export default function AuthLayout({ children }) {
  return (
    <div className="auth-layout">
      <Navbar />
      <main className="auth-main">
        {children}
      </main>
      <Footer />
    </div>
  );
}
