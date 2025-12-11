import React from "react";
import { useSettings } from "../hooks/useSettings";

/**
 * PUBLIC_INTERFACE
 * Header component displaying app title and theme toggle.
 * Uses settings context to get and set the theme.
 * This updates SettingsProvider state which App observes to sync theme to <html data-theme>.
 */
export default function Header() {
  const { state, setTheme } = useSettings();
  const theme = state.theme || "light";
  const nextTheme = theme === "light" ? "dark" : "light";

  const handleToggle = () => setTheme(nextTheme);

  return (
    <header className="app-header">
      <div className="container header-inner">
        <h1 className="brand">
          <span className="brand-accent">✦</span> Local Notes
        </h1>
        <div className="header-actions">
          <button
            className="btn btn-secondary"
            onClick={handleToggle}
            aria-label={`Switch to ${nextTheme} mode`}
            title={`Switch to ${nextTheme} mode`}
          >
            {theme === "light" ? "🌙 Dark" : "☀️ Light"}
          </button>
        </div>
      </div>
    </header>
  );
}
