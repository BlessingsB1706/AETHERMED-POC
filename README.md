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

## 5. Data & AI: how we build the intelligence

**Principle: don't train a medical AI from scratch.** Build it in three layers and only train models where rules and existing models can't do the job.

```
 lab result ──► Layer 1: rules engine ──► decision + flags (auto-verify / review / recollect / critical call)
                       │                         │
                       │                         ▼
                       │              Layer 2: language model explains the flags,
                       │              cites the library, drafts reports & quizzes
                       ▼
 image / ECG ──► Layer 3: specialist model ──► finding + confidence ──► human review queue
                                                                            │
                         every verdict becomes a labelled example ◄─────────┘
```

### Layer 1: rules engine (built, in `REACTMOD/src/lib/labRules/`)

Lab review is mostly fixed rules, so we write them as **versioned, tested code**:

| Rule type | Example in the ruleset | Decision it drives |
|---|---|---|
| Reference ranges (by sex, anticoagulation, Duffy status) | Hemoglobin 12.0–15.5 g/dL for women | needs review |
| Critical values | Potassium > 6.2 mmol/L | **phone the clinician now** |
| Delta checks | Creatinine +0.3 mg/dL within 48 h (KDIGO AKI criterion) | needs review (wrong-patient check) |
| Plausibility | Potassium 45 mmol/L (typo for 4.5) | needs review, never a false critical |
| Sample quality | Hemolysis index ≥ 50 withholds potassium | **recollect** |
| Consistency | MCHC > 37 g/dL suggests interference | needs review |
| Scope | Patient under 18 | manual review (no pediatric ranges yet) |
| Units | Glucose mmol/L → mg/dL, creatinine µmol/L → mg/dL | unknown unit is flagged, never guessed |

**The Nigerian advantage is built in:** neutrophil counts use a **Duffy-null-aware range**. When Duffy status is unknown and the count sits in the Duffy-null interval, the engine raises an *information* hint instead of labelling the person neutropenic. Standard ranges misclassify up to half of Duffy-null people.

**Try it:** sign in as Professional → **Lab review**. It runs five sample reports through the engine.

**How to change a rule (the process that keeps it safe):**
1. Edit `ruleset.ts`, bump `RULESET_VERSION`, and add a changelog line saying why.
2. Add or adjust a test in `engine.test.ts`. CI must pass (`npm test`).
3. A pathologist or senior lab scientist approves the pull request.
4. Every evaluation stores the `rulesetVersion` it ran with, so any past flag can be explained in an audit.

**Path to production:**
- **Server-side:** run `evaluate()` on the server for every incoming result. The browser copy is for the demo. The function is pure TypeScript, so the same file runs in a Supabase Edge Function or Node.
- **Storage:** save each evaluation (decision, flags, ruleset version, reviewer action) in an append-only audit table.
- **Results in:** start with CSV import from the lab system, then an HL7 v2 / ASTM analyser interface.
- **Per-lab configuration:** move ranges and limits into a versioned per-lab table, each signed off by that lab's pathologist. Hemolysis and lipemia index scales differ by analyser brand.

**Next rules to add:** pediatric and pregnancy ranges, local reference intervals from partner labs' own healthy-population data, more analytes (liver panel, lipids, HbA1c, malaria RDT/microscopy agreement), and Westgard QC rules for daily controls.

### Layer 2: language model with a curated library (next to build)

The language model **explains**; it never **decides**. The decision always comes from Layer 1 or a human.

1. **Server-side only.** Add `POST /ai/explain` and `POST /ai/chat` as a Supabase Edge Function or a Node service, using the official Anthropic TypeScript SDK (`@anthropic-ai/sdk`). The API key lives in server environment variables, never in `VITE_*`. The frontend already calls `httpAiClient` in `src/lib/ai.ts`, so only the server is new.
2. **Model:** start with `claude-opus-5-5`. Tune the `effort` setting per route (low for chat, higher for report drafting) before considering a cheaper model, and only switch if a measured eval shows quality holds.
3. **Input is structured, not free text.** Send the Layer 1 `Evaluation` (flags, evidence, ranges) plus age and sex. **Send no names, IDs or contact details.** Minimum necessary data, under the Nigeria Data Protection Act and a signed data-processing agreement with the AI vendor.
4. **The library (RAG), simplest first:**
   - *Start:* a small curated library (WHO guidance, Nigerian national guidelines, your lab procedures, the ruleset's own reference table) placed in the **system prompt with prompt caching**. While it's under a few hundred pages, this is simpler and more reliable than a vector database.
   - *Grow:* when the library gets big, chunk it into Postgres with `pgvector` (built into Supabase), retrieve the most relevant passages per request, and pass them as `document` blocks with **citations enabled**, so every sentence in an explanation points at its source.
5. **Guardrails:**
   - a fixed output structure (structured outputs);
   - a system prompt that forbids diagnoses and requires the red-flag wording for critical values;
   - handling of the `refusal` stop reason;
   - logging of prompt version, sources used and response for audit.
6. **Evaluation before every change.** Keep a fixed test set:
   - 150–300 realistic lab reports with clinician-written ideal explanations;
   - a slice of AfriMed-QA questions, for research benchmarking only (its licence is non-commercial).

   Each answer is graded automatically (mentions every critical flag, makes no diagnosis claims, cites a source, stays at the target reading level) plus clinician spot-checks. A prompt or library change ships only if the scores don't drop.
7. **Uses:** patient-friendly result explanations, report drafts for reviewers, Aether AI chat, and quiz generation from verified cases for the Learning Hub.

### Layer 3: specialist models for images and signals (after Layer 2)

Only for things rules and language models can't do: blood smears and ECGs.

**Order of work:**
1. Malaria thin-smear classifier.
2. White-cell differential.
3. 12-lead ECG.

**Tools:** Python, PyTorch with **timm** (pretrained image models), Label Studio for annotation, DVC for data versioning, MLflow for experiment tracking. Prototype on free Kaggle or Colab GPUs, then a rented cloud GPU.

**Steps:**
1. **Data card per dataset:** source, licence, consent basis, demographics, scanner or phone model.
2. **Split by patient and site,** never by image (otherwise the test scores are inflated by leakage).
3. **Transfer learning:** start from a model pretrained on ImageNet (images) or a published PTB-XL baseline (ECG), then fine-tune on public data:
   - NIH malaria cell images (27,558 images, public domain);
   - PTB-XL ECGs.
4. **Local fine-tune:** thousands, not millions, of smear photos taken with phone-microscope adapters at partner labs and schools. Two scientists label each image, and a third resolves disagreements.
5. **Evaluate what matters clinically:**
   - sensitivity at a fixed specificity;
   - calibration (so the confidence score can route cases);
   - results broken down by site and device.
6. **Ship safely:**
   - export to ONNX and serve from a small inference service;
   - run in **shadow mode** (predicting silently next to experts) at one pilot lab;
   - go live only as an assistant whose low-confidence cases go to the human review queue.
7. **The flywheel:** every reviewer verdict becomes a new labelled example. Retrain monthly, and deploy a candidate model only if it beats the current one on a frozen test set. The admin "Trigger AI training" flow already treats new models as candidates.

> Image-analysis AI is likely regulated as software as a medical device (NAFDAC in Nigeria; FDA, MHRA or CE elsewhere). Until cleared, position it as decision support with mandatory human sign-off, and get regulatory advice before making any accuracy claims.

### Where the data comes from

| Source | Use | Access |
|---|---|---|
| NIH/NLM malaria cell images | Malaria model | Public domain |
| PTB-XL (PhysioNet) | ECG model | Open access |
| AfriMed-QA | Benchmarking the assistant | CC-BY-NC-SA: research only unless the authors grant commercial terms |
| MIMIC-IV (PhysioNet) | Lab-pattern research | Credentialed: training course + data-use agreement |
| NHANES | Population lab distributions | Open |
| Synthea | App development and testing only | Open (synthetic) |
| **Partner labs and teaching hospitals** | Local ranges, Layer 1 tuning, Layer 3 fine-tuning | Data-sharing agreement + ethics approval (NHREC or hospital HREC) + NDPA compliance. Offer the software free in exchange. |
| **Med-lab schools** | Labelled smear images | Coursework with phone microscopes, consented |
| **AetherMed's own review queue** | Ongoing labels | Every verified case, de-identified, with consent recorded |

**Data rules from day one:**
- a provenance table recording the source, licence and consent of every record;
- no scraping;
- no non-commercial datasets in the paid product;
- no raw patient data ever sold. Research access is consented and revenue-shared with contributing institutions.

### Milestones

| When | Deliverable |
|---|---|
| Week 1 | Layer 1 running server-side, with CSV result import and the audit table |
| Weeks 2–3 | Layer 2 explanations with a cached library; eval set v1 (150 cases) |
| Month 2 | Malaria smear model on public data; offline evaluation report |
| Month 3 | Pilot with one lab and one school: local ranges, phone-microscope images, shadow mode |
| Month 4+ | Assisted go-live with human sign-off; monthly retraining from queue verdicts |

## 6. What happens next

All new work happens in **[`REACTMOD/`](./REACTMOD)**. Its README has the stack, the folder layout, what was already fixed, and the **7-day production-readiness plan**.

```bash
cd REACTMOD
npm install
npm run dev
```

> ⚠️ **Disclaimer.** AetherMed is a proof of concept. It is not a medical device, it does not provide medical advice, and none of the data shown is real.
