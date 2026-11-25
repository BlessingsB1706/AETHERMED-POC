import { ANALYTES } from './ruleset';
import type { Analyte } from './types';

/** Converters into each analyte's canonical unit. Add a country's local units here. */
const CONVERT: Partial<Record<Analyte, Record<string, (v: number) => number>>> = {
  GLU: { 'mmol/L': (v) => v * 18.016 },
  CREA: { 'µmol/L': (v) => v / 88.4, 'umol/L': (v) => v / 88.4 },
  HB: { 'g/L': (v) => v / 10 },
  WBC: { '/µL': (v) => v / 1000, '/uL': (v) => v / 1000 },
  ANC: { '/µL': (v) => v / 1000, '/uL': (v) => v / 1000 },
  PLT: { '/µL': (v) => v / 1000, '/uL': (v) => v / 1000 },
  MCHC: { 'g/L': (v) => v / 10 },
};

const SAME_AS_E9 = ['x10^9/L', '10^9/L', '×10⁹/L'];

/** Returns the value in canonical units, or null if the unit is unknown. */
export function toCanonical(analyte: Analyte, value: number, unit: string): number | null {
  const canonical = ANALYTES[analyte].unit;
  if (unit === canonical || (canonical === '×10⁹/L' && SAME_AS_E9.includes(unit))) return value;
  const fn = CONVERT[analyte]?.[unit];
  return fn ? Math.round(fn(value) * 100) / 100 : null;
}
