'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Keyboard, Lock, Mail, User, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/auth/register', { username, email, password });
      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa] px-4 font-geek relative">
      {/* Background decorations: grid pattern for hacker feel */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <div className="w-full max-w-md animate-fade-in z-10 flex flex-col">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 uppercase tracking-wider mb-6 transition-colors self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        {/* Logo */}
        <div className="w-full flex flex-col items-center mb-6">
          <div className="w-10 h-10 bg-slate-900 border-2 border-slate-900 flex items-center justify-center text-white mb-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.15)]">
            <Keyboard className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold tracking-wide font-pixel uppercase text-slate-900">KeyTone</h1>
          <p className="text-slate-500 mt-1 text-xs uppercase tracking-wider text-center">
            [ Keyboard Specs & Acoustics Library ]
          </p>
        </div>

        {/* Card */}
        <div className="geek-card w-full p-8 shadow-[6px_6px_0px_0px_rgba(18,18,18,1)] bg-white">
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-900 mb-6 font-pixel border-b-2 border-slate-900 pb-2">
            Create Account
          </h2>

          {error && (
            <div className="mb-6 p-3 bg-red-50 border-2 border-red-500 text-red-700 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 p-3 bg-emerald-50 border-2 border-emerald-500 text-emerald-800 text-xs font-bold uppercase tracking-wider">
              <span>Account created successfully! Redirecting...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-3.5 h-3.5" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="keyboard_fanatic"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border-2 border-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-900 outline-none text-slate-900 text-xs placeholder:text-slate-400 transition-all font-geek"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border-2 border-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-900 outline-none text-slate-900 text-xs placeholder:text-slate-400 transition-all font-geek"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-3.5 h-3.5" />
                </div>
                <input
                  type="password"
                  required
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border-2 border-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-900 outline-none text-slate-900 text-xs placeholder:text-slate-400 transition-all font-geek"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="geek-btn w-full py-3 text-xs uppercase tracking-wider"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Registering...</span>
                </span>
              ) : (
                <span>Register</span>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-slate-500 uppercase tracking-wider">
            Already have an account?{' '}
            <Link href="/login" className="text-slate-900 hover:text-emerald-600 font-bold transition-colors underline decoration-2">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
