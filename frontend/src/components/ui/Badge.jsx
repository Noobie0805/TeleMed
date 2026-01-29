import React from "react";
import "./Badge.css";

export default function Badge({ children, variant = "default", size = "md", className = "" }) {
  const baseClass = "badge";
  const variantClass = `badge--${variant}`;
  const sizeClass = `badge--${size}`;

  return (
    <span className={`${baseClass} ${variantClass} ${sizeClass} ${className}`.trim()}>
      {children}
    </span>
  );
}

