import { AlertTriangle, CheckCircle2, FlaskConical, Info, PhoneCall, RotateCcw, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Badge, Card, DemoBanner, PageHeader } from '../../components/ui';
import { labCases } from '../../data/mock';
import { ANALYTES, evaluate, referenceRangeFor, RULESET_VERSION, type Decision, type Flag } from '../../lib/labRules';

const DECISION_UI: Record<Decision, { label: string; text: string; cls: string; icon: typeof CheckCircle2 }> = {
  'auto-verify': { label: 'Auto-verify', text: 'All rules passed. Safe to release without manual review.', cls: 'border-emerald-200 bg-emerald-50 text-emerald-700', icon: CheckCircle2 },
  'needs-review': { label: 'Needs review', text: 'A qualified reviewer must check the flags before release.', cls: 'border-amber-200 bg-amber-50 text-amber-800', icon: Search },
  recollect: { label: 'Recollect sample', text: 'Some results are unreliable on this sample. Do not release them.', cls: 'border-indigo-200 bg-indigo-50 text-indigo-700', icon: RotateCcw },
  'critical-call': { label: 'Critical: phone now', text: 'Call the requesting clinician immediately and document the call.', cls: 'border-red-200 bg-red-50 text-red-700', icon: PhoneCall },
};

const flagIcon = (f: Flag) => (f.severity === 'critical' ? PhoneCall : f.severity === 'info' ? Info : AlertTriangle);
const flagTint = (f: Flag) => (f.severity === 'critical' ? 'text-red-600' : f.severity === 'info' ? 'text-medical-600' : 'text-amber-600');

export function ProLabReview() {
  const [idx, setIdx] = useState(0);
  const c = labCases[idx];
  const evaluation = useMemo(() => evaluate(c.report, c.history), [c]);
  const ui = DECISION_UI[evaluation.decision];
  const flagsFor = (a: string) => evaluation.flags.filter((f) => f.analyte === a);

  return (
    <>
      <DemoBanner />
      <PageHeader
        title="Lab review (Layer 1 rules engine)"
        subtitle="Deterministic, versioned rules. No AI: every flag names the rule that fired and the numbers behind it."
        action={<Badge tone="blue">Ruleset {RULESET_VERSION}</Badge>}
      />

      <div className="mb-6 flex flex-wrap gap-2" role="tablist" aria-label="Sample reports">
        {labCases.map((x, i) => (
          <button key={x.report.id} role="tab" aria-selected={i === idx} onClick={() => setIdx(i)} className={`rounded-full px-4 py-2 text-sm font-semibold ${i === idx ? 'bg-medical-600 text-white' : 'border border-slate-200 bg-surface text-slate-600 hover:bg-slate-50'}`}>
            {x.title}
          </button>
        ))}
      </div>

      <div className={`mb-6 flex items-start gap-4 rounded-2xl border p-5 ${ui.cls}`}>
        <ui.icon className="mt-0.5 h-6 w-6 shrink-0" />
        <div>
          <p className="text-lg font-bold">{ui.label}</p>
          <p className="text-sm">{ui.text}</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-5">
        <Card className="xl:col-span-3 overflow-x-auto !p-0">
          <div className="flex items-center gap-3 p-6 pb-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-medical-50 text-medical-600"><FlaskConical className="h-5 w-5" /></span>
            <div>
              <h2 className="font-bold text-slate-900">{c.report.id} · {c.report.patient.id}</h2>
              <p className="text-xs text-slate-500">
                {c.report.patient.sex === 'F' ? 'Female' : 'Male'}, {c.report.patient.ageYears} y
                {c.report.patient.onAnticoagulant ? ' · on anticoagulant' : ''}
                {' · Duffy status '}{c.report.patient.duffyNull === undefined ? 'unknown' : c.report.patient.duffyNull ? 'null' : 'positive'}
              </p>
            </div>
          </div>
          <p className="px-6 pb-4 text-sm text-slate-600">{c.story}</p>
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr><th className="px-6 py-3">Test</th><th className="px-6 py-3">As received</th><th className="px-6 py-3">Canonical</th><th className="px-6 py-3">Reference used</th><th className="px-6 py-3">Rules</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {c.report.results.map((r) => {
                const def = ANALYTES[r.analyte];
                const norm = evaluation.normalized.find((n) => n.analyte === r.analyte);
                const range = referenceRangeFor(r.analyte, c.report.patient);
                const fs = flagsFor(r.analyte);
                return (
                  <tr key={r.analyte}>
                    <td className="px-6 py-3 font-semibold text-slate-900">{def.name}</td>
                    <td className="px-6 py-3 text-slate-600">{r.value} {r.unit}</td>
                    <td className="px-6 py-3 font-semibold text-slate-900">{norm ? `${norm.value} ${def.unit}` : '—'}</td>
                    <td className="px-6 py-3 text-slate-500">{range.low}–{range.high}</td>
                    <td className="px-6 py-3">
                      {fs.length === 0 ? <Badge tone="green">pass</Badge> : fs.map((f) => <Badge key={f.ruleId} tone={f.severity === 'critical' ? 'red' : f.severity === 'info' ? 'blue' : 'amber'}>{f.kind}</Badge>)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {c.history.length > 0 && <p className="px-6 py-4 text-xs text-slate-500">Compared with {c.history.length} earlier report(s) for delta checks.</p>}
        </Card>

        <Card className="xl:col-span-2">
          <h2 className="mb-4 font-bold text-slate-900">Flags ({evaluation.flags.length})</h2>
          {evaluation.flags.length === 0 && <p className="text-sm text-slate-500">No rule fired.</p>}
          <ul className="space-y-4">
            {evaluation.flags.map((f) => {
              const Icon = flagIcon(f);
              return (
                <li key={f.ruleId} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <p className={`flex items-start gap-2 text-sm font-semibold ${flagTint(f)}`}><Icon className="mt-0.5 h-4 w-4 shrink-0" />{f.message}</p>
                  <p className="mt-2 text-xs text-slate-500"><span className="font-semibold text-slate-600">Evidence:</span> {f.evidence}</p>
                  <p className="text-xs text-slate-500"><span className="font-semibold text-slate-600">Action:</span> {f.action}</p>
                  <p className="mt-2 font-mono text-[11px] text-slate-400">{f.ruleId}</p>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>
      <p className="mt-6 text-xs text-slate-500">Reference values are illustrative adult ranges. A lab's pathologist must validate every range, limit and analyser index before real use.</p>
    </>
  );
}
