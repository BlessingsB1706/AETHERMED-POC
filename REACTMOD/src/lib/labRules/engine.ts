import { ADULT_MIN_AGE, ANALYTES, ANC_DUFFY_NULL, QUALITY, RULESET_VERSION, referenceRangeFor } from './ruleset';
import type { Analyte, Decision, Evaluation, Flag, LabReport, LabResult } from './types';
import { toCanonical } from './units';

const PRIORITY: Decision[] = ['auto-verify', 'needs-review', 'recollect', 'critical-call'];
const worst = (a: Decision, b: Decision) => (PRIORITY.indexOf(b) > PRIORITY.indexOf(a) ? b : a);
const hoursBetween = (a: string, b: string) => Math.abs(new Date(a).getTime() - new Date(b).getTime()) / 3.6e6;
const fmt = (n: number) => String(Math.round(n * 100) / 100);

/**
 * Evaluate one report against the ruleset. Pure function: same input + same ruleset = same output.
 * @param history earlier reports for the same patient (any order), used for delta checks.
 */
export function evaluate(report: LabReport, history: LabReport[] = []): Evaluation {
  const flags: Flag[] = [];
  const { patient, sample } = report;

  // ---- scope: this ruleset only covers adults ----
  if (patient.ageYears < ADULT_MIN_AGE) {
    flags.push({
      ruleId: 'SCOPE.pediatric', kind: 'scope', severity: 'warning',
      message: 'Pediatric patient: this ruleset only has adult reference ranges.',
      evidence: `age ${patient.ageYears} y`, action: 'Manual review against pediatric ranges.', decision: 'needs-review',
    });
  }

  // ---- normalize units ----
  const normalized: LabResult[] = [];
  for (const r of report.results) {
    const v = toCanonical(r.analyte, r.value, r.unit);
    if (v === null) {
      flags.push({
        ruleId: `${r.analyte}.unit.unknown`, kind: 'plausibility', severity: 'warning', analyte: r.analyte,
        message: `Unit "${r.unit}" is not recognised for ${ANALYTES[r.analyte].name}.`,
        evidence: `${r.value} ${r.unit}`, action: 'Check the analyser interface mapping.', decision: 'needs-review',
      });
      continue;
    }
    normalized.push({ ...r, value: v, unit: ANALYTES[r.analyte].unit });
  }

  // ---- sample quality: work out which analytes are compromised ----
  const compromised = new Map<Analyte, string>();
  const hemolysed = (sample.hemolysisIndex ?? 0) >= QUALITY.hemolysisIndexLimit;
  const lipemic = (sample.lipemiaIndex ?? 0) >= QUALITY.lipemiaIndexLimit;
  for (const r of normalized) {
    if (hemolysed && QUALITY.hemolysisAffects.includes(r.analyte)) compromised.set(r.analyte, `hemolysis index ${sample.hemolysisIndex} ≥ ${QUALITY.hemolysisIndexLimit}`);
    if (lipemic && QUALITY.lipemiaAffects.includes(r.analyte)) compromised.set(r.analyte, `lipemia index ${sample.lipemiaIndex} ≥ ${QUALITY.lipemiaIndexLimit}`);
    if (sample.clotted && QUALITY.clotAffects.includes(r.analyte)) compromised.set(r.analyte, 'sample reported clotted');
  }
  for (const [analyte, why] of compromised) {
    flags.push({
      ruleId: `QC.${analyte}.compromised`, kind: 'quality', severity: 'warning', analyte,
      message: `${ANALYTES[analyte].name} is unreliable on this sample; result withheld.`,
      evidence: why, action: 'Request a new sample. Do not release this result.', decision: 'recollect',
    });
  }
  if (normalized.some((r) => r.analyte === 'GLU') && (sample.hoursToProcessing ?? 0) > QUALITY.glucoseMaxHoursUnspun) {
    flags.push({
      ruleId: 'QC.GLU.delayed', kind: 'quality', severity: 'warning', analyte: 'GLU',
      message: 'Delayed processing: glucose may be falsely low (cells keep consuming it).',
      evidence: `${sample.hoursToProcessing} h to processing > ${QUALITY.glucoseMaxHoursUnspun} h`,
      action: 'Interpret with caution, or recollect in a fluoride tube.', decision: 'needs-review',
    });
  }

  // ---- per-result rules ----
  for (const r of normalized) {
    if (compromised.has(r.analyte)) continue;
    const def = ANALYTES[r.analyte];
    const label = `${fmt(r.value)} ${def.unit}`.trim();

    // 1. plausibility first: an impossible value makes every other rule meaningless
    if (r.value < def.plausible.low || r.value > def.plausible.high) {
      flags.push({
        ruleId: `${r.analyte}.implausible`, kind: 'plausibility', severity: 'warning', analyte: r.analyte,
        message: `${def.name} ${label} is outside what is physiologically possible.`,
        evidence: `plausible ${def.plausible.low}–${def.plausible.high}`,
        action: 'Check sample identity and data entry, then rerun.', decision: 'needs-review',
      });
      continue;
    }

    // 2. critical values: phone the clinician now; otherwise 3. reference range
    const c = def.critical;
    const critLow = c?.low !== undefined && r.value < c.low;
    const critHigh = c?.high !== undefined && r.value > c.high;
    if (critLow || critHigh) {
      const side = critLow ? 'low' : 'high';
      flags.push({
        ruleId: `${r.analyte}.critical.${side}`, kind: 'critical', severity: 'critical', analyte: r.analyte,
        message: `CRITICAL ${side} ${def.name}: ${label}.`,
        evidence: critLow ? `< ${c?.low}` : `> ${c?.high}`,
        action: 'Phone the requesting clinician now and document the call (who, when, read-back).', decision: 'critical-call',
      });
    } else {
      const range = referenceRangeFor(r.analyte, patient);
      if (r.value < range.low || r.value > range.high) {
        const side = r.value < range.low ? 'low' : 'high';
        // Unknown Duffy status + value inside the Duffy-null interval: likely normal for this person.
        const duffyHint = r.analyte === 'ANC' && side === 'low' && patient.duffyNull === undefined && r.value >= ANC_DUFFY_NULL.low;
        flags.push({
          ruleId: duffyHint ? 'ANC.range.low.duffy-unknown' : `${r.analyte}.range.${side}`,
          kind: 'range', severity: duffyHint ? 'info' : 'warning', analyte: r.analyte,
          message: duffyHint
            ? `ANC ${label} is below the standard range but inside the Duffy-null range.`
            : `${def.name} ${side}: ${label}.`,
          evidence: duffyHint
            ? `standard ${range.low}–${range.high}; Duffy-null ${ANC_DUFFY_NULL.low}–${ANC_DUFFY_NULL.high}`
            : `reference ${range.low}–${range.high} (${range.source})`,
          action: duffyHint
            ? 'Consider Duffy status before labelling this neutropenia.'
            : 'Reviewer checks against clinical context before release.',
          decision: 'needs-review',
        });
      }
    }

    // 4. delta check against the most recent earlier result in the window
    if (def.delta) {
      const prev = history
        .flatMap((h) => h.results.filter((x) => x.analyte === r.analyte))
        .map((x) => ({ ...x, value: toCanonical(x.analyte, x.value, x.unit) }))
        .filter((x): x is LabResult => x.value !== null && new Date(x.collectedAt) < new Date(r.collectedAt))
        .sort((a, b) => b.collectedAt.localeCompare(a.collectedAt))[0];
      if (prev && hoursBetween(prev.collectedAt, r.collectedAt) <= def.delta.withinHours) {
        const diff = r.value - prev.value;
        const pct = prev.value ? Math.abs(diff / prev.value) * 100 : 0;
        const absHit = def.delta.abs !== undefined && Math.abs(diff) >= def.delta.abs;
        const pctHit = def.delta.pct !== undefined && pct >= def.delta.pct;
        if (absHit || pctHit) {
          flags.push({
            ruleId: `DELTA.${r.analyte}`, kind: 'delta', severity: 'warning', analyte: r.analyte,
            message: `${def.name} changed ${diff > 0 ? '+' : ''}${fmt(diff)} ${def.unit} (${fmt(pct)}%) in ${fmt(hoursBetween(prev.collectedAt, r.collectedAt))} h.`,
            evidence: `previous ${fmt(prev.value)}; limit ${def.delta.abs !== undefined ? `±${def.delta.abs}` : `±${def.delta.pct}%`} within ${def.delta.withinHours} h`,
            action: 'Confirm sample identity (wrong-patient check), then review clinically.', decision: 'needs-review',
          });
        }
      }
    }
  }

  // ---- 5. cross-result consistency ----
  const mchc = normalized.find((r) => r.analyte === 'MCHC' && !compromised.has('MCHC'));
  if (mchc && mchc.value > 37 && mchc.value <= ANALYTES.MCHC.plausible.high) {
    flags.push({
      ruleId: 'CONSISTENCY.MCHC.high', kind: 'consistency', severity: 'warning', analyte: 'MCHC',
      message: 'MCHC above 37 g/dL is rarely real: suggests lipemia, cold agglutinins or an analytical error.',
      evidence: `MCHC ${fmt(mchc.value)} g/dL`, action: 'Warm the sample or check for lipemia, then rerun.', decision: 'needs-review',
    });
  }

  const decision = flags.reduce<Decision>((d, f) => worst(d, f.decision), 'auto-verify');
  return { reportId: report.id, rulesetVersion: RULESET_VERSION, decision, flags, normalized };
}
