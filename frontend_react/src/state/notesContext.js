import React, { createContext, useContext, useEffect, useReducer } from "react";
import { notesReducer, initialNotesState } from "./notesReducer";

// PUBLIC_INTERFACE
export const NotesContext = createContext({
  state: initialNotesState,
  // eslint-disable-next-line no-unused-vars
  dispatch: (_action) => {},
});

/**
 * PUBLIC_INTERFACE
 * NotesProvider wraps children with notes state via useReducer.
 * Also emits a custom event with the latest state for persistence.
 * @param {{children: React.ReactNode, initialState?: any}} props
 * @returns {JSX.Element}
 */
export function NotesProvider({ children, initialState = initialNotesState }) {
  const [state, dispatch] = useReducer(notesReducer, initialState);

  useEffect(() => {
    // Notify app about state updates for persistence (App handles debounced write)
    if (typeof window.__persistNotesState === "function") {
      window.__persistNotesState(state);
    } else {
      const ev = new CustomEvent("notes:state", { detail: state });
      window.dispatchEvent(ev);
    }
  }, [state]);

  return <NotesContext.Provider value={{ state, dispatch }}>{children}</NotesContext.Provider>;
}

/**
 * PUBLIC_INTERFACE
 * Access notes context.
 * @returns {{state: any, dispatch: Function}}
 */
export function useNotesContext() {
  const ctx = useContext(NotesContext);
  if (!ctx) {
    // In case context is used outside provider, return a safe fallback.
    return { state: initialNotesState, dispatch: () => {} };
  }
  return ctx;
}
