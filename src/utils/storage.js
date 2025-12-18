/**
 * localStorage utilities with defensive coding and data integrity checks.
 *
 * SECURITY NOTES:
 * - API keys are stored in localStorage (client-side only, never transmitted to our servers)
 * - Data is validated on read to prevent corruption issues
 * - All operations are wrapped in try-catch to handle quota exceeded, private browsing, etc.
 */

const STORAGE_PREFIX = 'messageclearance_';

/**
 * Storage keys used by the application.
 * Centralized here to prevent typos and enable easy auditing.
 */
export const STORAGE_KEYS = {
  API_KEY: `${STORAGE_PREFIX}api_key`,
  SELECTED_MODEL: `${STORAGE_PREFIX}selected_model`,
  CHAT_HISTORY: `${STORAGE_PREFIX}chat_history`,
  USER_PREFERENCES: `${STORAGE_PREFIX}preferences`,
};

/**
 * Default values for each storage key.
 * These are returned when storage is empty or corrupted.
 */
export const STORAGE_DEFAULTS = {
  [STORAGE_KEYS.API_KEY]: '',
  [STORAGE_KEYS.SELECTED_MODEL]: 'anthropic/claude-3.5-sonnet',
  [STORAGE_KEYS.CHAT_HISTORY]: [],
  [STORAGE_KEYS.USER_PREFERENCES]: {
    safetyCheckEnabled: true,
  },
};

/**
 * Checks if localStorage is available and functional.
 * Private browsing mode and some security settings can disable it.
 *
 * @returns {boolean} True if localStorage is available
 */
export function isStorageAvailable() {
  try {
    const testKey = `${STORAGE_PREFIX}__test__`;
    window.localStorage.setItem(testKey, 'test');
    const result = window.localStorage.getItem(testKey) === 'test';
    window.localStorage.removeItem(testKey);
    return result;
  } catch (e) {
    // localStorage not available (private mode, disabled, quota exceeded)
    return false;
  }
}

/**
 * Safely retrieves an item from localStorage.
 * Returns the default value if:
 * - localStorage is unavailable
 * - Key doesn't exist
 * - Stored value is corrupted JSON
 *
 * @param {string} key - Storage key (use STORAGE_KEYS constants)
 * @param {*} defaultValue - Fallback value if retrieval fails
 * @returns {*} The stored value or defaultValue
 */
export function getItem(key, defaultValue = null) {
  if (!isStorageAvailable()) {
    console.warn('[Storage] localStorage unavailable, returning default');
    return defaultValue ?? STORAGE_DEFAULTS[key] ?? null;
  }

  try {
    const item = window.localStorage.getItem(key);

    // Key doesn't exist
    if (item === null) {
      return defaultValue ?? STORAGE_DEFAULTS[key] ?? null;
    }

    // Try to parse as JSON, but handle plain strings too
    try {
      const parsed = JSON.parse(item);
      return parsed;
    } catch {
      // Not JSON, return as plain string (valid for API key, etc.)
      return item;
    }
  } catch (e) {
    console.error('[Storage] Error reading from localStorage:', e);
    return defaultValue ?? STORAGE_DEFAULTS[key] ?? null;
  }
}

/**
 * Safely stores an item in localStorage.
 * Handles quota exceeded errors and other edge cases.
 *
 * @param {string} key - Storage key (use STORAGE_KEYS constants)
 * @param {*} value - Value to store (will be JSON.stringify'd if not a string)
 * @returns {boolean} True if storage succeeded, false otherwise
 */
export function setItem(key, value) {
  if (!isStorageAvailable()) {
    console.warn('[Storage] localStorage unavailable, data not persisted');
    return false;
  }

  try {
    // Validate key is a known storage key (paranoid check)
    const validKeys = Object.values(STORAGE_KEYS);
    if (!validKeys.includes(key)) {
      console.warn(`[Storage] Unknown storage key: ${key}`);
      // Still allow it, but log the warning
    }

    // Serialize value
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);

    // Check if we're about to store something unreasonably large
    // localStorage typically has a 5MB limit
    const sizeInBytes = new Blob([serialized]).size;
    const MAX_ITEM_SIZE = 1024 * 1024; // 1MB per item is plenty

    if (sizeInBytes > MAX_ITEM_SIZE) {
      console.error(`[Storage] Item too large (${sizeInBytes} bytes), refusing to store`);
      return false;
    }

    window.localStorage.setItem(key, serialized);
    return true;
  } catch (e) {
    if (e.name === 'QuotaExceededError') {
      console.error('[Storage] Quota exceeded, unable to store data');
      // Could implement cleanup of old data here if needed
    } else {
      console.error('[Storage] Error writing to localStorage:', e);
    }
    return false;
  }
}

/**
 * Safely removes an item from localStorage.
 *
 * @param {string} key - Storage key to remove
 * @returns {boolean} True if removal succeeded (or key didn't exist)
 */
export function removeItem(key) {
  if (!isStorageAvailable()) {
    return false;
  }

  try {
    window.localStorage.removeItem(key);
    return true;
  } catch (e) {
    console.error('[Storage] Error removing from localStorage:', e);
    return false;
  }
}

/**
 * Clears all MessageClearance data from localStorage.
 * Only removes keys with our prefix, leaving other apps' data intact.
 *
 * @returns {boolean} True if clear succeeded
 */
export function clearAll() {
  if (!isStorageAvailable()) {
    return false;
  }

  try {
    const keysToRemove = [];

    // Collect our keys first (don't modify while iterating)
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key && key.startsWith(STORAGE_PREFIX)) {
        keysToRemove.push(key);
      }
    }

    // Now remove them
    keysToRemove.forEach(key => window.localStorage.removeItem(key));

    return true;
  } catch (e) {
    console.error('[Storage] Error clearing localStorage:', e);
    return false;
  }
}

/**
 * API Key specific helpers with extra validation
 */
export const apiKeyStorage = {
  /**
   * Retrieves the stored API key.
   * @returns {string} The API key or empty string
   */
  get() {
    const key = getItem(STORAGE_KEYS.API_KEY, '');
    // Basic validation - OpenRouter keys start with 'sk-or-'
    if (key && typeof key === 'string' && key.length > 0) {
      return key;
    }
    return '';
  },

  /**
   * Stores the API key after basic validation.
   * @param {string} key - The API key to store
   * @returns {boolean} True if storage succeeded
   */
  set(key) {
    if (typeof key !== 'string') {
      console.error('[Storage] API key must be a string');
      return false;
    }

    // Don't store empty strings explicitly, just remove
    if (key.trim() === '') {
      return removeItem(STORAGE_KEYS.API_KEY);
    }

    // Warn if key doesn't look like an OpenRouter key
    if (!key.startsWith('sk-or-')) {
      console.warn('[Storage] API key does not appear to be an OpenRouter key');
      // Still store it - user might know what they're doing
    }

    return setItem(STORAGE_KEYS.API_KEY, key);
  },

  /**
   * Removes the stored API key.
   * @returns {boolean} True if removal succeeded
   */
  remove() {
    return removeItem(STORAGE_KEYS.API_KEY);
  },

  /**
   * Checks if an API key is stored (doesn't validate it).
   * @returns {boolean} True if an API key exists
   */
  exists() {
    const key = this.get();
    return key.length > 0;
  },
};

/**
 * Chat history helpers with size management
 */
export const chatHistoryStorage = {
  MAX_HISTORY_ITEMS: 50, // Prevent unbounded growth

  /**
   * Retrieves chat history.
   * @returns {Array} Array of chat history items
   */
  get() {
    const history = getItem(STORAGE_KEYS.CHAT_HISTORY, []);

    // Validate it's actually an array
    if (!Array.isArray(history)) {
      console.warn('[Storage] Chat history was corrupted, resetting');
      return [];
    }

    return history;
  },

  /**
   * Saves chat history, trimming if too large.
   * @param {Array} history - The chat history array
   * @returns {boolean} True if storage succeeded
   */
  set(history) {
    if (!Array.isArray(history)) {
      console.error('[Storage] Chat history must be an array');
      return false;
    }

    // Trim to max size (keep most recent)
    const trimmed = history.slice(-this.MAX_HISTORY_ITEMS);

    return setItem(STORAGE_KEYS.CHAT_HISTORY, trimmed);
  },

  /**
   * Adds a single item to history.
   * @param {Object} item - The chat item to add
   * @returns {boolean} True if storage succeeded
   */
  add(item) {
    if (!item || typeof item !== 'object') {
      console.error('[Storage] Chat item must be an object');
      return false;
    }

    const history = this.get();
    history.push({
      ...item,
      id: item.id || crypto.randomUUID?.() || Date.now().toString(),
      timestamp: item.timestamp || new Date().toISOString(),
    });

    return this.set(history);
  },

  /**
   * Clears all chat history.
   * @returns {boolean} True if clear succeeded
   */
  clear() {
    return setItem(STORAGE_KEYS.CHAT_HISTORY, []);
  },
};
