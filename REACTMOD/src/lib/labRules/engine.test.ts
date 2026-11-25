import { describe, expect, it } from 'vitest';
import { evaluate, RULESET_VERSION, toCanonical } from './index';
import type { LabReport, LabResult, Patient } from './types';

const adultF: Patient = { id: 'p1', sex: 'F', ageYears: 34 };
const T0 = '2026-11-20T08:00:00Z';
const res = (analyte: LabResult['analyte'], value: number, unit: string, collectedAt = T0): LabResult => ({ analyte, value, unit, collectedAt });
const report = (results: LabResult[], over: Partial<LabReport> = {}): LabReport => ({ id: 'r1', patient: adultF, sample: {}, results, ...over });
const ids = (r: ReturnType<typeof evaluate>) => r.flags.map((f) => f.ruleId);

describe('lab rules engine', () => {
  it('auto-verifies a normal panel and stamps the ruleset version', () => {
    const e = evaluate(report([res('K', 4.2, 'mmol/L'), res('NA', 140, 'mmol/L'), res('HB', 13.1, 'g/dL')]));
    expect(e.decision).toBe('auto-verify');
    expect(e.flags).toHaveLength(0);
    expect(e.rulesetVersion).toBe(RULESET_VERSION);
  });

  it('withholds potassium on a hemolysed sample instead of calling a false critical', () => {
    const e = evaluate(report([res('K', 6.8, 'mmol/L')], { sample: { hemolysisIndex: 120 } }));
    expect(e.decision).toBe('recollect');
    expect(ids(e)).toEqual(['QC.K.compromised']);
  });

  it('calls a true critical potassium', () => {
    const e = evaluate(report([res('K', 6.8, 'mmol/L')]));
    expect(e.decision).toBe('critical-call');
    expect(ids(e)).toContain('K.critical.high');
  });

  it('uses sex-specific ranges', () => {
    expect(evaluate(report([res('HB', 13.0, 'g/dL')])).decision).toBe('auto-verify'); // female
    const male = evaluate(report([res('HB', 13.0, 'g/dL')], { patient: { ...adultF, sex: 'M' } }));
    expect(ids(male)).toContain('HB.range.low');
  });

  it('flags a creatinine rise of 0.3 mg/dL within 48 h (AKI delta)', () => {
    const prev = report([res('CREA', 0.8, 'mg/dL', '2026-11-19T08:00:00Z')], { id: 'r0' });
    const e = evaluate(report([res('CREA', 1.15, 'mg/dL')]), [prev]);
    expect(ids(e)).toContain('DELTA.CREA');
    expect(e.decision).toBe('needs-review');
  });

  it('ignores deltas outside the time window', () => {
    const prev = report([res('CREA', 0.8, 'mg/dL', '2026-11-01T08:00:00Z')], { id: 'r0' });
    expect(ids(evaluate(report([res('CREA', 1.0, 'mg/dL')]), [prev]))).not.toContain('DELTA.CREA');
  });

  it('converts local units before applying rules (glucose mmol/L, creatinine µmol/L)', () => {
    expect(toCanonical('GLU', 5.5, 'mmol/L')).toBeCloseTo(99.09, 1);
    expect(toCanonical('CREA', 88.4, 'µmol/L')).toBe(1);
    const e = evaluate(report([res('GLU', 2.0, 'mmol/L')])); // 36 mg/dL
    expect(ids(e)).toContain('GLU.critical.low');
  });

  it('flags an unknown unit instead of guessing', () => {
    const e = evaluate(report([res('GLU', 5.5, 'mg%')]));
    expect(ids(e)).toEqual(['GLU.unit.unknown']);
    expect(e.normalized).toHaveLength(0);
  });

  it('treats impossible values as errors, not as criticals', () => {
    const e = evaluate(report([res('K', 45, 'mmol/L')])); // decimal slip for 4.5
    expect(ids(e)).toEqual(['K.implausible']);
    expect(e.decision).toBe('needs-review');
  });

  describe('Duffy-null aware neutrophil ranges', () => {
    it('does not call neutropenia for a known Duffy-null patient within their range', () => {
      const e = evaluate(report([res('ANC', 1.4, 'x10^9/L')], { patient: { ...adultF, duffyNull: true } }));
      expect(e.decision).toBe('auto-verify');
    });
    it('adds a Duffy hint (info, not warning) when status is unknown', () => {
      const e = evaluate(report([res('ANC', 1.4, 'x10^9/L')]));
      expect(ids(e)).toEqual(['ANC.range.low.duffy-unknown']);
      expect(e.flags[0].severity).toBe('info');
    });
    it('still flags a real low below every range', () => {
      const e = evaluate(report([res('ANC', 0.9, 'x10^9/L')], { patient: { ...adultF, duffyNull: true } }));
      expect(ids(e)).toContain('ANC.range.low');
    });
  });

  it('withholds platelets on a clotted sample', () => {
    const e = evaluate(report([res('PLT', 60, 'x10^9/L')], { sample: { clotted: true } }));
    expect(e.decision).toBe('recollect');
    expect(ids(e)).toEqual(['QC.PLT.compromised']);
  });

  it('warns that delayed glucose may be falsely low', () => {
    const e = evaluate(report([res('GLU', 80, 'mg/dL')], { sample: { hoursToProcessing: 5 } }));
    expect(ids(e)).toContain('QC.GLU.delayed');
  });

  it('sends pediatric patients to manual review', () => {
    const e = evaluate(report([res('K', 4.2, 'mmol/L')], { patient: { ...adultF, ageYears: 6 } }));
    expect(ids(e)).toContain('SCOPE.pediatric');
  });

  it('uses the anticoagulation INR target when the patient is on warfarin', () => {
    expect(ids(evaluate(report([res('INR', 2.5, '')])))).toContain('INR.range.high');
    expect(evaluate(report([res('INR', 2.5, '')], { patient: { ...adultF, onAnticoagulant: true } })).decision).toBe('auto-verify');
  });

  it('flags implausibly high MCHC as an interference problem', () => {
    expect(ids(evaluate(report([res('MCHC', 38.5, 'g/dL')])))).toContain('CONSISTENCY.MCHC.high');
  });
});
