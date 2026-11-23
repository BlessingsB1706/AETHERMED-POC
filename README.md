# AetherMed — Proof of Concept (v1)

> **Where Medical Intelligence Meets the Future.**
> One platform that links **patient care**, **clinician review** and **medical education** into a single AI-assisted loop.

This repository holds two things:

| Folder | What it is | Status |
|---|---|---|
| `/` (root `*.html`) | The original **static HTML POC**: 11 pages built with Tailwind (CDN), Feather icons and Chart.js. | Frozen reference. Do not build on it. |
| [`REACTMOD/`](./REACTMOD) | The **new stack** (React 19 + Vite + TypeScript + Tailwind v4). All 11 POC screens ported, with the main bugs fixed. | Active development. |

---

## 1. What the product is

AetherMed is one ecosystem with three portals:

| Portal | Who | What they do |
|---|---|---|
| **Patients & Students** | Patients, medical / lab-science students | Track vitals, chat with **Aether AI**, take courses and simulations, get matched to internships. |
| **Medical Professionals** | Doctors, lab scientists | Work the **AI diagnostic queue** (human-in-the-loop review), manage patients, contribute de-identified datasets, mentor students. |
| **System Operators** | Admins | Users and verification, model health, content, analytics, security settings. |

### POC page map

| Page | File |
|---|---|
| Landing + Aether AI demo chat (3-message limit) | `index.html` |
| Login / Signup | `login.html`, `signup.html` |
| Patient & student portal (Overview, AI, Learning Hub, Career Match) | `patient-dashboard.html` |
| Professional portal (Overview, AI Queue + review modal, Patients, Research, Students) | `professional-dashboard.html` |
| Admin (Dashboard, Users, Analytics, Diagnostics, Content, Settings) | `admin-*.html` |

### Run the POC

No build step. Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
```

---

## 2. What makes it unique

Plenty of products do one of these things. Very few connect them, and the connections are where the value is.

1. **A closed loop between care and education.** Clinician-verified AI cases from the professional queue can (de-identified) become simulations in the student Learning Hub. Students train on real-world-shaped cases, not textbook ones. Most edtech and most clinical AI tools stay separate.
2. **Human-in-the-loop as the product, not a disclaimer.** The queue routes low-confidence AI reads (e.g. 74% on an ECG) to a licensed reviewer, who writes the final verdict. That is what regulators and hospitals expect, and it builds a labelled dataset as a by-product.
3. **Lab scientists are first-class users.** Most clinical AI is built for doctors and radiologists. AetherMed explicitly includes lab techs and lab-science students, a workforce with its own shortage that few products serve.
4. **Skills-verified talent pipeline.** Career Match ranks students on what they *did* in simulations and quizzes, not only on their CV. Hospitals get pre-screened interns, and students get a reason to keep using the platform.
5. **One identity across the lifecycle.** A student becomes a professional, and a patient can be either. One account and one record model removes the silo problem the product pitch describes.
6. **A data flywheel with consent built in.** Research Hub uploads, reviewer verdicts and simulation outcomes all improve the models, *if* consent and de-identification are designed in from day one (see the issues below).

---

## 3. Scalable problems AetherMed can go after

These are problems backed by current data where the existing design fits naturally. Figures are from the sources linked; several are estimates, so check the primaries before putting them in a pitch deck.

| Problem | Evidence | How AetherMed fits |
|---|---|---|
| **Clinician shortage in Africa** | WHO Africa Region projects a shortage of about **6.1 million health workers by 2030**, ~5.3M of them doctors, nurses, midwives, pharmacists and dentists ([BMJ Global Health / PMC](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11789529/)). | AI pre-reads plus human review lets one clinician clear more cases. Triage in the patient assistant reduces unnecessary visits. |
| **Doctor emigration ("japa") in Nigeria** | The health minister says **16,000+ doctors** left in 5–7 years, at a training cost of **$21k+ each** ([Premium Times](https://www.premiumtimesng.com/news/headlines/786750-nigeria-loses-billions-as-16000-doctors-exit-in-seven-years-minister.html), [Gazette](https://gazettengr.com/16000-doctors-fled-nigeria-in-seven-years-says-health-minister-pate/)). Reported ratios are around **1 doctor : 9,000 people**, against a WHO benchmark of about 1:600 ([ModernGhana](https://www.modernghana.com/news/1503703/too-few-doctors-too-many-patients-how-the-japa.amp)). | **Diaspora remote review**: Nigerian doctors abroad can review queue cases at home remotely and get paid per case. That turns brain drain into "brain circulation". |
| **Lab workforce shortage and lab errors** | The US alone needs 10–12k new lab professionals a year against roughly 5k graduates ([Labcorp](https://www.labcorp.com/education-events/articles/why-medical-laboratory-scientists-matter-how-labcorp-building-healthcare-talent-pipeline), [GWU](https://healthsciencesprograms.gwu.edu/news/biomedical-laboratory-workforce)). In a vendor survey, **14%** of lab staff admit a high-risk error, often linked to burnout ([SelectScience](https://www.selectscience.net/article/new-survey-reveals-burnout-in-clinical-labs-impacts-patient-care-and-staff-safety)). Shortage is a named barrier to reducing diagnostic error ([Diagnosis, 2025](https://www.degruyterbrill.com/document/doi/10.1515/dx-2025-0052/pdf)). | AI second-read on lab panels, plus a Learning Hub that trains and certifies lab techs faster. |
| **Training capacity bottleneck** | Africa's annual doctor training capacity rose from ~6k to ~40k per year, but it is still far below need ([WHO AFRO brief](https://files.aho.afro.who.int/afahobckpcontainer/production/files/Evidence_Brief_on_Health_Wokforce-Edited_Final.pdf)). | Simulation-based training at scale for schools that lack clinical placements or teaching hospitals. |
| **Graduate-to-job matching** | Students graduate without verified practical skills, and hospitals struggle to screen them. | Career Match on verified simulation performance, plus sponsored internships as B2B revenue. |
| **Fragmented patient records** | Patients carry paper results between clinics and labs. | A patient-held record shared with the care team. Later: FHIR import/export so it works with hospital systems. |

**Suggested wedge for a first paying customer:** an **AI-assisted lab-result review and training product for private labs and med-lab schools in Nigeria**. It is the narrowest slice that uses the unique loop (lab review → training cases → hiring) and avoids the heaviest regulation (autonomous diagnosis).

---

## 4. Known issues in this POC (why we moved to `REACTMOD/`)

### 🔴 Critical — must fix before anyone outside the team uses it

| # | Issue | Where |
|---|---|---|
| 1 | **Hard-coded login credentials, including the admin password, are in public source.** Anyone can read them in the browser and in this public repo. **Treat that password as burned: never reuse it anywhere.** | `login.html` (submit handler) |
| 2 | **No real authentication or authorization.** Every dashboard is a static file: going to `admin-dashboard.html` directly skips login completely. | all dashboards |
| 3 | **XSS in both chat boxes.** User text is injected with `insertAdjacentHTML(... ${text} ...)`, so typing `<img src=x onerror=alert(1)>` runs script. | `index.html` `appendUserMessage`; `patient-dashboard.html` `handleFullChatSubmit` (user bubble *and* AI reply) |
| 4 | **Unverifiable medical and compliance claims presented as fact**: "94.7% Diagnostic Accuracy", "HIPAA-compliant", "10 million clinical cases", "Aether AI v2.4 is Live", "Systems Operational". In a health product these are regulatory and legal risks (consumer-protection law, FDA/NAFDAC/MHRA rules on medical-device marketing). | `index.html`, admin pages |
| 5 | **Testimonials from named people with stock photos** ("Dr. Sarah Johnson, Cardiologist"…) read as real endorsements. | `index.html` "Trusted by Visionaries" |
| 6 | **Signup does nothing**: the selected role is never read (radio inputs have no `value`), no account is created, and it redirects to login. | `signup.html` |

### 🟠 Functional bugs

| # | Issue | Where |
|---|---|---|
| 7 | **The show/hide password icon breaks after the first click.** `feather.replace()` swaps the `<i id="eyeIcon">` for an `<svg>`, so the saved `eyeIcon` reference points at a detached node. | `login.html`, `signup.html` |
| 8 | **Images over plain `http://static.photos/...`** are blocked as mixed content on any HTTPS host (GitHub Pages, Vercel…), so avatars and course images disappear. | patient, professional, all admin pages |
| 9 | The demo chat says **"3 messages remaining" and never updates**. | `index.html` |
| 10 | The patient AI reply **echoes the user's question back verbatim** ("I've analyzed your query regarding …") and claims to have "logged this into your study tracker", which it did not. | `patient-dashboard.html` |
| 11 | The **`animate-fade-in-up` class is used but never defined**, so there is no animation. | `index.html`, `patient-dashboard.html` |
| 12 | **Chart.js is loaded but never used** (about 200 KB wasted). | `professional-dashboard.html` |
| 13 | **Dead controls everywhere**: Weekly/Monthly select, filter tabs, admin role/status filters, pagination, "Submit Final Verdict" (just closes the modal), Upload, Easy Apply, Settings toggles, Forgot key, Apple/Google buttons, footer links (`href="#"`). | all pages |
| 14 | **Unpinned CDN scripts** (`cdn.jsdelivr.net/npm/chart.js`, `unpkg.com/feather-icons`) with no version or SRI hash: a new major release can break the site overnight, and a compromised CDN can inject code. `cdn.tailwindcss.com` is the dev-only Play CDN, which Tailwind says not to use in production. | all pages |
| 15 | The greeting is always **"Good morning"**, and the user is always "Sarah". | `patient-dashboard.html` |
| 16 | The **"EN" language switcher** does nothing, and the mobile menu has no focus trap or Escape-to-close. | `index.html` |

### 🟡 Code quality, accessibility and performance

- **Huge duplication**: the sidebar, header, Tailwind config and mobile-menu script are copy-pasted across 9 files. Admin pages use `gray-*`/`blue-*` while the others use `slate-*`/`medical-*`, so the styles have already drifted.
- **Accessibility**: icon-only buttons have no labels (`aria-*` appears **0 times** in the repo), modals do not trap focus or close on Escape, the role picker hides its radio inputs with `display:none` (unreachable by keyboard), toggles are `<div>`s, and there is no reduced-motion support despite constant floating animations.
- **Mock data is mixed into the markup**, so nothing can be swapped for an API without rewriting HTML.
- **No tests, no lint, no CI, no README** (until now), and no `LICENSE`.
- **Hot-linked Unsplash images** depend on a third party and give a slow first paint. The hero image is 2000 px wide.
- **No `<meta name="description">`, Open Graph tags or favicon.**

---

## 5. What happens next

All new work happens in **[`REACTMOD/`](./REACTMOD)**. Its README has the stack, the folder layout, what was already fixed, and the **7-day production-readiness plan**.

```bash
cd REACTMOD
npm install
npm run dev
```

> ⚠️ **Disclaimer.** AetherMed is a proof of concept. It is not a medical device, it does not provide medical advice, and none of the data shown is real.
