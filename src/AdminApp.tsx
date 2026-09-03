import React, { useState } from 'react';
import { AdminPanelView } from './components/AdminPanelView';
import { ShieldCheck, Lock, User, ArrowLeft, LogOut, CheckCircle2, KeyRound } from 'lucide-react';

export const AdminApp: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('northveil_admin_authenticated') === 'true';
  });
  const [error, setError] = useState(false);

  const handleAuthenticate = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    // Accepted usernames: "Fortune" or "Northveil"
    const isUserValid = cleanUser === 'fortune' || cleanUser === 'northveil';
    // Accepted password: "Fortune45"
    const isPassValid = cleanPass === 'Fortune45';

    if (isUserValid && isPassValid) {
      setIsAuthenticated(true);
      setError(false);
      localStorage.setItem('northveil_admin_authenticated', 'true');
    } else {
      setError(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('northveil_admin_authenticated');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#070709] text-white flex items-center justify-center p-4 selection:bg-white/20 font-sans">
        <div className="bg-[#0f0f12] border border-white/[0.08] p-8 max-w-md w-full rounded-3xl shadow-2xl space-y-6 relative z-10 text-left">
          {/* Brand Logo & Header */}
          <div className="flex items-center gap-3.5 border-b border-white/[0.08] pb-5">
            <img
              src="https://iili.io/CDS9fvn.png"
              alt="Northveil Logo"
              className="h-10 w-auto object-contain"
            />
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">Super Admin Portal</h1>
              <span className="text-xs text-emerald-400 font-medium flex items-center gap-1.5 pt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Northveil Protocol Governance
              </span>
            </div>
          </div>

          <form onSubmit={handleAuthenticate} className="space-y-4">
            {/* Username Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-zinc-400" />
                <span>Admin Username (Fortune / Northveil)</span>
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError(false);
                }}
                placeholder="Enter admin username..."
                autoFocus
                className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-white/30 transition-colors"
              />
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-zinc-400" />
                <span>Passkey / Password</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(false);
                }}
                placeholder="Enter password..."
                className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-white/30 transition-colors"
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
                Invalid credentials. Please verify your admin username and password.
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-white text-black font-semibold text-xs rounded-xl hover:bg-zinc-200 cursor-pointer transition-colors shadow-sm"
            >
              Authenticate &amp; Unlock Portal
            </button>
          </form>

          <div className="pt-4 border-t border-white/[0.08] text-center">
            <a
              href="/"
              className="text-xs text-zinc-400 hover:text-white transition-colors inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Web3 Wallet</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070709] text-zinc-100 font-sans selection:bg-white/20">
      {/* Admin Standalone Top Navigation Header */}
      <header className="w-full h-16 sm:h-20 px-4 sm:px-8 border-b border-white/[0.08] bg-[#0f0f12]/80 backdrop-blur-xl flex items-center justify-between gap-4 sticky top-0 z-30">
        <div className="flex items-center gap-3.5">
          <a
            href="/"
            className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-all"
            title="Back to Web3 Wallet"
          >
            <ArrowLeft className="w-4 h-4" />
          </a>
          <div className="flex items-center gap-3">
            <img
              src="https://iili.io/CDS9fvn.png"
              alt="Northveil Logo"
              className="h-8 w-auto object-contain"
            />
            <div>
              <h1 className="text-base font-bold text-white tracking-tight">
                Northveil Super Admin Portal
              </h1>
              <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Live Production Governance
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleLogout}
            className="px-3.5 py-2 bg-white/[0.06] hover:bg-rose-500/10 border border-white/10 hover:border-rose-500/30 text-zinc-300 hover:text-rose-400 text-xs font-medium rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Lock Portal</span>
          </button>
        </div>
      </header>

      {/* Admin Panel Body */}
      <main className="p-4 sm:p-8 max-w-[1600px] mx-auto">
        <AdminPanelView />
      </main>
    </div>
  );
};
