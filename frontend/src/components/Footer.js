import React from 'react';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-links">
        <a href="/about">About</a>
        <a href="#">Privacy Policy</a>
        <a href="#">Terms of Service</a>
        <a href="#">Contact</a>
      </div>
      <div className="footer-copy">
        &copy; {new Date().getFullYear()} AI Telemedicine. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer; 