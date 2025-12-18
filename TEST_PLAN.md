# 🧪 TEST_PLAN.md - MessageClearance QA Test Plan

**Application:** MessageClearance - Airport Security Themed Message Screening Tool
**QA Tester:** Quinn
**Date:** 2024

---

## Overview

This test plan covers critical functionality for the MessageClearance application, focusing on AI response handling, loading states, error handling, and message history persistence.

---

## Test Case 1: AI Response Handling - Valid JSON Parsing

**Priority:** Critical
**Component:** `src/utils/ai.js` → `analyzeMessage()`

### Description
Verify the application correctly parses and displays AI responses with all expected fields.

### Preconditions
- Valid OpenRouter API key configured
- Network connectivity available

### Test Steps
1. Enter a message with clear tone issues (e.g., "Per my last email, you should have done this already.")
2. Click "Screen Message"
3. Wait for analysis to complete

### Expected Results
- Response contains all required fields:
  - `verdict`: One of `good_to_send`, `needs_edit`, or `high_risk`
  - `verdictReason`: Non-empty string
  - `risks`: Array with `text`, `issue`, and `why` for each risk
  - `rewrites`: Object with `short`, `warm`, and `confident` options
- BoardingPass displays appropriate stamp (CLEARED/REVIEW/FLAGGED)
- ResultsPanel shows all rewrite options

### Edge Cases to Test
- [ ] AI returns JSON wrapped in markdown code blocks (\`\`\`json ... \`\`\`)
- [ ] Response has extra whitespace before/after JSON
- [ ] Very long responses that may be truncated
- [ ] Unicode characters in response text
- [ ] Empty `risks` array (message is clean)
- [ ] Empty `missing` array (nothing missing)

---

## Test Case 2: Loading State During AI Call

**Priority:** High
**Components:** `src/hooks/useChat.js`, `src/components/MessageInput.jsx`, `src/components/ScannerAnimation.jsx`

### Description
Verify loading indicators display correctly during API calls and UI is properly disabled.

### Preconditions
- Valid API key configured
- Application in IDLE state

### Test Steps
1. Enter a valid message
2. Click "Screen Message"
3. Observe UI during the scanning phase
4. Wait for completion

### Expected Results
- Status transitions: `IDLE` → `SCANNING` → `COMPLETE`
- Button shows loading dots and "Scanning..." text
- Submit button is disabled during scan
- Textarea is disabled during scan
- ScannerAnimation displays x-ray effect
- User cannot submit another message while scanning

### Edge Cases to Test
- [ ] Rapid double-click on submit button (should not double-submit)
- [ ] Pressing Enter while already scanning (should be ignored)
- [ ] Slow API response (30+ seconds) - verify loading persists
- [ ] Request cancellation mid-flight (if implemented)
- [ ] Browser tab switch during loading (state preserved on return)
- [ ] Component unmount during loading (no memory leak/state update errors)

---

## Test Case 3: Error Handling - API Failures

**Priority:** Critical
**Components:** `src/utils/ai.js`, `src/hooks/useChat.js`

### Description
Verify appropriate error messages display for various API failure scenarios.

### Test Scenarios

#### 3A: Invalid API Key (401/403)
**Steps:**
1. Enter an invalid API key (e.g., "invalid-key-12345")
2. Submit a message

**Expected:**
- Error type: `INVALID_API_KEY`
- User message: "Your API key is invalid. Please check and update it."
- No retry attempted (error is non-retryable)
- Clear prompt to update API key

#### 3B: Rate Limiting (429)
**Steps:**
1. Submit many messages in rapid succession
2. Trigger rate limit from OpenRouter

**Expected:**
- Error type: `RATE_LIMITED`
- User message: "Too many requests. Please wait a moment and try again."
- Retry with exponential backoff (1s, 2s, 4s... max 10s)

#### 3C: Network Error
**Steps:**
1. Disable network/go offline
2. Submit a message

**Expected:**
- Error type: `NETWORK_ERROR`
- User message: "Network error. Check your internet connection."
- Retry attempted with backoff

#### 3D: Server Error (500+)
**Steps:**
1. If possible, trigger server-side error

**Expected:**
- Error type: `SERVER_ERROR`
- User message indicates server issue
- Retry attempted (up to 3 times with backoff)

#### 3E: Timeout (30 seconds)
**Steps:**
1. Simulate or wait for request timeout

**Expected:**
- Error type: `TIMEOUT`
- Clear timeout message
- Retry attempted

### Edge Cases to Test
- [ ] AbortError (user cancels) - should return to IDLE, not ERROR
- [ ] Malformed JSON in response - should show INVALID_RESPONSE error
- [ ] Empty response body
- [ ] Response with wrong structure (missing required fields)
- [ ] Recovery after error (can submit new message successfully)
- [ ] Retry button functionality (if implemented)

---

## Test Case 4: Message History Persistence

**Priority:** High
**Components:** `src/utils/storage.js`, `src/hooks/useLocalStorage.js`, `src/hooks/useChat.js`

### Description
Verify message history is correctly saved to and loaded from localStorage.

### Preconditions
- Clear localStorage for clean test (`messageclearance_chat_history`)

### Test Steps
1. Submit a message and wait for successful analysis
2. Note the result verdict and rewrites
3. Refresh the browser page
4. Check that history is preserved
5. Load a previous analysis from history

### Expected Results
- History entry created with:
  - Unique `id` (UUID or timestamp-based)
  - ISO timestamp
  - Original message text
  - Complete result object
  - Model used
- History persists across page refresh
- Maximum 50 items retained (oldest trimmed)
- `loadFromHistory(id)` restores full analysis result

### Edge Cases to Test
- [ ] localStorage full/quota exceeded - graceful handling
- [ ] Corrupted history data in localStorage - should reset to empty array
- [ ] localStorage disabled/unavailable - app still functions (no persistence)
- [ ] 51st message added - oldest entry removed
- [ ] `removeFromHistory(id)` - single entry deletion works
- [ ] `clearHistory()` - all entries removed
- [ ] Cross-tab synchronization - add in Tab A, appears in Tab B
- [ ] History with very long messages (check for truncation issues)
- [ ] Special characters in messages (XSS vectors, unicode)

---

## Test Case 5: End-to-End User Flow - Complete Analysis Cycle

**Priority:** Critical
**Components:** All

### Description
Verify the complete user journey from input to result to history.

### Preconditions
- Valid API key configured
- Fresh browser session (or cleared storage)

### Test Steps
1. Open application
2. Enter a problematic message: "I guess you forgot AGAIN. Whatever, just do it when you can."
3. Click "Screen Message"
4. Wait for analysis
5. Review the verdict displayed
6. Check risk highlights
7. Review suggested rewrites
8. Copy a rewrite (if feature exists)
9. Submit another message
10. Navigate to history
11. Load previous analysis

### Expected Results
- Smooth transition through all states (IDLE → SCANNING → COMPLETE)
- Verdict correctly identifies tone issues
- Risks highlighted with explanations
- Three rewrite options provided (short, warm, confident)
- Second submission works correctly
- History shows both analyses
- Loading from history restores full result

### Edge Cases to Test
- [ ] Empty message submission (should be blocked)
- [ ] Whitespace-only message (should be blocked)
- [ ] Maximum character limit (verify limit and count display)
- [ ] Minimum character requirement (if any)
- [ ] Message with only emojis
- [ ] Message in non-English language
- [ ] Very short message ("ok")
- [ ] Very long message (near/at limit)
- [ ] Paste large text block
- [ ] API key modal - can update and save key
- [ ] Model selector - switching models works

---

## Test Environment Notes

### Storage Keys to Monitor
```javascript
localStorage keys:
- messageclearance_api_key
- messageclearance_selected_model
- messageclearance_chat_history
- messageclearance_preferences
```

### Status State Machine
```
IDLE → SCANNING → COMPLETE
  ↑         ↓
  └─────ERROR
```

### Error Types Reference
| Type | HTTP Code | Retryable |
|------|-----------|-----------|
| INVALID_API_KEY | 401/403 | No |
| RATE_LIMITED | 429 | Yes |
| NETWORK_ERROR | - | Yes |
| SERVER_ERROR | 500+ | Yes |
| TIMEOUT | - | Yes |
| INVALID_RESPONSE | - | No |

---

## Bug Reporting Template

When bugs are found, document with:

```markdown
**Bug ID:** BUG-XXX
**Severity:** Critical/High/Medium/Low
**Test Case:** TC-X
**Steps to Reproduce:**
1.
2.
3.

**Expected Result:**

**Actual Result:**

**Screenshots/Console Errors:**

**Environment:** Browser, OS, etc.
```

---

*Happy bug hunting!* 🐛🔍
