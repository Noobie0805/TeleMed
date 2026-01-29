import React from "react";
import "./MarketingFooter.css";
import { Link } from "react-router-dom";

function MarketingFooter() {
  return (
    <footer className="footer">
      <div className="footer-links">
        <Link to="/about">About</Link>
        <a href="#privacy">Privacy Policy</a>
        <a href="#terms">Terms of Service</a>
        <a href="#contact">Contact</a>
      </div>
      <div className="footer-copy">
        &copy; {new Date().getFullYear()} AI Telemedicine. All rights reserved.
      </div>
    </footer>
  );
}

export default MarketingFooter;

