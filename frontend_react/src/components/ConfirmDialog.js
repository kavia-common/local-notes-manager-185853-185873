import React, { useEffect, useRef } from "react";

/**
 * PUBLIC_INTERFACE
 * Simple confirm dialog modal with keyboard support and focus trapping.
 * Props:
 * - open: boolean
 * - title: string
 * - message: string
 * - onCancel: function
 * - onConfirm: function
 */
export default function ConfirmDialog({ open, title, message, onCancel, onConfirm }) {
  const backdropRef = useRef(null);
  const cancelBtnRef = useRef(null);
  const confirmBtnRef = useRef(null);

  // Close on Escape, Enter confirms when focused in dialog (not inside inputs)
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onCancel && onCancel();
      }
      if (e.key === "Enter") {
        // If focus is on cancel button do not confirm implicitly
        if (document.activeElement === cancelBtnRef.current) return;
        // Confirm with Enter if dialog open
        e.preventDefault();
        onConfirm && onConfirm();
      }
      // Basic focus trap with Tab
      if (e.key === "Tab") {
        const focusables = [cancelBtnRef.current, confirmBtnRef.current].filter(Boolean);
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [open, onCancel, onConfirm]);

  // Initial focus to cancel for a safe default action
  useEffect(() => {
    if (open && cancelBtnRef.current) {
      cancelBtnRef.current.focus();
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      ref={backdropRef}
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      aria-describedby="confirm-message"
    >
      <div className="modal" role="document">
        <h3 id="confirm-title" className="modal-title">{title}</h3>
        <p id="confirm-message" className="modal-message">{message}</p>
        <div className="modal-actions">
          <button
            ref={cancelBtnRef}
            className="btn btn-ghost"
            onClick={onCancel}
            aria-label="Cancel deletion"
          >
            Cancel
          </button>
          <button
            ref={confirmBtnRef}
            className="btn btn-danger"
            onClick={onConfirm}
            aria-label="Confirm delete"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
