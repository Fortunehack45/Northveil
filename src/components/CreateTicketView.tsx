import React, { useState } from 'react';
import { CustomSelect } from './CustomSelect';
import {
  Ticket,
  Send,
  ArrowLeft,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Paperclip,
  Check,
  FileText,
  User,
  MessageSquare,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';

interface CreateTicketViewProps {
  onBack?: () => void;
}

export const CreateTicketView: React.FC<CreateTicketViewProps> = ({ onBack }) => {
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('Transaction Stuck');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [network, setNetwork] = useState('ethereum');
  const [txHash, setTxHash] = useState('');
  const [details, setDetails] = useState('');
  const [attachLogs, setAttachLogs] = useState(true);
  const [mockFiles, setMockFiles] = useState<string[]>([]);

  const [ticketStatus, setTicketStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active / Submitted tickets tracker list
  const [ticketsList, setTicketsList] = useState([
    {
      id: 'TCK-8942',
      subject: 'Transaction stuck on Arbitrum One gas spike',
      category: 'Transaction Stuck',
      priority: 'HIGH',
      status: 'OPEN - ASSIGNED TO PROTOCOL ENG #3',
      date: '2026-08-01 14:10',
    },
    {
      id: 'TCK-7210',
      subject: 'Ledger Nano X Bluetooth pairing handshake delay',
      category: 'Hardware Wallet',
      priority: 'MEDIUM',
      status: 'RESOLVED - INSTRUCTIONS SENT',
      date: '2026-07-28 11:45',
    },
  ]);

  const handleAddMockFile = () => {
    setMockFiles((prev) => [...prev, `wallet_diag_snapshot_${Date.now().toString().slice(-4)}.log`]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !details.trim()) return;

    setIsSubmitting(true);
    setTicketStatus(null);

    setTimeout(() => {
      setIsSubmitting(false);
      const newId = `TCK-${Math.floor(1000 + Math.random() * 9000)}`;
      const newTicket = {
        id: newId,
        subject: subject,
        category: category,
        priority: priority.toUpperCase(),
        status: 'OPEN - AWAITING PROTOCOL TRIAGE',
        date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      };

      setTicketsList([newTicket, ...ticketsList]);
      setTicketStatus(
        `✓ TICKET ${newId} CREATED SUCCESSFULLY! ENCRYPTED DIAGNOSTIC SNAPSHOT SENT TO PROTOCOL DESK.`
      );
      setSubject('');
      setDetails('');
      setTxHash('');
      setMockFiles([]);
    }, 1200);
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 pb-12 w-full font-mono select-none animate-fadeIn">
      {/* Top Banner Navigation Header */}
      <div className="bg-[#141419] border-2 border-white p-5 sm:p-6 shadow-[8px_8px_0px_0px_#ccff00] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="px-3.5 py-2 bg-[#ccff00] text-black font-black text-xs uppercase border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:bg-[#d8ff33] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer flex items-center gap-2 transition-all"
            >
              <ArrowLeft className="w-4 h-4 stroke-[3]" />
              <span>BACK TO HELP</span>
            </button>
          )}

          <div>
            <span className="px-2.5 py-1 bg-[#00f0ff] text-black text-[10px] font-black uppercase border border-black shadow-[2px_2px_0px_0px_#000]">
              24/7 ENCRYPTED SUPPORT DESK
            </span>
            <h1 className="text-2xl font-black text-white uppercase tracking-tight mt-1">
              CREATE SUPPORT TICKET
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-[#0a0a0c] text-[#ccff00] text-xs font-black uppercase border border-white/40">
            AVERAGE RESPONSE TIME: &lt; 15 MINS
          </span>
        </div>
      </div>

      {/* Grid: Main Ticket Form (2/3) + Live Ticket Tracker (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Ticket Submission Form */}
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-2 bg-[#0a0a0c] border-2 border-white p-6 sm:p-8 shadow-[8px_8px_0px_0px_#00f0ff] space-y-6"
        >
          <div className="border-b-2 border-white/20 pb-4">
            <h2 className="text-lg font-black text-white uppercase flex items-center gap-2">
              <Ticket className="w-5 h-5 text-[#ccff00]" />
              <span>SUBMIT NEW TICKET TO CRYPTFEST ENGINEERS</span>
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              ALL TICKET DETAILS AND LOGS ARE ENCRYPTED CLIENT-SIDE BEFORE TRANSMISSION.
            </p>
          </div>

          {/* Ticket Subject */}
          <div className="space-y-2">
            <label className="text-xs text-slate-300 font-bold uppercase block">
              TICKET SUBJECT / SUMMARY *
            </label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="E.G. TRANSACTION STUCK ON ARBITRUM ONE OR UNABLE TO CLAIM STAKING REWARDS..."
              className="w-full bg-[#141419] border-2 border-white p-3 text-xs font-bold text-white focus:outline-none focus:border-[#ccff00]"
            />
          </div>

          {/* Category, Priority & Network Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-xs text-slate-300 font-bold uppercase block">CATEGORY:</label>
              <CustomSelect
                options={[
                  { value: 'Transaction Stuck', label: 'Transaction Stuck / Gas' },
                  { value: 'DEX Swap Slippage', label: 'DEX Swap / Trade Slippage' },
                  { value: 'Hardware Wallet', label: 'Hardware Wallet Connection' },
                  { value: 'Smart Contract', label: 'Smart Contract Execution' },
                  { value: 'Tax & History', label: 'Tax Export / Data History' },
                  { value: 'Account & Security', label: 'Account & Security' },
                ]}
                value={category}
                onChange={(val) => setCategory(val)}
                variant="dark"
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-slate-300 font-bold uppercase block">PRIORITY LEVEL:</label>
              <CustomSelect
                options={[
                  { value: 'low', label: 'LOW - GENERAL QUESTION' },
                  { value: 'medium', label: 'MEDIUM - STANDARD INQUIRY' },
                  { value: 'high', label: 'HIGH - TRANSACTION BLOCKED' },
                  { value: 'urgent', label: 'URGENT - CRITICAL ISSUE' },
                ]}
                value={priority}
                onChange={(val) => setPriority(val as any)}
                variant="dark"
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-slate-300 font-bold uppercase block">CHAIN / NETWORK:</label>
              <CustomSelect
                options={[
                  { value: 'ethereum', label: 'Ethereum Mainnet' },
                  { value: 'solana', label: 'Solana' },
                  { value: 'arbitrum', label: 'Arbitrum One' },
                  { value: 'polygon', label: 'Polygon POS' },
                  { value: 'avalanche', label: 'Avalanche C-Chain' },
                  { value: 'base', label: 'Base' },
                ]}
                value={network}
                onChange={(val) => setNetwork(val)}
                variant="dark"
                className="w-full"
              />
            </div>
          </div>

          {/* Optional Transaction Hash */}
          <div className="space-y-2">
            <label className="text-xs text-slate-300 font-bold uppercase block">
              TRANSACTION HASH (OPTIONAL):
            </label>
            <input
              type="text"
              value={txHash}
              onChange={(e) => setTxHash(e.target.value)}
              placeholder="0x..."
              className="w-full bg-[#141419] border-2 border-white p-3 text-xs font-bold text-white focus:outline-none"
            />
          </div>

          {/* Detailed Description */}
          <div className="space-y-2">
            <label className="text-xs text-slate-300 font-bold uppercase block">
              DETAILED ISSUE DESCRIPTION & STEPS *
            </label>
            <textarea
              rows={6}
              required
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="PROVIDE ALL RELEVANT DETAILS, STEPS TAKEN, AND ANY ERROR CODES DISPLAYED..."
              className="w-full bg-[#141419] border-2 border-white p-3 text-xs font-bold text-white focus:outline-none"
            />
          </div>

          {/* Attach Diagnostics & Mock Attachments */}
          <div className="space-y-3 p-4 bg-[#141419] border-2 border-white/40">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={attachLogs}
                  onChange={(e) => setAttachLogs(e.target.checked)}
                  className="w-4 h-4 accent-[#ccff00]"
                />
                <span className="text-xs font-bold text-white uppercase">
                  AUTO-ATTACH ENCRYPTED WALLET DIAGNOSTIC SNAPSHOT
                </span>
              </label>

              <span className="text-[10px] text-[#00f0ff] font-bold uppercase">SAFE: NO SEED / KEYS SHARED</span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/20">
              <button
                type="button"
                onClick={handleAddMockFile}
                className="px-3 py-1.5 bg-[#0a0a0c] text-slate-300 border border-white/40 hover:border-white text-xs font-bold uppercase cursor-pointer flex items-center gap-2"
              >
                <Paperclip className="w-3.5 h-3.5" />
                <span>ATTACH LOG / SCREENSHOT</span>
              </button>

              <div className="flex flex-wrap gap-2">
                {mockFiles.map((f, i) => (
                  <span key={i} className="px-2 py-0.5 bg-[#ccff00] text-black text-[10px] font-black border border-black">
                    {f}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !subject.trim() || !details.trim()}
            className="w-full py-4 bg-[#ccff00] text-black font-black text-sm uppercase border-2 border-black shadow-[5px_5px_0px_0px_#000] hover:bg-[#d8ff33] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer transition-all flex items-center justify-center gap-2"
          >
            <Send className="w-5 h-5 stroke-[2.5]" />
            <span>{isSubmitting ? 'ENCRYPTING & SUBMITTING TICKET...' : 'SUBMIT SUPPORT TICKET'}</span>
          </button>

          {ticketStatus && (
            <div className="p-4 bg-[#141419] border-2 border-[#ccff00] text-xs text-[#ccff00] font-black shadow-[4px_4px_0px_0px_#ccff00]">
              {ticketStatus}
            </div>
          )}
        </form>

        {/* Right Tracker Panel: Existing Support Tickets */}
        <div className="space-y-6">
          <div className="bg-[#141419] border-2 border-white p-6 shadow-[6px_6px_0px_0px_#ff007f] space-y-4">
            <h3 className="text-sm font-black text-white uppercase border-b-2 border-white/20 pb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#ff007f]" />
              <span>YOUR SUPPORT TICKET DESK</span>
            </h3>

            <div className="space-y-3">
              {ticketsList.map((t) => (
                <div key={t.id} className="bg-[#0a0a0c] p-4 border-2 border-white/40 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 bg-[#00f0ff] text-black font-black text-[10px] border border-black">
                      {t.id}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">{t.date}</span>
                  </div>

                  <h4 className="font-black text-white">{t.subject}</h4>

                  <div className="flex items-center justify-between text-[10px] pt-1 border-t border-white/10">
                    <span className="text-slate-400">PRIORITY: <span className="text-white font-bold">{t.priority}</span></span>
                    <span className="text-[#ccff00] font-bold">{t.status}</span>
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
