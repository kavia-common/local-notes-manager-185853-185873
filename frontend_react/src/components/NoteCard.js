import React, { useState } from "react";
import { useNotes } from "../hooks/useNotes";

/**
 * PUBLIC_INTERFACE
 * NoteCard displays a single note with actions (pin, archive, delete, edit inline).
 */
export default function NoteCard({ note, onConfirmDelete }) {
  const { updateNote, togglePin, archiveNote, restoreNote } = useNotes();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(note.title || "");
  const [content, setContent] = useState(note.content || "");

  const handleSave = () => {
    updateNote(note.id, { title: title.trim(), content: content.trim() });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTitle(note.title || "");
    setContent(note.content || "");
    setIsEditing(false);
  };

  return (
    <article
      className={`note-card ${note.pinned ? "is-pinned" : ""} ${note.archived ? "is-archived" : ""}`}
      aria-label={`Note ${note.title || "Untitled"}`}
    >
      <div className="note-card-header" role="group" aria-label="Note actions and title">
        {!isEditing ? (
          <h3 className="note-title">{note.title || "Untitled"}</h3>
        ) : (
          <input
            className="input input-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            aria-label="Edit title"
          />
        )}
        <div className="note-actions" role="toolbar" aria-label="Note actions">
          <button
            className="icon-btn"
            title={note.pinned ? "Unpin" : "Pin"}
            aria-label={note.pinned ? "Unpin note" : "Pin note"}
            onClick={() => togglePin(note.id)}
          >
            {note.pinned ? "📌" : "📍"}
          </button>
          {!note.archived ? (
            <button
              className="icon-btn"
              title="Archive"
              aria-label="Archive note"
              onClick={() => archiveNote(note.id)}
            >
              🗄️
            </button>
          ) : (
            <button
              className="icon-btn"
              title="Restore"
              aria-label="Restore note"
              onClick={() => restoreNote(note.id)}
            >
              ♻️
            </button>
          )}
          {!isEditing ? (
            <button className="icon-btn" title="Edit" aria-label="Edit note" onClick={() => setIsEditing(true)}>
              ✏️
            </button>
          ) : (
            <>
              <button className="icon-btn" title="Save" aria-label="Save changes" onClick={handleSave}>
                💾
              </button>
              <button className="icon-btn" title="Cancel" aria-label="Cancel editing" onClick={handleCancel}>
                ✖️
              </button>
            </>
          )}
          <button
            className="icon-btn danger"
            title="Delete"
            onClick={() => onConfirmDelete(note)}
            aria-label="Delete note"
          >
            🗑️
          </button>
        </div>
      </div>

      <div className="note-content">
        {!isEditing ? (
          <p>{note.content || "No content"}</p>
        ) : (
          <textarea
            className="textarea"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            aria-label="Edit content"
          />
        )}
      </div>

      {Array.isArray(note.tags) && note.tags.length > 0 && (
        <div className="note-tags">
          {note.tags.map((t) => (
            <span key={t} className="tag">
              #{t}
            </span>
          ))}
        </div>
      )}

      <footer className="note-meta">
        <small>Updated: {new Date(note.updatedAt).toLocaleString()}</small>
        <small>Created: {new Date(note.createdAt).toLocaleString()}</small>
      </footer>
    </article>
  );
}
