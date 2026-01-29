import React from "react";
import "./PageHeader.css";

export default function PageHeader({ title, subtitle, actions = [], className = "" }) {
  return (
    <div className={`page-header ${className}`.trim()}>
      <div className="page-header__text">
        <h1 className="page-header__title">{title}</h1>
        {subtitle && <p className="page-header__subtitle">{subtitle}</p>}
      </div>
      {actions.length > 0 && (
        <div className="page-header__actions">
          {actions.map((action, index) => (
            <span key={index}>{action}</span>
          ))}
        </div>
      )}
    </div>
  );
}

