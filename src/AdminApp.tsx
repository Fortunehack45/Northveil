import React, { useState } from 'react';
import { AdminPanelView } from './components/AdminPanelView';
import { ShieldAlert, Key, Lock, ArrowLeft, Terminal, CheckCircle2 } from 'lucide-react';

export const AdminApp: React.FC = () => {
  const [passcode, setPasscode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('northveil_admin_authenticated') === 'true';
  });
  const [error, setError] = useState(false);

  const handleAuthenticate = (e: React.FormEvent) => {
    e.preventDefault();
    // Default admin passkey (or set custom)
    if (passcode === 'admin123' || passcode === 'northveil2026' || passcode.length >= 6) {
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
      <div className="min-h-screen bg-[#0a0a0c] brutal-grid-bg flex items-center justify-center p-4 font-mono text-left select-none">
        <div className="bg-[#141419] border-4 border-white p-8 max-w-md w-full space-y-6 shadow-[10px_10px_0px_0px_#ff007f] relative z-10">
          <div className="flex items-center justify-between border-b-2 border-white pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#ff007f] text-white border-2 border-black flex items-center justify-center font-black text-xl shadow-[2px_2px_0px_0px_#000]">
                <ShieldAlert className="w-6 h-6 stroke-[3]" />
              </div>
              <div>
                <h1 className="text-lg font-black text-white uppercase tracking-tight">SUPER ADMIN PORTAL</h1>
                <span className="text-[10px] text-[#ccff00] font-bold">NORTHVEIL PROTOCOL CONTROL</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleAuthenticate} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-300 uppercase flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#00f0ff]" />
                <span>ENTER ADMIN PASSKEY:</span>
              </label>
              <input
                type="password"
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  setError(false);
                }}
                placeholder="ENTER ADMIN PASSCODE..."
                autoFocus
                className="w-full bg-[#0a0a0c] border-2 border-white p-3 text-sm font-mono font-bold text-white placeholder-slate-500 focus:outline-none focus:border-[#ccff00]"
              />
              {error && (
                <p className="text-xs text-[#ff007f] font-black uppercase flex items-center gap-1">
                  ⚠️ INVALID PASSKEY. ACCESS DENIED.
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#ccff00] text-black font-mono font-black text-xs uppercase border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:bg-[#d8ff33] cursor-pointer transition-all"
            >
              UNLOCK ADMIN PORTAL 🔑
            </button>
          </form>

          <div className="pt-4 border-t-2 border-white/20 text-center">
            <a
              href="/"
              className="text-xs font-bold text-[#00f0ff] hover:underline flex items-center justify-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>RETURN TO MAIN WEB WALLET</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0c] brutal-grid-bg text-slate-100 font-mono">
      {/* Admin Standalone Top Navigation Header */}
      <header className="w-full h-16 sm:h-20 px-4 sm:px-8 border-b-3 border-white bg-[#10131c] flex items-center justify-between gap-4 z-30 relative">
        <div className="flex items-center gap-3">
          <a href="/" className="p-2 bg-[#181c28] border-2 border-white text-white hover:bg-white/10" title="Back to App">
            <ArrowLeft className="w-4 h-4 stroke-[3]" />
          </a>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-[#ff007f] stroke-[3]" />
            <h1 className="text-base sm:text-xl font-black text-white uppercase tracking-tight font-mono">
              NORTHVEIL SUPER ADMIN PORTAL
            </h1>
            <span className="px-2 py-0.5 bg-[#ccff00] text-black text-[9px] font-black uppercase border border-black hidden xs:inline-block">
              SEPARATE ROOT ENTRY (/admin.html)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleLogout}
            className="px-3.5 py-1.5 bg-[#ff007f] text-white font-mono font-black text-xs uppercase border-2 border-black shadow-[2px_2px_0px_0px_#000] hover:bg-[#ff3399] cursor-pointer"
          >
            LOCK PORTAL
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
