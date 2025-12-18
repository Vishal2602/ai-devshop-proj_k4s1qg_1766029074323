# MessageClearance ✈️

*"Your message has been cleared for takeoff."*

---

## App Name: **MessageClearance**

A message screening tool themed like airport security. Paste any text, run it through scanners, get a boarding pass verdict.

---

## Target User Persona

**Primary: "Careful Communicator Casey"**
- Remote worker, 28-45, sends 50+ messages daily
- Worries about tone in async communication
- Has experienced misunderstandings from poorly-worded Slack/email
- Values efficiency but doesn't want to sound cold
- Uses multiple platforms: Slack, email, LinkedIn, Teams

**Secondary: Non-native English speakers** who want confidence their message reads correctly.

---

## Core Features (Prioritized)

### P0 - Must Have (MVP)
1. **Tone Scanner** - Detects passive-aggressive, rude, or vague language with explanations
2. **Three Rewrite Buttons** - Short & direct | Warm & human | Confident & assertive
3. **Boarding Pass Verdict** - Visual stamp: ✅ Good to send | ⚠️ Needs edit | 🚨 High risk misread

### P1 - Should Have
4. **Missing Info Detector** - Flags what readers will ask next (dates, context, clear ask)
5. **Subject/Opener Suggestion** - Better first line for emails and DMs

### P2 - Nice to Have
6. **Safety Check Toggle** - Warns about sensitive data (phone, address, order IDs)
7. **Model Selector** - Choose between fast/cheap or best quality models

---

## User Flow

```
┌─────────────────────────────────────────────────────┐
│  1. PASTE MESSAGE                                   │
│     ↓                                               │
│  2. SECURITY BELT ANIMATION (scanning...)          │
│     ↓                                               │
│  3. RESULTS SCREEN:                                 │
│     ├── 🎫 Boarding Pass Verdict                   │
│     ├── ⚠️ Misread Risks (if any)                  │
│     ├── ❓ Missing Info (if any)                   │
│     ├── 📝 Subject Line Suggestion                 │
│     └── 🔄 Three Rewrite Options                   │
│     ↓                                               │
│  4. COPY REWRITE → Done                            │
└─────────────────────────────────────────────────────┘
```

**First-time user:**
1. Land on page → Enter OpenRouter API key → Stored in localStorage
2. Paste message → Click "Screen Message"
3. View results → Pick a rewrite or edit original
4. Copy to clipboard → Use anywhere

---

## Emotional Goal

Users should feel: **"I'm protected from myself."**

- Relief: "Glad I caught that before sending"
- Confidence: "Now I know this reads the way I intended"
- Speed: "30 seconds saved me a 10-email thread"
- Delight: Airport theme makes a mundane task feel playful

---

## AI/LLM Features

### What Uses AI
| Feature | AI-Powered | Details |
|---------|------------|---------|
| Tone Scanner | ✅ | Analyzes text for misread risks |
| Missing Info Detector | ✅ | Identifies gaps a reader would notice |
| Rewrites (x3) | ✅ | Generates style variants |
| Subject/Opener | ✅ | Suggests better first lines |
| Safety Check | ❌ | Regex/pattern matching (no AI needed) |
| Boarding Pass Verdict | ✅ | Overall assessment |

### API Structure
- **Provider:** OpenRouter (user brings their own key)
- **Storage:** localStorage (browser only, never server)
- **Default Model:** `anthropic/claude-3.5-sonnet` (balanced quality/cost)
- **Fast/Cheap Option:** `anthropic/claude-3-haiku`
- **Single API call** returns structured JSON with all analysis

### System Prompt Strategy
One tight prompt that returns:
```json
{
  "verdict": "good_to_send | needs_edit | high_risk",
  "risks": [{ "text": "...", "issue": "...", "why": "..." }],
  "missing": ["date", "clear ask"],
  "rewrites": {
    "short": "...",
    "warm": "...",
    "confident": "..."
  },
  "suggested_opener": "..."
}
```

---

## Tech Stack Recommendation

- **Frontend:** React + Vite (fast, simple)
- **Styling:** Tailwind CSS
- **State:** React hooks (no Redux needed)
- **Storage:** localStorage for API key
- **Hosting:** Vercel or Netlify (static site)

---

## Out of Scope (v1)

- User accounts / authentication
- Message history
- Browser extension
- Mobile app
- Team/org features

---

## Success Metrics

1. User completes full flow in under 60 seconds
2. At least one rewrite copied per session
3. Return usage (users come back)
