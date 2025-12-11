import React, { useEffect, useState } from "react";

/**
 * PUBLIC_INTERFACE
 * ErrorBanner subscribes to app storage errors and displays a dismissible inline banner.
 * Props:
 * - autoHideMs?: number (default undefined - persistent)
 */
export default function ErrorBanner({ autoHideMs }) {
  const [err, setErr] = useState(null);

  useEffect(() => {
    function onError(ev) {
      setErr(ev.detail);
    }
    window.addEventListener("app:error", onError);
    return () => window.removeEventListener("app:error", onError);
  }, []);

  useEffect(() => {
    if (!autoHideMs || !err) return;
    const t = setTimeout(() => setErr(null), autoHideMs);
    return () => clearTimeout(t);
  }, [autoHideMs, err]);

  if (!err) return null;

  return (
    <div
      className="error-banner"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <span>⚠️ {err.message || "A storage error occurred."}</span>
      <button
        className="icon-btn"
        onClick={() => setErr(null)}
        aria-label="Dismiss error"
        title="Dismiss"
      >
        ✖️
      </button>
    </div>
  );
}
