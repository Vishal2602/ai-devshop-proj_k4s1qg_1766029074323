# MessageClearance Design System

## Design Rationale

**Concept: "Retro-Futuristic Terminal"**

This app reimagines airport security as a warm, playful experience rather than stressful TSA vibes. We're channeling the optimism of 1970s jet-age design — think TWA Flight Center, Pan Am terminals, and vintage airline graphics — merged with contemporary UI sensibilities.

**Why this direction?**
- The airport security metaphor could easily feel clinical or anxiety-inducing. Instead, we lean into *retro-futuristic optimism* — the golden age when flying was glamorous and exciting
- Users should feel like VIP travelers getting concierge service, not stressed passengers in a TSA line
- The boarding pass verdict becomes a collectible stamp of approval, not a judgment
- Warm institutional colors (amber, cream, slate) say "trusted authority" without corporate coldness

**The Unforgettable Element:**
The **conveyor belt scanner animation** — your message literally travels through X-ray-style scanners with retro CRT aesthetics, receiving stamps and marks as it passes each checkpoint. The final boarding pass appears with a satisfying "CLEARED" or "FLAGGED" stamp animation.

**Tone:** Playfully authoritative. Like a friendly pilot giving you the all-clear.

---

## Color Palette

### Primary Colors
| Role | Color | Hex | Usage |
|------|-------|-----|-------|
| **Primary** | Terminal Amber | `#D97706` | CTAs, active states, scanner beams |
| **Primary Dark** | Burnt Sienna | `#B45309` | Hover states, emphasis |
| **Secondary** | Runway Slate | `#475569` | Secondary actions, icons |

### Background & Surface
| Role | Color | Hex | Usage |
|------|-------|-----|-------|
| **Background** | Departure Cream | `#FFFBEB` | Main background |
| **Surface** | Boarding Card | `#FEF3C7` | Cards, panels |
| **Surface Alt** | Terminal Gray | `#F1F5F9` | Input fields, code blocks |
| **Dark Surface** | Cockpit Navy | `#1E293B` | Headers, footer, dark mode panels |

### Text Colors
| Role | Color | Hex | Usage |
|------|-------|-----|-------|
| **Text Primary** | Charcoal | `#1C1917` | Headings, body text |
| **Text Secondary** | Slate Gray | `#64748B` | Captions, secondary info |
| **Text Inverse** | Cream White | `#FEFCE8` | Text on dark backgrounds |
| **Text Muted** | Warm Gray | `#A8A29E` | Placeholders, disabled |

### Semantic Colors
| Role | Color | Hex | Usage |
|------|-------|-----|-------|
| **Success (Cleared)** | Runway Green | `#059669` | Good to send verdict |
| **Success Light** | Light Green | `#D1FAE5` | Success backgrounds |
| **Warning (Needs Edit)** | Caution Amber | `#F59E0B` | Needs attention |
| **Warning Light** | Light Amber | `#FEF3C7` | Warning backgrounds |
| **Error (High Risk)** | Alert Red | `#DC2626` | High risk misread |
| **Error Light** | Light Red | `#FEE2E2` | Error backgrounds |
| **Info** | Sky Blue | `#0284C7` | Informational callouts |

### Accent & Effects
| Role | Color | Hex | Usage |
|------|-------|-----|-------|
| **Scanner Beam** | Electric Amber | `#FBBF24` | Scanning animation glow |
| **X-Ray Blue** | CRT Blue | `#38BDF8` | X-ray scan effect |
| **Stamp Ink** | Navy Ink | `#1E3A5F` | Boarding pass stamps |

---

## Typography

### Font Stack

**Heading Font: `Syne`**
- Bold, geometric, retro-futuristic
- Evokes 1970s airport signage and space-age optimism
- Use for: Page titles, section headers, boarding pass text

**Body Font: `DM Sans`**
- Clean, readable, slightly rounded
- Modern but warm, pairs perfectly with Syne's geometry
- Use for: Body text, form labels, descriptions

**Monospace Font: `JetBrains Mono`**
- For: Scanned text display, code-like elements, API key fields

### Type Scale
```
--text-xs:    0.75rem   / 1rem      (12px) - Micro labels
--text-sm:    0.875rem  / 1.25rem   (14px) - Captions, helper text
--text-base:  1rem      / 1.5rem    (16px) - Body text
--text-lg:    1.125rem  / 1.75rem   (18px) - Large body
--text-xl:    1.25rem   / 1.75rem   (20px) - Card titles
--text-2xl:   1.5rem    / 2rem      (24px) - Section headers
--text-3xl:   1.875rem  / 2.25rem   (30px) - Page subtitles
--text-4xl:   2.25rem   / 2.5rem    (36px) - Page titles
--text-5xl:   3rem      / 1         (48px) - Hero text
```

### Font Weights
- Regular (400): Body text
- Medium (500): Emphasized text, labels
- Semibold (600): Subheadings, buttons
- Bold (700): Headings, verdicts

---

## Component Styles

### Spacing Scale
```
--space-1:  0.25rem   (4px)
--space-2:  0.5rem    (8px)
--space-3:  0.75rem   (12px)
--space-4:  1rem      (16px)
--space-5:  1.25rem   (20px)
--space-6:  1.5rem    (24px)
--space-8:  2rem      (32px)
--space-10: 2.5rem    (40px)
--space-12: 3rem      (48px)
--space-16: 4rem      (64px)
```

### Border Radius
```
--radius-sm:   4px     - Inputs, small elements
--radius-md:   8px     - Buttons, cards
--radius-lg:   12px    - Panels, modals
--radius-xl:   16px    - Large cards
--radius-2xl:  24px    - Boarding pass
--radius-full: 9999px  - Pills, avatars
```

### Shadows
```
--shadow-sm:    0 1px 2px rgba(28, 25, 23, 0.05)
--shadow-md:    0 4px 6px -1px rgba(28, 25, 23, 0.08),
                0 2px 4px -2px rgba(28, 25, 23, 0.05)
--shadow-lg:    0 10px 15px -3px rgba(28, 25, 23, 0.1),
                0 4px 6px -4px rgba(28, 25, 23, 0.05)
--shadow-xl:    0 20px 25px -5px rgba(28, 25, 23, 0.12),
                0 8px 10px -6px rgba(28, 25, 23, 0.05)
--shadow-stamp: 2px 2px 0 rgba(30, 58, 95, 0.3)  - Boarding pass stamp effect
--shadow-glow:  0 0 20px rgba(251, 191, 36, 0.4) - Scanner beam glow
```

---

## Button Styles

### Primary Button (Screen Message)
```css
background: linear-gradient(135deg, #D97706 0%, #B45309 100%);
color: #FEFCE8;
padding: 14px 28px;
border-radius: 8px;
font-family: 'Syne', sans-serif;
font-weight: 600;
font-size: 1rem;
text-transform: uppercase;
letter-spacing: 0.05em;
box-shadow: 0 4px 6px -1px rgba(217, 119, 6, 0.25);
transition: all 0.2s ease;

/* Hover */
transform: translateY(-1px);
box-shadow: 0 6px 12px -2px rgba(217, 119, 6, 0.35);

/* Active */
transform: translateY(0);
```

### Secondary Button (Rewrite options)
```css
background: #FFFBEB;
color: #1C1917;
border: 2px solid #D97706;
padding: 12px 24px;
border-radius: 8px;
font-family: 'Syne', sans-serif;
font-weight: 600;

/* Hover */
background: #FEF3C7;
```

### Ghost Button
```css
background: transparent;
color: #475569;
padding: 12px 24px;

/* Hover */
background: #F1F5F9;
```

---

## Input Styles

### Text Area (Message Input)
```css
background: #FFFBEB;
border: 2px solid #E7E5E4;
border-radius: 12px;
padding: 16px;
font-family: 'DM Sans', sans-serif;
font-size: 1rem;
color: #1C1917;
min-height: 160px;
transition: border-color 0.2s, box-shadow 0.2s;

/* Focus */
border-color: #D97706;
box-shadow: 0 0 0 3px rgba(217, 119, 6, 0.15);
outline: none;

/* Placeholder */
color: #A8A29E;
```

### API Key Input
```css
font-family: 'JetBrains Mono', monospace;
background: #1E293B;
color: #38BDF8;
border: 1px solid #475569;
padding: 12px 16px;
border-radius: 8px;
letter-spacing: 0.02em;
```

---

## Card Styles

### Result Panel
```css
background: #FFFBEB;
border: 1px solid #E7E5E4;
border-radius: 16px;
padding: 24px;
box-shadow: 0 4px 6px -1px rgba(28, 25, 23, 0.08);
```

### Boarding Pass (Verdict Card)
```css
background: linear-gradient(135deg, #FEF3C7 0%, #FFFBEB 100%);
border: 2px dashed #D97706;
border-radius: 24px;
padding: 32px;
position: relative;
overflow: hidden;

/* Perforated edge effect */
&::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  width: 20px;
  height: 40px;
  background: #FFFBEB;
  border-radius: 0 20px 20px 0;
  transform: translateY(-50%);
}

/* Stamp overlay */
.stamp {
  position: absolute;
  top: 20px;
  right: 20px;
  transform: rotate(-15deg);
  font-family: 'Syne', sans-serif;
  font-weight: 700;
  text-transform: uppercase;
  padding: 8px 16px;
  border: 3px solid currentColor;
  border-radius: 4px;
  box-shadow: 2px 2px 0 rgba(30, 58, 95, 0.3);
}
```

### Risk Alert Card
```css
background: #FEE2E2;
border-left: 4px solid #DC2626;
border-radius: 0 8px 8px 0;
padding: 16px;
```

### Missing Info Card
```css
background: #FEF3C7;
border-left: 4px solid #F59E0B;
border-radius: 0 8px 8px 0;
padding: 16px;
```

---

## Verdict Stamps

### Good to Send (Cleared)
```css
color: #059669;
border-color: #059669;
background: rgba(5, 150, 105, 0.1);
```

### Needs Edit (Review)
```css
color: #D97706;
border-color: #D97706;
background: rgba(217, 119, 6, 0.1);
```

### High Risk (Flagged)
```css
color: #DC2626;
border-color: #DC2626;
background: rgba(220, 38, 38, 0.1);
```

---

## Animations

### Scanner Beam
```css
@keyframes scan {
  0% { transform: translateX(-100%); opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { transform: translateX(100%); opacity: 0; }
}

.scanner-beam {
  background: linear-gradient(
    90deg,
    transparent,
    rgba(251, 191, 36, 0.3),
    rgba(56, 189, 248, 0.5),
    rgba(251, 191, 36, 0.3),
    transparent
  );
  animation: scan 2s ease-in-out;
}
```

### Conveyor Belt
```css
@keyframes convey {
  0% { background-position: 0 0; }
  100% { background-position: 40px 0; }
}

.conveyor-belt {
  background: repeating-linear-gradient(
    90deg,
    #475569 0px,
    #475569 20px,
    #64748B 20px,
    #64748B 40px
  );
  animation: convey 0.5s linear infinite;
}
```

### Stamp Appear
```css
@keyframes stamp {
  0% {
    transform: rotate(-15deg) scale(2);
    opacity: 0;
  }
  50% {
    transform: rotate(-15deg) scale(0.95);
    opacity: 1;
  }
  100% {
    transform: rotate(-15deg) scale(1);
  }
}

.stamp-animation {
  animation: stamp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

### Fade In Up
```css
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

---

## Special Effects

### X-Ray Container (Message being scanned)
```css
.x-ray-container {
  background: #1E293B;
  border-radius: 12px;
  padding: 24px;
  position: relative;
  overflow: hidden;
}

.x-ray-text {
  font-family: 'JetBrains Mono', monospace;
  color: #38BDF8;
  text-shadow: 0 0 10px rgba(56, 189, 248, 0.5);
}

/* CRT scan lines */
.x-ray-container::after {
  content: '';
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0, 0, 0, 0.1) 2px,
    rgba(0, 0, 0, 0.1) 4px
  );
  pointer-events: none;
}
```

### Noise Texture Overlay
```css
.noise-overlay {
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)'/%3E%3C/svg%3E");
  opacity: 0.03;
  pointer-events: none;
}
```

---

## Responsive Breakpoints

```css
--breakpoint-sm:  640px   /* Mobile landscape */
--breakpoint-md:  768px   /* Tablet */
--breakpoint-lg:  1024px  /* Desktop */
--breakpoint-xl:  1280px  /* Large desktop */
```

---

## Iconography

Use **Lucide Icons** with:
- Stroke width: 2
- Size: 20px (inline), 24px (standalone)
- Color: inherit from parent

Key icons:
- `Plane` - Logo, success state
- `ScanLine` - Scanning in progress
- `ShieldCheck` - Safety check
- `AlertTriangle` - Warning
- `XCircle` - High risk
- `Copy` - Copy to clipboard
- `Sparkles` - AI-generated content
- `Settings` - API key settings
