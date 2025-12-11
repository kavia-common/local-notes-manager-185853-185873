/**
 * Notes reducer handles CRUD and state toggles for notes.
 * Note shape:
 * { id, title, content, createdAt, updatedAt, pinned: false, archived: false, tags: [] }
 */

// PUBLIC_INTERFACE
export const initialNotesState = {
  notes: [],
};

// Action constants
// PUBLIC_INTERFACE
export const ADD_NOTE = "ADD_NOTE";
// PUBLIC_INTERFACE
export const UPDATE_NOTE = "UPDATE_NOTE";
// PUBLIC_INTERFACE
export const DELETE_NOTE = "DELETE_NOTE";
// PUBLIC_INTERFACE
export const TOGGLE_PIN = "TOGGLE_PIN";
// PUBLIC_INTERFACE
export const ARCHIVE_NOTE = "ARCHIVE_NOTE";
// PUBLIC_INTERFACE
export const RESTORE_NOTE = "RESTORE_NOTE";
// PUBLIC_INTERFACE
export const BULK_DELETE = "BULK_DELETE";

/**
 * PUBLIC_INTERFACE
 * Notes reducer function.
 * @param {{notes: Array}} state
 * @param {{type: string, payload: any}} action
 * @returns {{notes: Array}}
 */
export function notesReducer(state = initialNotesState, action) {
  const now = new Date().toISOString();

  switch (action.type) {
    case ADD_NOTE: {
      const note = action.payload || {};
      const newNote = {
        id: note.id,
        title: note.title || "",
        content: note.content || "",
        createdAt: note.createdAt || now,
        updatedAt: now,
        pinned: !!note.pinned,
        archived: !!note.archived,
        tags: Array.isArray(note.tags) ? note.tags : [],
      };
      return { ...state, notes: [newNote, ...state.notes] };
    }

    case UPDATE_NOTE: {
      const { id, changes = {} } = action.payload || {};
      if (!id) return state;
      return {
        ...state,
        notes: state.notes.map((n) =>
          n.id === id
            ? {
                ...n,
                ...changes,
                updatedAt: now,
              }
            : n
        ),
      };
    }

    case DELETE_NOTE: {
      const id = action.payload;
      if (!id) return state;
      return { ...state, notes: state.notes.filter((n) => n.id !== id) };
    }

    case TOGGLE_PIN: {
      const id = action.payload;
      if (!id) return state;
      return {
        ...state,
        notes: state.notes.map((n) =>
          n.id === id ? { ...n, pinned: !n.pinned, updatedAt: now } : n
        ),
      };
    }

    case ARCHIVE_NOTE: {
      const id = action.payload;
      if (!id) return state;
      return {
        ...state,
        notes: state.notes.map((n) =>
          n.id === id ? { ...n, archived: true, updatedAt: now } : n
        ),
      };
    }

    case RESTORE_NOTE: {
      const id = action.payload;
      if (!id) return state;
      return {
        ...state,
        notes: state.notes.map((n) =>
          n.id === id ? { ...n, archived: false, updatedAt: now } : n
        ),
      };
    }

    case BULK_DELETE: {
      const ids = Array.isArray(action.payload) ? action.payload : [];
      if (ids.length === 0) return state;
      const idSet = new Set(ids);
      return { ...state, notes: state.notes.filter((n) => !idSet.has(n.id)) };
    }

    default:
      return state;
  }
}
