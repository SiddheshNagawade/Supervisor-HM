# ALIGN · Supervisor desk

The desktop dashboard for a Bhawan supervisor at IIT Roorkee: check new reports, assign IWD technicians, sign off closures, unblock stuck jobs, settle disputes and spot fixtures that keep failing.

Part of ALIGN, a hostel maintenance system for IIT Roorkee (DEC 301 User Interaction Project).

## Run it

```bash
npm install
npm run dev      # local dev server
npm run build    # production build in dist/ (relative paths, host anywhere)
```

## What is inside

- `src/ds/` shared ALIGN design system (same files in all three apps):
  - `ui.tsx` structured components: Button, IconButton (with hover names), Choice tiles with a corner check, Chip, Segmented, Toggle,
    TextField, OTP boxes, Keypad, Card, ListRow, Tag, Steps, Timeline, Stars, Sheet, Dialog, sticky-note / phone-notification / snackbar toasts.
  - `motion.tsx` app-specific motion: word-by-word headline rise, paper drop, rubber stamp, flip digits, count-up, ink lines.
  - `nav.tsx` screen stack with custom transitions: page push, sheet rise, paper-plane wipe (student), blue wave wash (technician).
  - `fx.ts` sound + haptics. Every sound is synthesised live with Web Audio (tap, select, keypad notes, swoosh, sticky-note slap,
    stamp, success chime, error, bell) and paired with a vibration pattern on phones. Mute from the side panel or profile.
  - `stage.tsx` on a laptop the phone apps sit in a phone frame with a side panel listing every screen and the "simulate" actions.
- `src/data/iitr.ts` mock world modelled on IIT Roorkee: Bhawans (Himalaya, Sarojini, Kasturba, Rajendra, Govind, Ganga...),
  IWD Electrical / Civil sections, technicians, items that break, evening visit slots, `name@dept.iitr.ac.in` emails.
- Everything you type is kept in this browser (localStorage). "Restart" in the side panel clears it.

## Try this

- Sign in (prefilled). Press **1–8** to jump between sections, **/** to search, **?** for shortcuts.
- To check → **Accept** a row (Undo appears), or open one to merge a duplicate, assign a technician or close it as not a real problem.
- Closures → sign off with a stamp, one after another.
- Load forecast → move two jobs off the overloaded Tuesday.
- Blocked → escalate to the warden or estate office. Disputes → reopen, reassign or uphold.
- The flask button (bottom right) simulates a new report from a student and the error pages.
