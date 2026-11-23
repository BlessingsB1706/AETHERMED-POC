import { ArrowLeft } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { ThemeToggle } from '../lib/theme';
import { homePathFor, useAuth, type Role } from '../lib/auth';

const ROLES: { value: Role | 'institution'; label: string }[] = [
  { value: 'patient', label: 'Patient' },
  { value: 'student', label: 'Student' },
  { value: 'professional', label: 'Professional' },
  { value: 'institution', label: 'Institution' },
];

export default function Signup() {
  const { signInDemo } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirm: '', role: 'patient' as Role | 'institution', terms: false });
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (form.password.length < 12) return setError('Use at least 12 characters for your password.');
    if (form.password !== form.confirm) return setError('Passwords do not match.');
    setError(null);
    // TODO(auth): create the account with the auth provider. Professionals and institutions go to a
    // "pending verification" state until their licence / registration is checked by an admin.
    if (form.role === 'institution') return navigate('/login');
    const user = signInDemo(form.role, form.email);
    navigate(homePathFor(user.role));
  }

  const input = 'w-full rounded-xl border border-slate-200 bg-surface px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-medical-500';

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-medical-50 px-4 py-12">
      <div className="w-full max-w-2xl rounded-3xl border border-slate-200/60 bg-surface/90 p-8 shadow-xl backdrop-blur-md sm:p-10">
        <div className="mb-6 flex items-center justify-between"><Link to="/" className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-medical-600"><ArrowLeft className="mr-1 h-4 w-4" /> Home</Link><ThemeToggle /></div>
        <div className="mb-8 flex flex-col items-center gap-4 text-center">
          <Logo />
          <h1 className="text-2xl font-bold text-slate-900">Create account</h1>
        </div>
        <form onSubmit={onSubmit} className="space-y-5" noValidate={false}>
          <div className="grid gap-5 md:grid-cols-2">
            <div><label htmlFor="fn" className="mb-1.5 block text-sm font-medium text-slate-700">First name</label><input id="fn" required autoComplete="given-name" className={input} value={form.firstName} onChange={(e) => set('firstName', e.target.value)} /></div>
            <div><label htmlFor="ln" className="mb-1.5 block text-sm font-medium text-slate-700">Last name</label><input id="ln" required autoComplete="family-name" className={input} value={form.lastName} onChange={(e) => set('lastName', e.target.value)} /></div>
          </div>
          <div><label htmlFor="em" className="mb-1.5 block text-sm font-medium text-slate-700">Email</label><input id="em" type="email" required autoComplete="email" className={input} value={form.email} onChange={(e) => set('email', e.target.value)} /></div>
          <div className="grid gap-5 md:grid-cols-2">
            <div><label htmlFor="pw" className="mb-1.5 block text-sm font-medium text-slate-700">Password</label><input id="pw" type="password" required minLength={12} autoComplete="new-password" className={input} value={form.password} onChange={(e) => set('password', e.target.value)} /></div>
            <div><label htmlFor="pw2" className="mb-1.5 block text-sm font-medium text-slate-700">Confirm password</label><input id="pw2" type="password" required autoComplete="new-password" className={input} value={form.confirm} onChange={(e) => set('confirm', e.target.value)} /></div>
          </div>
          <fieldset>
            <legend className="mb-3 text-sm font-medium text-slate-700">I am registering as a</legend>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {ROLES.map(({ value, label }) => (
                <label key={value} className={`cursor-pointer rounded-xl border p-3 text-center text-xs font-semibold ${form.role === value ? 'border-medical-500 bg-medical-50 text-medical-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                  <input type="radio" name="role" value={value} checked={form.role === value} onChange={() => set('role', value)} className="sr-only" /> {label}
                </label>
              ))}
            </div>
          </fieldset>
          <label className="flex items-start gap-3 text-sm text-slate-600">
            <input type="checkbox" required checked={form.terms} onChange={(e) => set('terms', e.target.checked)} className="mt-1 h-4 w-4" />
            <span>I agree to the Terms of Service and Privacy Policy, and consent to my health data being processed as described there.</span>
          </label>
          {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <button type="submit" className="w-full rounded-xl bg-medical-600 px-4 py-3.5 font-semibold text-white hover:bg-medical-700">Create account</button>
        </form>
        <p className="mt-8 text-center text-sm text-slate-600">Already have an account? <Link to="/login" className="font-semibold text-medical-600">Sign in</Link></p>
      </div>
    </div>
  );
}
