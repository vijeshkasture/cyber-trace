import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({
    full_name: '',
    officer_id: '',
    email: '',
    department: '',
    password: '',
    confirm_password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirm_password) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await register(form);
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Unable to create officer account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-police-bg px-4 py-8">
      <div className="w-full max-w-xl rounded-2xl border border-police-border bg-police-navy p-7 shadow-sm">
        <div className="mb-7 flex items-center justify-center">
          <img src="/ctlogo1.png" alt="CyberTrace logo" className="h-20 w-auto object-contain" />
        </div>
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-200">
            <ShieldCheck className="h-3.5 w-3.5 text-police-accent" />
            Create Officer Account
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-medium text-slate-300">Full Name</label>
            <input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="w-full rounded border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-slate-400 outline-none focus:border-police-accent" required />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-300">Officer ID</label>
            <input value={form.officer_id} onChange={(e) => setForm({ ...form, officer_id: e.target.value })} className="w-full rounded border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-slate-400 outline-none focus:border-police-accent" required />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-300">Department</label>
            <input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="w-full rounded border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-slate-400 outline-none focus:border-police-accent" required />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-medium text-slate-300">Official Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-slate-400 outline-none focus:border-police-accent" required />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-300">Password</label>
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full rounded border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-slate-400 outline-none focus:border-police-accent" required />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-300">Confirm Password</label>
            <input type="password" value={form.confirm_password} onChange={(e) => setForm({ ...form, confirm_password: e.target.value })} className="w-full rounded border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-slate-400 outline-none focus:border-police-accent" required />
          </div>

          {error && <div className="md:col-span-2 rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{error}</div>}

          <button type="submit" disabled={loading} className="md:col-span-2 w-full rounded bg-police-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-police-accentHover disabled:opacity-60">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-300">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-police-accent hover:text-blue-300">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
