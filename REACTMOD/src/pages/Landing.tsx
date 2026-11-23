import { ArrowRight, BookOpen, Briefcase, CheckCircle, Cpu, LayoutGrid, MessageCircle, MessageSquare, Shield, Target, User, Users } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChatPanel } from '../components/ChatPanel';
import { Logo } from '../components/Logo';
import { Modal } from '../components/Modal';

const FEATURES = [
  { icon: MessageSquare, title: 'Aether AI Assistant', text: 'A 24/7 companion that explains health information in plain language and points to a professional when it matters.' },
  { icon: Cpu, title: 'Human-in-the-loop Diagnostics', text: 'AI pre-reads labs, ECGs and scans; low-confidence cases are routed to a licensed clinician before anything is final.' },
  { icon: LayoutGrid, title: 'Smart Patient Dashboard', text: 'Vitals, appointments and trends for patients, with the same records visible to their care team.' },
  { icon: BookOpen, title: 'Learning Hub', text: 'Simulations and quizzes for medical and lab-science students, built from real (de-identified) review cases.' },
  { icon: Target, title: 'Career Match', text: 'Students who prove skill in the hub are matched to internships and roles at partner institutions.' },
  { icon: Users, title: 'Research Hub', text: 'Professionals contribute de-identified datasets with consent tracking to improve the models.' },
];

const PORTALS = [
  { icon: User, title: 'Patients & Students', text: 'Health tracking, the Aether AI assistant and learning modules.', to: '/signup', cta: 'Enter portal' },
  { icon: Briefcase, title: 'Medical Professionals', text: 'Review the AI diagnostic queue, manage patients and mentor students.', to: '/signup', cta: 'Enter portal' },
  { icon: Shield, title: 'System Operators', text: 'Model health, user management, content and platform analytics.', to: '/login', cta: 'Admin sign in' },
];

const SUGGESTIONS = ['What are the early signs of hypertension?', 'How does the AI diagnostic tool work?', 'Can you help me interpret an ECG scan?'];

export default function Landing() {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div className="bg-slate-50 text-slate-800">
      <header className="fixed z-40 w-full border-b border-slate-200/60 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Logo />
          <nav className="flex items-center gap-6 text-sm font-medium text-slate-600" aria-label="Primary">
            <a href="#about" className="hidden hover:text-medical-600 md:inline">About</a>
            <a href="#portals" className="hidden hover:text-medical-600 md:inline">Portals</a>
            <a href="#features" className="hidden hover:text-medical-600 md:inline">Features</a>
            <Link to="/login" className="hover:text-medical-600">Sign in</Link>
            <Link to="/signup" className="rounded-full bg-slate-900 px-5 py-2.5 text-white hover:bg-medical-600">Get started</Link>
          </nav>
        </div>
      </header>

      <section className="bg-gradient-to-br from-slate-50 to-medical-50 px-4 pb-24 pt-40 text-center">
        <span className="mb-8 inline-flex items-center rounded-full border border-medical-100 bg-white/60 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-medical-700">
          <span className="mr-2 h-2 w-2 rounded-full bg-medical-500" /> Proof of concept
        </span>
        <h1 className="mx-auto mb-6 max-w-5xl text-5xl font-extrabold leading-tight tracking-tight text-slate-900 md:text-7xl">
          Where Medical Intelligence <span className="bg-gradient-to-r from-medical-600 to-indigo-600 bg-clip-text text-transparent">Meets the Future.</span>
        </h1>
        <p className="mx-auto mb-10 max-w-2xl text-lg text-slate-600">
          One platform that connects patient care, clinician review and medical education in a single AI-assisted loop.
        </p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <button onClick={() => setChatOpen(true)} className="flex items-center rounded-full bg-medical-600 px-8 py-4 font-semibold text-white shadow-lg shadow-medical-600/30 hover:bg-medical-700">
            <MessageCircle className="mr-2 h-5 w-5" /> Talk to Aether AI
          </button>
          <Link to="/login" className="flex items-center rounded-full border border-slate-200 bg-white px-8 py-4 font-semibold text-slate-700 hover:text-medical-600">
            <LayoutGrid className="mr-2 h-5 w-5" /> Explore the dashboards
          </Link>
        </div>
      </section>

      <section id="about" className="bg-white px-4 py-24">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-6 text-3xl font-bold text-slate-900 md:text-4xl">Bridging the gap between care and computation.</h2>
          <p className="mb-6 text-lg text-slate-600">
            Clinicians lack time and predictive tools, students train on cases that do not look like real practice, and patient data sits in silos.
            AetherMed links <strong>learning, diagnosis and management</strong> so each one feeds the others.
          </p>
          <ul className="space-y-3">
            {['Lab scientists and doctors work on the same case record.', 'Every AI suggestion is reviewed by a licensed professional.', 'Built for privacy: consent, audit logs and de-identification by design.'].map((t) => (
              <li key={t} className="flex items-start gap-3 text-slate-700"><CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-medical-500" /> {t}</li>
            ))}
          </ul>
        </div>
      </section>

      <section id="portals" className="px-4 py-24">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-12 text-center text-3xl font-bold text-slate-900 md:text-4xl">One ecosystem. Three portals.</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {PORTALS.map(({ icon: Icon, title, text, to, cta }) => (
              <div key={title} className="rounded-3xl border border-slate-100 bg-white p-8 transition hover:-translate-y-1 hover:shadow-xl">
                <span className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-medical-100 text-medical-600"><Icon className="h-7 w-7" /></span>
                <h3 className="mb-3 text-2xl font-bold text-slate-900">{title}</h3>
                <p className="mb-6 text-slate-600">{text}</p>
                <Link to={to} className="inline-flex items-center font-semibold text-medical-600 hover:text-medical-800">{cta} <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="bg-white px-4 py-24">
        <div className="mx-auto grid max-w-7xl gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <div key={title}>
              <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-medical-50 text-medical-600"><Icon className="h-6 w-6" /></span>
              <h3 className="mb-3 text-xl font-bold text-slate-900">{title}</h3>
              <p className="text-slate-600">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="bg-slate-900 px-4 py-12 text-sm text-slate-400">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 md:flex-row">
          <Logo dark />
          <p>© {new Date().getFullYear()} AetherMed. Proof of concept, not a medical device.</p>
        </div>
      </footer>

      <button
        onClick={() => setChatOpen(true)}
        className="fixed bottom-6 right-6 z-40 h-16 w-16 overflow-hidden rounded-full border-2 border-medical-500 bg-white shadow-2xl hover:scale-110"
        aria-label="Talk to Aether AI"
      >
        <img src="/aether_ai.png" alt="" className="h-full w-full object-cover" />
      </button>

      <Modal open={chatOpen} onClose={() => setChatOpen(false)} title="Aether AI">
        <div className="-m-6 h-[65vh]">
          <ChatPanel
            context="public-demo"
            limit={3}
            suggestions={SUGGESTIONS}
            greeting="Hello! I'm Aether AI. Ask me about your health or your studies."
          />
        </div>
      </Modal>
    </div>
  );
}
