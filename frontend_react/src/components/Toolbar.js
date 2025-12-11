import React, { useState, useEffect } from "react";
import { useSettings } from "../hooks/useSettings";

/**
 * PUBLIC_INTERFACE
 * Toolbar component provides search, filter toggles, and sorting controls.
 */
export default function Toolbar() {
  const { state, setSort, setFilters, resetFilters } = useSettings();
  const { sortBy, sortDir, filter } = state;

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
              onChange={(e) => setPinnedOnly(e.target.checked)}
            />
            <span>Pinned</span>
          </label>
          <label className="checkbox">
            <input
              type="checkbox"
              checked={archived}
              onChange={(e) => setArchived(e.target.checked)}
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
