import type { LabReport } from '../lib/labRules';
/**
 * ALL demo data lives here so it is easy to find and replace with API calls.
 * Nothing in this file is real: no real patients, users, accuracy figures or institutions.
 */
export type CaseStatus = 'flagged' | 'completed' | 'processing';

export interface DiagnosticCase {
  id: string;
  type: string;
  specialty: string;
  patient: string;
  confidence: number | null;
  status: CaseStatus;
  findings: string[];
}

export const diagnosticQueue: DiagnosticCase[] = [
  {
    id: 'DRG-8922',
    type: 'ECG Analysis',
    specialty: 'Cardiology',
    patient: 'J. Davis',
    confidence: 74,
    status: 'flagged',
    findings: ['Slight T-wave inversion in leads V2-V3', 'Irregular baseline noise detected'],
  },
  { id: 'DRG-8921', type: 'MRI Brain Scan', specialty: 'Neurology', patient: 'M. Roberts', confidence: 98, status: 'completed', findings: [] },
  { id: 'DRG-8924', type: 'Blood Panel', specialty: 'Oncology', patient: 'S. Lee', confidence: null, status: 'processing', findings: [] },
];

export const patientVitals = [
  { label: 'Heart Rate', value: '72', unit: 'bpm', note: 'Normal', tone: 'rose' },
  { label: 'Blood Pressure', value: '118/75', unit: 'mmHg', note: 'Optimal', tone: 'medical' },
  { label: 'Blood Oxygen', value: '98', unit: '%', note: '+1% from yesterday', tone: 'emerald' },
  { label: 'Sleep Duration', value: '7h 12m', unit: '', note: 'Light sleep detected', tone: 'indigo' },
] as const;

export const studentStats = [
  { label: 'Modules Completed', value: '14', unit: '/ 20', note: 'Top 10% of class', tone: 'medical' },
  { label: 'Avg Quiz Score', value: '92.4', unit: '%', note: '+4.2% this term', tone: 'indigo' },
  { label: 'Simulation Time', value: '45', unit: 'hrs', note: '5 hrs this week', tone: 'amber' },
  { label: 'Global Rank', value: '#142', unit: '', note: 'Elite tier', tone: 'emerald' },
] as const;

export const weekLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const healthTrend = { activity: [65, 78, 60, 92, 85, 95, 80], sleep: [70, 72, 85, 65, 75, 90, 88] };
export const studyTrend = [2, 3.5, 1, 4, 5, 2.5, 6];

export const courses = [
  { title: 'Basics of ECG Interpretation', author: 'Prof. Michael Chen', progress: 75 },
  { title: 'AI Neural Networks in Oncology', author: 'AetherMed Research Team', progress: 0 },
  { title: 'Hematology Slide Reading', author: 'Lab Science Faculty', progress: 30 },
];

export const careerMatches = [
  { title: 'Clinical Data Analyst (Intern)', org: 'Example General Hospital', location: 'Remote / Hybrid', tags: ['Data Science', 'Cardiology'], match: 98 },
  { title: 'Lab Technician Apprentice', org: 'Example Labs Ltd.', location: 'Lagos, NG', tags: ['Laboratory', 'Full-time'], match: 85 },
];

export const users = [
  { name: 'Dr. Michael Chen', email: 'm.chen@example.org', role: 'Professional', status: 'Active', joined: '2026-02-23' },
  { name: 'Sarah Wilson', email: 's.wilson@example.edu', role: 'Student', status: 'Active', joined: '2026-02-21' },
  { name: 'John Davis', email: 'j.davis@example.com', role: 'Patient', status: 'Pending', joined: '2026-02-20' },
];

export const adminKpis = [
  { label: 'Total Users', value: '12,847', note: '+12.5% vs last month' },
  { label: 'AI Reviews', value: '8,432', note: '+8.3% vs last month' },
  { label: 'Learning Sessions', value: '24,156', note: '+15.2% this week' },
  { label: 'Uptime', value: '99.8%', note: 'All systems operational' },
];

export const userGrowth = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
  data: [8500, 9200, 9800, 10500, 11200, 11800, 12847],
};

export const contentItems = [
  { title: 'Basics of ECG Interpretation', kind: 'Module', status: 'Published', updated: '2026-02-20' },
  { title: 'Q1 2026 Oncology Dataset', kind: 'Dataset', status: 'In Review', updated: '2026-02-19' },
  { title: 'The Future of Neural Networks in Medicine', kind: 'Article', status: 'Draft', updated: '2026-02-15' },
];

export const modelHealth = [
  { name: 'Cardiology v2.4', state: 'Online', note: 'Normal load (32 ms avg latency)' },
  { name: 'Oncology v1.8', state: 'Online', note: 'High load (145 ms avg latency)' },
  { name: 'Neurology v3.1', state: 'Training', note: 'Retraining 78% complete' },
];

// ---------- Professional: patients ----------
export type Risk = 'Low' | 'Moderate' | 'High';
export interface Patient {
  id: string;
  name: string;
  age: number;
  sex: 'F' | 'M';
  condition: string;
  risk: Risk;
  lastVisit: string;
  vitals: { hr: number; bp: string; spo2: number; temp: number };
  labs: { test: string; value: string; range: string; flag: 'normal' | 'high' | 'low' }[];
  aiSummary: string;
  timeline: { date: string; event: string }[];
  bpTrend: number[];
}

export const patients: Patient[] = [
  {
    id: 'PT-8472', name: 'John Davis', age: 45, sex: 'M', condition: 'Hypertension', risk: 'Moderate', lastVisit: '2026-10-12',
    vitals: { hr: 78, bp: '138/88', spo2: 97, temp: 36.8 },
    labs: [
      { test: 'Total cholesterol', value: '232 mg/dL', range: '< 200', flag: 'high' },
      { test: 'HbA1c', value: '5.6 %', range: '< 5.7', flag: 'normal' },
      { test: 'Creatinine', value: '1.0 mg/dL', range: '0.7–1.3', flag: 'normal' },
    ],
    aiSummary: 'BP trending down since medication change but still above target. ECG #DRG-8922 flagged (74%) for possible T-wave inversion: awaiting your review.',
    timeline: [
      { date: '2026-10-12', event: 'Follow-up visit, amlodipine dose adjusted' },
      { date: '2026-10-10', event: 'ECG uploaded, AI flagged for review' },
      { date: '2026-09-02', event: 'Lipid panel: cholesterol high' },
    ],
    bpTrend: [148, 146, 144, 141, 140, 139, 138],
  },
  {
    id: 'PT-8519', name: 'Amara Okafor', age: 32, sex: 'F', condition: 'Type 2 diabetes', risk: 'Low', lastVisit: '2026-11-02',
    vitals: { hr: 72, bp: '118/76', spo2: 99, temp: 36.6 },
    labs: [
      { test: 'HbA1c', value: '6.4 %', range: '< 5.7', flag: 'high' },
      { test: 'Fasting glucose', value: '112 mg/dL', range: '70–99', flag: 'high' },
      { test: 'eGFR', value: '104', range: '> 90', flag: 'normal' },
    ],
    aiSummary: 'HbA1c improved from 7.1% to 6.4% over 6 months. Adherence good. No action needed before next routine review.',
    timeline: [
      { date: '2026-11-02', event: 'Quarterly review, metformin continued' },
      { date: '2026-08-01', event: 'HbA1c 6.9%' },
    ],
    bpTrend: [122, 120, 121, 119, 118, 118, 118],
  },
  {
    id: 'PT-8601', name: 'Mei Roberts', age: 61, sex: 'F', condition: 'Post-stroke rehab', risk: 'High', lastVisit: '2026-11-18',
    vitals: { hr: 88, bp: '152/94', spo2: 95, temp: 37.1 },
    labs: [
      { test: 'INR', value: '3.4', range: '2.0–3.0', flag: 'high' },
      { test: 'Hemoglobin', value: '11.2 g/dL', range: '12–15.5', flag: 'low' },
      { test: 'Sodium', value: '139 mmol/L', range: '135–145', flag: 'normal' },
    ],
    aiSummary: 'INR above therapeutic range and BP elevated. Suggest anticoagulation review within 48 h. MRI #DRG-8921 completed (98%).',
    timeline: [
      { date: '2026-11-18', event: 'Physio session, mobility improving' },
      { date: '2026-11-15', event: 'MRI brain processed by AI, report verified' },
      { date: '2026-10-30', event: 'Discharged from inpatient stroke unit' },
    ],
    bpTrend: [160, 158, 155, 156, 154, 153, 152],
  },
  {
    id: 'PT-8644', name: 'Samuel Lee', age: 54, sex: 'M', condition: 'Anemia work-up', risk: 'Moderate', lastVisit: '2026-11-20',
    vitals: { hr: 92, bp: '124/80', spo2: 98, temp: 36.9 },
    labs: [
      { test: 'Hemoglobin', value: '10.1 g/dL', range: '13.5–17.5', flag: 'low' },
      { test: 'Ferritin', value: '9 ng/mL', range: '24–336', flag: 'low' },
      { test: 'MCV', value: '74 fL', range: '80–100', flag: 'low' },
    ],
    aiSummary: 'Pattern consistent with iron-deficiency anemia. Blood panel #DRG-8924 still processing.',
    timeline: [
      { date: '2026-11-20', event: 'Blood panel sent to lab' },
      { date: '2026-11-19', event: 'GP referral: fatigue for 3 months' },
    ],
    bpTrend: [126, 125, 124, 125, 124, 124, 124],
  },
];

// ---------- Professional: research ----------
export const datasets = [
  { name: 'Q3 Cardiology ECG scans', size: '1.2 GB', records: 4210, uploaded: '2026-10-10', status: 'Published', consent: 100 },
  { name: 'Neurology MRI batch: study 42', size: '3.4 GB', records: 812, uploaded: '2026-11-21', status: 'In review', consent: 100 },
  { name: 'Hematology slide images', size: '640 MB', records: 2304, uploaded: '2026-09-14', status: 'Published', consent: 98 },
  { name: 'Pediatric growth charts', size: '48 MB', records: 15020, uploaded: '2026-08-30', status: 'Rejected: PII found', consent: 92 },
];

// ---------- Professional: mentees ----------
export const mentees = [
  { name: 'Sarah Wilson', program: 'MedLab Science, Yr 3', module: 'ECG Interpretation', progress: 75, quiz: 92.4, sims: 45, questions: 1, scores: [78, 82, 85, 88, 91, 92, 94] },
  { name: 'Tunde Bakare', program: 'Medicine, Yr 4', module: 'Hematology Slides', progress: 40, quiz: 81.0, sims: 22, questions: 3, scores: [70, 72, 69, 75, 78, 80, 81] },
  { name: 'Lina Haddad', program: 'MedLab Science, Yr 2', module: 'Clinical Chemistry', progress: 90, quiz: 95.2, sims: 61, questions: 0, scores: [88, 90, 91, 93, 94, 95, 96] },
];

// ---------- Admin ----------
export interface AdminMember {
  name: string;
  email: string;
  level: 'Super Admin' | 'Content Admin' | 'Support';
  status: 'Active' | 'Invited';
  added: string;
}
export const adminTeam: AdminMember[] = [
  { name: 'System Admin', email: 'admin@example.org', level: 'Super Admin', status: 'Active', added: '2026-01-04' },
  { name: 'Grace Eze', email: 'g.eze@example.org', level: 'Content Admin', status: 'Active', added: '2026-03-18' },
];

export const reports = [
  { name: 'Monthly clinician-agreement audit.pdf', meta: 'Generated automatically', size: '2.4 MB' },
  { name: 'User engagement Q3.csv', meta: 'Requested by System Admin', size: '1.1 MB' },
  { name: 'Server cost & load analysis.pdf', meta: 'Generated automatically', size: '3.8 MB' },
];

// ---------- Layer 1 demo: lab reports fed to the rules engine ----------

export interface LabCase {
  title: string;
  story: string;
  report: LabReport;
  history: LabReport[];
}

export const labCases: LabCase[] = [
  {
    title: 'Routine panel',
    story: 'Healthy adult, everything in range.',
    report: {
      id: 'LAB-1001', patient: { id: 'PT-8519', sex: 'F', ageYears: 32 }, sample: { hemolysisIndex: 10 },
      results: [
        { analyte: 'NA', value: 139, unit: 'mmol/L', collectedAt: '2026-11-24T08:10:00Z' },
        { analyte: 'K', value: 4.1, unit: 'mmol/L', collectedAt: '2026-11-24T08:10:00Z' },
        { analyte: 'GLU', value: 5.1, unit: 'mmol/L', collectedAt: '2026-11-24T08:10:00Z' },
        { analyte: 'CREA', value: 71, unit: 'µmol/L', collectedAt: '2026-11-24T08:10:00Z' },
      ],
    },
    history: [],
  },
  {
    title: 'Hemolysed sample',
    story: 'Potassium looks critical, but the sample was hemolysed in transport.',
    report: {
      id: 'LAB-1002', patient: { id: 'PT-8472', sex: 'M', ageYears: 45 }, sample: { hemolysisIndex: 140 },
      results: [
        { analyte: 'K', value: 6.9, unit: 'mmol/L', collectedAt: '2026-11-24T09:00:00Z' },
        { analyte: 'NA', value: 141, unit: 'mmol/L', collectedAt: '2026-11-24T09:00:00Z' },
        { analyte: 'CREA', value: 1.1, unit: 'mg/dL', collectedAt: '2026-11-24T09:00:00Z' },
      ],
    },
    history: [],
  },
  {
    title: 'Critical + kidney delta',
    story: 'Post-stroke patient: true critical potassium and a creatinine rise since yesterday.',
    report: {
      id: 'LAB-1003', patient: { id: 'PT-8601', sex: 'F', ageYears: 61, onAnticoagulant: true }, sample: { hemolysisIndex: 15 },
      results: [
        { analyte: 'K', value: 6.6, unit: 'mmol/L', collectedAt: '2026-11-24T07:30:00Z' },
        { analyte: 'CREA', value: 1.45, unit: 'mg/dL', collectedAt: '2026-11-24T07:30:00Z' },
        { analyte: 'INR', value: 3.4, unit: '', collectedAt: '2026-11-24T07:30:00Z' },
        { analyte: 'HB', value: 11.2, unit: 'g/dL', collectedAt: '2026-11-24T07:30:00Z' },
      ],
    },
    history: [{
      id: 'LAB-0990', patient: { id: 'PT-8601', sex: 'F', ageYears: 61, onAnticoagulant: true }, sample: {},
      results: [
        { analyte: 'K', value: 4.9, unit: 'mmol/L', collectedAt: '2026-11-23T07:00:00Z' },
        { analyte: 'CREA', value: 1.05, unit: 'mg/dL', collectedAt: '2026-11-23T07:00:00Z' },
      ],
    }],
  },
  {
    title: 'Low neutrophils, Duffy status unknown',
    story: 'Healthy Nigerian adult. Imported software would call this neutropenia.',
    report: {
      id: 'LAB-1004', patient: { id: 'PT-8710', sex: 'M', ageYears: 28 }, sample: {},
      results: [
        { analyte: 'WBC', value: 3800, unit: '/µL', collectedAt: '2026-11-24T10:00:00Z' },
        { analyte: 'ANC', value: 1450, unit: '/µL', collectedAt: '2026-11-24T10:00:00Z' },
        { analyte: 'HB', value: 14.6, unit: 'g/dL', collectedAt: '2026-11-24T10:00:00Z' },
        { analyte: 'PLT', value: 245, unit: 'x10^9/L', collectedAt: '2026-11-24T10:00:00Z' },
      ],
    },
    history: [],
  },
  {
    title: 'Clotted FBC + data-entry slip',
    story: 'Platelets unreliable on a clotted tube; MCHC typed as 3.4 instead of 34.',
    report: {
      id: 'LAB-1005', patient: { id: 'PT-8644', sex: 'M', ageYears: 54 }, sample: { clotted: true },
      results: [
        { analyte: 'PLT', value: 62, unit: 'x10^9/L', collectedAt: '2026-11-24T11:00:00Z' },
        { analyte: 'MCHC', value: 3.4, unit: 'g/dL', collectedAt: '2026-11-24T11:00:00Z' },
        { analyte: 'K', value: 4.4, unit: 'mmol/L', collectedAt: '2026-11-24T11:00:00Z' },
      ],
    },
    history: [],
  },
];
