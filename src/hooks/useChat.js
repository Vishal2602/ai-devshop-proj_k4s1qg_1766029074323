import { useState, useCallback, useRef, useEffect } from 'react';
import { useLocalStorage, useApiKey } from './useLocalStorage';
import { analyzeMessage, AIError, AI_ERROR_TYPES, DEFAULT_MODEL } from '../utils/ai';
import { STORAGE_KEYS } from '../utils/storage';

/**
 * Chat states for the scanning flow.
 */
export const CHAT_STATUS = {
  IDLE: 'idle',           // Ready for input
  SCANNING: 'scanning',   // Analysis in progress
  COMPLETE: 'complete',   // Analysis complete, showing results
  ERROR: 'error',         // Error occurred
};

/**
 * Main chat state management hook.
 *
 * This hook manages:
 * - Current message being analyzed
 * - Analysis results
 * - Loading/error states
 * - Scan history (persisted to localStorage)
 * - Abort capability for in-flight requests
 *
 * @returns {Object} Chat state and actions
 */
export function useChat() {
  // API key from localStorage
  const {
    apiKey,
    setApiKey,
    hasApiKey,
    isLoaded: apiKeyLoaded,
    maskedKey,
  } = useApiKey();

  // Selected model (persisted)
  const [selectedModel, setSelectedModel] = useLocalStorage(
    STORAGE_KEYS.SELECTED_MODEL,
    DEFAULT_MODEL
  );

  // Scan history (persisted)
  const [history, setHistory, { isLoaded: historyLoaded }] = useLocalStorage(
    STORAGE_KEYS.CHAT_HISTORY,
    []
  );

  // Current scan state (not persisted - ephemeral)
  const [currentMessage, setCurrentMessage] = useState('');
  const [status, setStatus] = useState(CHAT_STATUS.IDLE);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Abort controller for cancelling in-flight requests
  const abortControllerRef = useRef(null);

  // Track if component is mounted (prevent state updates after unmount)
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      // Cancel any in-flight request on unmount
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  /**
   * Safe state setter that checks mount status.
   */
  const safeSetState = useCallback((setter) => {
    if (isMountedRef.current) {
      setter();
    }
  }, []);

  /**
   * Submit a message for analysis.
   *
   * @param {string} message - The message to analyze
   * @returns {Promise<Object|null>} The analysis result or null on error
   */
  const submitMessage = useCallback(async (message) => {
    // Validate inputs
    if (!message || message.trim().length === 0) {
      setError({ type: 'VALIDATION', message: 'Please enter a message to analyze' });
      return null;
    }

    if (!hasApiKey) {
      setError({ type: 'NO_API_KEY', message: 'Please add your OpenRouter API key' });
      return null;
    }

    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    // Update state
    safeSetState(() => {
      setCurrentMessage(message.trim());
      setStatus(CHAT_STATUS.SCANNING);
      setError(null);
      setResult(null);
    });

    try {
      const analysisResult = await analyzeMessage(
        message.trim(),
        apiKey,
        {
          model: selectedModel,
          signal: abortControllerRef.current.signal,
        }
      );

      // Create history entry
      const historyEntry = {
        id: crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        originalMessage: message.trim(),
        result: analysisResult,
        model: selectedModel,
      };

      safeSetState(() => {
        setResult(analysisResult);
        setStatus(CHAT_STATUS.COMPLETE);

        // Add to history (limit to 50 most recent)
        setHistory((prev) => {
          const newHistory = [...(prev || []), historyEntry];
          return newHistory.slice(-50);
        });
      });

      return analysisResult;

    } catch (err) {
      console.error('[useChat] Analysis failed:', err);

      // Handle specific error types
      let errorInfo = {
        type: 'UNKNOWN',
        message: 'An unexpected error occurred',
      };

      if (err instanceof AIError) {
        switch (err.type) {
          case AI_ERROR_TYPES.INVALID_API_KEY:
            errorInfo = {
              type: 'INVALID_API_KEY',
              message: 'Your API key is invalid. Please check and update it.',
            };
            break;
          case AI_ERROR_TYPES.RATE_LIMITED:
            errorInfo = {
              type: 'RATE_LIMITED',
              message: 'Too many requests. Please wait a moment and try again.',
            };
            break;
          case AI_ERROR_TYPES.NETWORK_ERROR:
            errorInfo = {
              type: 'NETWORK_ERROR',
              message: 'Network error. Please check your internet connection.',
            };
            break;
          case AI_ERROR_TYPES.TIMEOUT:
            errorInfo = {
              type: 'TIMEOUT',
              message: 'Request timed out. Please try again.',
            };
            break;
          case AI_ERROR_TYPES.SERVER_ERROR:
            errorInfo = {
              type: 'SERVER_ERROR',
              message: 'Server error. Please try again in a moment.',
            };
            break;
          default:
            errorInfo = {
              type: err.type,
              message: err.message,
            };
        }
      } else if (err.name === 'AbortError') {
        // Request was cancelled, not an error
        safeSetState(() => {
          setStatus(CHAT_STATUS.IDLE);
        });
        return null;
      }

      safeSetState(() => {
        setError(errorInfo);
        setStatus(CHAT_STATUS.ERROR);
      });

      return null;
    }
  }, [apiKey, hasApiKey, selectedModel, safeSetState, setHistory]);

  /**
   * Cancel the current analysis request.
   */
  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    safeSetState(() => {
      setStatus(CHAT_STATUS.IDLE);
      setError(null);
    });
  }, [safeSetState]);

  /**
   * Reset to initial state (clear current result).
   */
  const reset = useCallback(() => {
    cancelRequest();
    safeSetState(() => {
      setCurrentMessage('');
      setResult(null);
      setError(null);
      setStatus(CHAT_STATUS.IDLE);
    });
  }, [cancelRequest, safeSetState]);

  /**
   * Clear all history.
   */
  const clearHistory = useCallback(() => {
    setHistory([]);
  }, [setHistory]);

  /**
   * Retry the last failed request.
   */
  const retry = useCallback(() => {
    if (currentMessage) {
      submitMessage(currentMessage);
    }
  }, [currentMessage, submitMessage]);

  /**
   * Load a previous analysis from history.
   */
  const loadFromHistory = useCallback((historyId) => {
    const entry = history.find((h) => h.id === historyId);
    if (entry) {
      safeSetState(() => {
        setCurrentMessage(entry.originalMessage);
        setResult(entry.result);
        setStatus(CHAT_STATUS.COMPLETE);
        setError(null);
      });
    }
  }, [history, safeSetState]);

  /**
   * Remove a specific item from history.
   */
  const removeFromHistory = useCallback((historyId) => {
    setHistory((prev) => (prev || []).filter((h) => h.id !== historyId));
  }, [setHistory]);

  // Derived state
  const isScanning = status === CHAT_STATUS.SCANNING;
  const hasResult = status === CHAT_STATUS.COMPLETE && result !== null;
  const hasError = status === CHAT_STATUS.ERROR && error !== null;
  const isReady = apiKeyLoaded && historyLoaded;

  return {
    // State
    status,
    currentMessage,
    result,
    error,
    history: history || [],
    selectedModel,
    isScanning,
    hasResult,
    hasError,
    isReady,

    // API Key
    apiKey,
    setApiKey,
    hasApiKey,
    maskedKey,

    // Actions
    submitMessage,
    cancelRequest,
    reset,
    retry,
    setSelectedModel,
    clearHistory,
    loadFromHistory,
    removeFromHistory,
  };
}

/**
 * Hook for just the API key settings (lighter weight).
 * Use this in the settings modal.
 */
export function useApiKeySettings() {
  const {
    apiKey,
    setApiKey,
    removeApiKey,
    hasApiKey,
    isLoaded,
    maskedKey,
    isValidFormat,
  } = useApiKey();

  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState(null);

  const saveApiKey = useCallback(async (newKey) => {
    // Basic format validation
    if (!newKey || newKey.trim().length === 0) {
      setValidationError('API key is required');
      return false;
    }

    if (!newKey.startsWith('sk-or-')) {
      setValidationError('API key should start with sk-or-');
      return false;
    }

    setIsValidating(true);
    setValidationError(null);

    try {
      // For now, just save it - validation happens on first use
      setApiKey(newKey.trim());
      setIsValidating(false);
      return true;
    } catch (err) {
      setValidationError(err.message);
      setIsValidating(false);
      return false;
    }
  }, [setApiKey]);

  const clearApiKey = useCallback(() => {
    removeApiKey();
    setValidationError(null);
  }, [removeApiKey]);

  return {
    apiKey,
    maskedKey,
    hasApiKey,
    isLoaded,
    isValidFormat,
    isValidating,
    validationError,
    saveApiKey,
    clearApiKey,
  };
}

export default useChat;
