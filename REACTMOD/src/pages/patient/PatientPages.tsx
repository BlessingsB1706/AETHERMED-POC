import { useState } from 'react';
import { ChatPanel } from '../../components/ChatPanel';
import { LineChart } from '../../components/LineChart';
import { Badge, Card, DemoBanner, PageHeader, StatCard } from '../../components/ui';
import { careerMatches, courses, healthTrend, patientVitals, studentStats, studyTrend, weekLabels } from '../../data/mock';
import { useAuth } from '../../lib/auth';

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}

export function PatientOverview() {
  const { user } = useAuth();
  const [mode, setMode] = useState<'health' | 'student'>(user?.role === 'student' ? 'student' : 'health');
  const stats = mode === 'health' ? patientVitals : studentStats;

  return (
    <>
      <DemoBanner />
      <PageHeader
        title={`${greeting()}, ${user?.name.split(' ')[0] ?? ''}!`}
        subtitle="Your daily overview across the AetherMed ecosystem."
        action={
          <div role="tablist" aria-label="Dashboard view" className="inline-grid grid-cols-2 rounded-xl bg-slate-200 p-1">
            {(['health', 'student'] as const).map((m) => (
              <button key={m} role="tab" aria-selected={mode === m} onClick={() => setMode(m)} className={`rounded-lg px-6 py-2.5 text-sm font-semibold ${mode === m ? 'bg-surface text-medical-600 shadow-sm' : 'text-slate-500'}`}>
                {m === 'health' ? 'Patient view' : 'Student view'}
              </button>
            ))}
          </div>
        }
      />
      <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => <StatCard key={s.label} {...s} />)}
      </div>
      <div className="grid gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h2 className="mb-6 text-lg font-bold text-slate-900">{mode === 'health' ? 'Health trends (last 7 days)' : 'Study hours (last 7 days)'}</h2>
          {mode === 'health' ? (
            <LineChart label="Activity and sleep scores for the last 7 days" labels={weekLabels} series={[{ label: 'Activity score', data: healthTrend.activity, color: '#3b82f6' }, { label: 'Sleep score', data: healthTrend.sleep, color: '#10b981', dashed: true }]} />
          ) : (
            <LineChart label="Study hours for the last 7 days" labels={weekLabels} series={[{ label: 'Study hours', data: studyTrend, color: '#8b5cf6' }]} />
          )}
        </Card>
        <Card>
          <h2 className="mb-6 text-lg font-bold text-slate-900">Upcoming</h2>
          <ul className="space-y-4">
            <li className="rounded-xl border border-slate-100 bg-slate-50 p-4"><Badge tone="blue">Appointment</Badge><p className="mt-2 text-sm font-bold">Cardiology follow-up</p><p className="text-xs text-slate-500">Tomorrow, 10:00 · Dr. Michael Chen</p></li>
            <li className="rounded-xl border border-slate-100 bg-slate-50 p-4"><Badge>Simulation</Badge><p className="mt-2 text-sm font-bold">Virtual ECG Diagnostics Lab</p><p className="text-xs text-slate-500">Thursday, 14:00 · 45 min</p></li>
          </ul>
        </Card>
      </div>
    </>
  );
}

export function PatientAssistant() {
  const { user } = useAuth();
  return (
    <Card className="flex h-[calc(100vh-9rem)] flex-col overflow-hidden !p-0">
      <div className="flex items-center gap-3 bg-medical-600 px-6 py-4 text-white">
        <img src="/aether_ai.png" alt="" className="h-10 w-10 rounded-full border-2 border-white/20 bg-surface" />
        <div><p className="font-bold">Aether AI</p><p className="text-xs text-medical-100">Personal assistant</p></div>
      </div>
      <div className="min-h-0 flex-1">
        <ChatPanel context="patient" greeting={`Hello ${user?.name.split(' ')[0] ?? ''}. Ask me about your results, symptoms or your current study module.`} />
      </div>
    </Card>
  );
}

export function PatientLearning() {
  return (
    <>
      <PageHeader title="Learning Hub" subtitle="Pick up where you left off or start a new module." />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((c) => (
          <Card key={c.title} className="flex flex-col">
            <h2 className="mb-1 text-lg font-bold text-slate-900">{c.title}</h2>
            <p className="mb-4 text-xs text-slate-500">{c.author}</p>
            <div className="mt-auto">
              <div className="mb-1 flex justify-between text-xs font-semibold"><span>Completion</span><span>{c.progress}%</span></div>
              <div className="mb-4 h-2 rounded-full bg-slate-100" role="progressbar" aria-valuenow={c.progress} aria-valuemin={0} aria-valuemax={100} aria-label={`${c.title} progress`}>
                <div className="h-2 rounded-full bg-medical-500" style={{ width: `${c.progress}%` }} />
              </div>
              <button className="w-full rounded-xl bg-medical-50 py-2.5 text-sm font-semibold text-medical-700 hover:bg-medical-100">{c.progress ? 'Resume' : 'Start course'}</button>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}

export function PatientCareer() {
  return (
    <>
      <PageHeader title="Career Match" subtitle="Roles matched to your verified progress in the Learning Hub." />
      <div className="space-y-4">
        {careerMatches.map((j) => (
          <Card key={j.title} className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-900">{j.title}</h2>
              <p className="text-sm text-slate-500">{j.org} · {j.location}</p>
              <div className="mt-2 flex gap-2">{j.tags.map((t) => <Badge key={t}>{t}</Badge>)}</div>
            </div>
            <div className="flex items-center gap-3"><Badge tone="green">{j.match}% match</Badge><button className="rounded-lg bg-slate-950 dark:bg-medical-600 px-6 py-2 text-sm font-semibold text-white hover:bg-medical-600">Apply</button></div>
          </Card>
        ))}
      </div>
    </>
  );
}
