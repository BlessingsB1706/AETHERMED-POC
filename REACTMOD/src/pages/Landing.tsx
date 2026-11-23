import { ArrowRight, BookOpen, Briefcase, CheckCircle, Cpu, LayoutGrid, MessageCircle, MessageSquare, Shield, ShieldCheck, Stethoscope, Target, User, UserRound, Users, GraduationCap } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChatPanel } from '../components/ChatPanel';
import { HeroIllustration } from '../components/HeroIllustration';
import { Logo } from '../components/Logo';
import { Modal } from '../components/Modal';
import { ThemeToggle } from '../lib/theme';

const FEATURES = [
  { icon: MessageSquare, title: 'Aether AI Assistant', text: 'A 24/7 companion that explains health information in plain language and points to a professional when it matters.', tint: 'bg-medical-50 text-medical-600' },
  { icon: Cpu, title: 'Human-in-the-loop Diagnostics', text: 'AI pre-reads labs, ECGs and scans; low-confidence cases are routed to a licensed clinician before anything is final.', tint: 'bg-indigo-50 text-indigo-700' },
  { icon: LayoutGrid, title: 'Smart Patient Dashboard', text: 'Vitals, appointments and trends for patients, with the same record visible to their care team.', tint: 'bg-emerald-50 text-emerald-700' },
  { icon: BookOpen, title: 'Learning Hub', text: 'Simulations and quizzes for medical and lab-science students, built from real (de-identified) review cases.', tint: 'bg-purple-50 text-purple-700' },
  { icon: Target, title: 'Career Match', text: 'Students who prove skill in the hub are matched to internships and roles at partner institutions.', tint: 'bg-amber-50 text-amber-700' },
  { icon: Users, title: 'Research Hub', text: 'Professionals contribute de-identified datasets with consent tracking to improve the models.', tint: 'bg-rose-50 text-rose-700' },
];

const PORTALS = [
  { icon: User, title: 'Patients & Students', text: 'Health tracking, the Aether AI assistant and learning modules.', to: '/signup', cta: 'Enter portal', dark: false },
  { icon: Briefcase, title: 'Medical Professionals', text: 'Review the AI diagnostic queue, manage patients and mentor students.', to: '/signup', cta: 'Enter portal', dark: false },
  { icon: Shield, title: 'System Operators', text: 'Model and server health, admins and users, content and platform analytics.', to: '/login', cta: 'Admin sign in', dark: true },
];

const LOOP = [
  { icon: UserRound, title: 'Patient', text: 'Shares symptoms, vitals or a lab result.' },
  { icon: Cpu, title: 'AI pre-read', text: 'Flags findings with a confidence score.' },
  { icon: Stethoscope, title: 'Clinician signs off', text: 'Every result is reviewed before release.' },
  { icon: GraduationCap, title: 'Becomes training', text: 'De-identified cases power student simulations.' },
  { icon: Target, title: 'Talent pipeline', text: 'Top performers matched to real roles.' },
];

const SUGGESTIONS = ['What are the early signs of hypertension?', 'How does the AI diagnostic tool work?', 'Can you help me interpret an ECG scan?'];

export default function Landing() {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div className="bg-slate-50 text-slate-800">
      <header className="fixed z-40 w-full border-b border-slate-200/60 bg-surface/80 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <Logo />
          <nav className="flex items-center gap-4 text-sm font-medium text-slate-600 sm:gap-6" aria-label="Primary">
            <a href="#how" className="hidden hover:text-medical-600 md:inline">How it works</a>
            <a href="#portals" className="hidden hover:text-medical-600 md:inline">Portals</a>
            <a href="#features" className="hidden hover:text-medical-600 md:inline">Features</a>
            <ThemeToggle />
            <Link to="/login" className="hidden hover:text-medical-600 sm:inline">Sign in</Link>
            <Link to="/signup" className="rounded-full bg-slate-950 px-5 py-2.5 text-white hover:bg-medical-600 dark:bg-medical-600">Get started</Link>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-medical-50 to-indigo-50 px-4 pb-28 pt-36 lg:pt-44">
        <div className="pointer-events-none absolute -right-40 -top-40 h-96 w-96 rounded-full bg-medical-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -left-40 top-60 h-96 w-96 rounded-full bg-indigo-400/20 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2">
          <div className="text-center lg:text-left">
            <span className="mb-8 inline-flex items-center rounded-full border border-medical-100 bg-surface/70 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-medical-700 backdrop-blur">
              <span className="mr-2 h-2 w-2 animate-pulse rounded-full bg-medical-500" /> Proof of concept
            </span>
            <h1 className="mb-6 text-5xl font-extrabold leading-[1.1] tracking-tight text-slate-900 md:text-6xl xl:text-7xl">
              Where Medical Intelligence <span className="bg-gradient-to-r from-medical-600 to-indigo-500 bg-clip-text text-transparent">Meets the Future.</span>
            </h1>
            <p className="mx-auto mb-10 max-w-xl text-lg text-slate-600 lg:mx-0">
              One platform that connects patient care, clinician review and medical education in a single AI-assisted loop, with a human signing off on every result.
            </p>
            <div className="flex flex-col items-center gap-4 sm:flex-row lg:justify-start sm:justify-center">
              <button onClick={() => setChatOpen(true)} className="flex w-full items-center justify-center rounded-full bg-medical-600 px-8 py-4 font-semibold text-white shadow-lg shadow-medical-600/30 hover:bg-medical-700 sm:w-auto">
                <MessageCircle className="mr-2 h-5 w-5" /> Talk to Aether AI
              </button>
              <Link to="/login" className="flex w-full items-center justify-center rounded-full border border-slate-200 bg-surface px-8 py-4 font-semibold text-slate-700 hover:text-medical-600 sm:w-auto">
                <LayoutGrid className="mr-2 h-5 w-5" /> Explore the dashboards
              </Link>
            </div>
            <ul className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-slate-500 lg:justify-start">
              {['3 connected portals', 'Human sign-off on AI results', 'Consent & audit by design'].map((t) => (
                <li key={t} className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-emerald-500" /> {t}</li>
              ))}
            </ul>
          </div>
          <div className="px-6 py-10 sm:px-12">
            <HeroIllustration />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="bg-surface px-4 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-14 max-w-3xl text-center">
            <p className="mb-2 font-semibold uppercase tracking-wide text-medical-600">How it works</p>
            <h2 className="mb-4 text-3xl font-bold text-slate-900 md:text-4xl">One loop. Every step makes the next one better.</h2>
            <p className="text-lg text-slate-600">Care, review and education usually live in separate tools. AetherMed connects them, so each verified case improves the AI and trains the next generation of clinicians and lab scientists.</p>
          </div>
          <ol className="grid gap-6 md:grid-cols-5">
            {LOOP.map(({ icon: Icon, title, text }, i) => (
              <li key={title} className="relative rounded-2xl border border-slate-100 bg-slate-50 p-6 text-center">
                <span className="absolute left-4 top-4 text-xs font-bold text-slate-400">0{i + 1}</span>
                <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-medical-600 text-white shadow-lg shadow-medical-600/30"><Icon className="h-6 w-6" /></span>
                <h3 className="mb-1 font-bold text-slate-900">{title}</h3>
                <p className="text-sm text-slate-500">{text}</p>
                {i < LOOP.length - 1 && <ArrowRight className="absolute -right-5 top-1/2 hidden h-4 w-4 -translate-y-1/2 text-slate-300 md:block" aria-hidden />}
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* PORTALS */}
      <section id="portals" className="px-4 py-24">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-4 text-center text-3xl font-bold text-slate-900 md:text-4xl">One ecosystem. Three portals.</h2>
          <p className="mx-auto mb-12 max-w-2xl text-center text-lg text-slate-600">Tailored experiences for every user in the healthcare lifecycle.</p>
          <div className="grid gap-8 md:grid-cols-3">
            {PORTALS.map(({ icon: Icon, title, text, to, cta, dark }) => (
              <div key={title} className={`group relative overflow-hidden rounded-3xl border p-8 transition hover:-translate-y-1 hover:shadow-xl ${dark ? 'border-slate-950 bg-slate-950 text-white' : 'border-slate-100 bg-surface'}`}>
                <div className={`absolute -right-6 -top-6 h-32 w-32 rounded-full transition-transform group-hover:scale-125 ${dark ? 'bg-white/5' : 'bg-medical-50'}`} />
                <span className={`relative mb-6 flex h-14 w-14 items-center justify-center rounded-2xl ${dark ? 'bg-white/10 text-white' : 'bg-medical-100 text-medical-600'}`}><Icon className="h-7 w-7" /></span>
                <h3 className={`relative mb-3 text-2xl font-bold ${dark ? 'text-white' : 'text-slate-900'}`}>{title}</h3>
                <p className={`relative mb-6 ${dark ? 'text-white/70' : 'text-slate-600'}`}>{text}</p>
                <Link to={to} className={`relative inline-flex items-center font-semibold ${dark ? 'text-white hover:text-medical-300' : 'text-medical-600 hover:text-medical-800'}`}>{cta} <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="bg-surface px-4 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-14 max-w-3xl text-center">
            <p className="mb-2 font-semibold uppercase tracking-wide text-medical-600">Platform capabilities</p>
            <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">Engineered for clinicians, learners and patients.</h2>
          </div>
          <div className="grid gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, text, tint }) => (
              <div key={title} className="rounded-2xl p-2">
                <span className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl ${tint}`}><Icon className="h-6 w-6" /></span>
                <h3 className="mb-3 text-xl font-bold text-slate-900">{title}</h3>
                <p className="text-slate-600">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-24">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl bg-gradient-to-br from-medical-600 to-indigo-600 px-8 py-16 text-center text-white shadow-2xl shadow-medical-600/20">
          <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]" />
          <ShieldCheck className="relative mx-auto mb-6 h-12 w-12" />
          <h2 className="relative mb-4 text-3xl font-bold md:text-4xl">See the whole loop in two minutes.</h2>
          <p className="relative mx-auto mb-8 max-w-xl text-white/80">Open the demo portals: no password, no real data, nothing saved.</p>
          <Link to="/login" className="relative inline-flex items-center rounded-full bg-white px-8 py-4 font-semibold text-medical-600 hover:bg-white/90">Try the demo <ArrowRight className="ml-2 h-4 w-4" /></Link>
        </div>
      </section>

      <footer className="bg-slate-950 px-4 py-12 text-sm text-white/60">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 md:flex-row">
          <Logo dark />
          <p>© {new Date().getFullYear()} AetherMed. Proof of concept, not a medical device.</p>
        </div>
      </footer>

      <button
        onClick={() => setChatOpen(true)}
        className="fixed bottom-6 right-6 z-40 h-16 w-16 overflow-hidden rounded-full border-2 border-medical-500 bg-white shadow-2xl transition-transform hover:scale-110"
        aria-label="Talk to Aether AI"
      >
        <img src="/aether_ai.png" alt="" className="h-full w-full object-cover" />
      </button>

      <Modal open={chatOpen} onClose={() => setChatOpen(false)} title="Aether AI">
        <div className="-m-6 h-[65vh]">
          <ChatPanel context="public-demo" limit={3} suggestions={SUGGESTIONS} greeting="Hello! I'm Aether AI. Ask me about your health or your studies." />
        </div>
      </Modal>
    </div>
  );
}
