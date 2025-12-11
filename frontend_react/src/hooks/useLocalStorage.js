import { useCallback, useEffect, useRef, useState } from "react";
import { getItemSafe, setItemSafe } from "../utils/storage";

/**
 * PUBLIC_INTERFACE
 * Generic localStorage hook with safe get/set and cross-tab sync.
 * @param {string} key
 * @param {*} initialValue
 * @returns {[any, Function]}
 */
export function useLocalStorage(key, initialValue) {
  // Lazy initializer reads once on mount
  const initializerRef = useRef(false);
  const [value, setValue] = useState(() => {
    const stored = getItemSafe(key, undefined);
    initializerRef.current = true;
    return stored === undefined ? initialValue : stored;
  });

  // Persist on value changes
  useEffect(() => {
    if (!initializerRef.current) return;
    setItemSafe(key, value);
  }, [key, value]);

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
      return next;
    });
  }, []);

  return [value, setStoredValue];
}
