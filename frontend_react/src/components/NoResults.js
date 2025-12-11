import React from "react";

/**
 * PUBLIC_INTERFACE
 * NoResults: Shown when filters/search yield no results.
 * Props:
 * - message: string
 * - onClear?: function (clear filters)
 */
export default function NoResults({ message = "No results found.", onClear }) {
  return (
    <div className="empty" role="status" aria-live="polite" aria-atomic="true">
      <p style={{ margin: 0 }}>{message}</p>
      {onClear ? (
        <div style={{ marginTop: 10 }}>
          <button className="btn btn-ghost" onClick={onClear} aria-label="Clear filters">Clear filters</button>
        </div>
      ) : null}
    </div>
  );
}
