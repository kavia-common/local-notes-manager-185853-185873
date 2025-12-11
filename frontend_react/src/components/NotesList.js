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

  // Derive filtered/sorted list based on settings
  const filtered = useMemo(() => {
    const notes = Array.isArray(notesState?.notes) ? notesState.notes : [];
    const sortBy = settings?.sortBy || "updatedAt";
    const sortDir = settings?.sortDir === "asc" ? "asc" : "desc";
    const filter = settings?.filter || { query: "", pinnedOnly: false, archived: false };

    let arr = [...notes];

    // Text query across title, content, and tags
    const q = (filter.query || "").trim().toLowerCase();
    if (q) {
      arr = arr.filter((n) => {
        const title = (n.title || "").toLowerCase();
        const content = (n.content || "").toLowerCase();
        const tags = Array.isArray(n.tags) ? n.tags.join(" ").toLowerCase() : "";
        return title.includes(q) || content.includes(q) || tags.includes(q);
      });
    }

    // Pinned-only view
    if (filter.pinnedOnly) {
      arr = arr.filter((n) => !!n.pinned);
    }

    // Archived toggle:
    // - If archived is true: show ONLY archived
    // - If false or not set: hide archived
    if (filter.archived) {
      arr = arr.filter((n) => !!n.archived);
    } else {
      arr = arr.filter((n) => !n.archived);
    }

    // Sorting
    const dir = sortDir === "asc" ? 1 : -1;
    arr.sort((a, b) => {
      if (sortBy === "title") {
        return dir * (String(a.title || "").localeCompare(String(b.title || "")));
      }
      if (sortBy === "createdAt") {
        return dir * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      }
      // Default: updatedAt
      return dir * (new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime());
    });

    // Ensure pinned notes appear on top, preserving sort order within pinned/non-pinned groups
    const pinned = arr.filter((n) => !!n.pinned);
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
    <div
      className="notes-grid container"
      role="list"
      aria-label="Notes list"
    >
      {filtered.map((note) => (
        <div key={note.id} role="listitem">
          <NoteCard note={note} onConfirmDelete={onConfirmDelete} />
        </div>
      ))}
    </div>
  );
}
