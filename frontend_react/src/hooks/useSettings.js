import { useMemo } from "react";
import { useSettingsContext } from "../state/settingsContext";
import { SET_THEME, SET_SORT, SET_FILTERS, RESET_FILTERS } from "../state/settingsReducer";

/**
 * PUBLIC_INTERFACE
 * Hook providing settings state and action helpers.
 * @returns {{state: any, setTheme: Function, setSort: Function, setFilters: Function, resetFilters: Function, dispatch: Function}}
 */
export function useSettings() {
  const { state, dispatch } = useSettingsContext();

  const actions = useMemo(() => {
    const setTheme = (theme) => dispatch({ type: SET_THEME, payload: theme });
    const setSort = (sortBy, sortDir) => dispatch({ type: SET_SORT, payload: { sortBy, sortDir } });
    const setFilters = (filters) => dispatch({ type: SET_FILTERS, payload: filters });
    const resetFilters = () => dispatch({ type: RESET_FILTERS });

    return { setTheme, setSort, setFilters, resetFilters };
  }, [dispatch]);

  return { state, dispatch, ...actions };
}
