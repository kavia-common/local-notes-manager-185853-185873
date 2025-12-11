import React, { useMemo } from "react";
import NoteCard from "./NoteCard";
import { useNotes } from "../hooks/useNotes";
import { useSettings } from "../hooks/useSettings";

/**
 * PUBLIC_INTERFACE
 * NotesList renders all notes applying filters and sorting from settings.
 * Props:
 * - onConfirmDelete: function(note) to ask for deletion
 */
export default function NotesList({ onConfirmDelete }) {
  const { state: notesState } = useNotes();
  const { state: settings } = useSettings();

  const filtered = useMemo(() => {
    const { notes } = notesState;
    const { filter, sortBy, sortDir } = settings;

    let arr = Array.isArray(notes) ? [...notes] : [];

    // Filter
    const q = (filter.query || "").toLowerCase();
    if (q) {
      arr = arr.filter(
        (n) =>
          (n.title || "").toLowerCase().includes(q) ||
          (n.content || "").toLowerCase().includes(q) ||
          (Array.isArray(n.tags) ? n.tags.join(" ").toLowerCase() : "").includes(q)
      );
    }
    if (filter.pinnedOnly) {
      arr = arr.filter((n) => n.pinned);
    }
    if (!filter.archived) {
      arr = arr.filter((n) => !n.archived);
    } else {
      // Explicitly only archived
      arr = arr.filter((n) => n.archived);
    }

    // Sort
    arr.sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortBy === "title") {
        return dir * (a.title || "").localeCompare(b.title || "");
      }
      if (sortBy === "createdAt") {
        return dir * (new Date(a.createdAt) - new Date(b.createdAt));
      }
      // default updatedAt
      return dir * (new Date(a.updatedAt) - new Date(b.updatedAt));
    });

    // Pinned at top regardless of sort by timestamp/title within sections
    const pinned = arr.filter((n) => n.pinned);
    const others = arr.filter((n) => !n.pinned);
    return [...pinned, ...others];
  }, [notesState, settings]);

  if (filtered.length === 0) {
    return (
      <div className="container empty">
        <p>No notes match your filters. Create one above!</p>
      </div>
    );
  }

  return (
    <div className="notes-grid container">
      {filtered.map((note) => (
        <NoteCard key={note.id} note={note} onConfirmDelete={onConfirmDelete} />
      ))}
    </div>
  );
}
