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

  return (
    <div className={`toast toast-${type}`} role="status" aria-live="polite">
      <span>{message}</span>
      <button className="icon-btn" onClick={onClose} aria-label="Close">✖️</button>
    </div>
  );
}
