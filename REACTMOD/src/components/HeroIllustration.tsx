import { Bot, CheckCircle2, Droplets, GraduationCap, HeartPulse, ShieldCheck, Wind } from 'lucide-react';

/** Product illustration drawn in HTML/SVG: no external images, themes automatically. */
export function HeroIllustration() {
  return (
    <div className="relative mx-auto w-full max-w-xl select-none" aria-hidden>
      {/* glow */}
      <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-gradient-to-tr from-medical-400/30 via-indigo-400/20 to-emerald-300/20 blur-2xl" />

      {/* main app window */}
      <div className="animate-float rounded-3xl border border-slate-200 bg-surface p-5 shadow-2xl shadow-medical-900/10">
        <div className="mb-4 flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          <span className="ml-3 h-2 w-28 rounded-full bg-slate-100" />
        </div>

        <div className="mb-4 grid grid-cols-3 gap-3">
          {[
            { icon: HeartPulse, label: 'Heart rate', value: '72', unit: 'bpm', tint: 'text-rose-500 bg-rose-50' },
            { icon: Droplets, label: 'Blood pressure', value: '118/75', unit: '', tint: 'text-medical-600 bg-medical-50' },
            { icon: Wind, label: 'SpO₂', value: '98', unit: '%', tint: 'text-emerald-600 bg-emerald-50' },
          ].map(({ icon: Icon, label, value, unit, tint }) => (
            <div key={label} className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
              <span className={`mb-2 flex h-7 w-7 items-center justify-center rounded-lg ${tint}`}><Icon className="h-4 w-4" /></span>
              <p className="text-[10px] font-medium text-slate-500">{label}</p>
              <p className="text-base font-bold text-slate-900">{value}<span className="ml-0.5 text-[10px] font-normal text-slate-500">{unit}</span></p>
            </div>
          ))}
        </div>

        {/* ECG */}
        <div className="rounded-2xl border border-slate-100 bg-slate-950 p-4">
          <div className="mb-2 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider">
            <span className="text-emerald-400">Lead II · live</span>
            <span className="text-white/50">25 mm/s</span>
          </div>
          <svg viewBox="0 0 400 90" className="h-20 w-full">
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M20 0H0V20" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="400" height="90" fill="url(#grid)" />
            <path
              className="ecg-line"
              pathLength={600}
              d="M0 50 H40 L48 44 L56 50 H70 L76 56 L84 10 L92 76 L100 50 H120 L132 38 L146 50 H170 L178 44 L186 50 H200 L206 56 L214 10 L222 76 L230 50 H250 L262 38 L276 50 H300 L308 44 L316 50 H330 L336 56 L344 10 L352 76 L360 50 H380 L390 42 L400 50"
              fill="none"
              stroke="#34d399"
              strokeWidth="2.5"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* floating: AI review card */}
      <div className="animate-float-delayed absolute -left-4 top-1/2 w-56 rounded-2xl border border-slate-200 bg-surface p-4 shadow-xl sm:-left-12">
        <div className="mb-2 flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-700"><ShieldCheck className="h-4 w-4" /></span>
          <p className="text-xs font-bold text-slate-900">AI pre-read · 74%</p>
        </div>
        <div className="mb-2 h-1.5 rounded-full bg-slate-100"><div className="h-1.5 w-[74%] rounded-full bg-amber-400" /></div>
        <p className="text-[11px] text-slate-500">Low confidence → sent to Dr. Chen for review</p>
      </div>

      {/* floating: chat bubble */}
      <div className="animate-float absolute -right-2 -top-6 w-52 rounded-2xl border border-slate-200 bg-surface p-3 shadow-xl sm:-right-10">
        <div className="flex items-start gap-2">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-medical-600 text-white"><Bot className="h-4 w-4" /></span>
          <p className="text-[11px] leading-snug text-slate-600">Your BP is back in range this week. Want a reminder for Thursday's check?</p>
        </div>
      </div>

      {/* floating: learning card */}
      <div className="animate-float-delayed absolute -bottom-8 right-4 flex w-56 items-center gap-3 rounded-2xl border border-slate-200 bg-surface p-3 shadow-xl">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700"><GraduationCap className="h-5 w-5" /></span>
        <div className="min-w-0">
          <p className="truncate text-xs font-bold text-slate-900">ECG simulation passed</p>
          <p className="flex items-center gap-1 text-[11px] text-emerald-600"><CheckCircle2 className="h-3 w-3" /> 92% · built from a real review</p>
        </div>
      </div>
    </div>
  );
}
