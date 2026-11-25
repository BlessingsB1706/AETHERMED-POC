import type { Analyte, Patient, Sex } from './types';

/**
 * THE RULESET. Bump RULESET_VERSION on every change and record why in the changelog below.
 * Every evaluation stores the version it ran with, so any past flag can be explained later.
 *
 * ⚠️ DEMO VALUES. Typical adult ranges for illustration only. Before real use, each lab's
 * pathologist must validate ranges for its own analysers, methods and population.
 *
 * Changelog
 *   2026.11-demo.1  First ruleset: ranges, criticals, deltas, plausibility, quality, Duffy-null ANC.
 */
export const RULESET_VERSION = '2026.11-demo.1';

export interface RangeRule {
  low: number;
  high: number;
  sex?: Sex;
  duffyNull?: boolean;
  onAnticoagulant?: boolean;
  source: string;
}

export interface AnalyteDef {
  name: string;
  /** Canonical unit every result is converted to before rules run. */
  unit: string;
  ranges: RangeRule[];
  critical?: { low?: number; high?: number };
  /** Outside this the value is almost certainly an error (sample mix-up, entry typo, analyser fault). */
  plausible: { low: number; high: number };
  /** Flag if the change from the patient's previous result exceeds abs or pct within the window. */
  delta?: { abs?: number; pct?: number; withinHours: number };
}

export const ANALYTES: Record<Analyte, AnalyteDef> = {
  K: {
    name: 'Potassium', unit: 'mmol/L',
    ranges: [{ low: 3.5, high: 5.1, source: 'Typical adult reference interval' }],
    critical: { low: 2.8, high: 6.2 }, plausible: { low: 1, high: 10 },
    delta: { abs: 1.0, withinHours: 24 },
  },
  NA: {
    name: 'Sodium', unit: 'mmol/L',
    ranges: [{ low: 135, high: 145, source: 'Typical adult reference interval' }],
    critical: { low: 120, high: 160 }, plausible: { low: 90, high: 200 },
    delta: { abs: 10, withinHours: 24 },
  },
  GLU: {
    name: 'Glucose (fasting)', unit: 'mg/dL',
    ranges: [{ low: 70, high: 99, source: 'Typical fasting adult interval' }],
    critical: { low: 40, high: 450 }, plausible: { low: 5, high: 2000 },
  },
  CREA: {
    name: 'Creatinine', unit: 'mg/dL',
    ranges: [
      { low: 0.7, high: 1.3, sex: 'M', source: 'Typical adult male interval' },
      { low: 0.6, high: 1.1, sex: 'F', source: 'Typical adult female interval' },
    ],
    plausible: { low: 0.05, high: 30 },
    delta: { abs: 0.3, withinHours: 48 }, // KDIGO acute kidney injury criterion
  },
  HB: {
    name: 'Hemoglobin', unit: 'g/dL',
    ranges: [
      { low: 13.5, high: 17.5, sex: 'M', source: 'Typical adult male interval' },
      { low: 12.0, high: 15.5, sex: 'F', source: 'Typical adult female interval' },
    ],
    critical: { low: 7, high: 20 }, plausible: { low: 1, high: 25 },
    delta: { abs: 2, withinHours: 72 },
  },
  WBC: {
    name: 'White cell count', unit: '×10⁹/L',
    ranges: [{ low: 4.0, high: 11.0, source: 'Typical adult interval' }],
    critical: { low: 2, high: 30 }, plausible: { low: 0.1, high: 500 },
  },
  ANC: {
    name: 'Absolute neutrophil count', unit: '×10⁹/L',
    ranges: [
      { low: 1.21, high: 5.39, duffyNull: true, source: 'Duffy-null-specific interval proposed in published studies; validate locally' },
      { low: 1.8, high: 7.7, source: 'Typical adult interval (derived mostly from non-African populations)' },
    ],
    critical: { low: 0.5 }, plausible: { low: 0, high: 300 },
  },
  PLT: {
    name: 'Platelets', unit: '×10⁹/L',
    ranges: [{ low: 150, high: 400, source: 'Typical adult interval' }],
    critical: { low: 20, high: 1000 }, plausible: { low: 1, high: 3000 },
    delta: { pct: 50, withinHours: 72 },
  },
  INR: {
    name: 'INR', unit: '',
    ranges: [
      { low: 2.0, high: 3.0, onAnticoagulant: true, source: 'Common warfarin target; set per patient' },
      { low: 0.8, high: 1.2, source: 'Typical interval without anticoagulation' },
    ],
    critical: { high: 5.0 }, plausible: { low: 0.5, high: 20 },
  },
  MCHC: {
    name: 'MCHC', unit: 'g/dL',
    ranges: [{ low: 32, high: 36, source: 'Typical adult interval' }],
    plausible: { low: 20, high: 45 },
  },
};

/** The Duffy-null ANC interval, used to warn when Duffy status is unknown. */
export const ANC_DUFFY_NULL = ANALYTES.ANC.ranges[0];

/** Sample-quality limits. Index scales differ between analyser brands: set these per analyser. */
export const QUALITY = {
  hemolysisIndexLimit: 50,
  lipemiaIndexLimit: 300,
  glucoseMaxHoursUnspun: 2,
  /** Which analytes each problem makes unreliable. */
  hemolysisAffects: ['K'] as Analyte[],
  lipemiaAffects: ['NA', 'HB', 'MCHC'] as Analyte[],
  clotAffects: ['PLT', 'WBC', 'ANC', 'HB'] as Analyte[],
};

export const ADULT_MIN_AGE = 18;

/** Picks the first matching range. Ranges are listed most-specific first, general last. */
export function referenceRangeFor(analyte: Analyte, patient: Patient): RangeRule {
  const ranges = ANALYTES[analyte].ranges;
  const match = ranges.find(
    (r) =>
      (r.sex === undefined || r.sex === patient.sex) &&
      (r.duffyNull === undefined || r.duffyNull === patient.duffyNull) &&
      (r.onAnticoagulant === undefined || r.onAnticoagulant === Boolean(patient.onAnticoagulant)),
  );
  return match ?? ranges[ranges.length - 1];
}
