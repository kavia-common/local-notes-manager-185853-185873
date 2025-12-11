import React, { createContext, useContext, useReducer } from "react";
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
 * @param {{children: React.ReactNode, initialState?: any}} props
 * @returns {JSX.Element}
 */
export function NotesProvider({ children, initialState = initialNotesState }) {
  const [state, dispatch] = useReducer(notesReducer, initialState);
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
