import { Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Logo({ to = '/', dark = false }: { to?: string; dark?: boolean }) {
  return (
    <Link to={to} className="flex items-center gap-3" aria-label="AetherMed home">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-medical-500 text-white shadow-md shadow-medical-500/30">
        <Activity className="h-5 w-5" aria-hidden />
      </span>
      <span className={`text-xl font-bold tracking-tight ${dark ? 'text-white' : 'text-slate-900'}`}>
        Aether<span className="text-medical-600">Med</span>
      </span>
    </Link>
  );
}
