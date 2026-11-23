import { AlertCircle, AlertTriangle, BadgeCheck, Check, CheckCircle2, Clock, Database, FileText, Loader, MessageCircle, Search, ShieldCheck, Upload, X } from 'lucide-react';
import { useMemo, useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import { Link } from 'react-router-dom';
import { LineChart } from '../../components/LineChart';
import { Modal } from '../../components/Modal';
import { Badge, Card, DemoBanner, PageHeader, StatCard, Toast } from '../../components/ui';
import { datasets as initialDatasets, diagnosticQueue, mentees, patients, type DiagnosticCase, type Risk } from '../../data/mock';
import { useToast } from '../../lib/useToast';

const riskTone = (r: Risk) => (r === 'High' ? 'red' : r === 'Moderate' ? 'amber' : 'green') as 'red' | 'amber' | 'green';
const initials = (name: string) => name.split(' ').map((p) => p[0]).slice(0, 2).join('');

/* ---------------- Overview ---------------- */
export function ProOverview() {
  const flagged = diagnosticQueue.filter((c) => c.status === 'flagged').length;
  return (
    <>
      <DemoBanner />
      <div className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 to-medical-600 p-8 text-white shadow-lg">
        <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15"><ShieldCheck className="h-7 w-7" /></span>
            <div>
              <h1 className="flex items-center gap-2 text-2xl font-bold">Dr. Michael Chen <BadgeCheck className="h-5 w-5 text-emerald-300" /></h1>
              <p className="text-sm text-white/80">Licence verification: pending (demo) · Cardiology & general practice</p>
            </div>
          </div>
          <Link to="/pro/queue" className="rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-indigo-600 hover:bg-white/90">Open AI queue ({flagged})</Link>
        </div>
      </div>
      <div className="mb-8 grid gap-6 md:grid-cols-3">
        <StatCard label="Pending AI reviews" value={String(flagged)} note="Needs human-in-the-loop verification" tone="amber" />
        <StatCard label="Active patients" value={String(patients.length)} note={`${patients.filter((p) => p.risk === 'High').length} high-risk`} />
        <StatCard label="Mentees" value={String(mentees.length)} note={`${mentees.reduce((n, m) => n + m.questions, 0)} open questions`} tone="indigo" />
      </div>
      <Card>
        <h2 className="mb-6 text-lg font-bold text-slate-900">Recent clinical activity</h2>
        <ol className="space-y-5">
          {[
            { icon: Check, tint: 'bg-emerald-50 text-emerald-700', title: 'AI report verified: #DRG-8921', text: 'MRI brain scan for M. Roberts, 98% confidence, signed off.', when: '2 hours ago' },
            { icon: AlertTriangle, tint: 'bg-amber-50 text-amber-700', title: 'Review flagged: #DRG-8922', text: 'ECG analysis for J. Davis at 74% confidence. Waiting for you.', when: '4 hours ago' },
            { icon: MessageCircle, tint: 'bg-medical-50 text-medical-700', title: 'Student question', text: 'Sarah Wilson asked about T-wave inversion.', when: 'Yesterday' },
          ].map(({ icon: Icon, tint, title, text, when }) => (
            <li key={title} className="flex gap-4">
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${tint}`}><Icon className="h-5 w-5" /></span>
              <div><p className="text-sm font-bold text-slate-900">{title}</p><p className="text-sm text-slate-500">{text}</p><p className="mt-1 text-xs text-slate-400">{when}</p></div>
            </li>
          ))}
        </ol>
      </Card>
    </>
  );
}

/* ---------------- Queue ---------------- */
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
  const toast = useToast();

  const shown = filter === 'all' ? cases : cases.filter((c) => c.status === filter);

  function submitVerdict() {
    if (!active || !note.trim()) return;
    // TODO(api): POST /cases/:id/verdict { note } — store reviewer id + timestamp in the audit log.
    setCases((cs) => cs.map((c) => (c.id === active.id ? { ...c, status: 'completed' } : c)));
    toast.show(`Verdict for #${active.id} signed and released.`);
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
      <div className="mb-4 flex flex-wrap gap-2" role="tablist" aria-label="Filter cases">
        {(['all', 'flagged', 'completed', 'processing'] as const).map((f) => (
          <button key={f} role="tab" aria-selected={filter === f} onClick={() => setFilter(f)} className={`rounded-full px-4 py-1.5 text-sm font-semibold capitalize ${filter === f ? 'bg-slate-950 text-white dark:bg-medical-600' : 'border border-slate-200 bg-surface text-slate-600'}`}>
            {f} <span className="ml-1 opacity-60">{f === 'all' ? cases.length : cases.filter((c) => c.status === f).length}</span>
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
                <td className="px-6 py-4">
                  {c.confidence === null ? <span className="text-slate-400">Calculating…</span> : (
                    <div className="w-32"><span className="text-xs font-bold">{c.confidence}%</span><div className="mt-1 h-1.5 rounded-full bg-slate-100"><div className={`h-1.5 rounded-full ${c.confidence < 80 ? 'bg-amber-400' : 'bg-emerald-500'}`} style={{ width: `${c.confidence}%` }} /></div></div>
                  )}
                </td>
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
            <textarea id="verdict" rows={4} value={note} onChange={(e) => setNote(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-surface p-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
            <div className="flex justify-end gap-3">
              <button onClick={() => setActive(null)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold">Cancel</button>
              <button onClick={submitVerdict} disabled={!note.trim()} className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">Submit final verdict</button>
            </div>
          </div>
        )}
      </Modal>
      <Toast message={toast.message} />
    </>
  );
}

/* ---------------- Patients ---------------- */
export function ProPatients() {
  const [q, setQ] = useState('');
  const [risk, setRisk] = useState<'' | Risk>('');
  const [selectedId, setSelectedId] = useState(patients[0].id);

  const shown = useMemo(
    () => patients.filter((p) => (!risk || p.risk === risk) && `${p.name} ${p.id} ${p.condition}`.toLowerCase().includes(q.toLowerCase())),
    [q, risk],
  );
  const p = patients.find((x) => x.id === selectedId) ?? patients[0];

  return (
    <>
      <PageHeader title="Patient directory" subtitle="Records, lab results and AI summaries for your patients." />
      <div className="grid gap-6 xl:grid-cols-[22rem_1fr]">
        <Card className="!p-4">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
            <input aria-label="Search patients" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name, ID or condition" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-medical-500" />
          </div>
          <div className="mb-3 flex gap-2" role="group" aria-label="Filter by risk">
            {(['', 'High', 'Moderate', 'Low'] as const).map((r) => (
              <button key={r || 'all'} onClick={() => setRisk(r)} aria-pressed={risk === r} className={`rounded-full px-3 py-1 text-xs font-semibold ${risk === r ? 'bg-medical-600 text-white' : 'bg-slate-100 text-slate-600'}`}>{r || 'All'}</button>
            ))}
          </div>
          <ul className="space-y-1">
            {shown.map((x) => (
              <li key={x.id}>
                <button onClick={() => setSelectedId(x.id)} aria-current={x.id === p.id} className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition ${x.id === p.id ? 'bg-medical-50 ring-1 ring-medical-200' : 'hover:bg-slate-50'}`}>
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">{initials(x.name)}</span>
                  <span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold text-slate-900">{x.name}</span><span className="block truncate text-xs text-slate-500">{x.id} · {x.condition}</span></span>
                  <Badge tone={riskTone(x.risk)}>{x.risk}</Badge>
                </button>
              </li>
            ))}
            {shown.length === 0 && <li className="p-6 text-center text-sm text-slate-500">No patients match.</li>}
          </ul>
        </Card>

        <div className="space-y-6">
          <Card>
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-4">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-lg font-bold text-indigo-700">{initials(p.name)}</span>
                <div><h2 className="text-xl font-bold text-slate-900">{p.name}</h2><p className="text-sm text-slate-500">{p.id} · {p.age} y · {p.sex} · last visit {p.lastVisit}</p></div>
              </div>
              <div className="flex items-center gap-2"><Badge tone="blue">{p.condition}</Badge><Badge tone={riskTone(p.risk)}>AI risk: {p.risk}</Badge></div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
              {[['Heart rate', `${p.vitals.hr} bpm`], ['Blood pressure', p.vitals.bp], ['SpO₂', `${p.vitals.spo2}%`], ['Temp', `${p.vitals.temp} °C`]].map(([k, v]) => (
                <div key={k} className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">{k}</p><p className="text-lg font-bold text-slate-900">{v}</p></div>
              ))}
            </div>
          </Card>

          <div className="rounded-2xl border border-medical-200 bg-medical-50 p-5">
            <p className="mb-1 flex items-center gap-2 text-sm font-bold text-medical-700"><ShieldCheck className="h-4 w-4" /> AI summary (needs clinician judgement)</p>
            <p className="text-sm text-slate-700">{p.aiSummary}</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <h3 className="mb-4 font-bold text-slate-900">Latest labs</h3>
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase text-slate-400"><tr><th className="pb-2">Test</th><th className="pb-2">Result</th><th className="pb-2">Ref.</th></tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {p.labs.map((l) => (
                    <tr key={l.test}>
                      <td className="py-2.5 font-medium text-slate-700">{l.test}</td>
                      <td className={`py-2.5 font-bold ${l.flag === 'normal' ? 'text-slate-900' : l.flag === 'high' ? 'text-red-600' : 'text-amber-600'}`}>{l.value}{l.flag !== 'normal' && <span className="ml-1 text-[10px] uppercase">{l.flag}</span>}</td>
                      <td className="py-2.5 text-slate-500">{l.range}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
            <Card>
              <h3 className="mb-2 font-bold text-slate-900">Systolic BP (last 7 readings)</h3>
              <LineChart height="h-44" label={`Systolic blood pressure trend for ${p.name}`} labels={['1', '2', '3', '4', '5', '6', '7']} series={[{ label: 'Systolic', data: p.bpTrend, color: '#6366f1' }]} />
            </Card>
          </div>

          <Card>
            <h3 className="mb-4 font-bold text-slate-900">Timeline</h3>
            <ol className="relative space-y-4 border-l border-slate-200 pl-6">
              {p.timeline.map((t) => (
                <li key={t.date + t.event} className="relative">
                  <span className="absolute -left-[1.85rem] top-1 h-3 w-3 rounded-full border-2 border-surface bg-medical-500" />
                  <p className="text-xs font-semibold text-slate-400">{t.date}</p>
                  <p className="text-sm text-slate-700">{t.event}</p>
                </li>
              ))}
            </ol>
          </Card>
        </div>
      </div>
    </>
  );
}

/* ---------------- Research ---------------- */
export function ProResearch() {
  const [files, setFiles] = useState<File[]>([]);
  const [drag, setDrag] = useState(false);
  const [checks, setChecks] = useState({ consent: false, deid: false, agreement: false });
  const [list, setList] = useState(initialDatasets);
  const inputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const addFiles = (incoming: FileList | null) => incoming && setFiles((f) => [...f, ...Array.from(incoming)].slice(0, 10));
  const onDrop = (e: DragEvent) => { e.preventDefault(); setDrag(false); addFiles(e.dataTransfer.files); };
  const ready = files.length > 0 && checks.consent && checks.deid && checks.agreement;
  const totalMb = files.reduce((n, f) => n + f.size, 0) / 1024 / 1024;

  function submit() {
    // TODO(api): upload to a private bucket; server runs de-identification + PII scan before review.
    setList((l) => [{ name: files.length === 1 ? files[0].name : `${files.length} files batch`, size: `${totalMb.toFixed(1)} MB`, records: 0, uploaded: new Date().toISOString().slice(0, 10), status: 'In review', consent: 100 }, ...l]);
    setFiles([]);
    setChecks({ consent: false, deid: false, agreement: false });
    toast.show('Submitted for de-identification and review (demo: nothing was uploaded).');
  }

  const published = list.filter((d) => d.status === 'Published');
  const statusTone = (s: string) => (s === 'Published' ? 'green' : s.startsWith('Rejected') ? 'red' : 'amber') as 'green' | 'red' | 'amber';

  return (
    <>
      <PageHeader title="Research hub" subtitle="Contribute de-identified datasets to improve the models." />
      <div className="mb-8 grid gap-6 md:grid-cols-3">
        <StatCard label="Datasets published" value={String(published.length)} note="Available to model training" tone="emerald" />
        <StatCard label="Records contributed" value={published.reduce((n, d) => n + d.records, 0).toLocaleString()} note="After de-identification" />
        <StatCard label="In review" value={String(list.filter((d) => d.status === 'In review').length)} note="PII scan + ethics check" tone="amber" />
      </div>
      <div className="grid gap-8 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <h2 className="mb-4 text-lg font-bold text-slate-900">Upload dataset</h2>
          <div
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={onDrop}
            className={`rounded-2xl border-2 border-dashed p-8 text-center transition ${drag ? 'border-medical-500 bg-medical-50' : 'border-slate-200'}`}
          >
            <span className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-medical-50 text-medical-600"><Upload className="h-7 w-7" /></span>
            <p className="font-semibold text-slate-900">Drag & drop files</p>
            <p className="mb-4 text-xs text-slate-500">CSV, DICOM or ZIP · up to 10 files</p>
            <button onClick={() => inputRef.current?.click()} className="rounded-xl border border-slate-200 bg-surface px-4 py-2 text-sm font-semibold hover:bg-slate-50">Browse files</button>
            <input ref={inputRef} type="file" multiple accept=".csv,.dcm,.zip" className="hidden" onChange={(e: ChangeEvent<HTMLInputElement>) => addFiles(e.target.files)} />
          </div>
          {files.length > 0 && (
            <ul className="mt-4 space-y-2">
              {files.map((f, i) => (
                <li key={f.name + i} className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2 text-sm">
                  <FileText className="h-4 w-4 text-slate-400" /><span className="min-w-0 flex-1 truncate">{f.name}</span><span className="text-xs text-slate-400">{(f.size / 1024).toFixed(0)} KB</span>
                  <button aria-label={`Remove ${f.name}`} onClick={() => setFiles((all) => all.filter((_, j) => j !== i))} className="text-slate-400 hover:text-red-500"><X className="h-4 w-4" /></button>
                </li>
              ))}
            </ul>
          )}
          <fieldset className="mt-5 space-y-3 text-sm text-slate-600">
            <legend className="mb-2 font-semibold text-slate-900">Before you submit</legend>
            {([['consent', 'Every record has documented patient consent'], ['deid', 'Direct identifiers removed (names, IDs, dates of birth, faces)'], ['agreement', 'Covered by a signed data-sharing agreement']] as const).map(([k, label]) => (
              <label key={k} className="flex items-start gap-3"><input type="checkbox" checked={checks[k]} onChange={(e) => setChecks((c) => ({ ...c, [k]: e.target.checked }))} className="mt-0.5 h-4 w-4" /> {label}</label>
            ))}
          </fieldset>
          <button onClick={submit} disabled={!ready} className="mt-5 w-full rounded-xl bg-medical-600 py-3 text-sm font-bold text-white hover:bg-medical-700 disabled:opacity-50">Submit for review</button>
        </Card>

        <Card className="lg:col-span-3 !p-0">
          <h2 className="p-6 pb-2 text-lg font-bold text-slate-900">My contributions</h2>
          <ul className="divide-y divide-slate-100">
            {list.map((d) => (
              <li key={d.name + d.uploaded} className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500"><Database className="h-5 w-5" /></span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-slate-900">{d.name}</p>
                  <p className="text-xs text-slate-500">{d.size} · {d.records ? `${d.records.toLocaleString()} records · ` : ''}uploaded {d.uploaded} · consent {d.consent}%</p>
                </div>
                <Badge tone={statusTone(d.status)}>{d.status}</Badge>
              </li>
            ))}
          </ul>
        </Card>
      </div>
      <Toast message={toast.message} />
    </>
  );
}

/* ---------------- Students / mentorship ---------------- */
export function ProStudents() {
  const [open, setOpen] = useState<(typeof mentees)[number] | null>(null);
  const [reply, setReply] = useState('');
  const toast = useToast();

  return (
    <>
      <PageHeader title="Mentorship" subtitle="Oversee students and review their diagnostic simulations." />
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {mentees.map((m) => (
          <Card key={m.name} className="flex flex-col">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-50 font-bold text-purple-700">{initials(m.name)}</span>
              <div className="min-w-0 flex-1"><h2 className="truncate font-bold text-slate-900">{m.name}</h2><p className="truncate text-xs text-slate-500">{m.program}</p></div>
              {m.questions > 0 && <Badge tone="amber">{m.questions} question{m.questions > 1 ? 's' : ''}</Badge>}
            </div>
            <p className="mb-1 text-xs font-semibold text-slate-500">Active module</p>
            <p className="mb-3 text-sm font-bold text-slate-900">{m.module}</p>
            <div className="mb-1 flex justify-between text-xs font-semibold text-slate-600"><span>Progress</span><span>{m.progress}%</span></div>
            <div className="mb-4 h-2 rounded-full bg-slate-100" role="progressbar" aria-valuenow={m.progress} aria-valuemin={0} aria-valuemax={100} aria-label={`${m.name} progress`}><div className="h-2 rounded-full bg-purple-500" style={{ width: `${m.progress}%` }} /></div>
            <div className="mb-5 grid grid-cols-2 gap-3 text-center">
              <div className="rounded-xl bg-slate-50 p-3"><p className="text-lg font-bold text-slate-900">{m.quiz}%</p><p className="text-xs text-slate-500">Avg quiz</p></div>
              <div className="rounded-xl bg-slate-50 p-3"><p className="text-lg font-bold text-slate-900">{m.sims} h</p><p className="text-xs text-slate-500">Simulations</p></div>
            </div>
            <button onClick={() => setOpen(m)} className="mt-auto w-full rounded-xl bg-purple-50 py-2.5 text-sm font-semibold text-purple-700 hover:bg-purple-100">Review progress</button>
          </Card>
        ))}
      </div>

      <Modal open={open !== null} onClose={() => setOpen(null)} title={`${open?.name ?? ''}: progress`}>
        {open && (
          <div className="space-y-5">
            <LineChart height="h-48" label={`Quiz scores over the last 7 attempts for ${open.name}`} labels={['1', '2', '3', '4', '5', '6', '7']} series={[{ label: 'Quiz score', data: open.scores, color: '#a855f7' }]} />
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2 text-slate-700"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Passed "ST elevation" simulation (94%)</li>
              <li className="flex items-center gap-2 text-slate-700"><Clock className="h-4 w-4 text-amber-500" /> "T-wave inversion" retry scheduled</li>
            </ul>
            {open.questions > 0 && (
              <div>
                <label htmlFor="mentor-reply" className="mb-1.5 block text-sm font-semibold text-slate-700">Reply to open question</label>
                <textarea id="mentor-reply" rows={3} value={reply} onChange={(e) => setReply(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-surface p-3 text-sm outline-none focus:ring-2 focus:ring-purple-500" placeholder="Explain, or link a module…" />
              </div>
            )}
            <div className="flex justify-end gap-3">
              <button onClick={() => setOpen(null)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold">Close</button>
              {open.questions > 0 && <button disabled={!reply.trim()} onClick={() => { toast.show(`Reply sent to ${open.name}.`); setReply(''); setOpen(null); }} className="rounded-xl bg-purple-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">Send reply</button>}
            </div>
          </div>
        )}
      </Modal>
      <Toast message={toast.message} />
    </>
  );
}
