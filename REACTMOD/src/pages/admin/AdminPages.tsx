import { Activity, AlertTriangle, CheckCircle2, Cpu, Download, FileText, HardDrive, Mail, MemoryStick, Network, Pause, Play, PlayCircle, RefreshCw, Save, Server, Settings2, Shield, User, UserPlus, Wrench, XCircle, Zap } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BarChart, DoughnutChart, LineChart } from '../../components/LineChart';
import { Modal } from '../../components/Modal';
import { Badge, Card, DemoBanner, PageHeader, StatCard, Switch, Toast } from '../../components/ui';
import { adminKpis, adminTeam as initialTeam, contentItems, diagnosticQueue, modelHealth, reports as initialReports, userGrowth, users, type AdminMember } from '../../data/mock';
import { useAuth } from '../../lib/auth';
import { formatUptime, healthClient, type HealthSnapshot, type ServiceState } from '../../lib/health';
import { useToast } from '../../lib/useToast';

const input = 'w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:bg-surface focus:ring-2 focus:ring-medical-500';

/* ---------------- Overview ---------------- */
export function AdminOverview() {
  return (
    <>
      <DemoBanner />
      <PageHeader title="Admin dashboard" subtitle="Platform-wide health and growth." action={<Link to="/admin/health" className="flex items-center gap-2 rounded-xl border border-slate-200 bg-surface px-4 py-2.5 text-sm font-semibold text-slate-700 hover:text-medical-600"><Server className="h-4 w-4" /> Server health</Link>} />
      <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">{adminKpis.map((k) => <StatCard key={k.label} {...k} />)}</div>
      <div className="grid gap-8 lg:grid-cols-2">
        <Card><h2 className="mb-6 text-lg font-bold text-slate-900">Platform growth</h2><LineChart label="Total users per month" labels={userGrowth.labels} series={[{ label: 'Users', data: userGrowth.data, color: '#3b82f6' }]} /></Card>
        <Card><h2 className="mb-6 text-lg font-bold text-slate-900">Clinician agreement by module (demo)</h2><BarChart label="Agreement rate %" labels={['Cardiology', 'Neurology', 'Oncology', 'Pediatrics', 'Dermatology']} data={[94.5, 89.2, 96.1, 86.8, 92.4]} /></Card>
      </div>
    </>
  );
}

/* ---------------- Users ---------------- */
export function AdminUsers() {
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const shown = useMemo(
    () => users.filter((u) => (!role || u.role === role) && (!status || u.status === status) && `${u.name} ${u.email}`.toLowerCase().includes(q.toLowerCase())),
    [role, status, q],
  );
  const select = 'rounded-lg border border-slate-200 bg-surface px-3 py-2 text-sm';
  return (
    <>
      <PageHeader
        title="User management"
        subtitle="Verify professionals, manage access."
        action={<Link to="/admin/settings#admins" className="flex items-center gap-2 rounded-xl bg-medical-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-medical-700"><UserPlus className="h-4 w-4" /> Invite admin</Link>}
      />
      <div className="mb-4 flex flex-wrap gap-3">
        <input aria-label="Search users" placeholder="Search name or email" value={q} onChange={(e) => setQ(e.target.value)} className={select} />
        <select aria-label="Role" value={role} onChange={(e) => setRole(e.target.value)} className={select}><option value="">All roles</option><option>Professional</option><option>Patient</option><option>Student</option></select>
        <select aria-label="Status" value={status} onChange={(e) => setStatus(e.target.value)} className={select}><option value="">All statuses</option><option>Active</option><option>Pending</option><option>Inactive</option></select>
      </div>
      <Card className="overflow-x-auto !p-0">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-6 py-3">User</th><th className="px-6 py-3">Role</th><th className="px-6 py-3">Status</th><th className="px-6 py-3">Joined</th></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {shown.map((u) => (
              <tr key={u.email}>
                <td className="px-6 py-4"><p className="font-semibold text-slate-900">{u.name}</p><p className="text-xs text-slate-500">{u.email}</p></td>
                <td className="px-6 py-4">{u.role}</td>
                <td className="px-6 py-4"><Badge tone={u.status === 'Active' ? 'green' : 'amber'}>{u.status}</Badge></td>
                <td className="px-6 py-4">{u.joined}</td>
              </tr>
            ))}
            {shown.length === 0 && <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">No users match these filters.</td></tr>}
          </tbody>
        </table>
      </Card>
    </>
  );
}

/* ---------------- Analytics ---------------- */
const MODULES = [
  { label: 'Cardiology', value: 42, color: '#3b82f6' },
  { label: 'Neurology', value: 28, color: '#6366f1' },
  { label: 'Oncology', value: 18, color: '#10b981' },
  { label: 'Other', value: 12, color: '#f59e0b' },
];
const RESOURCES = [
  { label: 'Compute (GPU)', value: 78, color: 'bg-medical-500' },
  { label: 'Database storage', value: 62, color: 'bg-indigo-500' },
  { label: 'Memory (RAM)', value: 45, color: 'bg-emerald-500' },
  { label: 'Network bandwidth', value: 30, color: 'bg-amber-500' },
];

export function AdminAnalytics() {
  const [range, setRange] = useState<'7d' | '30d'>('7d');
  const [reports, setReports] = useState(initialReports);
  const toast = useToast();
  const labels = range === '7d' ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] : Array.from({ length: 30 }, (_, i) => String(i + 1));
  const queries = range === '7d' ? [450, 520, 480, 610, 590, 420, 380] : labels.map((_, i) => Math.round(480 + 120 * Math.sin(i / 3) + i * 4));
  const scans = range === '7d' ? [210, 250, 240, 290, 280, 150, 120] : labels.map((_, i) => Math.round(220 + 60 * Math.cos(i / 4) + i * 2));

  return (
    <>
      <DemoBanner />
      <PageHeader
        title="Analytics"
        subtitle="Usage, model volume and resource consumption."
        action={
          <div role="tablist" aria-label="Date range" className="inline-flex rounded-xl bg-slate-200 p-1">
            {(['7d', '30d'] as const).map((r) => (
              <button key={r} role="tab" aria-selected={range === r} onClick={() => setRange(r)} className={`rounded-lg px-4 py-2 text-sm font-semibold ${range === r ? 'bg-surface text-medical-600 shadow-sm' : 'text-slate-500'}`}>{r === '7d' ? 'Last 7 days' : 'Last 30 days'}</button>
            ))}
          </div>
        }
      />
      <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total API calls" value={range === '7d' ? '1.2M' : '4.9M'} note="+14% vs previous period" />
        <StatCard label="Avg. response time" value="124" unit="ms" note="−5% vs previous period" tone="emerald" />
        <StatCard label="Data processed" value={range === '7d' ? '4.8' : '19.6'} unit="TB" note="Scans, labs and datasets" tone="indigo" />
        <StatCard label="Clinician agreement" value="91.8" unit="%" note="AI vs final verdict (demo)" tone="amber" />
      </div>
      <div className="mb-8 grid gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h2 className="mb-6 text-lg font-bold text-slate-900">Diagnostic volume</h2>
          <LineChart label="Patient queries and professional scans" labels={labels} series={[{ label: 'Patient queries', data: queries, color: '#3b82f6' }, { label: 'Professional scans', data: scans, color: '#10b981', dashed: true }]} />
        </Card>
        <Card>
          <h2 className="mb-6 text-lg font-bold text-slate-900">Requests by module</h2>
          <DoughnutChart label="Share of requests by clinical module" labels={MODULES.map((m) => m.label)} data={MODULES.map((m) => m.value)} colors={MODULES.map((m) => m.color)} />
          <ul className="mt-6 space-y-2 text-sm">
            {MODULES.map((m) => <li key={m.label} className="flex items-center justify-between"><span className="flex items-center gap-2 text-slate-600"><span className="h-2.5 w-2.5 rounded-full" style={{ background: m.color }} />{m.label}</span><span className="font-bold text-slate-900">{m.value}%</span></li>)}
          </ul>
        </Card>
      </div>
      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <h2 className="mb-6 text-lg font-bold text-slate-900">Resource allocation</h2>
          <ul className="space-y-5">
            {RESOURCES.map((r) => (
              <li key={r.label}>
                <div className="mb-1.5 flex justify-between text-sm"><span className="font-medium text-slate-700">{r.label}</span><span className="font-bold text-slate-900">{r.value}%</span></div>
                <div className="h-2.5 rounded-full bg-slate-100"><div className={`h-2.5 rounded-full ${r.color}`} style={{ width: `${r.value}%` }} /></div>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Automated reports</h2>
            <button onClick={() => { setReports((r) => [{ name: `Ad-hoc usage report ${new Date().toISOString().slice(0, 10)}.csv`, meta: 'Requested just now', size: '0.4 MB' }, ...r]); toast.show('Report generated (demo).'); }} className="rounded-lg bg-medical-50 px-3 py-1.5 text-sm font-semibold text-medical-700 hover:bg-medical-100">Generate new</button>
          </div>
          <ul className="divide-y divide-slate-100">
            {reports.map((r) => (
              <li key={r.name} className="flex items-center gap-3 py-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500"><FileText className="h-5 w-5" /></span>
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-900">{r.name}</p><p className="text-xs text-slate-500">{r.meta} · {r.size}</p></div>
                <Download className="h-4 w-4 text-slate-400" aria-hidden />
              </li>
            ))}
          </ul>
        </Card>
      </div>
      <Toast message={toast.message} />
    </>
  );
}

/* ---------------- Diagnostics ---------------- */
export function AdminDiagnostics() {
  return (
    <>
      <PageHeader title="Diagnostics" subtitle="Live AI queue and model health." />
      <div className="grid gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h2 className="mb-4 font-bold text-slate-900">Live queue</h2>
          <ul className="divide-y divide-slate-100">{diagnosticQueue.map((c) => <li key={c.id} className="flex justify-between py-3 text-sm"><span>#{c.id} · {c.type}</span><Badge tone={c.status === 'flagged' ? 'amber' : c.status === 'completed' ? 'green' : 'slate'}>{c.status}</Badge></li>)}</ul>
        </Card>
        <Card>
          <h2 className="mb-4 font-bold text-slate-900">Model health</h2>
          <ul className="space-y-4">{modelHealth.map((m) => <li key={m.name}><div className="flex justify-between text-sm font-semibold"><span>{m.name}</span><Badge tone={m.state === 'Online' ? 'green' : 'blue'}>{m.state}</Badge></div><p className="text-xs text-slate-500">{m.note}</p></li>)}</ul>
        </Card>
      </div>
    </>
  );
}

/* ---------------- Content ---------------- */
export function AdminContent() {
  return (
    <>
      <PageHeader title="Content" subtitle="Modules, articles and datasets." />
      <Card className="overflow-x-auto !p-0">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-6 py-3">Title</th><th className="px-6 py-3">Type</th><th className="px-6 py-3">Status</th><th className="px-6 py-3">Updated</th></tr></thead>
          <tbody className="divide-y divide-slate-100">{contentItems.map((c) => <tr key={c.title}><td className="px-6 py-4 font-semibold text-slate-900">{c.title}</td><td className="px-6 py-4">{c.kind}</td><td className="px-6 py-4"><Badge tone={c.status === 'Published' ? 'green' : c.status === 'Draft' ? 'slate' : 'amber'}>{c.status}</Badge></td><td className="px-6 py-4">{c.updated}</td></tr>)}</tbody>
        </table>
      </Card>
    </>
  );
}

/* ---------------- Settings ---------------- */
const SECTIONS = [
  { id: 'quick-actions', label: 'Quick actions', icon: Zap },
  { id: 'admins', label: 'Admin team', icon: UserPlus },
  { id: 'profile', label: 'Admin profile', icon: User },
  { id: 'security', label: 'Security & access', icon: Shield },
  { id: 'system', label: 'System operations', icon: Cpu },
] as const;

function Section({ id, title, children, action }: { id: string; title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-6 rounded-2xl border border-slate-100 bg-surface p-6 shadow-sm sm:p-8">
      <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function AdminSettings() {
  const { user } = useAuth();
  const location = useLocation();
  const toast = useToast();
  const showToast = toast.show;
  const [active, setActive] = useState<string>('quick-actions');
  const [team, setTeam] = useState<AdminMember[]>(initialTeam);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [invite, setInvite] = useState({ name: '', email: '', level: 'Content Admin' as AdminMember['level'] });
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [trainingOpen, setTrainingOpen] = useState(false);
  const [training, setTraining] = useState<number | null>(null);
  const [toggles, setToggles] = useState({ twoFactor: true, masking: true, maintenance: false });
  const [maintConfirm, setMaintConfirm] = useState(false);
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // Deep links like /admin/settings#admins
  useEffect(() => {
    const id = location.hash.slice(1);
    if (id) document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [location.hash]);

  // Scroll-spy for the sub-navigation
  useEffect(() => {
    const root = document.querySelector('main');
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActive(visible.target.id);
      },
      { root, rootMargin: '0px 0px -60% 0px', threshold: 0 },
    );
    SECTIONS.forEach((s) => { const el = document.getElementById(s.id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, []);

  // Simulated training progress
  useEffect(() => {
    if (training === null || training >= 100) return;
    const t = setTimeout(() => setTraining((p) => Math.min(100, (p ?? 0) + 7 + Math.random() * 10)), 350);
    return () => clearTimeout(t);
  }, [training]);
  useEffect(() => { if (training !== null && training >= 100) showToast('Training job finished: new model is waiting for evaluation before rollout.'); }, [training, showToast]);

  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  function submitInvite(e: FormEvent) {
    e.preventDefault();
    if (!invite.name.trim()) return setInviteError('Enter a name.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(invite.email)) return setInviteError('Enter a valid email address.');
    if (team.some((m) => m.email.toLowerCase() === invite.email.toLowerCase())) return setInviteError('That person is already on the admin team.');
    // TODO(api): POST /admin/invitations — server emails a single-use link; invitee must set up MFA on first sign-in.
    setTeam((t) => [...t, { ...invite, name: invite.name.trim(), status: 'Invited', added: new Date().toISOString().slice(0, 10) }]);
    toast.show(`Invitation sent to ${invite.email} (demo: no email was sent).`);
    setInvite({ name: '', email: '', level: 'Content Admin' });
    setInviteError(null);
    setInviteOpen(false);
  }

  function exportLog() {
    const rows = [
      ['timestamp', 'actor', 'action', 'target'],
      [new Date().toISOString(), user?.email ?? 'admin', 'export_system_log', 'audit_log'],
      ['2026-11-23T09:12:44Z', 'dr.chen', 'verdict_submitted', 'DRG-8921'],
      ['2026-11-23T08:03:10Z', 'system', 'backup_completed', 'database'],
      ['2026-11-22T17:45:02Z', 'admin', 'user_verified', 'PRO-0192'],
    ];
    const blob = new Blob([rows.map((r) => r.join(',')).join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement('a'), { href: url, download: `aethermed-system-log-${new Date().toISOString().slice(0, 10)}.csv` });
    a.click();
    URL.revokeObjectURL(url);
    toast.show('System log exported (demo data).');
  }

  function changePassword(e: FormEvent) {
    e.preventDefault();
    if (!pw.current) return setPwMsg({ ok: false, text: 'Enter your current password.' });
    if (pw.next.length < 12) return setPwMsg({ ok: false, text: 'New password needs at least 12 characters.' });
    if (pw.next !== pw.confirm) return setPwMsg({ ok: false, text: 'New passwords do not match.' });
    // TODO(auth): call the auth provider's updatePassword; never handle password hashes in the client.
    setPw({ current: '', next: '', confirm: '' });
    setPwMsg({ ok: true, text: 'Password updated (demo).' });
  }

  const QUICK = [
    { label: 'Invite new admin', icon: UserPlus, tint: 'bg-medical-50 text-medical-600', onClick: () => setInviteOpen(true) },
    { label: 'Trigger AI training', icon: PlayCircle, tint: 'bg-purple-50 text-purple-700', onClick: () => setTrainingOpen(true) },
    { label: 'Export system log', icon: Download, tint: 'bg-emerald-50 text-emerald-700', onClick: exportLog },
    { label: 'Ecosystem settings', icon: Settings2, tint: 'bg-slate-100 text-slate-600', onClick: () => go('system') },
  ];

  return (
    <>
      <PageHeader
        title="System settings"
        subtitle="Configure ecosystem preferences, admins and security."
        action={<button onClick={() => toast.show('Settings saved (demo).')} className="flex items-center gap-2 rounded-xl bg-medical-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-medical-600/20 hover:bg-medical-700"><Save className="h-4 w-4" /> Save changes</button>}
      />
      <div className="grid gap-8 lg:grid-cols-[14rem_1fr]">
        <nav aria-label="Settings sections" className="lg:sticky lg:top-0 lg:self-start">
          <ul className="flex gap-2 overflow-x-auto lg:flex-col">
            {SECTIONS.map(({ id, label, icon: Icon }) => (
              <li key={id}>
                <button onClick={() => go(id)} aria-current={active === id} className={`flex w-full items-center gap-3 whitespace-nowrap rounded-xl px-4 py-3 text-sm font-medium transition ${active === id ? 'bg-surface text-medical-600 shadow-sm ring-1 ring-slate-100' : 'text-slate-600 hover:bg-slate-100'}`}>
                  <Icon className="h-4 w-4" /> {label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-8">
          <Section id="quick-actions" title="Quick actions">
            <div className="grid gap-4 sm:grid-cols-2">
              {QUICK.map(({ label, icon: Icon, tint, onClick }) => (
                <button key={label} onClick={onClick} className="flex items-center gap-4 rounded-2xl border border-slate-100 p-4 text-left transition hover:-translate-y-0.5 hover:border-medical-200 hover:shadow-md">
                  <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tint}`}><Icon className="h-5 w-5" /></span>
                  <span className="font-semibold text-slate-900">{label}</span>
                </button>
              ))}
            </div>
          </Section>

          <Section id="admins" title="Admin team" action={<button onClick={() => setInviteOpen(true)} className="flex items-center gap-2 rounded-xl bg-medical-600 px-4 py-2 text-sm font-semibold text-white hover:bg-medical-700"><UserPlus className="h-4 w-4" /> Invite admin</button>}>
            <ul className="divide-y divide-slate-100">
              {team.map((m) => (
                <li key={m.email} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-medical-100 text-sm font-bold text-medical-700">{m.name.split(' ').map((p) => p[0]).slice(0, 2).join('')}</span>
                  <div className="min-w-0 flex-1"><p className="truncate font-semibold text-slate-900">{m.name}</p><p className="truncate text-xs text-slate-500">{m.email} · added {m.added}</p></div>
                  <Badge tone="blue">{m.level}</Badge>
                  <Badge tone={m.status === 'Active' ? 'green' : 'amber'}>{m.status}</Badge>
                  {m.level !== 'Super Admin' && (
                    <button onClick={() => { setTeam((t) => t.filter((x) => x.email !== m.email)); toast.show(`${m.status === 'Invited' ? 'Invitation revoked' : 'Access removed'} for ${m.name}.`); }} className="text-xs font-semibold text-red-600 hover:underline">
                      {m.status === 'Invited' ? 'Revoke' : 'Remove'}
                    </button>
                  )}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-slate-500">Super Admin: everything · Content Admin: modules, articles, datasets · Support: users and verification only.</p>
          </Section>

          <Section id="profile" title="Personal information">
            <div className="mb-6 flex items-center gap-5">
              <span className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-medical-500 to-indigo-500 text-2xl font-bold text-white shadow-lg">{user?.name.split(' ').map((p) => p[0]).slice(0, 2).join('')}</span>
              <div className="flex gap-3"><button className="rounded-xl border border-slate-200 bg-surface px-4 py-2 text-sm font-semibold hover:bg-slate-50">Change photo</button><button className="rounded-xl bg-red-50 px-4 py-2 text-sm font-semibold text-red-700">Remove</button></div>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <div><label htmlFor="pf-name" className="mb-1.5 block text-sm font-medium text-slate-700">Full name</label><input id="pf-name" defaultValue={user?.name} className={input} /></div>
              <div><label htmlFor="pf-email" className="mb-1.5 block text-sm font-medium text-slate-700">Email address</label><input id="pf-email" type="email" defaultValue={user?.email} className={input} /></div>
              <div><label htmlFor="pf-role" className="mb-1.5 block text-sm font-medium text-slate-700">Role</label><input id="pf-role" value="Super Administrator" readOnly className={`${input} text-slate-500`} /></div>
            </div>
          </Section>

          <Section id="security" title="Security & access control">
            <form onSubmit={changePassword} className="mb-6 border-b border-slate-100 pb-6">
              <h3 className="mb-3 font-semibold text-slate-900">Change password</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <input aria-label="Current password" type="password" autoComplete="current-password" placeholder="Current password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} className={input} />
                <div className="hidden md:block" />
                <input aria-label="New password" type="password" autoComplete="new-password" placeholder="New password (12+ characters)" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} className={input} />
                <input aria-label="Confirm new password" type="password" autoComplete="new-password" placeholder="Confirm new password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} className={input} />
              </div>
              {pwMsg && <p role="status" className={`mt-3 text-sm ${pwMsg.ok ? 'text-emerald-600' : 'text-red-600'}`}>{pwMsg.text}</p>}
              <button type="submit" className="mt-4 rounded-xl border border-slate-200 bg-surface px-4 py-2 text-sm font-semibold hover:bg-slate-50">Update password</button>
            </form>
            <div className="divide-y divide-slate-100">
              <div className="flex items-center justify-between gap-4 py-4"><div><p className="font-semibold text-slate-900">Two-factor authentication (2FA)</p><p className="text-sm text-slate-500">Require an extra step at sign-in for all staff accounts.</p></div><Switch label="Two-factor authentication" checked={toggles.twoFactor} onChange={(v) => setToggles({ ...toggles, twoFactor: v })} /></div>
              <div className="flex items-center justify-between gap-4 py-4"><div><p className="font-semibold text-slate-900">Strict data masking</p><p className="text-sm text-slate-500">Hide direct identifiers on dashboards by default.</p></div><Switch label="Strict data masking" checked={toggles.masking} onChange={(v) => setToggles({ ...toggles, masking: v })} /></div>
            </div>
          </Section>

          <Section id="system" title="System operations">
            <div className={`flex items-center justify-between gap-4 rounded-2xl border p-5 ${toggles.maintenance ? 'border-red-200 bg-red-50' : 'border-amber-200 bg-amber-50'}`}>
              <div>
                <p className={`flex items-center gap-2 font-semibold ${toggles.maintenance ? 'text-red-700' : 'text-amber-800'}`}><Wrench className="h-4 w-4" /> Maintenance mode {toggles.maintenance && '· ON'}</p>
                <p className={`text-sm ${toggles.maintenance ? 'text-red-700' : 'text-amber-700'}`}>Take AetherMed offline for users. Admins keep access.</p>
              </div>
              <Switch label="Maintenance mode" checked={toggles.maintenance} onChange={(v) => (v ? setMaintConfirm(true) : setToggles({ ...toggles, maintenance: false }))} />
            </div>
            <Link to="/admin/health" className="mt-4 flex items-center justify-between rounded-2xl border border-slate-100 p-5 hover:border-medical-200">
              <span className="flex items-center gap-3 font-semibold text-slate-900"><Server className="h-5 w-5 text-medical-600" /> Server health & uptime</span>
              <span className="text-sm text-medical-600">Open →</span>
            </Link>
          </Section>
        </div>
      </div>

      <Modal open={inviteOpen} onClose={() => setInviteOpen(false)} title="Invite new admin">
        <form onSubmit={submitInvite} className="space-y-4">
          <div><label htmlFor="inv-name" className="mb-1.5 block text-sm font-medium text-slate-700">Full name</label><input id="inv-name" value={invite.name} onChange={(e) => setInvite({ ...invite, name: e.target.value })} className={input} /></div>
          <div><label htmlFor="inv-email" className="mb-1.5 block text-sm font-medium text-slate-700">Work email</label><input id="inv-email" type="email" value={invite.email} onChange={(e) => setInvite({ ...invite, email: e.target.value })} className={input} /></div>
          <fieldset>
            <legend className="mb-2 text-sm font-medium text-slate-700">Access level</legend>
            <div className="grid gap-3 sm:grid-cols-3">
              {(['Super Admin', 'Content Admin', 'Support'] as const).map((lvl) => (
                <label key={lvl} className={`cursor-pointer rounded-xl border p-3 text-center text-sm font-semibold ${invite.level === lvl ? 'border-medical-500 bg-medical-50 text-medical-700' : 'border-slate-200 text-slate-600'}`}>
                  <input type="radio" name="level" className="sr-only" checked={invite.level === lvl} onChange={() => setInvite({ ...invite, level: lvl })} /> {lvl}
                </label>
              ))}
            </div>
          </fieldset>
          <p className="flex items-start gap-2 rounded-xl bg-slate-50 p-3 text-xs text-slate-500"><Mail className="mt-0.5 h-4 w-4 shrink-0" /> They'll get a single-use link that expires in 48 hours and must set up 2FA before first access.</p>
          {inviteError && <p role="alert" className="text-sm text-red-600">{inviteError}</p>}
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setInviteOpen(false)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold">Cancel</button>
            <button type="submit" className="rounded-xl bg-medical-600 px-4 py-2 text-sm font-bold text-white hover:bg-medical-700">Send invitation</button>
          </div>
        </form>
      </Modal>

      <Modal open={trainingOpen} onClose={() => setTrainingOpen(false)} title="Trigger AI training">
        {training === null ? (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">Retrain on newly verified cases since the last run. The result is a <strong>candidate</strong> model; it is not deployed until it passes evaluation and a clinician signs off.</p>
            <ul className="space-y-2 rounded-xl bg-slate-50 p-4 text-sm text-slate-600"><li>New verified cases: <strong>1,284</strong></li><li>Estimated time: <strong>~40 min</strong> (demo: a few seconds)</li></ul>
            <div className="flex justify-end gap-3"><button onClick={() => setTrainingOpen(false)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold">Cancel</button><button onClick={() => setTraining(0)} className="rounded-xl bg-purple-600 px-4 py-2 text-sm font-bold text-white">Start training</button></div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between text-sm font-semibold"><span>{training >= 100 ? 'Finished' : 'Training…'}</span><span>{Math.round(training)}%</span></div>
            <div className="h-3 rounded-full bg-slate-100" role="progressbar" aria-valuenow={Math.round(training)} aria-valuemin={0} aria-valuemax={100} aria-label="Training progress"><div className="h-3 rounded-full bg-purple-500 transition-all" style={{ width: `${training}%` }} /></div>
            {training >= 100 && <div className="flex justify-end"><button onClick={() => { setTrainingOpen(false); setTraining(null); }} className="rounded-xl bg-purple-600 px-4 py-2 text-sm font-bold text-white">Done</button></div>}
          </div>
        )}
      </Modal>

      <Modal open={maintConfirm} onClose={() => setMaintConfirm(false)} title="Turn on maintenance mode?">
        <p className="mb-6 text-sm text-slate-600">All patients, students and professionals will be signed out and see a maintenance page. Admins keep access.</p>
        <div className="flex justify-end gap-3">
          <button onClick={() => setMaintConfirm(false)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold">Cancel</button>
          <button onClick={() => { setToggles({ ...toggles, maintenance: true }); setMaintConfirm(false); toast.show('Maintenance mode is ON (demo).'); }} className="rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white">Turn on</button>
        </div>
      </Modal>
      <Toast message={toast.message} />
    </>
  );
}

/* ---------------- Server health ---------------- */
const HISTORY = 30;
const POLL_MS = 3000;

function Gauge({ label, value, icon: Icon }: { label: string; value: number; icon: typeof Cpu }) {
  const r = 42;
  const c = 2 * Math.PI * r;
  const color = value >= 85 ? '#ef4444' : value >= 70 ? '#f59e0b' : '#10b981';
  return (
    <div className="flex flex-col items-center rounded-2xl border border-slate-100 bg-surface p-5 shadow-sm">
      <div className="relative h-28 w-28">
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
          <circle cx="50" cy="50" r={r} fill="none" stroke="currentColor" className="text-slate-100" strokeWidth="9" />
          <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="9" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} style={{ transition: 'stroke-dashoffset 0.6s ease, stroke 0.6s' }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-2xl font-bold text-slate-900">{value}%</span></div>
      </div>
      <p className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-slate-600"><Icon className="h-4 w-4" /> {label}</p>
    </div>
  );
}

const stateUi: Record<ServiceState, { tone: 'green' | 'amber' | 'red'; label: string; icon: typeof CheckCircle2 }> = {
  operational: { tone: 'green', label: 'Operational', icon: CheckCircle2 },
  degraded: { tone: 'amber', label: 'Degraded', icon: AlertTriangle },
  down: { tone: 'red', label: 'Down', icon: XCircle },
};

export function AdminHealth() {
  const [snap, setSnap] = useState<HealthSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [live, setLive] = useState(true);
  const [checking, setChecking] = useState(false);
  const [cpuHist, setCpuHist] = useState<number[]>([]);
  const [latHist, setLatHist] = useState<number[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
  const mounted = useRef(true);

  const check = useCallback(async () => {
    setChecking(true);
    try {
      const s = await healthClient.check();
      if (!mounted.current) return;
      setSnap(s);
      setError(null);
      const t = new Date(s.checkedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setCpuHist((h) => [...h, s.cpu].slice(-HISTORY));
      setLatHist((h) => [...h, s.p95LatencyMs].slice(-HISTORY));
      setLabels((l) => [...l, t].slice(-HISTORY));
    } catch (e) {
      if (mounted.current) setError(e instanceof Error ? e.message : 'Health check failed');
    } finally {
      if (mounted.current) setChecking(false);
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    void check();
    return () => { mounted.current = false; };
  }, [check]);

  useEffect(() => {
    if (!live) return;
    const id = setInterval(() => void check(), POLL_MS);
    return () => clearInterval(id);
  }, [live, check]);

  const worst: ServiceState = !snap ? 'operational' : snap.services.some((s) => s.state === 'down') ? 'down' : snap.services.some((s) => s.state === 'degraded') ? 'degraded' : 'operational';
  const banner = {
    operational: { cls: 'border-emerald-200 bg-emerald-50 text-emerald-700', text: 'All systems operational' },
    degraded: { cls: 'border-amber-200 bg-amber-50 text-amber-800', text: 'Some services are degraded' },
    down: { cls: 'border-red-200 bg-red-50 text-red-700', text: 'Service outage' },
  }[worst];

  return (
    <>
      <DemoBanner />
      <PageHeader
        title="Server health"
        subtitle={snap ? `Last checked ${new Date(snap.checkedAt).toLocaleTimeString()} · ${snap.region} · ${snap.version}` : 'Checking…'}
        action={
          <div className="flex gap-2">
            <button onClick={() => setLive((v) => !v)} aria-pressed={live} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-surface px-4 py-2.5 text-sm font-semibold text-slate-700">
              {live ? <><Pause className="h-4 w-4" /> Pause live</> : <><Play className="h-4 w-4" /> Resume live</>}
            </button>
            <button onClick={() => void check()} disabled={checking} className="flex items-center gap-2 rounded-xl bg-medical-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-medical-700 disabled:opacity-60">
              <RefreshCw className={`h-4 w-4 ${checking ? 'animate-spin' : ''}`} /> Run check
            </button>
          </div>
        }
      />

      {error && <p role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">Health endpoint unreachable: {error}</p>}

      <div className={`mb-8 flex flex-col justify-between gap-3 rounded-2xl border p-5 sm:flex-row sm:items-center ${banner.cls}`}>
        <p className="flex items-center gap-3 text-lg font-bold">
          <span className="relative flex h-3 w-3"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-50" /><span className="relative inline-flex h-3 w-3 rounded-full bg-current" /></span>
          {banner.text}
        </p>
        {snap && <p className="text-sm font-medium">Uptime {formatUptime(snap.uptimeSeconds)} {live && <span className="ml-2 rounded-full bg-surface/70 px-2 py-0.5 text-xs">● live · every {POLL_MS / 1000}s (simulated)</span>}</p>}
      </div>

      {snap && (
        <>
          <div className="mb-8 grid grid-cols-2 gap-6 lg:grid-cols-4">
            <Gauge label="CPU" value={snap.cpu} icon={Cpu} />
            <Gauge label="Memory" value={snap.memory} icon={MemoryStick} />
            <Gauge label="Disk" value={snap.disk} icon={HardDrive} />
            <Gauge label="Network" value={snap.network} icon={Network} />
          </div>

          <div className="mb-8 grid gap-6 md:grid-cols-3">
            <StatCard label="Requests / min" value={snap.requestsPerMin.toLocaleString()} note="Across all services" />
            <StatCard label="Error rate" value={String(snap.errorRate)} unit="%" note={snap.errorRate > 1 ? 'Above 1% alert threshold' : 'Below 1% alert threshold'} tone={snap.errorRate > 1 ? 'rose' : 'emerald'} />
            <StatCard label="p95 latency" value={String(snap.p95LatencyMs)} unit="ms" note={snap.p95LatencyMs > 300 ? 'Above 300 ms target' : 'Within 300 ms target'} tone={snap.p95LatencyMs > 300 ? 'amber' : 'indigo'} />
          </div>

          <div className="mb-8 grid gap-8 lg:grid-cols-2">
            <Card><h2 className="mb-4 text-lg font-bold text-slate-900">CPU usage</h2><LineChart height="h-52" label="CPU usage over the last checks" labels={labels} series={[{ label: 'CPU %', data: cpuHist, color: '#3b82f6' }]} /></Card>
            <Card><h2 className="mb-4 text-lg font-bold text-slate-900">p95 latency</h2><LineChart height="h-52" label="p95 latency over the last checks" labels={labels} series={[{ label: 'p95 ms', data: latHist, color: '#8b5cf6' }]} /></Card>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            <Card className="lg:col-span-2 !p-0">
              <h2 className="p-6 pb-2 text-lg font-bold text-slate-900">Services</h2>
              <ul className="divide-y divide-slate-100">
                {snap.services.map((s) => {
                  const ui = stateUi[s.state];
                  return (
                    <li key={s.name} className="flex flex-col gap-2 px-6 py-4 sm:flex-row sm:items-center">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500"><Activity className="h-5 w-5" /></span>
                      <div className="min-w-0 flex-1"><p className="font-semibold text-slate-900">{s.name}</p><p className="text-xs text-slate-500">{s.description}</p></div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="w-20 text-right text-slate-600">{s.latencyMs} ms</span>
                        <span className="w-20 text-right text-slate-500">{s.uptime30d}%</span>
                        <Badge tone={ui.tone}><ui.icon className="mr-1 h-3 w-3" />{ui.label}</Badge>
                      </div>
                    </li>
                  );
                })}
              </ul>
              <p className="px-6 pb-4 text-xs text-slate-400">Columns: latency now · 30-day uptime · status</p>
            </Card>
            <Card>
              <h2 className="mb-4 text-lg font-bold text-slate-900">Recent incidents</h2>
              <ol className="relative space-y-5 border-l border-slate-200 pl-6">
                {[
                  { when: 'Nov 21, 14:02', title: 'AI inference latency spike', text: 'p95 > 900 ms for 11 min. Auto-scaled GPU pool. Resolved.', tone: 'bg-amber-500' },
                  { when: 'Nov 12, 03:30', title: 'Scheduled database maintenance', text: 'Minor version upgrade, 4 min read-only.', tone: 'bg-medical-500' },
                  { when: 'Oct 29, 19:47', title: 'Email provider outage', text: 'Notifications delayed 25 min. Retries succeeded.', tone: 'bg-red-500' },
                ].map((i) => (
                  <li key={i.when} className="relative">
                    <span className={`absolute -left-[1.85rem] top-1 h-3 w-3 rounded-full border-2 border-surface ${i.tone}`} />
                    <p className="text-xs font-semibold text-slate-400">{i.when}</p>
                    <p className="text-sm font-semibold text-slate-900">{i.title}</p>
                    <p className="text-xs text-slate-500">{i.text}</p>
                  </li>
                ))}
              </ol>
            </Card>
          </div>
        </>
      )}
    </>
  );
}
