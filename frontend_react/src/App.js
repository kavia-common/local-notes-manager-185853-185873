import React, { useEffect, useMemo, useState } from "react";
import "./App.css";
import Header from "./components/Header";
import Toolbar from "./components/Toolbar";
import NoteForm from "./components/NoteForm";
import NotesList from "./components/NotesList";
import ConfirmDialog from "./components/ConfirmDialog";
import Toast from "./components/Toast";

import { NotesProvider } from "./state/notesContext";
import { SettingsProvider } from "./state/settingsContext";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { STORAGE_KEY, migrateIfNeeded } from "./utils/storage";
import { initialNotesState } from "./state/notesReducer";
import { initialSettingsState } from "./state/settingsReducer";

/**
 * PUBLIC_INTERFACE
 * Root application component.
 * - Hydrates/serializes state to localStorage using versioned schema.
 * - Provides global Notes and Settings contexts.
 * - Renders Header, Toolbar, NoteForm, NotesList, and UX helpers (ConfirmDialog, Toast).
 */
function App() {
  // Hydrate from storage with schema
  const [rawData, setRawData] = useLocalStorage(STORAGE_KEY, {
    version: 1,
    notes: initialNotesState.notes,
    settings: initialSettingsState,
  });

  const data = useMemo(() => migrateIfNeeded(rawData), [rawData]);

  // Theme syncing to <html>
  useEffect(() => {
    const theme = data?.settings?.theme || "light";
    document.documentElement.setAttribute("data-theme", theme);
  }, [data?.settings?.theme]);

  // We'll provide initial states to providers; reducers will mutate in-memory.
  // To persist, we listen to window 'notes:state' and 'settings:state' events
  // fired by small bridge dispatchers inside providers via a window event.
  // For simplicity and given current constraints, we patch window.dispatchState
  // from App and inject via context effects below.
  const [toast, setToast] = useState({ message: "", type: "info" });
  const [confirm, setConfirm] = useState({ open: false, note: null });

  // Bridge updates from providers to localStorage
  useEffect(() => {
    function handleNotesState(e) {
      try {
        const next = { ...data, notes: e.detail.notes };
        setRawData(next);
      } catch {
        // ignore
      }
    }
    function handleSettingsState(e) {
      try {
        const next = { ...data, settings: e.detail };
        setRawData(next);
      } catch {
        // ignore
      }
    }
    window.addEventListener("notes:state", handleNotesState);
    window.addEventListener("settings:state", handleSettingsState);
    return () => {
      window.removeEventListener("notes:state", handleNotesState);
      window.removeEventListener("settings:state", handleSettingsState);
    };
  }, [data, setRawData]);

  // Provide event dispatchers to children by defining globals they can call via useEffect in contexts
  useEffect(() => {
    window.__persistNotesState = (notesState) => {
      const next = { ...data, notes: notesState.notes };
      setRawData(next);
    };
    window.__persistSettingsState = (settingsState) => {
      const next = { ...data, settings: settingsState };
      setRawData(next);
    };
  }, [data, setRawData]);

  // Delete handling via confirm dialog; actual deletion occurs in NoteCard via passed handler in NotesList
  const handleConfirmDelete = (note) => {
    setConfirm({ open: true, note });
  };

  // Consumers (NoteCard) will use onConfirmDelete -> open dialog, but actual delete is dispatched from within NotesList consumer via an event
  useEffect(() => {
    function handleNoteDeleted(e) {
      setToast({ message: `Deleted "${e.detail.title || "note"}"`, type: "success" });
    }
    window.addEventListener("note:deleted", handleNoteDeleted);
    return () => window.removeEventListener("note:deleted", handleNoteDeleted);
  }, []);

  return (
    <SettingsProvider initialState={data.settings || initialSettingsState}>
      <NotesProvider initialState={{ notes: data.notes || [] }}>
        <div className="app-root">
          <Header />
          <main>
            <NoteForm
              onSubmitSuccess={() => setToast({ message: "Note added", type: "success" })}
            />
            <Toolbar />
            <NotesList
              onConfirmDelete={(n) => {
                setConfirm({ open: true, note: n });
              }}
            />
          </main>

          <ConfirmDialog
            open={confirm.open}
            title="Delete note?"
            message={`Are you sure you want to delete "${confirm.note?.title || "this note"}"? This cannot be undone.`}
            onCancel={() => setConfirm({ open: false, note: null })}
            onConfirm={() => {
              // Emit an event that NotesList (or NoteCard) can listen to, but we keep it simple:
              const ev = new CustomEvent("note:confirm-delete", { detail: confirm.note });
              window.dispatchEvent(ev);
              setConfirm({ open: false, note: null });
            }}
          />

          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast({ message: "", type: "info" })}
          />
        </div>

        <StatePersistenceWires />
      </NotesProvider>
    </SettingsProvider>
  );
}

/**
 * Internal component that wires reducer state changes to persistence and deletion confirmations via window events.
 * It leverages contexts directly and dispatches appropriate events.
 */
function StatePersistenceWires() {
  // hooks are used here to observe state changes; any change triggers persistence via window globals
  const { state: notesState, deleteNote } = require("./hooks/useNotes"); // dynamic require to avoid circular import issues
  const { state: settingsState } = require("./hooks/useSettings");

  // Persist on each state change
  useEffect(() => {
    if (typeof window.__persistNotesState === "function") {
      window.__persistNotesState(notesState);
    } else {
      const ev = new CustomEvent("notes:state", { detail: notesState });
      window.dispatchEvent(ev);
    }
  }, [notesState]);

  useEffect(() => {
    if (typeof window.__persistSettingsState === "function") {
      window.__persistSettingsState(settingsState);
    } else {
      const ev = new CustomEvent("settings:state", { detail: settingsState });
      window.dispatchEvent(ev);
    }
  }, [settingsState]);

  // Handle confirm delete events which come from App's modal
  useEffect(() => {
    function onConfirmDelete(e) {
      const note = e.detail;
      if (note && note.id) {
        deleteNote(note.id);
        const ev = new CustomEvent("note:deleted", { detail: note });
        window.dispatchEvent(ev);
      }
    }
    window.addEventListener("note:confirm-delete", onConfirmDelete);
    return () => window.removeEventListener("note:confirm-delete", onConfirmDelete);
  }, [deleteNote]);

  return null;
}

export default App;
