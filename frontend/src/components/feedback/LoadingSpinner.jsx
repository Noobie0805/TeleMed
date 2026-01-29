import React from "react";
import "./LoadingSpinner.css";

export default function LoadingSpinner({ size = "md", text, fullScreen = false }) {
  const sizeClass = `loading-spinner--${size}`;
  const containerClass = fullScreen
    ? "loading-spinner-container loading-spinner-container--fullscreen"
    : "loading-spinner-container";

  return (
    <div className={containerClass}>
      <div className={`loading-spinner ${sizeClass}`}>
        <div className="loading-spinner__circle" />
        <div className="loading-spinner__circle" />
        <div className="loading-spinner__circle" />
      </div>
      {text && <p className="loading-spinner__text">{text}</p>}
    </div>
  );
}

