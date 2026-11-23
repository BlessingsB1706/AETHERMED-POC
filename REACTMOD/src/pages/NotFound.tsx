import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 text-center">
      <p className="text-6xl font-extrabold text-medical-600">404</p>
      <p className="text-slate-600">This page does not exist.</p>
      <Link to="/" className="rounded-full bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white">Back home</Link>
    </div>
  );
}
