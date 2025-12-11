import React, { useState, useEffect } from "react";
import { useSettings } from "../hooks/useSettings";

/**
 * PUBLIC_INTERFACE
 * Toolbar component provides search, filter toggles, and sorting controls.
 * Reads from settings context and updates it to drive selectors in NotesList.
 */
export default function Toolbar() {
  const { state, setSort, setFilters, resetFilters } = useSettings();
  const sortBy = state?.sortBy || "updatedAt";
  const sortDir = state?.sortDir === "asc" ? "asc" : "desc";
  const filter = state?.filter || { query: "", pinnedOnly: false, archived: false };

  const [query, setQuery] = useState(filter.query || "");
  const [pinnedOnly, setPinnedOnly] = useState(!!filter.pinnedOnly);
  const [archived, setArchived] = useState(!!filter.archived);

  // Keep local state in sync when settings change from elsewhere
  useEffect(() => {
    setQuery(filter.query || "");
    setPinnedOnly(!!filter.pinnedOnly);
    setArchived(!!filter.archived);
  }, [filter.query, filter.pinnedOnly, filter.archived]);

  const applyFilters = () => {
    setFilters({ query, pinnedOnly, archived });
  };

  const handleReset = () => {
    resetFilters();
    try {
      const ev = new CustomEvent("toast:info", { detail: { message: "Filters reset" } });
      window.dispatchEvent(ev);
    } catch (_) {}
  };

  const handleSortBy = (e) => {
    setSort(e.target.value, sortDir);
  };

  const handleSortDir = () => {
    setSort(sortBy, sortDir === "asc" ? "desc" : "asc");
  };

  return (
    <div className="toolbar container">
      <div className="toolbar-row">
        <div className="search-group">
          <input
            type="text"
            className="input"
            placeholder="Search notes..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") applyFilters();
            }}
            aria-label="Search notes"
          />
          <button className="btn" onClick={applyFilters} aria-label="Apply filters">
            Search
          </button>
          <button className="btn btn-ghost" onClick={handleReset} aria-label="Reset filters">
            Reset
          </button>
        </div>

        <div className="filters-group">
          <label className="checkbox">
            <input
              type="checkbox"
              checked={pinnedOnly}
              onChange={(e) => {
                const next = e.target.checked;
                setPinnedOnly(next);
                // Immediately reflect change in settings
                setFilters({ query, pinnedOnly: next, archived });
              }}
            />
            <span>Pinned</span>
          </label>
          <label className="checkbox">
            <input
              type="checkbox"
              checked={archived}
              onChange={(e) => {
                const next = e.target.checked;
                setArchived(next);
                // Immediately reflect change in settings
                setFilters({ query, pinnedOnly, archived: next });
              }}
            />
            <span>Archived</span>
          </label>
        </div>

        <div className="sort-group">
          <select className="select" value={sortBy} onChange={handleSortBy} aria-label="Sort by">
            <option value="updatedAt">Updated</option>
            <option value="createdAt">Created</option>
            <option value="title">Title</option>
          </select>
          <button className="btn btn-secondary" onClick={handleSortDir} aria-label="Toggle sort direction">
            {sortDir === "asc" ? "↑ Asc" : "↓ Desc"}
          </button>
        </div>
      </div>
    </div>
  );
}
