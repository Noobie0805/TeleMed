import React from "react";
import { FiClipboard } from "react-icons/fi";
import "./EmptyState.css";

export default function EmptyState({ icon, title, description, action, className = "" }) {
  const IconEl = icon ?? <FiClipboard />;
  return (
    <div className={`empty-state ${className}`.trim()}>
      <div className="empty-state__icon" aria-hidden="true">
        {IconEl}
      </div>
      <h3 className="empty-state__title">{title}</h3>
      {description && <p className="empty-state__description">{description}</p>}
      {action && <div className="empty-state__action">{action}</div>}
    </div>
  );
}

