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

            <h1 className="text-4xl font-semibold tracking-[-0.06em] text-white">Create your investigation profile.</h1>
            <p className="text-base leading-7 text-slate-300">
              Set up your officer profile to access CyberTrace and begin connecting evidence, entities, and risk.
            </p>
          </div>

          <div className="mt-4 grid max-w-md gap-3 text-sm text-slate-300">
            {['Evidence intake', 'Entity linking', 'Investigation workflow'].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-900/40 px-3 py-2.5">
                <span className="h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="mx-auto w-full max-w-xl">
          <div className="rounded-2xl border border-white/10 bg-[#0b1626]/95 p-5 shadow-[0_24px_70px_rgba(2,6,23,0.45)] backdrop-blur-sm sm:p-7">
            <div className="mb-6 flex items-center justify-center lg:hidden">
              <img src="/ctlogo1.png" alt="CyberTrace logo" className="h-16 w-auto object-contain" />
            </div>

            <div className="mb-6">
              <h2 className="text-2xl font-semibold tracking-[-0.04em] text-white">Create your account</h2>
              <p className="mt-2 text-sm text-slate-300">Set up your investigator profile to access CyberTrace.</p>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-xs font-medium text-slate-300">Full Name</label>
                <input
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-[#07111f] px-3 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-500/20"
                  placeholder="Full name"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-300">Officer ID</label>
                <input
                  value={form.officer_id}
                  onChange={(e) => setForm({ ...form, officer_id: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-[#07111f] px-3 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-500/20"
                  placeholder="OFF-1001"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-300">Department</label>
                <input
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-[#07111f] px-3 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-500/20"
                  placeholder="Department"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1.5 block text-xs font-medium text-slate-300">Official Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-[#07111f] px-3 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-500/20"
                  placeholder="officer@example.com"
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
                  placeholder="Password"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-300">Confirm Password</label>
                <input
                  type="password"
                  value={form.confirm_password}
                  onChange={(e) => setForm({ ...form, confirm_password: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-[#07111f] px-3 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-500/20"
                  placeholder="Confirm password"
                  required
                />
              </div>

              {error && (
                <div className="md:col-span-2 rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2 text-xs text-red-200">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="md:col-span-2 w-full rounded-lg bg-[#159FEF] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0d8ad9] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

            <p className="mt-5 text-center text-sm text-slate-300">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-cyan-300 transition hover:text-cyan-200">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
