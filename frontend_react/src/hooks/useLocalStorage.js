import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getItemSafe, setItemSafe, createDebouncedStorageWriter } from "../utils/storage";

/**
 * PUBLIC_INTERFACE
 * Generic localStorage hook with safe get/set, debounced write, and cross-tab sync.
 * @param {string} key
 * @param {*} initialValue
 * @returns {[any, Function]}
 */
export function useLocalStorage(key, initialValue) {
  // Lazy initializer reads once on mount
  const initialized = useRef(false);
  const [value, setValue] = useState(() => {
    const stored = getItemSafe(key, undefined);
    initialized.current = true;
    return stored === undefined ? initialValue : stored;
  });

  // Debounced writer instance (stable)
  const debouncedWrite = useMemo(() => createDebouncedStorageWriter(key, 250), [key]);

  // Persist on value changes (debounced)
  useEffect(() => {
    if (!initialized.current) return;
    debouncedWrite(value);
  }, [debouncedWrite, value]);

  // Sync across tabs
  useEffect(() => {
    function handleStorage(e) {
      try {
        if (e.key !== key) return;
        const newVal = e.newValue ? JSON.parse(e.newValue) : initialValue;
        setValue(newVal);
      } catch (err) {
        console.warn("[useLocalStorage] storage event parse error:", err);
      }
    }
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [key, initialValue]);

  const setStoredValue = useCallback((updater) => {
    setValue((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      // also write immediately for critical updates in addition to debounced write
      setItemSafe(key, next);
      return next;
    });
  }, [key]);

  return [value, setStoredValue];
}
