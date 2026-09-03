import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';
import { ShieldCheck, Cpu, Key, Home, LogOut } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Northveil Wallet — Non-Custodial Agent Vault',
  description: 'Passkey-bound non-custodial control plane for AI agents and human approvals',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#090a0f] text-zinc-100 min-h-screen flex flex-col">
        <header className="border-b border-zinc-800/80 bg-[#0d0f17]/90 backdrop-blur sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/home" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
                NV
              </div>
              <span className="font-semibold text-lg tracking-tight text-white font-mono">
                Northveil <span className="text-emerald-400 text-xs font-normal border border-emerald-500/30 px-2 py-0.5 rounded-full ml-1">MPC</span>
              </span>
            </Link>

            <nav className="flex items-center gap-1 sm:gap-4 text-sm font-medium">
              <Link href="/home" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-zinc-800/60 text-zinc-300 hover:text-white transition">
                <Home className="w-4 h-4 text-zinc-400" />
                <span className="hidden sm:inline">Home</span>
              </Link>
              <Link href="/settings/autonomous" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-zinc-800/60 text-zinc-300 hover:text-white transition">
                <Cpu className="w-4 h-4 text-indigo-400" />
                <span className="hidden sm:inline">Autonomous</span>
              </Link>
              <Link href="/connect-claude" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-zinc-800/60 text-zinc-300 hover:text-white transition">
                <Key className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">Connect Claude</span>
              </Link>
              <Link href="/login" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-red-500/10 text-zinc-400 hover:text-red-400 transition ml-2">
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </Link>
            </nav>
          </div>
        </header>

        <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 md:p-8">
          {children}
        </main>

        <footer className="border-t border-zinc-800/50 py-6 text-center text-xs text-zinc-600 font-mono">
          Northveil Non-Custodial Control Plane • Threshold MPC in Isolated TEEs • WebAuthn Approvals
        </footer>
      </body>
    </html>
  );
}
