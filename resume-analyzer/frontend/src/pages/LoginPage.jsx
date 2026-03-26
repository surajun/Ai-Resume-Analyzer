import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else {
        await register(form.name, form.email, form.password);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center p-4">
      {/* Background glow effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-700 rounded-full opacity-10 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-brand-500 rounded-full opacity-10 blur-3xl" />
      </div>

      <div className="w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-600 mb-4 shadow-lg shadow-brand-900/50">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-display font-bold text-white tracking-tight">ResumeAI</h1>
          <p className="text-surface-200 text-sm mt-1 font-sans">AI-powered resume analysis platform</p>
        </div>

        {/* Card */}
        <div className="bg-surface-900 border border-white/10 rounded-2xl p-8 shadow-2xl">
          {/* Tabs */}
          <div className="flex rounded-xl bg-surface-950 p-1 mb-6">
            {['login', 'register'].map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); }}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  mode === m
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-surface-200 hover:text-white'
                }`}
              >
                {m === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm animate-fade-in">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-surface-200 mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Jane Smith"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-surface-950 border border-white/10 rounded-xl text-white placeholder-surface-200/50 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors text-sm"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-surface-200 mb-1.5">Email</label>
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-2.5 bg-surface-950 border border-white/10 rounded-xl text-white placeholder-surface-200/50 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-200 mb-1.5">Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-4 py-2.5 bg-surface-950 border border-white/10 rounded-xl text-white placeholder-surface-200/50 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-brand-600 hover:bg-brand-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 mt-2 shadow-lg shadow-brand-900/40"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                </>
              ) : (
                mode === 'login' ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
