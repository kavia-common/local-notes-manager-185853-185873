import React, { createContext, useContext, useReducer } from "react";
import { settingsReducer, initialSettingsState } from "./settingsReducer";

// PUBLIC_INTERFACE
export const SettingsContext = createContext({
  state: initialSettingsState,
  // eslint-disable-next-line no-unused-vars
  dispatch: (_action) => {},
});

/**
 * PUBLIC_INTERFACE
 * SettingsProvider wraps children with settings state via useReducer.
 * @param {{children: React.ReactNode, initialState?: any}} props
 * @returns {JSX.Element}
 */
export function SettingsProvider({ children, initialState = initialSettingsState }) {
  const [state, dispatch] = useReducer(settingsReducer, initialState);
  return <SettingsContext.Provider value={{ state, dispatch }}>{children}</SettingsContext.Provider>;
}

/**
 * PUBLIC_INTERFACE
 * Access settings context.
 * @returns {{state: any, dispatch: Function}}
 */
export function useSettingsContext() {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    return { state: initialSettingsState, dispatch: () => {} };
  }
  return ctx;
}
