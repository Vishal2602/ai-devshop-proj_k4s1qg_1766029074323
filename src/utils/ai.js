/**
 * OpenRouter API helper for MessageClearance.
 *
 * This module handles all communication with the OpenRouter API.
 *
 * SECURITY NOTES:
 * - API key is stored client-side only (localStorage)
 * - API key is sent directly to OpenRouter, never to our servers
 * - Rate limiting and error handling prevent abuse
 *
 * RELIABILITY NOTES:
 * - Implements exponential backoff retry logic
 * - Validates API responses before returning
 * - Graceful degradation on network errors
 */

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

/**
 * Available models for the user to choose from.
 * Ordered by recommendation (best balance first).
 */
export const AVAILABLE_MODELS = {
  'anthropic/claude-3.5-sonnet': {
    name: 'Claude 3.5 Sonnet',
    description: 'Best balance of quality and speed',
    tier: 'recommended',
  },
  'anthropic/claude-3-haiku': {
    name: 'Claude 3 Haiku',
    description: 'Fast and affordable',
    tier: 'fast',
  },
  'openai/gpt-4o': {
    name: 'GPT-4o',
    description: 'OpenAI flagship model',
    tier: 'premium',
  },
  'openai/gpt-4o-mini': {
    name: 'GPT-4o Mini',
    description: 'Fast OpenAI model',
    tier: 'fast',
  },
};

export const DEFAULT_MODEL = 'anthropic/claude-3.5-sonnet';

/**
 * System prompt for message analysis.
 * This is the core of what makes the app work.
 */
const ANALYSIS_SYSTEM_PROMPT = `You are an expert communication analyst helping users ensure their messages are clear, professional, and won't be misunderstood.

Analyze the user's message and return a JSON response with this exact structure:

{
  "verdict": "good_to_send" | "needs_edit" | "high_risk",
  "verdictReason": "One sentence explaining the verdict",
  "risks": [
    {
      "text": "the problematic phrase from the message",
      "issue": "passive_aggressive" | "vague" | "rude" | "unclear" | "tone_mismatch",
      "why": "Brief explanation of how it could be misread"
    }
  ],
  "missing": ["list", "of", "missing", "info"],
  "rewrites": {
    "short": "Concise, direct rewrite of the full message",
    "warm": "Friendly, warm rewrite of the full message",
    "confident": "Assertive, confident rewrite of the full message"
  },
  "suggestedOpener": "A better first line or subject line if applicable"
}

VERDICT GUIDELINES:
- "good_to_send": Message is clear, professional, and unlikely to be misunderstood
- "needs_edit": Message has minor issues that could cause confusion or seem slightly off
- "high_risk": Message has serious tone problems that could damage the relationship or cause major misunderstanding

ANALYSIS GUIDELINES:
- Look for passive-aggressive language ("per my last email", "as I mentioned", "going forward")
- Identify vague requests without clear asks or deadlines
- Flag potentially rude or dismissive phrasing
- Note missing context that would leave the reader confused
- Consider how the message might read to someone stressed or defensive

REWRITE GUIDELINES:
- "short": Remove all fluff, be direct, keep only essential info
- "warm": Add warmth, acknowledgment, and human touch without being unprofessional
- "confident": Strong, clear, decisive tone without being aggressive

Always return valid JSON. Never include markdown code blocks in your response.`;

/**
 * Error types for better error handling.
 */
export class AIError extends Error {
  constructor(message, type, originalError = null) {
    super(message);
    this.name = 'AIError';
    this.type = type;
    this.originalError = originalError;
  }
}

export const AI_ERROR_TYPES = {
  INVALID_API_KEY: 'INVALID_API_KEY',
  RATE_LIMITED: 'RATE_LIMITED',
  NETWORK_ERROR: 'NETWORK_ERROR',
  INVALID_RESPONSE: 'INVALID_RESPONSE',
  SERVER_ERROR: 'SERVER_ERROR',
  TIMEOUT: 'TIMEOUT',
  UNKNOWN: 'UNKNOWN',
};

/**
 * Sleep utility for retry delays.
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Validates the API response structure.
 * Returns null if valid, error message if invalid.
 */
function validateAnalysisResponse(data) {
  if (!data || typeof data !== 'object') {
    return 'Response is not an object';
  }

  const validVerdicts = ['good_to_send', 'needs_edit', 'high_risk'];
  if (!validVerdicts.includes(data.verdict)) {
    return `Invalid verdict: ${data.verdict}`;
  }

  if (!Array.isArray(data.risks)) {
    return 'Missing or invalid risks array';
  }

  if (!data.rewrites || typeof data.rewrites !== 'object') {
    return 'Missing or invalid rewrites object';
  }

  const requiredRewrites = ['short', 'warm', 'confident'];
  for (const key of requiredRewrites) {
    if (typeof data.rewrites[key] !== 'string') {
      return `Missing rewrite: ${key}`;
    }
  }

  return null;
}

/**
 * Parse the AI response, handling potential JSON issues.
 */
function parseAIResponse(content) {
  // Try direct parse first
  try {
    return JSON.parse(content);
  } catch {
    // Content might have markdown code blocks
  }

  // Try to extract JSON from markdown code block
  const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[1].trim());
    } catch {
      // Fall through to error
    }
  }

  // Try to find JSON object pattern
  const objectMatch = content.match(/\{[\s\S]*\}/);
  if (objectMatch) {
    try {
      return JSON.parse(objectMatch[0]);
    } catch {
      // Fall through to error
    }
  }

  throw new AIError(
    'Could not parse AI response as JSON',
    AI_ERROR_TYPES.INVALID_RESPONSE
  );
}

/**
 * Analyzes a message using the OpenRouter API.
 *
 * @param {string} message - The message to analyze
 * @param {string} apiKey - OpenRouter API key
 * @param {Object} options - Additional options
 * @param {string} options.model - Model to use (default: claude-3.5-sonnet)
 * @param {number} options.maxRetries - Max retry attempts (default: 3)
 * @param {number} options.timeoutMs - Request timeout in ms (default: 30000)
 * @param {AbortSignal} options.signal - AbortController signal for cancellation
 * @returns {Promise<Object>} Analysis result
 */
export async function analyzeMessage(message, apiKey, options = {}) {
  const {
    model = DEFAULT_MODEL,
    maxRetries = 3,
    timeoutMs = 30000,
    signal,
  } = options;

  // Validate inputs
  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    throw new AIError('Message is required', AI_ERROR_TYPES.INVALID_RESPONSE);
  }

  if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length === 0) {
    throw new AIError('API key is required', AI_ERROR_TYPES.INVALID_API_KEY);
  }

  // Trim excessively long messages (prevent abuse)
  const MAX_MESSAGE_LENGTH = 10000;
  const trimmedMessage = message.slice(0, MAX_MESSAGE_LENGTH);
  if (message.length > MAX_MESSAGE_LENGTH) {
    console.warn(`[AI] Message truncated from ${message.length} to ${MAX_MESSAGE_LENGTH} chars`);
  }

  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Create abort controller for timeout
      const timeoutController = new AbortController();
      const timeoutId = setTimeout(() => timeoutController.abort(), timeoutMs);

      // Combine with user-provided signal if any
      const combinedSignal = signal
        ? anySignal([signal, timeoutController.signal])
        : timeoutController.signal;

      const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'MessageClearance',
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: ANALYSIS_SYSTEM_PROMPT },
            { role: 'user', content: `Analyze this message:\n\n${trimmedMessage}` },
          ],
          temperature: 0.3, // Lower temperature for more consistent analysis
          max_tokens: 2000,
        }),
        signal: combinedSignal,
      });

      clearTimeout(timeoutId);

      // Handle HTTP errors
      if (!response.ok) {
        const errorBody = await response.text().catch(() => '');

        if (response.status === 401 || response.status === 403) {
          throw new AIError(
            'Invalid API key. Please check your OpenRouter API key.',
            AI_ERROR_TYPES.INVALID_API_KEY
          );
        }

        if (response.status === 429) {
          throw new AIError(
            'Rate limited. Please wait a moment and try again.',
            AI_ERROR_TYPES.RATE_LIMITED
          );
        }

        if (response.status >= 500) {
          throw new AIError(
            'OpenRouter server error. Please try again.',
            AI_ERROR_TYPES.SERVER_ERROR
          );
        }

        throw new AIError(
          `API error: ${response.status} ${errorBody}`,
          AI_ERROR_TYPES.UNKNOWN
        );
      }

      const data = await response.json();

      // Validate response structure
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new AIError(
          'Invalid response structure from API',
          AI_ERROR_TYPES.INVALID_RESPONSE
        );
      }

      const content = data.choices[0].message.content;
      const parsed = parseAIResponse(content);

      // Validate the parsed response
      const validationError = validateAnalysisResponse(parsed);
      if (validationError) {
        throw new AIError(
          `Invalid analysis response: ${validationError}`,
          AI_ERROR_TYPES.INVALID_RESPONSE
        );
      }

      // Add metadata
      return {
        ...parsed,
        _meta: {
          model,
          timestamp: new Date().toISOString(),
          originalLength: message.length,
        },
      };

    } catch (error) {
      lastError = error;

      // Don't retry on certain errors
      if (error instanceof AIError) {
        if (
          error.type === AI_ERROR_TYPES.INVALID_API_KEY ||
          error.type === AI_ERROR_TYPES.INVALID_RESPONSE
        ) {
          throw error;
        }
      }

      // Check if aborted by user
      if (error.name === 'AbortError') {
        throw new AIError('Request cancelled', AI_ERROR_TYPES.TIMEOUT, error);
      }

      // Network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        lastError = new AIError(
          'Network error. Check your internet connection.',
          AI_ERROR_TYPES.NETWORK_ERROR,
          error
        );
      }

      // Retry with exponential backoff
      if (attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        console.warn(`[AI] Attempt ${attempt} failed, retrying in ${delay}ms...`);
        await sleep(delay);
      }
    }
  }

  // All retries exhausted
  throw lastError || new AIError('Request failed after retries', AI_ERROR_TYPES.UNKNOWN);
}

/**
 * Helper to combine multiple AbortSignals.
 */
function anySignal(signals) {
  const controller = new AbortController();

  for (const signal of signals) {
    if (signal.aborted) {
      controller.abort();
      break;
    }
    signal.addEventListener('abort', () => controller.abort(), { once: true });
  }

  return controller.signal;
}

/**
 * Validates an API key by making a minimal request.
 * Returns true if valid, throws AIError if not.
 */
export async function validateApiKey(apiKey) {
  if (!apiKey || !apiKey.startsWith('sk-or-')) {
    throw new AIError(
      'API key should start with sk-or-',
      AI_ERROR_TYPES.INVALID_API_KEY
    );
  }

  try {
    // Make a minimal request to verify the key
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'MessageClearance',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3-haiku', // Cheapest model for validation
        messages: [{ role: 'user', content: 'Hi' }],
        max_tokens: 1,
      }),
    });

    if (response.status === 401 || response.status === 403) {
      throw new AIError(
        'Invalid API key',
        AI_ERROR_TYPES.INVALID_API_KEY
      );
    }

    if (!response.ok) {
      // Other errors might be temporary
      const body = await response.text();
      console.warn('[AI] API key validation response:', response.status, body);
    }

    return true;
  } catch (error) {
    if (error instanceof AIError) {
      throw error;
    }

    // Network errors during validation - key format is OK, network is not
    throw new AIError(
      'Could not validate API key (network error)',
      AI_ERROR_TYPES.NETWORK_ERROR,
      error
    );
  }
}

export default {
  analyzeMessage,
  validateApiKey,
  AVAILABLE_MODELS,
  DEFAULT_MODEL,
  AI_ERROR_TYPES,
};
