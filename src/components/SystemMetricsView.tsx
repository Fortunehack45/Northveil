import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { CustomSelect } from './CustomSelect';
import {
  User,
  Wallet,
  BookOpen,
  Activity,
  Settings,
  ShieldCheck,
  Server,
  Plus,
  Trash2,
  Copy,
  Check,
  Edit2,
  Globe,
  Lock,
  Cpu,
  RefreshCw,
  ExternalLink,
  Smartphone,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  address: string;
  ens?: string;
  network: string;
}

interface WalletAccount {
  id: string;
  name: string;
  address: string;
  type: 'HOT' | 'HARDWARE' | 'VAULT';
  balanceUsd: string;
  isPrimary?: boolean;
}

export const SystemMetricsView: React.FC = () => {
  const { systemMetrics, userSettings, updateUserSettings } = useWallet();
  const [activeTab, setActiveTab] = useState<'profile' | 'walletsContacts' | 'activity' | 'telemetry'>('profile');

  // Wallet Name & Avatar State
  const [walletName, setWalletName] = useState('ARKHAN DEFI VAULT #1');
  const [isEditingName, setIsEditingName] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState('VAULT');
  const avatars = ['VAULT', 'NEXUS', 'CORE', 'PRIME', 'ALPHA', 'NODE', 'MATRIX', 'CYBER'];

  // Multi-wallet list
  const [walletAccounts, setWalletAccounts] = useState<WalletAccount[]>([
    {
      id: 'w1',
      name: 'Primary Neo Vault',
      address: '0x71C8...4CC8',
      type: 'VAULT',
      balanceUsd: '$345,920.50',
      isPrimary: true,
    },
    {
      id: 'w2',
      name: 'Hot Trading Wallet',
      address: '0x3A99...B820',
      type: 'HOT',
      balanceUsd: '$12,450.00',
    },
    {
      id: 'w3',
      name: 'Ledger Nano X Cold Key',
      address: '0x88F1...190C',
      type: 'HARDWARE',
      balanceUsd: '$1,250,000.00',
    },
  ]);

  // Contacts / Address Book
  const [contacts, setContacts] = useState<Contact[]>([
    { id: 'c1', name: 'Satoshi (OTC Desk)', address: '0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5', ens: 'satoshi.eth', network: 'Ethereum' },
    { id: 'c2', name: 'Vitalik Cold Storage', address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', ens: 'vitalik.eth', network: 'Ethereum' },
    { id: 'c3', name: 'Solana Staking Node', address: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU', network: 'Solana' },
  ]);

  const [newContactName, setNewContactName] = useState('');
  const [newContactAddress, setNewContactAddress] = useState('');
  const [newContactEns, setNewContactEns] = useState('');
  const [showAddContactModal, setShowAddContactModal] = useState(false);

  // Connected Accounts State
  const [connectedAccounts, setConnectedAccounts] = useState({
    google: { connected: true, email: 'arkhan.web3@gmail.com' },
    discord: { connected: true, handle: 'Arkhan#0001' },
    github: { connected: true, handle: 'arkhan-dev' },
    twitter: { connected: false, handle: '' },
    yubikey: { connected: true, serial: 'YUBI-5C-99824' },
  });

  // User Preferences
  const [currency, setCurrency] = useState('USD ($)');
  const [language, setLanguage] = useState('English (US)');
  const [gasSpeed, setGasSpeed] = useState<'SLOW' | 'NORMAL' | 'FAST' | 'INSTANT'>('FAST');
  const [autoLockMinutes, setAutoLockMinutes] = useState('15');

  // Activity Log
  const [activityLogs] = useState([
    { id: 'l1', time: '10 MINS AGO', action: 'CONNECTED TO UNISWAP V3', ip: '192.168.1.45', status: 'SUCCESS' },
    { id: 'l2', time: '1 HOUR AGO', action: 'SWAPPED 1.5 ETH FOR 4,500 USDC', ip: '192.168.1.45', status: 'SUCCESS' },
    { id: 'l3', time: '3 HOURS AGO', action: 'BIOMETRIC TOUCH ID AUTHENTICATED', ip: '192.168.1.45', status: 'SUCCESS' },
    { id: 'l4', time: '1 DAY AGO', action: 'YUBIKEY HARDWARE SIGNATURE APPROVED', ip: '192.168.1.45', status: 'SUCCESS' },
    { id: 'l5', time: '2 DAYS AGO', action: 'UPDATED DISCORD CONNECTED ACCOUNT', ip: '192.168.1.45', status: 'SUCCESS' },
  ]);

  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(text);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const handleAddContact = () => {
    if (!newContactName || !newContactAddress) return;
    setContacts([
      ...contacts,
      {
        id: Date.now().toString(),
        name: newContactName,
        address: newContactAddress,
        ens: newContactEns || undefined,
        network: 'Ethereum Mainnet',
      },
    ]);
    setNewContactName('');
    setNewContactAddress('');
    setNewContactEns('');
    setShowAddContactModal(false);
  };

  const handleDeleteContact = (id: string) => {
    setContacts(contacts.filter((c) => c.id !== id));
  };

  const toggleAccountConnection = (key: keyof typeof connectedAccounts) => {
    setConnectedAccounts((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        connected: !prev[key].connected,
      },
    }));
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 pb-12 w-full font-mono select-none">
      {/* Top Banner Header */}
      <div className="bg-[#141419] border-2 border-white p-6 sm:p-8 shadow-[8px_8px_0px_0px_#ccff00] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5 w-full min-w-0">
          {/* Avatar box */}
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#ccff00] border-4 border-black text-black text-xs sm:text-lg font-black flex items-center justify-center shadow-[4px_4px_0px_0px_#000] shrink-0 uppercase">
            {selectedAvatar}
          </div>

          <div className="min-w-0 flex-1 w-full">
            <div className="flex items-center gap-2 flex-wrap max-w-full">
              {isEditingName ? (
                <div className="flex items-center gap-2 w-full max-w-full min-w-0 flex-wrap">
                  <input
                    type="text"
                    value={walletName}
                    onChange={(e) => setWalletName(e.target.value)}
                    className="bg-[#0a0a0c] border-2 border-white px-2.5 py-1 text-sm sm:text-lg font-black text-white focus:outline-none uppercase min-w-0 flex-1"
                  />
                  <button
                    onClick={() => setIsEditingName(false)}
                    className="px-3 py-1 bg-[#ccff00] text-black font-black text-xs uppercase border border-black shadow-[2px_2px_0px_0px_#000] shrink-0 cursor-pointer"
                  >
                    SAVE
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 min-w-0 max-w-full">
                  <h2 className="text-base sm:text-2xl font-black text-white uppercase tracking-tight truncate max-w-full">{walletName}</h2>
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="text-slate-400 hover:text-[#ccff00] p-1 shrink-0 cursor-pointer"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            <p className="text-[10px] sm:text-xs text-slate-300 mt-1">
              ACCOUNT DASHBOARD, MULTI-WALLET MANAGER, CONTACTS, PREFERENCES & TELEMETRY.
            </p>
          </div>
        </div>

        {/* Tab Selection Navigation */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'profile', label: 'PREFERENCES & ACCOUNTS', icon: User },
            { id: 'walletsContacts', label: 'WALLETS & CONTACTS', icon: Wallet },
            { id: 'activity', label: 'SECURITY LOGS', icon: Activity },
            { id: 'telemetry', label: 'SYSTEM TELEMETRY', icon: Server },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 text-xs font-black uppercase border-2 shadow-[2px_2px_0px_0px_#000] flex items-center gap-2 cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-[#ccff00] text-black border-black'
                    : 'bg-[#0a0a0c] text-white border-white/40'
                }`}
              >
                <Icon className="w-4 h-4 stroke-[2.5]" /> {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: PREFERENCES & CONNECTED ACCOUNTS */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Avatar Selector & Wallet Name */}
          <div className="bg-[#141419] border-2 border-white p-6 shadow-[6px_6px_0px_0px_#00f0ff] space-y-4">
            <h3 className="text-base font-black text-white uppercase border-b-2 border-white pb-3 flex items-center gap-2">
              <User className="w-5 h-5 text-[#00f0ff]" /> AVATAR & IDENTITY SELECTION
            </h3>

            <p className="text-xs text-slate-300">SELECT AVATAR ICON FOR YOUR ON-CHAIN PROFILE:</p>
            <div className="flex flex-wrap gap-3">
              {avatars.map((av) => (
                <button
                  key={av}
                  onClick={() => setSelectedAvatar(av)}
                  className={`w-12 h-12 text-2xl flex items-center justify-center border-2 border-black shadow-[3px_3px_0px_0px_#000] cursor-pointer transition-all ${
                    selectedAvatar === av ? 'bg-[#00f0ff] scale-105' : 'bg-[#0a0a0c] text-white hover:bg-white/10'
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>

            <div className="pt-4 border-t-2 border-white/20 space-y-3">
              <h4 className="text-xs font-black text-white uppercase">USER PREFERENCES</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#0a0a0c] p-3 border-2 border-white space-y-1">
                  <label className="text-[10px] text-slate-400 font-black uppercase block mb-1">CURRENCY</label>
                  <CustomSelect
                    options={['USD ($)', 'EUR (€)', 'GBP (£)', 'JPY (¥)']}
                    value={currency}
                    onChange={(val) => setCurrency(val)}
                    variant="dark"
                    className="w-full"
                  />
                </div>

                <div className="bg-[#0a0a0c] p-3 border-2 border-white space-y-1">
                  <label className="text-[10px] text-slate-400 font-black uppercase block mb-1">LANGUAGE</label>
                  <CustomSelect
                    options={['English (US)', 'Spanish (ES)', 'Japanese (JP)']}
                    value={language}
                    onChange={(val) => setLanguage(val)}
                    variant="dark"
                    className="w-full"
                  />
                </div>

                <div className="bg-[#0a0a0c] p-3 border-2 border-white space-y-1">
                  <label className="text-[10px] text-slate-400 font-black uppercase block mb-1">DEFAULT GAS PRESET</label>
                  <CustomSelect
                    options={[
                      { value: 'SLOW', label: 'SLOW (LOWEST FEE)' },
                      { value: 'NORMAL', label: 'NORMAL (BALANCED)' },
                      { value: 'FAST', label: 'FAST (RECOMMENDED)' },
                      { value: 'INSTANT', label: 'INSTANT (MEV BOOST)' },
                    ]}
                    value={gasSpeed}
                    onChange={(val) => setGasSpeed(val as any)}
                    variant="green"
                    className="w-full"
                  />
                </div>

                <div className="bg-[#0a0a0c] p-3 border-2 border-white space-y-1">
                  <label className="text-[10px] text-slate-400 font-black uppercase block mb-1">AUTO-LOCK TIMEOUT</label>
                  <CustomSelect
                    options={[
                      { value: '5', label: '5 MINUTES' },
                      { value: '15', label: '15 MINUTES' },
                      { value: '30', label: '30 MINUTES' },
                      { value: 'NEVER', label: 'NEVER' },
                    ]}
                    value={autoLockMinutes}
                    onChange={(val) => setAutoLockMinutes(val)}
                    variant="dark"
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Connected Accounts */}
          <div className="bg-[#141419] border-2 border-white p-6 shadow-[6px_6px_0px_0px_#ff007f] space-y-4">
            <h3 className="text-base font-black text-white uppercase border-b-2 border-white pb-3 flex items-center gap-2">
              <Globe className="w-5 h-5 text-[#ff007f]" /> CONNECTED ACCOUNTS & OAUTH
            </h3>

            <p className="text-xs text-slate-300">LINK WEB2 INTEGRATIONS AND BIOMETRIC SECURITY PROFILES:</p>

            <div className="space-y-3">
              {/* Google */}
              <div className="p-3 bg-[#0a0a0c] border-2 border-white flex items-center justify-between gap-3 shadow-[2px_2px_0px_0px_#000]">
                <div>
                  <div className="text-xs font-black text-white uppercase">GOOGLE ACCOUNT</div>
                  <div className="text-[10px] text-slate-400">{connectedAccounts.google.email}</div>
                </div>
                <button
                  onClick={() => toggleAccountConnection('google')}
                  className={`px-3 py-1.5 text-xs font-black uppercase border border-black shadow-[2px_2px_0px_0px_#000] cursor-pointer ${
                    connectedAccounts.google.connected ? 'bg-[#ccff00] text-black' : 'bg-slate-700 text-white'
                  }`}
                >
                  {connectedAccounts.google.connected ? 'LINKED' : 'CONNECT'}
                </button>
              </div>

              {/* Discord */}
              <div className="p-3 bg-[#0a0a0c] border-2 border-white flex items-center justify-between gap-3 shadow-[2px_2px_0px_0px_#000]">
                <div>
                  <div className="text-xs font-black text-white uppercase">DISCORD COMMUNITY</div>
                  <div className="text-[10px] text-slate-400">{connectedAccounts.discord.handle}</div>
                </div>
                <button
                  onClick={() => toggleAccountConnection('discord')}
                  className={`px-3 py-1.5 text-xs font-black uppercase border border-black shadow-[2px_2px_0px_0px_#000] cursor-pointer ${
                    connectedAccounts.discord.connected ? 'bg-[#00f0ff] text-black' : 'bg-slate-700 text-white'
                  }`}
                >
                  {connectedAccounts.discord.connected ? 'LINKED' : 'CONNECT'}
                </button>
              </div>

              {/* GitHub */}
              <div className="p-3 bg-[#0a0a0c] border-2 border-white flex items-center justify-between gap-3 shadow-[2px_2px_0px_0px_#000]">
                <div>
                  <div className="text-xs font-black text-white uppercase">GITHUB DEVELOPER</div>
                  <div className="text-[10px] text-slate-400">{connectedAccounts.github.handle}</div>
                </div>
                <button
                  onClick={() => toggleAccountConnection('github')}
                  className={`px-3 py-1.5 text-xs font-black uppercase border border-black shadow-[2px_2px_0px_0px_#000] cursor-pointer ${
                    connectedAccounts.github.connected ? 'bg-[#ccff00] text-black' : 'bg-slate-700 text-white'
                  }`}
                >
                  {connectedAccounts.github.connected ? 'LINKED' : 'CONNECT'}
                </button>
              </div>

              {/* YubiKey */}
              <div className="p-3 bg-[#0a0a0c] border-2 border-white flex items-center justify-between gap-3 shadow-[2px_2px_0px_0px_#000]">
                <div>
                  <div className="text-xs font-black text-white uppercase flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-[#ff007f]" /> YUBIKEY HARDWARE AUTH
                  </div>
                  <div className="text-[10px] text-slate-400">{connectedAccounts.yubikey.serial}</div>
                </div>
                <button
                  onClick={() => toggleAccountConnection('yubikey')}
                  className={`px-3 py-1.5 text-xs font-black uppercase border border-black shadow-[2px_2px_0px_0px_#000] cursor-pointer ${
                    connectedAccounts.yubikey.connected ? 'bg-[#ff007f] text-white' : 'bg-slate-700 text-white'
                  }`}
                >
                  {connectedAccounts.yubikey.connected ? 'PAIRED' : 'PAIR'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: WALLETS & CONTACTS */}
      {activeTab === 'walletsContacts' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Wallets Manager */}
          <div className="bg-[#141419] border-2 border-white p-6 shadow-[6px_6px_0px_0px_#ccff00] space-y-4">
            <div className="flex items-center justify-between border-b-2 border-white pb-3">
              <h3 className="text-base font-black text-white uppercase flex items-center gap-2">
                <Wallet className="w-5 h-5 text-[#ccff00]" /> MANAGED ON-CHAIN WALLETS
              </h3>
              <button
                onClick={() => {
                  const newWalletName = prompt('Enter New Wallet Label (e.g. DeFi Trading Wallet):');
                  if (newWalletName) {
                    setWalletAccounts([
                      ...walletAccounts,
                      {
                        id: Date.now().toString(),
                        name: newWalletName,
                        address: '0x' + Math.random().toString(16).substring(2, 10).toUpperCase() + '... Vault',
                        type: 'HOT',
                        balanceUsd: '$0.00',
                      },
                    ]);
                  }
                }}
                className="px-3 py-1 bg-[#ccff00] text-black font-black text-xs uppercase border border-black shadow-[2px_2px_0px_0px_#000] cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" /> ADD WALLET
              </button>
            </div>

            <div className="space-y-3">
              {walletAccounts.map((w) => (
                <div key={w.id} className="p-4 bg-[#0a0a0c] border-2 border-white space-y-2 shadow-[3px_3px_0px_0px_#000]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-white uppercase">{w.name}</span>
                      {w.isPrimary && (
                        <span className="px-1.5 py-0.5 bg-[#ccff00] text-black text-[9px] font-black uppercase border border-black">
                          PRIMARY
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-black text-[#00f0ff]">{w.balanceUsd}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span className="font-mono text-slate-400">{w.address}</span>
                    <button
                      onClick={() => handleCopy(w.address)}
                      className="text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer text-[10px] uppercase font-bold"
                    >
                      {copiedAddress === w.address ? <Check className="w-3 h-3 text-[#ccff00]" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedAddress === w.address ? 'COPIED' : 'COPY'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Address Book Contacts */}
          <div className="bg-[#141419] border-2 border-white p-6 shadow-[6px_6px_0px_0px_#00f0ff] space-y-4">
            <div className="flex items-center justify-between border-b-2 border-white pb-3">
              <h3 className="text-base font-black text-white uppercase flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#00f0ff]" /> ADDRESS BOOK CONTACTS
              </h3>
              <button
                onClick={() => setShowAddContactModal(true)}
                className="px-3 py-1 bg-[#00f0ff] text-black font-black text-xs uppercase border border-black shadow-[2px_2px_0px_0px_#000] cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" /> NEW CONTACT
              </button>
            </div>

            <div className="space-y-3">
              {contacts.map((c) => (
                <div key={c.id} className="p-3 bg-[#0a0a0c] border-2 border-white space-y-1 shadow-[2px_2px_0px_0px_#000]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-white uppercase">{c.name}</span>
                      {c.ens && <span className="text-[10px] text-[#ccff00] font-bold">({c.ens})</span>}
                    </div>
                    <button
                      onClick={() => handleDeleteContact(c.id)}
                      className="text-slate-500 hover:text-[#ff007f] cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">{c.address}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ACTIVITY LOGS */}
      {activeTab === 'activity' && (
        <div className="bg-[#141419] border-2 border-white p-6 shadow-[6px_6px_0px_0px_#ff007f] space-y-4">
          <h3 className="text-base font-black text-white uppercase border-b-2 border-white pb-3 flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#ff007f]" /> AUDIT TRAIL & SECURITY EVENT LOGS
          </h3>

          <div className="space-y-3">
            {activityLogs.map((log) => (
              <div key={log.id} className="p-4 bg-[#0a0a0c] border-2 border-white flex items-center justify-between shadow-[3px_3px_0px_0px_#000]">
                <div>
                  <div className="text-xs font-black text-white uppercase">{log.action}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">IP ORIGIN: {log.ip} • TIME: {log.time}</div>
                </div>
                <span className="px-2 py-0.5 bg-[#ccff00] text-black text-[10px] font-black uppercase border border-black">
                  {log.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: SYSTEM TELEMETRY */}
      {activeTab === 'telemetry' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-[#141419] p-5 border-2 border-white shadow-[4px_4px_0px_0px_#000]">
              <div className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-wider">AVERAGE RPC LATENCY</div>
              <div className="text-2xl font-black text-[#ccff00] font-mono mt-1">14 MS</div>
              <div className="text-[10px] font-mono text-slate-400 mt-0.5">SUB-SECOND TARGET</div>
            </div>

            <div className="bg-[#141419] p-5 border-2 border-white shadow-[4px_4px_0px_0px_#000]">
              <div className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-wider">E2E ENCRYPTION</div>
              <div className="text-2xl font-black text-[#ff007f] font-mono mt-1">AES-256-GCM</div>
              <div className="text-[10px] font-mono text-slate-400 mt-0.5">ZERO-TRUST KEY MGMT</div>
            </div>

            <div className="bg-[#141419] p-5 border-2 border-white shadow-[4px_4px_0px_0px_#000]">
              <div className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-wider">CLUSTER UPTIME</div>
              <div className="text-2xl font-black text-[#00f0ff] font-mono mt-1">99.99%</div>
              <div className="text-[10px] font-mono text-slate-400 mt-0.5">MULTI-REGION CLOUD RUN</div>
            </div>

            <div className="bg-[#141419] p-5 border-2 border-white shadow-[4px_4px_0px_0px_#000]">
              <div className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-wider">CLOUD SYNC STATUS</div>
              <div className="text-xs font-black text-[#ffe600] font-mono mt-2 truncate">
                {userSettings.lastBackupTimestamp
                  ? new Date(userSettings.lastBackupTimestamp).toLocaleTimeString()
                  : 'SYNCED'}
              </div>
              <div className="text-[10px] font-mono text-slate-400 mt-0.5">AUTOMATED BACKUPS</div>
            </div>
          </div>

          <div className="bg-[#141419] border-2 border-white p-6 shadow-[8px_8px_0px_0px_#ff007f] space-y-4">
            <h3 className="text-lg font-black text-white font-mono uppercase flex items-center gap-2 tracking-tight border-b-2 border-white pb-3">
              <Server className="w-5 h-5 text-[#ff007f] stroke-[3]" />
              <span>MICROSERVICES TELEMETRY</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {systemMetrics.map((ms) => (
                <div key={ms.name} className="p-5 bg-[#0a0a0c] border-2 border-white flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-mono font-black text-sm text-white">{ms.name}</h4>
                      <span className="px-2.5 py-0.5 text-[10px] font-mono font-black uppercase bg-[#ccff00] text-black border border-black shadow-[1px_1px_0px_0px_#000]">
                        {ms.status}
                      </span>
                    </div>
                    <p className="text-xs font-mono text-slate-300">{ms.description}</p>
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono text-slate-300 pt-2 border-t-2 border-white/20">
                    <span>LATENCY: <strong className="text-[#ccff00]">{ms.latencyMs}MS</strong></span>
                    <span>UPTIME: <strong className="text-white">{ms.uptimePercentage}%</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add Contact Modal */}
      {showAddContactModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-[#141419] border-4 border-white p-6 max-w-md w-full space-y-4 shadow-[8px_8px_0px_0px_#00f0ff]">
            <h3 className="text-lg font-black text-white uppercase border-b-2 border-white pb-2">ADD ADDRESS BOOK CONTACT</h3>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-slate-400 font-black uppercase">CONTACT NICKNAME</label>
                <input
                  type="text"
                  placeholder="e.g. Satoshi OTC Vault"
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  className="w-full bg-[#0a0a0c] border-2 border-white p-2.5 text-xs text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 font-black uppercase">WALLET ADDRESS</label>
                <input
                  type="text"
                  placeholder="0x..."
                  value={newContactAddress}
                  onChange={(e) => setNewContactAddress(e.target.value)}
                  className="w-full bg-[#0a0a0c] border-2 border-white p-2.5 text-xs text-white focus:outline-none font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 font-black uppercase">ENS NAME (OPTIONAL)</label>
                <input
                  type="text"
                  placeholder="alias.eth"
                  value={newContactEns}
                  onChange={(e) => setNewContactEns(e.target.value)}
                  className="w-full bg-[#0a0a0c] border-2 border-white p-2.5 text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAddContactModal(false)}
                className="px-4 py-2 bg-slate-700 text-white font-black text-xs uppercase"
              >
                CANCEL
              </button>
              <button
                onClick={handleAddContact}
                className="px-4 py-2 bg-[#00f0ff] text-black font-black text-xs uppercase border border-black shadow-[2px_2px_0px_0px_#000]"
              >
                SAVE CONTACT
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
