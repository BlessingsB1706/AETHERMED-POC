import { AlertCircle, Check, Loader, Upload } from 'lucide-react';
import { useState } from 'react';
import { Modal } from '../../components/Modal';
import { Badge, Card, DemoBanner, PageHeader, StatCard } from '../../components/ui';
import { diagnosticQueue, type DiagnosticCase } from '../../data/mock';

export function ProOverview() {
  const flagged = diagnosticQueue.filter((c) => c.status === 'flagged').length;
  return (
    <>
      <DemoBanner />
      <PageHeader title="Professional overview" subtitle="Licence verification: pending (demo)" />
      <div className="grid gap-6 md:grid-cols-3">
        <StatCard label="Pending AI reviews" value={String(flagged)} note="Needs human-in-the-loop verification" tone="amber" />
        <StatCard label="Active patients" value="142" note="Cardiology & general practice" />
        <StatCard label="Datasets contributed" value="12" unit="GB" note="De-identified, consented" tone="emerald" />
      </div>
    </>
  );
}

function StatusBadge({ status }: { status: DiagnosticCase['status'] }) {
  if (status === 'flagged') return <Badge tone="amber"><AlertCircle className="mr-1 h-3 w-3" /> Flagged</Badge>;
  if (status === 'completed') return <Badge tone="green"><Check className="mr-1 h-3 w-3" /> Completed</Badge>;
  return <Badge><Loader className="mr-1 h-3 w-3 animate-spin" /> Processing</Badge>;
}

export function ProQueue() {
  const [cases, setCases] = useState(diagnosticQueue);
  const [active, setActive] = useState<DiagnosticCase | null>(null);
  const [note, setNote] = useState('');
  const [filter, setFilter] = useState<'all' | DiagnosticCase['status']>('all');

  const shown = filter === 'all' ? cases : cases.filter((c) => c.status === filter);

  function submitVerdict() {
    if (!active || !note.trim()) return;
    // TODO(api): POST /cases/:id/verdict { note } — store reviewer id + timestamp in the audit log.
    setCases((cs) => cs.map((c) => (c.id === active.id ? { ...c, status: 'completed' } : c)));
    setActive(null);
    setNote('');
  }

  return (
    <>
      <PageHeader
        title="AI diagnostic queue"
        subtitle="Incoming cases and human-in-the-loop review."
        action={<button className="flex items-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"><Upload className="mr-2 h-4 w-4" /> Upload scan</button>}
      />
      <div className="mb-4 flex gap-2" role="tablist" aria-label="Filter cases">
        {(['all', 'flagged', 'completed', 'processing'] as const).map((f) => (
          <button key={f} role="tab" aria-selected={filter === f} onClick={() => setFilter(f)} className={`rounded-full px-4 py-1.5 text-sm font-semibold capitalize ${filter === f ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>
            {f}
          </button>
        ))}
      </div>
      <Card className="overflow-x-auto !p-0">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr><th className="px-6 py-3">Case</th><th className="px-6 py-3">Patient</th><th className="px-6 py-3">AI confidence</th><th className="px-6 py-3">Status</th><th className="px-6 py-3"><span className="sr-only">Action</span></th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {shown.map((c) => (
              <tr key={c.id}>
                <td className="px-6 py-4"><p className="font-bold text-slate-900">#{c.id}</p><p className="text-xs text-slate-500">{c.type} ({c.specialty})</p></td>
                <td className="px-6 py-4">{c.patient}</td>
                <td className="px-6 py-4">{c.confidence === null ? 'Calculating…' : `${c.confidence}%`}</td>
                <td className="px-6 py-4"><StatusBadge status={c.status} /></td>
                <td className="px-6 py-4 text-right">
                  {c.status === 'flagged' && <button onClick={() => setActive(c)} className="rounded-lg bg-indigo-50 px-4 py-1.5 font-semibold text-indigo-700 hover:bg-indigo-100">Review</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Modal open={active !== null} onClose={() => setActive(null)} title={`Diagnostic review #${active?.id ?? ''}`}>
        {active && (
          <div className="space-y-4">
            <p className="text-sm text-slate-500">Patient: {active.patient} · {active.type}</p>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="font-bold text-amber-800">AI confidence: {active.confidence}%</p>
              <ul className="mt-2 list-disc pl-5 text-sm text-amber-900">{active.findings.map((f) => <li key={f}>{f}</li>)}</ul>
            </div>
            <label htmlFor="verdict" className="block text-sm font-semibold text-slate-700">Clinician assessment (required)</label>
            <textarea id="verdict" rows={4} value={note} onChange={(e) => setNote(e.target.value)} className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
            <div className="flex justify-end gap-3">
              <button onClick={() => setActive(null)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold">Cancel</button>
              <button onClick={submitVerdict} disabled={!note.trim()} className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">Submit final verdict</button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

export function ProPatients() {
  return (
    <>
      <PageHeader title="Patient directory" subtitle="Records, lab results and AI summaries." />
      <Card className="max-w-sm"><h2 className="font-bold">John Davis</h2><p className="text-xs text-slate-500">ID PT-8472 · Age 45 · Hypertension</p><div className="mt-3"><Badge tone="green">AI risk: low</Badge></div></Card>
    </>
  );
}

export function ProResearch() {
  return (
    <>
      <PageHeader title="Research hub" subtitle="Contribute de-identified datasets to improve the models." />
      <Card className="border-2 border-dashed text-center">
        <Upload className="mx-auto mb-3 h-8 w-8 text-slate-400" />
        <p className="font-semibold">Drag & drop files</p>
        <p className="text-xs text-slate-500">CSV, DICOM or ZIP. De-identification runs server-side before anything is stored.</p>
      </Card>
    </>
  );
}

export function ProStudents() {
  return (
    <>
      <PageHeader title="Mentorship" subtitle="Oversee students and review their diagnostic simulations." />
      <Card className="max-w-sm"><h2 className="font-bold">Sarah Wilson</h2><p className="text-xs text-slate-500">MedLab student · ECG Interpretation · 92.4% avg quiz</p></Card>
    </>
  );
}
