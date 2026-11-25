# AetherMed — REACTMOD (v1)

The production track for AetherMed: every screen from the static HTML POC (in the repo root), rebuilt as a typed React app with one shared layout, real routing, role guards and a pluggable AI client.

## Stack

| Concern | Choice | Why |
|---|---|---|
| UI | **React 19** + **TypeScript (strict)** | Typed components, one source of truth for layout |
| Build | **Vite** | Fast dev server, code-splitting per portal |
| Styling | **Tailwind CSS v4** (compiled, not the CDN) | Same look as the POC, production-safe, tokens in `src/index.css` |
| Routing | **React Router 7** | Real URLs (`/patient/learning`, `/admin/users`…), nested layouts, guards |
| Icons | **lucide-react** | Tree-shaken React icons (the POC's Feather icons broke when swapped at runtime) |
| Charts | **Chart.js** via `react-chartjs-2` | Same charts as the POC, lazy-loaded only on the pages that use them |
| Tests | **Vitest** | Unit tests; add React Testing Library and Playwright next (see plan) |

## Getting started

Requires Node 20 or newer.

```bash
npm install
```

```bash
cp .env.example .env
```

```bash
npm run dev
```

Then open http://localhost:5173. In demo mode the login page lets you pick a portal (Patient, Student, Professional, Admin). No passwords are needed, and none are stored anywhere in the code.

| Script | Does |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Type-check, then build to `dist/` |
| `npm run preview` | Serve the production build |
| `npm run typecheck` | `tsc` only |
| `npm test` | Vitest |

### Environment variables

| Var | Default | Meaning |
|---|---|---|
| `VITE_DEMO_MODE` | `true` | `true` = role-picker login, mock data, canned AI answers. `false` = real auth and the HTTP AI client. |
| `VITE_API_URL` | `http://localhost:8787` | Our backend, used by `httpAiClient`. |

> Anything prefixed `VITE_` is shipped to the browser. **Never put API keys or secrets in `VITE_*` variables.**

## Deploy (Vercel)

`vercel.json` lives at the **repo root**, so the existing Vercel project needs no dashboard changes. Every push to `main`:

1. runs `npm ci` and `npm run build` inside `REACTMOD/`;
2. serves `REACTMOD/dist`, with every route rewritten to `index.html` so deep links like `/admin/health` work;
3. redirects the old POC URLs (`/login.html`, `/admin-settings.html`, ...) to their new routes;
4. sends basic security headers and caches hashed assets for a year.

Environment variables (`VITE_DEMO_MODE`, `VITE_API_URL`) are set in the Vercel project settings. Without them the app runs in demo mode.

## Folder layout

```
REACTMOD/
├── index.html
├── public/aether_ai.png
└── src/
    ├── main.tsx                 # entry
    ├── App.tsx                  # router, nav config per portal, role guards, lazy pages
    ├── index.css                # Tailwind v4 + medical colour tokens + reduced-motion
    ├── lib/
    │   ├── auth.tsx             # AuthProvider, useAuth, RequireRole, DEMO_MODE
    │   ├── ai.ts                # AiClient interface + mock + HTTP client
    │   ├── health.ts            # HealthClient: simulated metrics or GET /health
    │   ├── labRules/            # Layer 1: versioned lab-result rules engine + tests
    │   ├── theme.tsx            # ThemeProvider + light/dark ThemeToggle
    │   ├── useToast.ts
    │   └── *.test.ts
    ├── data/mock.ts             # ALL demo data in one place (swap for API calls)
    ├── components/
    │   ├── DashboardLayout.tsx  # one sidebar/header for all 3 portals
    │   ├── ChatPanel.tsx        # shared, XSS-safe chat (landing demo + patient assistant)
    │   ├── Modal.tsx            # native <dialog>: focus trap + Escape
    │   ├── LineChart.tsx        # Line/Bar chart wrappers
    │   ├── HeroIllustration.tsx # code-drawn hero art (no stock images), animated ECG
    │   ├── Logo.tsx
    │   └── ui.tsx               # Card, PageHeader, StatCard, Badge, DemoBanner
    └── pages/
        ├── Landing.tsx  Login.tsx  Signup.tsx  NotFound.tsx
        ├── patient/PatientPages.tsx   # Overview, Assistant, Learning, Career
        ├── pro/ProPages.tsx           # Overview, Queue (+ review modal), Patients, Research, Students
        ├── pro/LabReview.tsx          # Layer 1 demo: sample reports through the rules engine
        └── admin/AdminPages.tsx       # Overview, Users, Analytics, Diagnostics, Content, Settings
```

### Routes

| Path | Who can open it |
|---|---|
| `/`, `/login`, `/signup` | everyone |
| `/patient/*` | patient, student |
| `/pro/*` | professional |
| `/admin/*` (incl. `/admin/health`, `/admin/settings#admins`) | admin |

A signed-out visitor is sent to `/login`. A signed-in user on the wrong portal is sent back to their own portal.

## Features added in v1.1

- **Light / dark mode** toggle in the landing nav, login and signup, and every dashboard header. The choice is saved per browser; the first visit follows the system setting, and the theme is applied before first paint, so there is no white flash.
  - How it works: `src/index.css` remaps colour tokens under `html.dark` (`surface`, the slate scale and pale tints), so components use one set of classes. `white` and `slate-950` are deliberately *not* remapped: use them for things that must look the same in both themes.
- **Illustrated landing hero** drawn in HTML/SVG (vitals, live ECG, AI-review and simulation cards), plus a "How it works" loop section and a CTA band.
- **Fuller pages:**
  - Patients: search, risk filter, detail panel with vitals, flagged labs, AI summary, BP trend and timeline.
  - Research: drag-and-drop upload with a consent/de-identification checklist; contributions list with statuses.
  - Mentorship: mentee cards, a progress modal with a score chart, and replies to open questions.
  - Analytics: 7/30-day range, a requests-by-module doughnut, resource bars, and generated reports.
- **Admin settings** rebuilt to match the POC layout, with a scroll-spy sub-nav and a Save button:
  - Quick actions: **Invite new admin** (modal with access levels, validation and duplicate check), **Trigger AI training** (shows progress; produces a *candidate* model, not deployed), **Export system log** (real CSV download) and **Ecosystem settings**.
  - **Admin team** list with revoke/remove, plus profile, password change with validation, 2FA, data masking, and maintenance mode with a confirmation step.
- **Server health** (`/admin/health`): overall status banner, CPU/memory/disk/network gauges, requests per minute, error rate, p95 latency, live CPU and latency charts (3 s polling, pausable), per-service status/latency/30-day uptime, and an incident timeline. Simulated in demo mode; with `VITE_DEMO_MODE=false` it calls `GET {VITE_API_URL}/health` (shape: `HealthSnapshot` in `lib/health.ts`), which must require an admin session server-side.

## Lab rules engine (Layer 1)

`src/lib/labRules/` is a pure TypeScript engine (no React, no network), so the same code can run on the server:
- **What it checks:** reference ranges, critical values, delta checks, plausibility, sample quality, consistency and unit conversion.
- **What it returns:** a decision (`auto-verify`, `needs-review`, `recollect` or `critical-call`) plus flags that each carry a rule ID, evidence and an action.
- **Where to see it:** sign in as Professional → `/pro/lab-review`.

How to change rules safely, and the plans for Layers 2 and 3, are in the root README → **Data & AI**.

## What's already fixed vs the POC

| POC problem | REACTMOD |
|---|---|
| Hard-coded passwords (including admin) in `login.html` | Gone. Demo role picker; real auth slots in behind `useAuth()` |
| Dashboards reachable without login | `RequireRole` guards (UX only: the **API must enforce roles too**) |
| XSS in both chats (`insertAdjacentHTML`) | Messages rendered as React text; input length capped |
| Signup ignored the role, 6-char passwords accepted | Role is read; 12+ character passwords; consent checkbox |
| Eye-icon toggle broke after one click | n/a (lucide-react is plain React) |
| `http://` images blocked on HTTPS | No external images; initials avatars |
| "3 messages remaining" never updated | Live counter, then a sign-in prompt |
| AI echoed the question back verbatim | Canned answers plus a safe fallback, behind the `AiClient` interface |
| Review modal's "Submit" just closed | Verdict requires a note and updates the case status |
| Admin filters, case filters, toggles were dead | Working (local state) |
| Sidebar/header copy-pasted 9×, colours drifted | One `DashboardLayout`, one colour token set |
| No ARIA, modals without focus trap, hidden radios | Labels, `role="switch"`/`tablist`/`progressbar`, native `<dialog>`, `sr-only` radios, reduced motion |
| Unpinned CDN scripts, Tailwind Play CDN | Versions locked in `package-lock.json`, compiled CSS |
| Unverifiable "94.7% accuracy" / "HIPAA-compliant" / fake testimonials | Removed. "Proof of concept" badge and a demo-data banner |
| Mock data scattered in markup | `src/data/mock.ts` |

Checked on this version: `tsc` clean, production build OK, unit tests pass, and a Chromium run through every route for every role showed no console errors. Guards redirect correctly, the XSS payload renders as text, and there is no horizontal scroll at phone width (390 px).

## Still to do (known gaps in v1)

- **No backend yet.** Data is mock and nothing persists across reloads (only the session, in `sessionStorage`).
- Content and Diagnostics admin pages are still thin.
- No i18n, no PWA/offline support.
- The main bundle is about 108 KB gzipped. Chart.js is split out; the router and React could be split further.
- No ESLint/Prettier or CI yet.

---

## 7-day production-readiness plan

**Be realistic about the target first.** In a week you *can* ship a secure, real, pilot-ready product. You *cannot* ship an AI that diagnoses patients: that needs clinical validation and regulatory clearance (NAFDAC in Nigeria, FDA/MHRA/CE elsewhere). So for launch, position the AI as **education and clinician decision support, with a human always signing off**, which is what the queue already does.

Recommended backend: **Supabase** (Postgres + Auth + Row Level Security + Storage + Edge Functions). It covers auth, a database, file uploads and a server for the AI key without running your own servers. Alternatives: Firebase, or Node/Nest + Postgres.

| Day | Goal | Deliverables |
|---|---|---|
| **1 — Data & auth** | Real users | Supabase project; tables `profiles(role, verified)`, `cases`, `verdicts`, `audit_log`, `courses`, `enrollments`, `jobs`; email/password + magic link; **Row Level Security on every table**; replace `signInDemo` with Supabase auth in `lib/auth.tsx`; MFA for professionals and admins. |
| **2 — Replace mocks** | Real data on screen | TanStack Query + typed services in `src/services/*`; every page reads from the API; loading, empty and error states; professional licence-verification flow (upload document → admin approves). |
| **3 — Aether AI for real** | Safe AI | Edge Function `/ai/chat` holding the LLM key (e.g. Claude), with a medical-safety system prompt (no diagnosis, escalate red-flag symptoms, cite sources), per-user rate limits, conversation storage, and logging for audit. Flip `VITE_DEMO_MODE=false`. |
| **4 — Diagnostic queue end-to-end** | The core loop works | Upload (Storage, private bucket, signed URLs) → case row → AI pre-read → flagged to a reviewer → verdict written with reviewer ID and timestamp to `audit_log` → patient sees the *verified* result only. |
| **5 — Learning + Career + Admin** | The other portals | Course progress persisted; quiz results; Career Match from real scores; admin user and content management on real tables; verified cases (de-identified) published as simulations. |
| **6 — Quality gate** | Confidence to ship | ESLint + Prettier; React Testing Library on ChatPanel, guards, review modal; Playwright e2e for the three login → core-task flows; GitHub Actions CI (typecheck, test, build) on every PR; Sentry for errors; Lighthouse/axe pass ≥ 90 accessibility. |
| **7 — Compliance & launch** | Go live (pilot) | Privacy policy and terms; consent records; **Nigeria Data Protection Act 2023** (plus GDPR if you have EU users; HIPAA only if serving US covered entities, which needs a BAA with every vendor); security headers/CSP; backups; deploy (Vercel or Netlify + Supabase); custom domain; incident contact; smoke test in production. |

### Ground rules from day 1

- Every role check happens **on the server** (RLS / API). Client guards are for UX only.
- No PHI in logs, analytics or error reports. Mask before sending to Sentry.
- Every clinical decision is stored with *who*, *when* and *what the AI said*.
- No public accuracy figures until they come from a documented evaluation.
- Small PRs, CI green before merge, and no secrets in git (`.env` is ignored).
