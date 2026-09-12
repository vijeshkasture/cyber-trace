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
    <div className="flex min-h-screen items-center justify-center bg-police-bg px-4 py-8">
      <div className="w-full max-w-md rounded-2xl border border-police-border bg-police-navy p-7 shadow-sm">
        <div className="mb-7 flex items-center justify-center">
          <img src="/ctlogo1.png" alt="CyberTrace logo" className="h-20 w-auto object-contain" />
        </div>
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-200">
            <ShieldCheck className="h-3.5 w-3.5 text-police-accent" />
            Investigation Workstation
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-300">Officer ID / Official Email</label>
            <input
              type="text"
              value={form.officer_id}
              onChange={(e) => setForm({ ...form, officer_id: e.target.value })}
              className="w-full rounded border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-slate-400 outline-none transition focus:border-police-accent"
              placeholder="OFF-1001"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-300">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full rounded border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-slate-400 outline-none transition focus:border-police-accent"
              placeholder="Enter password"
              required
            />
          </div>

          {error && <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-police-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-police-accentHover disabled:opacity-60"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-5 rounded border border-white/10 bg-white/5 p-3 text-left text-xs text-slate-300">
          <div className="mb-1 font-semibold uppercase tracking-[0.12em] text-slate-200">Demo Access</div>
          <div>Officer ID: <span className="font-mono text-white">user123</span></div>
          <div>Password: <span className="font-mono text-white">userpass123</span></div>
        </div>

        <p className="mt-5 text-center text-sm text-slate-300">
          Don’t have an account?{' '}
          <Link to="/register" className="font-semibold text-police-accent hover:text-blue-300">Create officer account</Link>
        </p>
      </div>
    </div>
  );
}
