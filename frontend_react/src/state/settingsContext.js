import React, { createContext, useContext, useEffect, useReducer } from "react";
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
 * Also emits a custom event with the latest settings for persistence.
 * @param {{children: React.ReactNode, initialState?: any}} props
 * @returns {JSX.Element}
 */
export function SettingsProvider({ children, initialState = initialSettingsState }) {
  const [state, dispatch] = useReducer(settingsReducer, initialState);

  useEffect(() => {
    if (typeof window.__persistSettingsState === "function") {
      window.__persistSettingsState(state);
    } else {
      const ev = new CustomEvent("settings:state", { detail: state });
      window.dispatchEvent(ev);
    }
  }, [state]);

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
