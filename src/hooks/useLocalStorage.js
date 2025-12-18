import { useState, useEffect, useCallback, useRef } from 'react';
import { getItem, setItem, isStorageAvailable } from '../utils/storage';

/**
 * React hook for persisting state to localStorage.
 *
 * Features:
 * - Automatic persistence on state change
 * - Cross-tab synchronization via storage events
 * - Graceful degradation when localStorage unavailable
 * - Debounced writes to prevent excessive I/O
 *
 * IMPORTANT: This hook is designed for data that should persist between
 * page refreshes. For ephemeral UI state, use regular useState.
 *
 * @param {string} key - localStorage key (use STORAGE_KEYS from storage.js)
 * @param {*} initialValue - Default value if nothing stored
 * @param {Object} options - Configuration options
 * @param {number} options.debounceMs - Debounce delay for writes (default: 300ms)
 * @param {function} options.serialize - Custom serializer (default: JSON.stringify)
 * @param {function} options.deserialize - Custom deserializer (default: JSON.parse)
 * @returns {[*, function, Object]} [value, setValue, { isLoaded, error, remove }]
 */
export function useLocalStorage(key, initialValue, options = {}) {
  const {
    debounceMs = 300,
    serialize = JSON.stringify,
    deserialize = JSON.parse,
  } = options;

  // Track if initial load from storage has completed
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);

  // Use a ref to track the debounce timer
  const debounceTimerRef = useRef(null);

  // Track if this is the first render
  const isFirstRender = useRef(true);

  // Initialize state with stored value or initial value
  const [storedValue, setStoredValue] = useState(() => {
    // During SSR or initial render, use initialValue
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = getItem(key, null);

      if (item === null) {
        return initialValue;
      }

      // If getItem already parsed it, use directly
      // Otherwise try to deserialize
      if (typeof item === 'string' && deserialize !== JSON.parse) {
        try {
          return deserialize(item);
        } catch {
          return item;
        }
      }

      return item;
    } catch (err) {
      console.error(`[useLocalStorage] Error reading ${key}:`, err);
      setError(err);
      return initialValue;
    }
  });

  // Mark as loaded after initial render
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Persist to storage when value changes (debounced)
  useEffect(() => {
    // Skip persistence on first render (we just read from storage)
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Clear existing debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Debounce the write
    debounceTimerRef.current = setTimeout(() => {
      try {
        const success = setItem(key, storedValue);
        if (!success) {
          setError(new Error('Failed to persist to localStorage'));
        } else {
          setError(null);
        }
      } catch (err) {
        console.error(`[useLocalStorage] Error writing ${key}:`, err);
        setError(err);
      }
    }, debounceMs);

    // Cleanup debounce timer on unmount
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [key, storedValue, debounceMs]);

  // Listen for changes from other tabs/windows
  useEffect(() => {
    if (!isStorageAvailable()) {
      return;
    }

    const handleStorageChange = (event) => {
      // Only respond to changes for our key
      if (event.key !== key) {
        return;
      }

      // Key was removed
      if (event.newValue === null) {
        setStoredValue(initialValue);
        return;
      }

      try {
        // Parse the new value
        const newValue = JSON.parse(event.newValue);
        setStoredValue(newValue);
      } catch {
        // Might be a plain string
        setStoredValue(event.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key, initialValue]);

  // Wrapped setter that handles all the edge cases
  const setValue = useCallback((value) => {
    try {
      // Allow value to be a function (like useState)
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      setError(null);
    } catch (err) {
      console.error(`[useLocalStorage] Error in setValue:`, err);
      setError(err);
    }
  }, [storedValue]);

  // Remove the value from storage
  const remove = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
      setError(null);
    } catch (err) {
      console.error(`[useLocalStorage] Error removing ${key}:`, err);
      setError(err);
    }
  }, [key, initialValue]);

  return [
    storedValue,
    setValue,
    {
      isLoaded,
      error,
      remove,
      isAvailable: isStorageAvailable(),
    },
  ];
}

/**
 * Simplified hook specifically for the API key.
 * Includes additional validation and masking helpers.
 *
 * @returns {Object} { apiKey, setApiKey, removeApiKey, hasApiKey, isLoaded, maskedKey }
 */
export function useApiKey() {
  const [apiKey, setApiKey, { isLoaded, error, remove }] = useLocalStorage(
    'messageclearance_api_key',
    ''
  );

  // Mask the API key for display (show first and last 4 chars)
  const maskedKey = apiKey && apiKey.length > 12
    ? `${apiKey.slice(0, 8)}${'•'.repeat(16)}${apiKey.slice(-4)}`
    : apiKey
      ? '•'.repeat(apiKey.length)
      : '';

  return {
    apiKey,
    setApiKey,
    removeApiKey: remove,
    hasApiKey: Boolean(apiKey && apiKey.length > 0),
    isLoaded,
    error,
    maskedKey,
    // Validate that key looks like an OpenRouter key
    isValidFormat: apiKey?.startsWith('sk-or-') ?? false,
  };
}

export default useLocalStorage;
