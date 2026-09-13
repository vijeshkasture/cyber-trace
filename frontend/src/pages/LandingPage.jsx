import React from 'react';
import { ArrowRight, CheckCircle2, FileText, ShieldCheck, Workflow } from 'lucide-react';
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
    <div className="min-h-screen bg-[#050b14] text-slate-100">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#050b14]/90 text-slate-50 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-3">
            <img src="/ctlogo1.png" alt="CyberTrace AI" className="h-10 w-auto object-contain sm:h-12" />
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <Link to="/login" className="text-sm font-medium text-slate-200 transition-colors hover:text-white">
              Sign In
            </Link>
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center gap-2 rounded-md border border-cyan-400/25 bg-[#159FEF] px-3.5 py-2 text-sm font-semibold text-white shadow-[0_0_25px_rgba(21,159,239,0.25)] transition hover:bg-[#0d8ad9] sm:px-4"
            >
              Start Investigation
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="relative overflow-hidden bg-[#050b14]">
        <section
          className="relative isolate overflow-hidden"
          style={{
            backgroundImage: `linear-gradient(90deg, rgba(5,11,20,0.96) 0%, rgba(5,11,20,0.82) 34%, rgba(5,11,20,0.42) 66%, rgba(5,11,20,0.72) 100%), url('/bg1.png')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center center',
          }}
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,_rgba(21,159,239,0.18),_transparent_26%),radial-gradient(circle_at_80%_40%,_rgba(34,211,238,0.14),_transparent_24%)]" />

          <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-12 sm:px-6 sm:pt-16 lg:pb-24 lg:pt-20">
            <div className="grid items-center gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:gap-12">
              <div className="max-w-xl">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/60 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-200 shadow-sm backdrop-blur-sm">
                  <ShieldCheck className="h-3.5 w-3.5 text-cyan-300" />
                  Digital Forensics • Cybercrime Investigation
                </div>

                <h1 className="text-4xl font-semibold leading-[1.02] tracking-[-0.06em] text-white sm:text-5xl lg:text-[4rem]">
                  Turn Digital Evidence
                  <span className="block text-slate-200">into Investigation Intelligence</span>
                </h1>

                <p className="mt-5 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
                  CyberTrace AI connects fragmented digital evidence, entities, relationships, suspicious patterns, and risk into a single investigation workflow.
                </p>

                <div className="mt-8 flex flex-wrap gap-3 sm:gap-4">
                  <button
                    onClick={() => navigate('/login')}
                    className="inline-flex items-center gap-2 rounded-md bg-[#159FEF] px-5 py-3 text-sm font-semibold text-white shadow-[0_0_25px_rgba(21,159,239,0.25)] transition hover:bg-[#0d8ad9]"
                  >
                    Start Investigation
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <a
                    href="#workflow"
                    className="inline-flex items-center gap-2 rounded-md border border-white/15 bg-slate-900/40 px-5 py-3 text-sm font-semibold text-slate-100 backdrop-blur-sm transition hover:border-cyan-400/40 hover:bg-slate-900/60"
                  >
                    View how it works
                  </a>
                </div>

                <div className="mt-8 flex flex-wrap gap-2 text-xs font-medium text-slate-300">
                  {['Evidence', 'Entities', 'Patterns', 'Risk'].map((label) => (
                    <span key={label} className="rounded-full border border-white/10 bg-slate-900/45 px-2.5 py-1.5 backdrop-blur-sm">
                      {label}
                    </span>
                  ))}
                </div>
              </div>

              <div className="relative hidden lg:block">
                <div className="absolute -left-8 top-10 h-28 w-28 rounded-full bg-cyan-400/10 blur-3xl" />
                <div className="absolute -right-8 bottom-8 h-24 w-24 rounded-full bg-blue-500/10 blur-3xl" />
              </div>
            </div>
          </div>
        </section>

        <section id="workflow" className="border-t border-white/10 bg-[#050b14]">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
            <div className="mb-8 text-center">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-200">Investigation Pipeline</div>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white">Evidence to intelligence</h2>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
              {pipeline.map((step, index) => (
                <React.Fragment key={step}>
                  <div className="rounded-full border border-cyan-400/20 bg-[#0b1626] px-4 py-2 text-sm font-medium text-slate-100 shadow-[0_0_0_1px_rgba(34,211,238,0.08)]">
                    {step}
                  </div>
                  {index < pipeline.length - 1 && (
                    <div className="text-slate-500">→</div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <div className="mb-8 text-center">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-200">Evidence Sources</div>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white">Supported case data</h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {evidenceSources.map((source) => (
              <div key={source.title} className="rounded-2xl border border-white/10 bg-[#0b1626] p-5 shadow-[0_0_0_1px_rgba(148,163,184,0.04)] transition hover:-translate-y-0.5 hover:border-cyan-400/25">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-300">
                  <FileText className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-white">{source.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">{source.subtitle}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-y border-white/10 bg-[#08111f]">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
            <div className="mb-8 text-center">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-200">Capabilities</div>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white">What CyberTrace connects</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {capabilities.map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0b1626] p-4 text-sm font-medium text-slate-200 shadow-[0_0_0_1px_rgba(148,163,184,0.04)] transition hover:border-cyan-400/25 hover:bg-[#0f1d30]">
                  <CheckCircle2 className="h-4 w-4 text-cyan-300" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:py-20">
          <div className="rounded-[28px] border border-white/10 bg-[#0b1626] p-7 text-white shadow-[0_18px_70px_rgba(2,6,23,0.45)] sm:p-8 lg:p-10">
            <div className="mb-4 flex items-center gap-3 text-cyan-200">
              <Workflow className="h-5 w-5" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em]">Why CyberTrace</span>
            </div>
            <h2 className="max-w-2xl text-3xl font-semibold tracking-[-0.05em] text-white sm:text-4xl">
              Fragmented evidence should not remain fragmented.
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
              CyberTrace connects evidence to entities, relationships, patterns, risk, and investigation decisions in a single, explainable workflow that helps teams move from raw data to actionable intelligence.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 pb-20 pt-2 sm:px-6">
          <div className="text-center">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-200">Ready to begin</div>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
              Ready to begin an investigation?
            </h2>
            <button
              onClick={() => navigate('/login')}
              className="mt-8 inline-flex items-center gap-2 rounded-md bg-[#159FEF] px-6 py-3 text-sm font-semibold text-white shadow-[0_0_30px_rgba(21,159,239,0.25)] transition hover:bg-[#0d8ad9]"
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
