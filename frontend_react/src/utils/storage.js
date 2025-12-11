//
// Storage utilities for safe localStorage access with versioned schema handling
//

// PUBLIC_INTERFACE
export const STORAGE_KEY = "notes.app.v1";

/**
 * Small in-app error bus to surface non-fatal storage/migration errors.
 * Consumers can subscribe to "error" events.
 */
const ERROR_EVENT = "app:error";
function emitError(message, detail) {
  try {
    const ev = new CustomEvent(ERROR_EVENT, { detail: { message, detail, ts: Date.now() } });
    window.dispatchEvent(ev);
  } catch (_) {
    // no-op
  }
}

/**
 * PUBLIC_INTERFACE
 * Check if localStorage is available and functional.
 * Uses a try/catch to avoid throwing in restricted environments (SSR, privacy mode).
 * @returns {boolean} true if available, false otherwise
 */
export function isStorageAvailable() {
  try {
    if (typeof window === "undefined" || !("localStorage" in window)) return false;
    const testKey = "__storage_test__";
    window.localStorage.setItem(testKey, "ok");
    window.localStorage.removeItem(testKey);
    return true;
  } catch (err) {
    console.warn("[storage] localStorage unavailable:", err);
    emitError("Local storage is not available. Your changes may not persist.", err?.message || err);
    return false;
  }
}

/**
 * Safe JSON parse producing undefined on error.
 */
function safeParseJSON(raw) {
  try {
    return JSON.parse(raw);
  } catch (err) {
    return undefined;
  }
}

/**
 * PUBLIC_INTERFACE
 * Safely get a JSON value from localStorage.
 * @param {string} key
 * @param {*} defaultValue Value to return if not found or errors occur
 * @returns {*} Parsed value or defaultValue
 */
export function getItemSafe(key, defaultValue = null) {
  try {
    if (!isStorageAvailable()) return defaultValue;
    const raw = window.localStorage.getItem(key);
    if (raw == null) return defaultValue;
    const parsed = safeParseJSON(raw);
    if (parsed === undefined) {
      console.warn("[storage] Failed to parse JSON for key:", key);
      emitError("Saved data is corrupted and could not be parsed. Using defaults.", { key });
      return defaultValue;
    }
    return parsed;
  } catch (err) {
    console.warn("[storage] getItemSafe error:", err);
    emitError("Could not read from local storage.", err?.message || err);
    return defaultValue;
  }
}

/**
 * PUBLIC_INTERFACE
 * Safely set a value to localStorage as JSON.
 * @param {string} key
 * @param {*} value
 * @returns {boolean} success
 */
export function setItemSafe(key, value) {
  try {
    if (!isStorageAvailable()) return false;
    const serialized = JSON.stringify(value);
    window.localStorage.setItem(key, serialized);
    return true;
  } catch (err) {
    console.warn("[storage] setItemSafe error:", err);
    emitError("Could not save to local storage. Your latest changes may be lost.", err?.message || err);
    return false;
  }
}

/**
 * PUBLIC_INTERFACE
 * Backup the bad value under a time-stamped key and reset the main key.
 * Primarily useful when migration or parse errors occur.
 * @param {string} key
 * @param {*} badValue
 * @returns {boolean} success
 */
export function backupAndReset(key, badValue) {
  try {
    if (!isStorageAvailable()) return false;
    const ts = new Date().toISOString().replace(/[:.]/g, "-");
    const backupKey = `${key}.__backup__${ts}`;
    try {
      window.localStorage.setItem(backupKey, typeof badValue === "string" ? badValue : JSON.stringify(badValue));
    } catch (backupErr) {
      console.warn("[storage] Failed to write backup:", backupErr);
      emitError("Could not create a backup copy of your corrupted data.", backupErr?.message || backupErr);
    }
    window.localStorage.removeItem(key);
    emitError("Your saved data was reset due to corruption. A backup copy was created.", { key, backupKey });
    return true;
  } catch (err) {
    console.warn("[storage] backupAndReset error:", err);
    emitError("Could not reset local storage.", err?.message || err);
    return false;
  }
}

/**
 * PUBLIC_INTERFACE
 * Versioned migration stub.
 * For version 1 it is a no-op and ensures a normalized payload shape.
 * @param {{version: number, notes: Array, settings: Object}} payload
 * @returns {{version: number, notes: Array, settings: Object}} migrated (or normalized) payload
 */
export function migrateIfNeeded(payload) {
  try {
    if (!payload || typeof payload !== "object") {
      return { version: 1, notes: [], settings: {} };
    }
    // Current schema version
    const currentVersion = 1;
    let working = {
      version: typeof payload.version === "number" ? payload.version : 1,
      notes: Array.isArray(payload.notes) ? payload.notes : [],
      settings: typeof payload.settings === "object" && payload.settings !== null ? payload.settings : {},
    };

    if (working.version < currentVersion) {
      // Placeholder for future migrations
    } else if (working.version > currentVersion) {
      console.warn("[storage] Data version is newer than app version:", working.version, ">", currentVersion);
      emitError("Your saved data is from a newer app version. Some features may not work as expected.", {
        dataVersion: working.version,
        appVersion: currentVersion,
      });
    }

    return working;
  } catch (err) {
    console.warn("[storage] migrateIfNeeded error:", err);
    emitError("Failed to load saved data. Using defaults.", err?.message || err);
    return { version: 1, notes: [], settings: {} };
  }
}

/**
 * Simple debounce helper.
 */
function debounce(fn, delay = 300) {
  let t = null;
  return (...args) => {
    if (t) clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
}

/**
 * PUBLIC_INTERFACE
 * Debounced writer factory for a given storage key.
 * Returns a write function that persists with debounce and emits errors safely.
 */
export function createDebouncedStorageWriter(key, delay = 350) {
  const write = (value) => setItemSafe(key, value);
  const debounced = debounce(write, delay);
  return debounced;
}

/**
 * PUBLIC_INTERFACE
 * Subscribe to internal error notifications.
 * @param {(payload:{message:string, detail:any, ts:number})=>void} handler
 * @returns {() => void} unsubscribe
 */
export function subscribeToErrors(handler) {
  function onError(ev) {
    handler(ev.detail);
  }
  window.addEventListener(ERROR_EVENT, onError);
  return () => window.removeEventListener(ERROR_EVENT, onError);
}
