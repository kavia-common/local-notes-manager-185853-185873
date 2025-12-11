import React, { useEffect, useRef, useState } from "react";
import { useNotes } from "../hooks/useNotes";

/**
 * PUBLIC_INTERFACE
 * NoteForm allows creation of a new note. Can be adapted for editing with initialValues.
 * Props:
 * - initialValues: { title, content, tags }
 * - onSubmitSuccess: callback with created note id
 */
export default function NoteForm({ initialValues, onSubmitSuccess }) {
  const { addNote } = useNotes();
  const [title, setTitle] = useState(initialValues?.title || "");
  const [content, setContent] = useState(initialValues?.content || "");
  const [tags, setTags] = useState((initialValues?.tags || []).join(", "));
  const titleRef = useRef(null);

  useEffect(() => {
    // autofocus title for quick entry
    if (titleRef.current) titleRef.current.focus();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const tagArr = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const id = addNote({ title: title.trim(), content: content.trim(), tags: tagArr });
    setTitle("");
    setContent("");
    setTags("");
    if (onSubmitSuccess) onSubmitSuccess(id);
  };

  const isDisabled = title.trim().length === 0 && content.trim().length === 0;

  return (
    <form className="note-form container" onSubmit={handleSubmit} aria-label="Create a new note">
      <label className="sr-only" htmlFor="note-title">Note title</label>
      <input
        id="note-title"
        ref={titleRef}
        className="input input-title"
        placeholder="Note title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        aria-label="Note title"
      />
      <label className="sr-only" htmlFor="note-content">Note content</label>
      <textarea
        id="note-content"
        className="textarea"
        placeholder="Write your note..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={4}
        aria-label="Note content"
      />
      <label className="sr-only" htmlFor="note-tags">Note tags</label>
      <input
        id="note-tags"
        className="input"
        placeholder="Tags (comma separated)"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        aria-label="Note tags"
      />
      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={isDisabled} aria-disabled={isDisabled}>
          Add note
        </button>
      </div>
    </form>
  );
}
