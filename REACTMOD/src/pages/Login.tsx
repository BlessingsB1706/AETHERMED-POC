import { ArrowLeft, Briefcase, GraduationCap, Shield, User } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { ThemeToggle } from '../lib/theme';
import { DEMO_MODE, homePathFor, useAuth, type Role } from '../lib/auth';

const ROLES: { role: Role; label: string; icon: typeof User }[] = [
  { role: 'patient', label: 'Patient', icon: User },
  { role: 'student', label: 'Student', icon: GraduationCap },
  { role: 'professional', label: 'Professional', icon: Briefcase },
  { role: 'admin', label: 'Admin', icon: Shield },
];

export default function Login() {
  const { signInDemo } = useAuth();
  const navigate = useNavigate();
  const from = (useLocation().state as { from?: string } | null)?.from;
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('patient');

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const user = signInDemo(role, email);
    navigate(from ?? homePathFor(user.role), { replace: true });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-medical-50 px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-slate-200/60 bg-surface/90 p-8 shadow-xl backdrop-blur-md sm:p-10">
        <div className="mb-6 flex items-center justify-between"><Link to="/" className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-medical-600"><ArrowLeft className="mr-1 h-4 w-4" /> Home</Link><ThemeToggle /></div>
        <div className="mb-8 flex flex-col items-center gap-4 text-center">
          <Logo />
          <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
        </div>

        {DEMO_MODE ? (
          <form onSubmit={onSubmit} className="space-y-6">
            <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
              Demo mode: pick a portal to explore. No password is needed and nothing is saved to a server.
            </p>
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">Email (optional)</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" className="w-full rounded-xl border border-slate-200 bg-surface px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-medical-500" />
            </div>
            <fieldset>
              <legend className="mb-3 text-sm font-medium text-slate-700">Sign in as</legend>
              <div className="grid grid-cols-2 gap-3">
                {ROLES.map(({ role: r, label, icon: Icon }) => (
                  <label key={r} className={`cursor-pointer rounded-xl border p-3 text-center text-xs font-semibold transition ${role === r ? 'border-medical-500 bg-medical-50 text-medical-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                    <input type="radio" name="role" value={r} checked={role === r} onChange={() => setRole(r)} className="sr-only" />
                    <Icon className="mx-auto mb-1.5 h-5 w-5" aria-hidden /> {label}
                  </label>
                ))}
              </div>
            </fieldset>
            <button type="submit" className="w-full rounded-xl bg-medical-600 px-4 py-3.5 font-semibold text-white shadow-lg shadow-medical-600/30 hover:bg-medical-700">Enter portal</button>
          </form>
        ) : (
          <p className="text-center text-sm text-slate-600">
            {/* TODO(auth): render the real provider's sign-in (email + password, magic link, OAuth, MFA for staff). */}
            Sign-in is not configured. Set <code>VITE_DEMO_MODE=true</code> or connect an auth provider.
          </p>
        )}

        <p className="mt-8 text-center text-sm text-slate-600">
          No account? <Link to="/signup" className="font-semibold text-medical-600 hover:text-medical-800">Create one</Link>
        </p>
      </div>
    </div>
  );
}
