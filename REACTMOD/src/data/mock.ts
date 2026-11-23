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
