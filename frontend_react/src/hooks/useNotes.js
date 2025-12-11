import { useMemo } from "react";
import { useNotesContext } from "../state/notesContext";
import {
  ADD_NOTE,
  UPDATE_NOTE,
  DELETE_NOTE,
  TOGGLE_PIN,
  ARCHIVE_NOTE,
  RESTORE_NOTE,
  BULK_DELETE,
} from "../state/notesReducer";

/**
 * Simple UUID fallback when crypto.randomUUID is not available.
 */
function simpleUUID() {
  // Not cryptographically secure; just a fallback.
  return "xxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * PUBLIC_INTERFACE
 * Hook providing notes state and action helpers.
 * @returns {{state: any, addNote: Function, updateNote: Function, deleteNote: Function, togglePin: Function, archiveNote: Function, restoreNote: Function, bulkDelete: Function, dispatch: Function}}
 */
export function useNotes() {
  const { state, dispatch } = useNotesContext();

  const actions = useMemo(() => {
    const addNote = ({ title = "", content = "", tags = [] }) => {
      const id = (typeof crypto !== "undefined" && crypto.randomUUID) ? crypto.randomUUID() : simpleUUID();
      dispatch({
        type: ADD_NOTE,
        payload: { id, title, content, tags, pinned: false, archived: false },
      });
      return id;
    };

    const updateNote = (id, changes) => {
      dispatch({ type: UPDATE_NOTE, payload: { id, changes } });
    };

    const deleteNote = (id) => {
      dispatch({ type: DELETE_NOTE, payload: id });
    };

    const togglePin = (id) => {
      dispatch({ type: TOGGLE_PIN, payload: id });
    };

    const archiveNote = (id) => {
      dispatch({ type: ARCHIVE_NOTE, payload: id });
    };

    const restoreNote = (id) => {
      dispatch({ type: RESTORE_NOTE, payload: id });
    };

    const bulkDelete = (ids) => {
      dispatch({ type: BULK_DELETE, payload: ids });
    };

    return { addNote, updateNote, deleteNote, togglePin, archiveNote, restoreNote, bulkDelete };
  }, [dispatch]);

  return { state, dispatch, ...actions };
}
