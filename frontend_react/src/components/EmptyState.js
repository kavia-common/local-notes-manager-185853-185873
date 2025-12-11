import React from "react";

/**
 * PUBLIC_INTERFACE
 * EmptyState: Generic empty state component with optional action.
 * Props:
 * - title: string
 * - description: string
 * - actionLabel?: string
 * - onAction?: function
 */
export default function EmptyState({ title = "Nothing here yet", description = "", actionLabel, onAction }) {
  return (
    <section className="empty" role="status" aria-live="polite" aria-atomic="true">
      <h2 style={{ margin: 0 }}>{title}</h2>
      {description ? <p style={{ marginTop: 6 }}>{description}</p> : null}
      {actionLabel && onAction ? (
        <div style={{ marginTop: 10 }}>
          <button className="btn btn-primary" onClick={onAction} aria-label={actionLabel}>
            {actionLabel}
          </button>
        </div>
      ) : null}
    </section>
  );
}
