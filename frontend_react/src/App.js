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
import { STORAGE_KEY, migrateIfNeeded, createDebouncedStorageWriter, subscribeToErrors } from "./utils/storage";
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

  const [toast, setToast] = useState({ message: "", type: "info" });
  const [confirm, setConfirm] = useState({ open: false, note: null });

  // Subscribe to non-fatal errors and show toast
  useEffect(() => {
    const unsub = subscribeToErrors(({ message }) => {
      setToast({ message, type: "error" });
    });
    return () => unsub();
  }, []);

  // Debounced writer for persistence bridge
  const debouncedWrite = useMemo(() => createDebouncedStorageWriter(STORAGE_KEY, 250), []);

  // Bridge updates from providers to localStorage (debounced)
  useEffect(() => {
    function handleNotesState(e) {
      try {
        const next = { ...data, notes: e.detail.notes };
        debouncedWrite(next);
      } catch (err) {
        // ignore
      }
    }
    function handleSettingsState(e) {
      try {
        const next = { ...data, settings: e.detail };
        debouncedWrite(next);
      } catch (err) {
        // ignore
      }
    }
    window.addEventListener("notes:state", handleNotesState);
    window.addEventListener("settings:state", handleSettingsState);
    return () => {
      window.removeEventListener("notes:state", handleNotesState);
      window.removeEventListener("settings:state", handleSettingsState);
    };
  }, [data, debouncedWrite]);

  // Provide global functions that contexts can call directly (debounced)
  useEffect(() => {
    window.__persistNotesState = (notesState) => {
      const next = { ...data, notes: notesState.notes };
      debouncedWrite(next);
    };
    window.__persistSettingsState = (settingsState) => {
      const next = { ...data, settings: settingsState };
      debouncedWrite(next);
    };
  }, [data, debouncedWrite]);

  const handleConfirmDelete = (note) => {
    setConfirm({ open: true, note });
  };

  useEffect(() => {
    function handleNoteDeleted(e) {
      setToast({ message: `Deleted "${e.detail.title || "note"}"`, type: "success" });
    }
    function handleToastInfo(e) {
      if (e?.detail?.message) setToast({ message: e.detail.message, type: "info" });
    }
    window.addEventListener("note:deleted", handleNoteDeleted);
    window.addEventListener("toast:info", handleToastInfo);
    return () => {
      window.removeEventListener("note:deleted", handleNoteDeleted);
      window.removeEventListener("toast:info", handleToastInfo);
    };
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

  // Persist on each state change (delegated to App's debounced writers)
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
