/** Layer 1 — deterministic lab-result review. No AI here: every flag is a named, versioned rule. */

export type Analyte = 'K' | 'NA' | 'GLU' | 'CREA' | 'HB' | 'WBC' | 'ANC' | 'PLT' | 'INR' | 'MCHC';
export type Sex = 'F' | 'M';

export interface Patient {
  id: string;
  sex: Sex;
  ageYears: number;
  /** true / false when known (genotype or phenotype test); undefined when unknown. */
  duffyNull?: boolean;
  onAnticoagulant?: boolean;
}

export interface LabResult {
  analyte: Analyte;
  value: number;
  unit: string;
  /** ISO timestamp of sample collection. */
  collectedAt: string;
}

/** Serum indices / handling info reported by the analyser or the sample-reception desk. */
export interface SampleQuality {
  hemolysisIndex?: number;
  lipemiaIndex?: number;
  clotted?: boolean;
  hoursToProcessing?: number;
}

export interface LabReport {
  id: string;
  patient: Patient;
  results: LabResult[];
  sample: SampleQuality;
}

export type Severity = 'info' | 'warning' | 'critical';
export type RuleKind = 'range' | 'critical' | 'delta' | 'plausibility' | 'quality' | 'consistency' | 'scope';

/** What the lab should do with the whole report. Ordered from least to most urgent. */
export type Decision = 'auto-verify' | 'needs-review' | 'recollect' | 'critical-call';

export interface Flag {
  /** Stable id, e.g. "K.critical.high" — logged with every report for audit. */
  ruleId: string;
  kind: RuleKind;
  severity: Severity;
  analyte?: Analyte;
  message: string;
  /** The numbers that triggered the rule, so a human can check it. */
  evidence: string;
  action: string;
  decision: Decision;
}

export interface Evaluation {
  reportId: string;
  rulesetVersion: string;
  decision: Decision;
  flags: Flag[];
  /** Results converted to the ruleset's canonical units. Unconvertible results are dropped and flagged. */
  normalized: LabResult[];
}
