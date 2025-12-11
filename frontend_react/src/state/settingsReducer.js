/**
 * Settings reducer handles UI preferences and filters.
 * State shape:
 * {
 *   theme: 'light'|'dark',
 *   sortBy: 'updatedAt'|'createdAt'|'title',
 *   sortDir: 'desc'|'asc',
 *   filter: { query: '', pinnedOnly: false, archived: false }
 * }
 */

// PUBLIC_INTERFACE
export const initialSettingsState = {
  theme: "light",
  sortBy: "updatedAt",
  sortDir: "desc",
  filter: {
    query: "",
    pinnedOnly: false,
    archived: false,
  },
};

// Action constants
// PUBLIC_INTERFACE
export const SET_THEME = "SET_THEME";
// PUBLIC_INTERFACE
export const SET_SORT = "SET_SORT";
// PUBLIC_INTERFACE
export const SET_FILTERS = "SET_FILTERS";
// PUBLIC_INTERFACE
export const RESET_FILTERS = "RESET_FILTERS";

/**
 * PUBLIC_INTERFACE
 * Settings reducer function.
 * @param {object} state
 * @param {{type: string, payload: any}} action
 * @returns {object}
 */
export function settingsReducer(state = initialSettingsState, action) {
  switch (action.type) {
    case SET_THEME: {
      const theme = action.payload === "dark" ? "dark" : "light";
      return { ...state, theme };
    }
    case SET_SORT: {
      const { sortBy, sortDir } = action.payload || {};
      const nextSortBy = ["updatedAt", "createdAt", "title"].includes(sortBy) ? sortBy : state.sortBy;
      const nextSortDir = ["asc", "desc"].includes(sortDir) ? sortDir : state.sortDir;
      return { ...state, sortBy: nextSortBy, sortDir: nextSortDir };
    }
    case SET_FILTERS: {
      const nextFilter = {
        ...state.filter,
        ...(typeof action.payload === "object" && action.payload !== null ? action.payload : {}),
      };
      // Normalize types
      nextFilter.query = typeof nextFilter.query === "string" ? nextFilter.query : "";
      nextFilter.pinnedOnly = !!nextFilter.pinnedOnly;
      nextFilter.archived = !!nextFilter.archived;
      return { ...state, filter: nextFilter };
    }
    case RESET_FILTERS: {
      return { ...state, filter: { ...initialSettingsState.filter } };
    }
    default:
      return state;
  }
}
