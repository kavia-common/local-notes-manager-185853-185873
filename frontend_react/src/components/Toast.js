import React, { useEffect } from "react";

/**
 * PUBLIC_INTERFACE
 * Toast component for transient messages.
 * Props:
 * - message: string
 * - type: 'success'|'error'|'info'
 * - onClose: function
 * - duration: ms before auto-close
 */
export default function Toast({ message, type = "info", onClose, duration = 2500 }) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => onClose && onClose(), duration);
    return () => clearTimeout(t);
  }, [message, onClose, duration]);

  if (!message) return null;

  // Use assertive for errors to announce immediately, polite otherwise
  const ariaLive = type === "error" ? "assertive" : "polite";
  const role = type === "error" ? "alert" : "status";

  return (
    <div className={`toast toast-${type}`} role={role} aria-live={ariaLive} aria-atomic="true">
      <span>{message}</span>
      <button
        className="icon-btn"
        onClick={onClose}
        aria-label="Close notification"
        title="Close notification"
      >
        ✖️
      </button>
    </div>
  );
}
