//
// Storage utilities for safe localStorage access with versioned schema handling
//

// PUBLIC_INTERFACE
export const STORAGE_KEY = "notes.app.v1";

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
    return false;
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
    try {
      return JSON.parse(raw);
    } catch (parseErr) {
      console.warn("[storage] Failed to parse JSON for key:", key, parseErr);
      return defaultValue;
    }
  } catch (err) {
    console.warn("[storage] getItemSafe error:", err);
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
    }
    window.localStorage.removeItem(key);
    return true;
  } catch (err) {
    console.warn("[storage] backupAndReset error:", err);
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

    // No migrations are needed for version 1, but structure is here for future versions.
    if (working.version < currentVersion) {
      // Example migration flow (commented for now since currentVersion === 1)
      // while (working.version < currentVersion) {
      //   switch (working.version) {
      //     case 1:
      //       // migrate to 2...
      //       working.version = 2;
      //       break;
      //     default:
      //       console.warn("[storage] Unknown migration path for version", working.version);
      //       working.version = currentVersion; // best-effort
      //   }
      // }
    } else if (working.version > currentVersion) {
      // Forward version found; leave as-is but log for visibility.
      console.warn("[storage] Data version is newer than app version:", working.version, ">", currentVersion);
    }

    return working;
  } catch (err) {
    console.warn("[storage] migrateIfNeeded error:", err);
    return { version: 1, notes: [], settings: {} };
  }
}
