import { useMemo, useState } from 'react';
import { BarChart, LineChart } from '../../components/LineChart';
import { Badge, Card, DemoBanner, PageHeader, StatCard } from '../../components/ui';
import { adminKpis, contentItems, diagnosticQueue, modelHealth, userGrowth, users } from '../../data/mock';

export function AdminOverview() {
  return (
    <>
      <DemoBanner />
      <PageHeader title="Admin dashboard" subtitle="Platform-wide health and growth." />
      <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">{adminKpis.map((k) => <StatCard key={k.label} {...k} />)}</div>
      <div className="grid gap-8 lg:grid-cols-2">
        <Card><h2 className="mb-6 text-lg font-bold">Platform growth</h2><LineChart label="Total users per month" labels={userGrowth.labels} series={[{ label: 'Users', data: userGrowth.data, color: '#3b82f6' }]} /></Card>
        <Card><h2 className="mb-6 text-lg font-bold">Clinician agreement by module (demo)</h2><BarChart label="Agreement rate %" labels={['Cardiology', 'Neurology', 'Oncology', 'Pediatrics', 'Dermatology']} data={[94.5, 89.2, 96.1, 86.8, 92.4]} /></Card>
      </div>
    </>
  );
}

export function AdminUsers() {
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const shown = useMemo(
    () => users.filter((u) => (!role || u.role === role) && (!status || u.status === status) && `${u.name} ${u.email}`.toLowerCase().includes(q.toLowerCase())),
    [role, status, q],
  );
  const select = 'rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm';
  return (
    <>
      <PageHeader title="User management" subtitle="Verify professionals, manage access." />
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
                <td className="px-6 py-4"><p className="font-semibold">{u.name}</p><p className="text-xs text-slate-500">{u.email}</p></td>
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

export function AdminAnalytics() {
  return (
    <>
      <PageHeader title="Analytics" subtitle="Usage and model volume." />
      <Card><LineChart label="Patient queries and professional scans per day" labels={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']} series={[{ label: 'Patient queries', data: [450, 520, 480, 610, 590, 420, 380], color: '#3b82f6' }, { label: 'Professional scans', data: [210, 250, 240, 290, 280, 150, 120], color: '#10b981', dashed: true }]} /></Card>
    </>
  );
}

export function AdminDiagnostics() {
  return (
    <>
      <PageHeader title="Diagnostics" subtitle="Live AI queue and model health." />
      <div className="grid gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h2 className="mb-4 font-bold">Live queue</h2>
          <ul className="divide-y divide-slate-100">{diagnosticQueue.map((c) => <li key={c.id} className="flex justify-between py-3 text-sm"><span>#{c.id} · {c.type}</span><Badge tone={c.status === 'flagged' ? 'amber' : c.status === 'completed' ? 'green' : 'slate'}>{c.status}</Badge></li>)}</ul>
        </Card>
        <Card>
          <h2 className="mb-4 font-bold">Model health</h2>
          <ul className="space-y-4">{modelHealth.map((m) => <li key={m.name}><div className="flex justify-between text-sm font-semibold"><span>{m.name}</span><Badge tone={m.state === 'Online' ? 'green' : 'blue'}>{m.state}</Badge></div><p className="text-xs text-slate-500">{m.note}</p></li>)}</ul>
        </Card>
      </div>
    </>
  );
}

export function AdminContent() {
  return (
    <>
      <PageHeader title="Content" subtitle="Modules, articles and datasets." />
      <Card className="overflow-x-auto !p-0">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-6 py-3">Title</th><th className="px-6 py-3">Type</th><th className="px-6 py-3">Status</th><th className="px-6 py-3">Updated</th></tr></thead>
          <tbody className="divide-y divide-slate-100">{contentItems.map((c) => <tr key={c.title}><td className="px-6 py-4 font-semibold">{c.title}</td><td className="px-6 py-4">{c.kind}</td><td className="px-6 py-4"><Badge tone={c.status === 'Published' ? 'green' : c.status === 'Draft' ? 'slate' : 'amber'}>{c.status}</Badge></td><td className="px-6 py-4">{c.updated}</td></tr>)}</tbody>
        </table>
      </Card>
    </>
  );
}

function Toggle({ label, hint }: { label: string; hint: string }) {
  const [on, setOn] = useState(false);
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div><p className="font-semibold text-slate-900">{label}</p><p className="text-sm text-slate-500">{hint}</p></div>
      <button role="switch" aria-checked={on} aria-label={label} onClick={() => setOn(!on)} className={`relative h-6 w-11 shrink-0 rounded-full transition ${on ? 'bg-medical-600' : 'bg-slate-300'}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${on ? 'left-5.5' : 'left-0.5'}`} />
      </button>
    </div>
  );
}

export function AdminSettings() {
  return (
    <>
      <PageHeader title="Settings" subtitle="Security and system operations. Toggles are local-only in the demo." />
      <Card className="max-w-2xl divide-y divide-slate-100">
        <Toggle label="Require 2FA for staff" hint="Professionals and admins must use a second factor." />
        <Toggle label="Strict data masking" hint="Hide direct identifiers on dashboards by default." />
        <Toggle label="Maintenance mode" hint="Take the platform offline for non-admin users." />
      </Card>
    </>
  );
}
