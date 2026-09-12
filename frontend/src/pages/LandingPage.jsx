import React from 'react';
import { ArrowRight, CheckCircle2, FileText, Network, ShieldCheck, Workflow } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const evidenceSources = [
  { title: 'CDR', subtitle: 'Call Detail Records' },
  { title: 'IPDR', subtitle: 'Network activity records' },
  { title: 'Transactions', subtitle: 'Bank / UPI transaction records' },
  { title: 'Device Logs', subtitle: 'IMEI / IMSI / MAC / device activity' },
];

const capabilities = [
  'Entity Correlation',
  'Suspicious Pattern Detection',
  'Explainable Risk',
  'Network Graph',
  'Unified Timeline',
  'Chain of Custody',
  'Forensic Report',
];

const pipeline = [
  'Evidence',
  'Parse',
  'Normalize',
  'Correlate',
  'Detect',
  'Risk',
  'Investigate',
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-police-bg text-police-text">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-black/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <img src="/ctlogo1.png" alt="CyberTrace AI" className="h-14 w-auto object-contain sm:h-16" />
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-slate-200 transition-colors hover:text-white">
              Sign in
            </Link>
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center gap-2 rounded border border-white/10 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
            >
              Start Investigation
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.22),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(34,211,238,0.14),_transparent_32%),linear-gradient(180deg,_rgba(2,6,23,0.0),_rgba(2,6,23,0.32))]" />
        <div className="pointer-events-none absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] [background-size:38px_38px]" />

        <section className="relative mx-auto max-w-6xl px-6 py-20 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-police-border bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-police-textMuted">
                <ShieldCheck className="h-3.5 w-3.5 text-police-accent" />
                Digital Forensics & Cybercrime Investigation
              </div>
              <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-police-navy sm:text-5xl">
                CYBERTRACE AI
              </h1>
              <p className="mt-4 max-w-2xl text-xl text-police-textMuted">
                Transform fragmented digital evidence into connected entities, suspicious patterns, explainable risk, and investigation-ready intelligence.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <button
                  onClick={() => navigate('/login')}
                  className="inline-flex items-center gap-2 rounded bg-police-accent px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-police-accentHover"
                >
                  Start Investigation
                  <ArrowRight className="h-4 w-4" />
                </button>
                <a href="#workflow" className="inline-flex items-center gap-2 rounded border border-police-border bg-white px-5 py-3 text-sm font-semibold text-police-text transition hover:bg-police-subtle">
                  View how it works
                </a>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.32),_transparent_30%),linear-gradient(135deg,_rgba(15,23,42,0.98),_rgba(15,23,42,0.9)_30%,_rgba(2,6,23,1))] p-6 shadow-[0_30px_100px_rgba(14,165,233,0.18)] backdrop-blur-sm">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,_rgba(34,211,238,0.2),_transparent_18%),radial-gradient(circle_at_80%_20%,_rgba(96,165,250,0.18),_transparent_18%)]" />
              <div className="relative">
                <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-300">Fraud Landscape</div>
                    <div className="mt-1 text-lg font-semibold text-white">India & Digital Crime</div>
                  </div>
                  <div className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-cyan-200">
                    Active Signals
                  </div>
                </div>

                <div className="mb-5 flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-400/10 text-cyan-200 shadow-[0_0_25px_rgba(34,211,238,0.25)]">
                    <Network className="h-8 w-8" />
                  </div>
                  <div>
                    <div className="text-3xl font-semibold text-white">UPI + SIM</div>
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-300">Fraud vectors</div>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    ['Synthetic IDs', 'KYC spoofing'],
                    ['Transaction Rings', ' mule accounts'],
                    ['Call Patterns', 'IMSI / CDR trails'],
                    ['Mitigation', 'risk scoring + alerts'],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <div className="text-[10px] uppercase tracking-[0.18em] text-slate-300">{label}</div>
                      <div className="mt-2 text-base font-semibold text-white">{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="workflow" className="border-t border-police-border bg-white">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <div className="mb-10 text-center">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-police-textMuted">Investigation Pipeline</div>
              <h2 className="mt-3 text-3xl font-semibold text-police-navy">Evidence to intelligence</h2>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {pipeline.map((step, index) => (
                <React.Fragment key={step}>
                  <div className="rounded-full border border-police-border bg-police-subtle px-4 py-2 text-sm font-medium text-police-text">
                    {step}
                  </div>
                  {index < pipeline.length - 1 && (
                    <div className="text-police-textDim">↓</div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-20">
          <div className="mb-10 text-center">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-police-textMuted">Evidence Sources</div>
            <h2 className="mt-3 text-3xl font-semibold text-police-navy">Supported case data</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {evidenceSources.map((source) => (
              <div key={source.title} className="rounded-xl border border-police-border bg-white p-5 shadow-sm">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-police-accentLight text-police-accent">
                  <FileText className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-police-navy">{source.title}</h3>
                <p className="mt-2 text-sm text-police-textMuted">{source.subtitle}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-y border-police-border bg-white">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <div className="mb-10 text-center">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-police-textMuted">Capabilities</div>
              <h2 className="mt-3 text-3xl font-semibold text-police-navy">What CyberTrace connects</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {capabilities.map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-xl border border-police-border bg-police-subtle p-4 text-sm font-medium text-police-text">
                  <CheckCircle2 className="h-4 w-4 text-police-accent" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-6 py-20">
          <div className="rounded-2xl border border-police-border bg-police-navy p-8 text-white">
            <div className="mb-4 flex items-center gap-3 text-police-accentLight">
              <Workflow className="h-5 w-5" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em]">Why CyberTrace</span>
            </div>
            <h2 className="max-w-2xl text-3xl font-semibold text-white">
              Fragmented evidence should not remain fragmented.
            </h2>
            <p className="mt-4 max-w-3xl text-base text-slate-200">
              CyberTrace connects evidence to entities, relationships, patterns, risk, and investigation decisions in a single, explainable workflow.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-6 pb-24 pt-6">
          <div className="text-center">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-police-textMuted">Ready to begin</div>
            <h2 className="mt-3 text-3xl font-semibold text-police-navy">Ready to begin an investigation?</h2>
            <button
              onClick={() => navigate('/login')}
              className="mt-8 inline-flex items-center gap-2 rounded bg-police-accent px-6 py-3 text-sm font-semibold text-white transition hover:bg-police-accentHover"
            >
              Start Using CyberTrace
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
