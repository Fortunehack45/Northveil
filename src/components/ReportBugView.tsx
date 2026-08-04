import React, { useState } from 'react';
import { CustomSelect } from './CustomSelect';
import {
  Bug,
  Send,
  ArrowLeft,
  ShieldAlert,
  Terminal,
  Paperclip,
  CheckCircle2,
  AlertOctagon,
  Code2,
  Cpu,
  Award,
  Clock,
} from 'lucide-react';

interface ReportBugViewProps {
  onBack?: () => void;
}

export const ReportBugView: React.FC<ReportBugViewProps> = ({ onBack }) => {
  const [bugTitle, setBugTitle] = useState('');
  const [module, setModule] = useState('DEX & Swap Engine');
  const [severity, setSeverity] = useState<'minor' | 'moderate' | 'major' | 'critical'>('moderate');
  const [steps, setSteps] = useState('');
  const [expectedBehavior, setExpectedBehavior] = useState('');
  const [actualBehavior, setActualBehavior] = useState('');
  const [consoleLogs, setConsoleLogs] = useState('');
  const [attachEnv, setAttachEnv] = useState(true);

  const [reportStatus, setReportStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reported bugs log list
  const [bugsList, setBugsList] = useState([
    {
      id: 'BUG-4091',
      title: 'Gas estimate delay on Polygon POS mainnet RPC',
      module: 'Gas Estimator',
      severity: 'MODERATE',
      status: 'UNDER TRIAGE - BUG BOUNTY REVIEW',
      reward: '$250 USDC ELIGIBLE',
      date: '2026-08-01 10:15',
    },
    {
      id: 'BUG-2910',
      title: 'NFT Metadata URI parsing fail for IPFS hashes',
      module: 'NFT Gallery',
      severity: 'MINOR',
      status: 'PATCHED IN V2.4.1',
      reward: '$100 USDC PAID',
      date: '2026-07-25 16:30',
    },
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bugTitle.trim() || !steps.trim()) return;

    setIsSubmitting(true);
    setReportStatus(null);

    setTimeout(() => {
      setIsSubmitting(false);
      const newId = `BUG-${Math.floor(1000 + Math.random() * 9000)}`;
      const newBug = {
        id: newId,
        title: bugTitle,
        module: module,
        severity: severity.toUpperCase(),
        status: 'TRIAGED - SUBMITTED TO PROTOCOL BOUNTY DESK',
        reward: severity === 'critical' ? '$2,500 USDC BOUNTY' : severity === 'major' ? '$1,000 USDC BOUNTY' : '$250 USDC BOUNTY',
        date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      };

      setBugsList([newBug, ...bugsList]);
      setReportStatus(
        `✓ BUG REPORT ${newId} SUBMITTED SAFELY! THANK YOU FOR SECURING NORTHVEIL. DISCORD NOTIFICATION SENT.`
      );
      setBugTitle('');
      setSteps('');
      setExpectedBehavior('');
      setActualBehavior('');
      setConsoleLogs('');
    }, 1200);
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 pb-12 w-full font-mono select-none animate-fadeIn">
      {/* Top Banner Navigation Header */}
      <div className="bg-[#141419] border-2 border-white p-5 sm:p-6 shadow-[8px_8px_0px_0px_#ff007f] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="px-3.5 py-2 bg-[#ff007f] text-white font-black text-xs uppercase border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:bg-[#ff3399] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer flex items-center gap-2 transition-all"
            >
              <ArrowLeft className="w-4 h-4 stroke-[3]" />
              <span>BACK TO HELP</span>
            </button>
          )}

          <div>
            <span className="px-2.5 py-1 bg-[#ccff00] text-black text-[10px] font-black uppercase border border-black shadow-[2px_2px_0px_0px_#000]">
              BUG BOUNTY & VULNERABILITY CONSOLE
            </span>
            <h1 className="text-2xl font-black text-white uppercase tracking-tight mt-1">
              REPORT A BUG / SECURITY VULNERABILITY
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-[#0a0a0c] text-[#00f0ff] text-xs font-black uppercase border border-white/40 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-[#ffe600]" />
            <span>BUG BOUNTY PROGRAM ACTIVE</span>
          </span>
        </div>
      </div>

      {/* Grid: Bug Form (2/3) + Bug Tracker & Bounty Panel (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Bug Submission Form */}
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-2 bg-[#0a0a0c] border-2 border-white p-6 sm:p-8 shadow-[8px_8px_0px_0px_#ccff00] space-y-6"
        >
          <div className="border-b-2 border-white/20 pb-4">
            <h2 className="text-lg font-black text-white uppercase flex items-center gap-2">
              <Bug className="w-5 h-5 text-[#ff007f]" />
              <span>SUBMIT VULNERABILITY / BUG REPORT</span>
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              HELP IMPROVE NORTHVEIL SECURITY AND EARN ON-CHAIN BOUNTY REWARDS FOR VERIFIED DISCOVERIES.
            </p>
          </div>

          {/* Bug Title */}
          <div className="space-y-2">
            <label className="text-xs text-slate-300 font-bold uppercase block">
              BUG TITLE / SHORT SUMMARY *
            </label>
            <input
              type="text"
              required
              value={bugTitle}
              onChange={(e) => setBugTitle(e.target.value)}
              placeholder="E.G. UNHANDLED REJECTION WHEN SLIPPAGE EXCEEDS 5% ON UNISWAP ROUTER..."
              className="w-full bg-[#141419] border-2 border-white p-3 text-xs font-bold text-white focus:outline-none focus:border-[#ff007f]"
            />
          </div>

          {/* Module & Severity Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs text-slate-300 font-bold uppercase block">AFFECTED MODULE:</label>
              <CustomSelect
                options={[
                  { value: 'DEX & Swap Engine', label: 'DEX & Swap Engine' },
                  { value: 'Dashboard & Assets', label: 'Dashboard & Assets' },
                  { value: 'Gas Estimator', label: 'Gas Estimator & Deposits' },
                  { value: 'Smart Contract Studio', label: 'Smart Contract Studio' },
                  { value: 'NFT Gallery', label: 'NFT Gallery & Minting' },
                  { value: 'DApp Browser', label: 'DApp Browser Sandbox' },
                  { value: 'Security Shield', label: 'Security Shield & Hardware Wallet' },
                ]}
                value={module}
                onChange={(val) => setModule(val)}
                variant="dark"
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-slate-300 font-bold uppercase block">SEVERITY IMPACT LEVEL:</label>
              <CustomSelect
                options={[
                  { value: 'minor', label: 'MINOR - COSMETIC / VISUAL GLITCH' },
                  { value: 'moderate', label: 'MODERATE - FUNCTIONAL DISRUPTION' },
                  { value: 'major', label: 'MAJOR - DEEP COMPONENT FAILURE' },
                  { value: 'critical', label: 'CRITICAL - SECURITY VULNERABILITY ($5K BOUNTY)' },
                ]}
                value={severity}
                onChange={(val) => setSeverity(val as any)}
                variant="dark"
                className="w-full"
              />
            </div>
          </div>

          {/* Steps to Reproduce */}
          <div className="space-y-2">
            <label className="text-xs text-slate-300 font-bold uppercase block">
              STEPS TO REPRODUCE *
            </label>
            <textarea
              rows={4}
              required
              value={steps}
              onChange={(e) => setSteps(e.target.value)}
              placeholder="1. NAVIGATE TO TRADE & SWAP&#10;2. SELECT SOLANA TO ETHEREUM BRIDGE&#10;3. ENTER AMOUNT AND OBSERVE UNEXPECTED SLIPPAGE CALCULATION..."
              className="w-full bg-[#141419] border-2 border-white p-3 text-xs font-bold text-white focus:outline-none"
            />
          </div>

          {/* Expected vs Actual Behavior */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs text-slate-300 font-bold uppercase block">EXPECTED BEHAVIOR:</label>
              <textarea
                rows={3}
                value={expectedBehavior}
                onChange={(e) => setExpectedBehavior(e.target.value)}
                placeholder="DESCRIBE WHAT SHOULD HAVE HAPPENED..."
                className="w-full bg-[#141419] border-2 border-white p-3 text-xs font-bold text-white focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-slate-300 font-bold uppercase block">ACTUAL BEHAVIOR:</label>
              <textarea
                rows={3}
                value={actualBehavior}
                onChange={(e) => setActualBehavior(e.target.value)}
                placeholder="DESCRIBE WHAT ACTUALLY HAPPENED..."
                className="w-full bg-[#141419] border-2 border-white p-3 text-xs font-bold text-white focus:outline-none"
              />
            </div>
          </div>

          {/* Console Output / Stack Trace */}
          <div className="space-y-2">
            <label className="text-xs text-slate-300 font-bold uppercase block flex items-center justify-between">
              <span>CONSOLE LOGS / ERROR STACK TRACE (OPTIONAL):</span>
              <span className="text-[10px] text-[#ccff00]">PASTE BROWSER CONSOLE ERRORS</span>
            </label>
            <textarea
              rows={3}
              value={consoleLogs}
              onChange={(e) => setConsoleLogs(e.target.value)}
              placeholder="Uncaught TypeError: Cannot read properties of undefined (reading 'gasPrice')..."
              className="w-full bg-[#141419] border-2 border-white p-3 text-xs font-mono font-bold text-[#ccff00] focus:outline-none"
            />
          </div>

          {/* Diagnostics Auto-Attach */}
          <div className="p-4 bg-[#141419] border-2 border-white/40 flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={attachEnv}
                onChange={(e) => setAttachEnv(e.target.checked)}
                className="w-4 h-4 accent-[#ff007f]"
              />
              <span className="text-xs font-bold text-white uppercase">
                AUTO-INCLUDE BROWSER ENVIRONMENT & BUILD METRICS (CHROME 128 / LINUX)
              </span>
            </label>
            <Cpu className="w-4 h-4 text-[#00f0ff]" />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !bugTitle.trim() || !steps.trim()}
            className="w-full py-4 bg-[#ff007f] text-white font-black text-sm uppercase border-2 border-black shadow-[5px_5px_0px_0px_#000] hover:bg-[#ff3399] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer transition-all flex items-center justify-center gap-2"
          >
            <Send className="w-5 h-5 stroke-[2.5]" />
            <span>{isSubmitting ? 'SUBMITTING BUG REPORT...' : 'SUBMIT VULNERABILITY REPORT'}</span>
          </button>

          {reportStatus && (
            <div className="p-4 bg-[#141419] border-2 border-[#ccff00] text-xs text-[#ccff00] font-black shadow-[4px_4px_0px_0px_#ccff00]">
              {reportStatus}
            </div>
          )}
        </form>

        {/* Right Tracker Panel: Reported Bugs & Bounty Dashboard */}
        <div className="space-y-6">
          <div className="bg-[#141419] border-2 border-white p-6 shadow-[6px_6px_0px_0px_#00f0ff] space-y-4">
            <h3 className="text-sm font-black text-white uppercase border-b-2 border-white/20 pb-3 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#00f0ff]" />
              <span>YOUR REPORTED BUGS & BOUNTIES</span>
            </h3>

            <div className="space-y-3">
              {bugsList.map((b) => (
                <div key={b.id} className="bg-[#0a0a0c] p-4 border-2 border-white/40 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 bg-[#ff007f] text-white font-black text-[10px] border border-black">
                      {b.id}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">{b.date}</span>
                  </div>

                  <h4 className="font-black text-white">{b.title}</h4>

                  <div className="flex items-center justify-between text-[10px] pt-1 border-t border-white/10">
                    <span className="text-[#ccff00] font-bold">{b.reward}</span>
                    <span className="text-white font-bold">{b.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
