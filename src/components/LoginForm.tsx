import React, { useState } from 'react';
import { Volunteer, AuthUser } from '../types';
import { Lock, User, ShieldCheck, HeartHandshake, ArrowRight, KeyRound, AlertCircle } from 'lucide-react';

interface Props {
  volunteers: Volunteer[];
  onLoginSuccess: (user: AuthUser) => void;
}

export const LoginForm: React.FC<Props> = ({ volunteers, onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedUser = username.trim().toLowerCase();
    const trimmedPass = password.trim();

    // Check Admin
    if (trimmedUser === 'admin' && (trimmedPass === '123' || trimmedPass === 'admin123')) {
      onLoginSuccess({
        id: 'admin-1',
        username: 'admin',
        role: 'admin',
      });
      return;
    }

    // Check Worker / Volunteer
    const matchedVolunteer = volunteers.find(
      (v) =>
        v.username.toLowerCase() === trimmedUser &&
        (v.password === trimmedPass || trimmedPass === '123')
    );

    if (matchedVolunteer) {
      onLoginSuccess({
        id: matchedVolunteer.id,
        username: matchedVolunteer.username,
        role: 'worker',
        volunteerData: matchedVolunteer,
      });
      return;
    }

    setError('Usuario o contraseña incorrectos. Verifique los datos o use los accesos de prueba.');
  };

  const handleQuickLogin = (user: string, pass: string) => {
    setUsername(user);
    setPassword(pass);
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-40 h-40 sm:w-48 sm:h-48 mb-3 p-1">
          <img
            src="/LOGO.png"
            alt="Logo"
            className="w-full h-full object-contain border-0"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const fallback = e.currentTarget.nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = 'flex';
            }}
          />
          <div className="hidden items-center justify-center w-full h-full text-blue-600">
            <HeartHandshake className="w-12 h-12" />
          </div>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        {/* Glassmorphic Crystalline Card */}
        <div className="bg-white/80 backdrop-blur-xl py-8 px-6 sm:px-10 rounded-3xl border border-white/90 shadow-xl shadow-blue-950/5 ring-1 ring-blue-100/60">
          {error && (
            <div className="mb-5 p-3 rounded-2xl bg-rose-50/90 border border-rose-200 text-rose-800 text-xs flex items-start gap-2 shadow-2xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Usuario
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-sky-600/70">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ej. admin o camila.rodriguez"
                  className="block w-full pl-10 pr-3.5 py-2.5 text-sm bg-white/75 border border-sky-200/80 rounded-xl focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 focus:outline-hidden transition-all placeholder:text-slate-400 text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-sky-600/70">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-3.5 py-2.5 text-sm bg-white/75 border border-sky-200/80 rounded-xl focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 focus:outline-hidden transition-all placeholder:text-slate-400 text-slate-900"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-md shadow-blue-600/20 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 via-sky-600 to-blue-700 hover:from-blue-700 hover:via-sky-700 hover:to-blue-800 focus:outline-hidden focus:ring-4 focus:ring-blue-500/20 transition-all cursor-pointer"
            >
              <span>Ingresar al Sistema</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Access Helpers with Soft Crystalline Borders */}
          <div className="mt-8 pt-6 border-t border-sky-100/90 space-y-3">
            <p className="text-xs font-bold text-sky-800 uppercase tracking-wider text-center">
              Accesos rápidos para prueba:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin', '123')}
                className="flex items-center gap-2.5 p-2.5 rounded-2xl border border-sky-200/70 hover:border-blue-400 bg-sky-50/50 hover:bg-white text-left transition-all cursor-pointer shadow-2xs group"
              >
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-sky-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-slate-900 leading-tight">Admin</p>
                  <p className="text-[11px] text-sky-700 font-mono truncate">admin / 123</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('camila.rodriguez', '123')}
                className="flex items-center gap-2.5 p-2.5 rounded-2xl border border-sky-200/70 hover:border-blue-400 bg-sky-50/50 hover:bg-white text-left transition-all cursor-pointer shadow-2xs group"
              >
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <User className="w-4 h-4" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-slate-900 leading-tight">Trabajador</p>
                  <p className="text-[11px] text-sky-700 font-mono truncate">camila.rodriguez / 123</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
