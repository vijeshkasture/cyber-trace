import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ officer_id: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(form);
      navigate('/cases');
    } catch (err) {
      setError(err.message || 'Unable to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-[#050b14] text-slate-100"
      style={{
        backgroundImage: `radial-gradient(circle at 70% 30%, rgba(21,159,239,0.12), transparent 36%), linear-gradient(135deg, rgba(5,11,20,0.98), rgba(5,11,20,1))`,
        backgroundSize: 'cover',
      }}
    >
      <div className="mx-auto grid min-h-screen max-w-6xl items-center gap-10 px-4 py-8 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
        <div className="hidden lg:flex lg:flex-col lg:justify-center lg:gap-6">
          <div className="flex items-center gap-3">
            <img src="/ctlogo1.png" alt="CyberTrace AI" className="h-12 w-auto object-contain" />
          </div>

          <div className="max-w-md space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-slate-900/60 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-200">
              <ShieldCheck className="h-3.5 w-3.5 text-cyan-300" />
              Digital Forensics • Cybercrime Investigation
            </div>

            <h1 className="text-4xl font-semibold tracking-[-0.06em] text-white">Secure access to your investigation workspace.</h1>
            <p className="text-base leading-7 text-slate-300">
              Investigate evidence, connect entities, and understand risk across fragmented digital records.
            </p>
          </div>

          <div className="mt-4 grid max-w-md gap-3 text-sm text-slate-300">
            {['Evidence analysis', 'Entity correlation', 'Risk assessment'].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-900/40 px-3 py-2.5">
                <span className="h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="mx-auto w-full max-w-md">
          <div className="rounded-2xl border border-white/10 bg-[#0b1626]/95 p-5 shadow-[0_24px_70px_rgba(2,6,23,0.45)] backdrop-blur-sm sm:p-7">
            <div className="mb-6 flex items-center justify-center lg:hidden">
              <img src="/ctlogo1.png" alt="CyberTrace logo" className="h-16 w-auto object-contain" />
            </div>

            <div className="mb-6">
              <h2 className="text-2xl font-semibold tracking-[-0.04em] text-white">Welcome back</h2>
              <p className="mt-2 text-sm text-slate-300">Sign in to continue to your investigation workspace.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-300">Officer ID / Official Email</label>
                <input
                  type="text"
                  value={form.officer_id}
                  onChange={(e) => setForm({ ...form, officer_id: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-[#07111f] px-3 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-500/20"
                  placeholder="OFF-1001"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-300">Password</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-[#07111f] px-3 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-500/20"
                  placeholder="Enter password"
                  required
                />
              </div>

              {error && (
                <div className="rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2 text-xs text-red-200">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-[#159FEF] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0d8ad9] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Signing in...' : 'Sign In →'}
              </button>
            </form>

            <div className="mt-5 rounded-xl border border-white/10 bg-slate-900/50 p-3 text-left text-xs text-slate-300">
              <div className="mb-1.5 font-semibold uppercase tracking-[0.12em] text-slate-200">Demo Access</div>
              <div>Officer ID: <span className="font-mono text-white">user123</span></div>
              <div>Password: <span className="font-mono text-white">userpass123</span></div>
            </div>

            <p className="mt-5 text-center text-sm text-slate-300">
              Don’t have an account?{' '}
              <Link to="/register" className="font-semibold text-cyan-300 transition hover:text-cyan-200">Create officer account</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
