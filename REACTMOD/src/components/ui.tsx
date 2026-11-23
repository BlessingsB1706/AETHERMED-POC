import type { ReactNode } from 'react';

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-slate-100 bg-surface p-6 shadow-sm ${className}`}>{children}</div>;
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

const TONES: Record<string, string> = {
  rose: 'border-l-rose-500',
  medical: 'border-l-medical-500',
  emerald: 'border-l-emerald-500',
  indigo: 'border-l-indigo-500',
  amber: 'border-l-amber-500',
};

export function StatCard(props: { label: string; value: string; unit?: string; note?: string; tone?: string }) {
  return (
    <div className={`rounded-2xl border border-l-4 border-slate-100 bg-surface p-5 shadow-sm ${TONES[props.tone ?? 'medical']}`}>
      <p className="text-sm font-medium text-slate-500">{props.label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-900">
        {props.value} {props.unit && <span className="text-sm font-normal text-slate-500">{props.unit}</span>}
      </p>
      {props.note && <p className="mt-2 text-xs font-medium text-slate-500">{props.note}</p>}
    </div>
  );
}

export function Badge({ children, tone = 'slate' }: { children: ReactNode; tone?: 'slate' | 'green' | 'amber' | 'red' | 'blue' }) {
  const map = {
    slate: 'bg-slate-100 text-slate-600',
    green: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    red: 'bg-red-50 text-red-700',
    blue: 'bg-medical-50 text-medical-700',
  };
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${map[tone]}`}>{children}</span>;
}

export function DemoBanner() {
  return (
    <div role="note" className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-800">
      Demo data. Nothing shown here is a real patient, result or statistic.
    </div>
  );
}

export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? 'bg-medical-600' : 'bg-slate-300'}`}
    >
      <span className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : ''}`} />
    </button>
  );
}

/** Minimal toast: render <Toast message={msg} /> and clear msg after a timeout. */
export function Toast({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div role="status" className="fixed bottom-6 left-1/2 z-[100] -translate-x-1/2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-medium text-white shadow-2xl">
      {message}
    </div>
  );
}
