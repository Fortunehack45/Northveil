import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { BlockiesAvatar } from './BlockiesAvatar';
import { SUPPORTED_CHAINS } from '../data/initialData';
import { Search, Bell, Menu, ChevronDown, Wallet, Plus, Check, Copy, X, CheckCheck, ShieldAlert, ArrowLeftRight, Zap } from 'lucide-react';
import { CustomSelect } from './CustomSelect';

interface HeaderProps {
  onToggleMobileNav?: () => void;
  onNavigateNetworkManager?: () => void;
}

interface NotificationItem {
  id: string;
  title: string;
  desc: string;
  time: string;
  type: 'alert' | 'success' | 'info';
  read: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileNav, onNavigateNetworkManager }) => {
  const {
    assets,
    activeChain,
    setActiveChain,
    subWallets,
    activeWalletId,
    activeSubWallet,
    setActiveWalletId,
    createSubWallet,
    customNetworks,
    addCustomNetwork
  } = useWallet();

  const [searchQuery, setSearchQuery] = useState('');
  const [isWalletMenuOpen, setIsWalletMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isCreatingWallet, setIsCreatingWallet] = useState(false);
  const [isAddingNetwork, setIsAddingNetwork] = useState(false);
  const [newWalletName, setNewWalletName] = useState('');
  const [copiedAddr, setCopiedAddr] = useState<string | null>(null);

  const [customNetData, setCustomNetData] = useState({ name: '', rpcUrl: '', chainId: '', symbol: '' });

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: '1',
      title: 'GAS PRICE DROP ALERT',
      desc: 'Ethereum Mainnet gas is currently 12 Gwei. Ideal for execution.',
      time: '2m ago',
      type: 'info',
      read: false,
    },
    {
      id: '2',
      title: 'SWAP EXECUTED',
      desc: 'Successfully swapped 0.5 ETH for 1,739.14 USDC via Uniswap Router.',
      time: '18m ago',
      type: 'success',
      read: false,
    },
    {
      id: '3',
      title: 'SECURITY APPROVAL WARNING',
      desc: '1 Unlimited ERC-20 token approval detected. Audit recommended.',
      time: '1h ago',
      type: 'alert',
      read: false,
    },
    {
      id: '4',
      title: 'STAKING YIELD ACCRUED',
      desc: '0.045 ETH rewards ready to claim on Lido Staking Vault.',
      time: '3h ago',
      type: 'success',
      read: false,
    },
    {
      id: '5',
      title: 'HD WALLET CREATED',
      desc: 'Sub-account #2 created on derivation path m/44\'/60\'/0\'/0/1.',
      time: '5h ago',
      type: 'info',
      read: true,
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const matchingSearchAssets = searchQuery.trim()
    ? assets.filter((a) => {
        const q = searchQuery.toLowerCase().trim();
        return (
          a.name.toLowerCase().includes(q) ||
          a.symbol.toLowerCase().includes(q) ||
          (a.contractAddress && a.contractAddress.toLowerCase().includes(q))
        );
      })
    : [];

  const activeChainData = [...SUPPORTED_CHAINS, ...customNetworks].find((c) => c.id === activeChain) || SUPPORTED_CHAINS[0];

  const handleAddCustomNetwork = () => {
    if (!customNetData.name || !customNetData.rpcUrl || !customNetData.chainId) return;
    const newChain = {
      id: `custom-${Date.now()}`,
      name: customNetData.name,
      symbol: customNetData.symbol || 'ETH',
      icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
      color: '#00f0ff',
      rpcLatency: 50,
      blockTime: 12,
      gasUnit: 'Gwei',
      nativeTokenPrice: 0,
      explorerUrl: '',
      rpcUrl: customNetData.rpcUrl,
      chainId: parseInt(customNetData.chainId),
      isCustom: true
    };
    addCustomNetwork(newChain);
    setActiveChain(newChain.id);
    setIsAddingNetwork(false);
    setCustomNetData({ name: '', rpcUrl: '', chainId: '', symbol: '' });
  };

  const handleCreateNewSubWallet = (overrideName?: string) => {
    const finalName = (overrideName || newWalletName).trim() || `Sub-Account #${subWallets.length + 1}`;
    const newW = createSubWallet(finalName);
    if (newW) {
      setActiveWalletId(newW.id);
    }
    setNewWalletName('');
    setIsCreatingWallet(false);
    setIsWalletMenuOpen(false);
  };

  const handleCopyAddr = (e: React.MouseEvent, address: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(address);
    setCopiedAddr(address);
    setTimeout(() => setCopiedAddr(null), 2000);
  };

  return (
    <header className="w-full h-14 sm:h-20 px-2 sm:px-8 border-b-2 border-white bg-[#10131c] flex items-center justify-between gap-2 sm:gap-4 shrink-0 z-30 relative font-mono">
      {(isWalletMenuOpen || isNotifOpen) && (
        <div
          onClick={() => {
            setIsWalletMenuOpen(false);
            setIsNotifOpen(false);
          }}
          className="fixed inset-0 z-40 bg-transparent"
        />
      )}

      {/* Left: Mobile Menu Trigger, Welcome Greeting & Search Bar */}
      <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
        <button
          onClick={onToggleMobileNav}
          className="md:hidden text-black bg-[#d4ff00] p-1.5 border-2 border-black shadow-[2px_2px_0px_0px_#000] font-black cursor-pointer active:translate-x-0.5 active:translate-y-0.5 shrink-0"
          aria-label="Open menu"
        >
          <Menu className="w-4 h-4 stroke-[3]" />
        </button>

        <div className="hidden xs:flex items-center gap-2 shrink-0">
          <BlockiesAvatar address={activeSubWallet?.address || '0x0000000000000000000000000000000000000000'} size={32} />
          <h2 className="text-xs sm:text-sm font-black text-white tracking-tight font-mono truncate flex items-center gap-1.5">
            <span className="hidden md:inline text-slate-400">VAULT:</span>
            <span className="bg-[#d4ff00] text-black px-1.5 py-0.5 border border-black shadow-[2px_2px_0px_0px_#000]">
              {activeSubWallet?.name || 'ACCOUNT 1'}
            </span>
          </h2>
        </div>

        {/* Search Bar - Left Aligned with Live Token & Address Search Popover */}
        <div className="hidden sm:flex items-center relative max-w-xs md:max-w-sm w-full ml-1 sm:ml-2 z-50">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="SEARCH CRYPTO, TICKER OR CONTRACT..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#181c28] border-2 border-white text-white placeholder-slate-400 text-xs font-mono font-bold pl-9 pr-7 py-1.5 sm:py-2 shadow-[3px_3px_0px_0px_#d4ff00] focus:outline-none focus:bg-[#202534] transition-all uppercase"
            />
            <Search className="w-3.5 h-3.5 text-[#d4ff00] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none stroke-[3]" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                title="Clear Search"
              >
                <X className="w-3.5 h-3.5 stroke-[3]" />
              </button>
            )}

            {/* Live Token & Address Search Results Dropdown */}
            {searchQuery.trim().length > 0 && (
              <div className="absolute left-0 right-0 top-11 bg-[#141824] border-2 border-white shadow-[5px_5px_0px_0px_#d4ff00] p-2.5 z-50 space-y-2 animate-fadeIn font-mono">
                <div className="flex items-center justify-between border-b border-white/20 pb-1.5 text-[10px]">
                  <span className="font-black text-[#d4ff00] uppercase tracking-wider">
                    TOKENS FOUND ({matchingSearchAssets.length})
                  </span>
                  {searchQuery.trim().startsWith('0x') && (
                    <span className="text-[9px] text-[#00f0ff] font-bold uppercase">CONTRACT FORMAT</span>
                  )}
                </div>

                {matchingSearchAssets.length > 0 ? (
                  <div className="max-h-60 overflow-y-auto no-scrollbar space-y-1.5">
                    {matchingSearchAssets.map((asset) => (
                      <div
                        key={asset.id}
                        onClick={() => {
                          setSearchQuery('');
                          window.dispatchEvent(new CustomEvent('open-token-details', { detail: asset }));
                        }}
                        className="p-2 bg-[#0a0b0e] border border-white/20 hover:border-[#d4ff00] hover:bg-[#1c2130] transition-all cursor-pointer flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <img
                            src={asset.icon}
                            alt={asset.symbol}
                            className="w-6 h-6 bg-[#ffe600] p-0.5 border border-black object-contain shrink-0"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                          <div className="min-w-0">
                            <div className="font-black text-xs text-white uppercase truncate flex items-center gap-1">
                              <span>{asset.symbol}</span>
                              <span className="text-[10px] text-slate-400 font-normal truncate">({asset.name})</span>
                            </div>
                            {asset.contractAddress && (
                              <div className="text-[9px] text-[#00f0ff] font-mono truncate">
                                {asset.contractAddress.slice(0, 6)}...{asset.contractAddress.slice(-4)}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="font-black text-xs text-white">
                            ${asset.priceUsd.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                          </div>
                          <div
                            className={`text-[9px] font-bold ${
                              asset.change24h >= 0 ? 'text-[#d4ff00]' : 'text-[#ff007f]'
                            }`}
                          >
                            {asset.change24h >= 0 ? '+' : ''}
                            {asset.change24h.toFixed(2)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 text-center text-xs text-slate-400 font-bold uppercase space-y-1">
                    <div>NO TOKENS OR CONTRACTS FOUND</div>
                    <div className="text-[10px] text-slate-500 font-normal font-sans">
                      Try searching by symbol (ETH, SOL), name, or contract address.
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Actions: Multi-Wallet Selector, Chain Selector, Notification Bell */}
      <div className="flex items-center gap-1.5 sm:gap-3 font-mono shrink-0">
        {/* Sub-Wallet Selector Button & Dropdown */}
        <div className="relative z-50">
          <button
            onClick={() => {
              setIsWalletMenuOpen(!isWalletMenuOpen);
              setIsNotifOpen(false);
            }}
            className="px-1.5 sm:px-3 py-1.5 sm:py-2 bg-[#0a0b0e] text-white border-2 border-white shadow-[2px_2px_0px_0px_#00f0ff] sm:shadow-[3px_3px_0px_0px_#00f0ff] font-black text-[11px] sm:text-xs uppercase flex items-center gap-1 sm:gap-2 cursor-pointer hover:bg-[#141824] active:translate-x-0.5 active:translate-y-0.5 max-w-[130px] sm:max-w-none"
          >
            <span
              className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full border border-black shrink-0"
              style={{ backgroundColor: activeSubWallet?.colorTag || '#00f0ff' }}
            />
            <span className="hidden md:inline-block max-w-[110px] truncate">{activeSubWallet?.name || 'Account 1'}</span>
            <span className="text-[10px] text-slate-300 font-bold">
              {activeSubWallet?.address ? `${activeSubWallet.address.slice(0, 6)}...` : '0x...'}
            </span>
            <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#00f0ff] stroke-[3] shrink-0" />
          </button>

          {/* Sub-Wallet Menu Dropdown */}
          {isWalletMenuOpen && (
            <div className="fixed left-3 right-3 top-14 sm:absolute sm:left-auto sm:right-0 sm:top-12 w-auto sm:w-80 max-w-sm bg-[#141824] border-2 border-white shadow-[5px_5px_0px_0px_#00f0ff] p-3 z-50 space-y-3 font-mono animate-fadeIn">
              <div className="flex items-center justify-between border-b-2 border-white pb-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Wallet className="w-3 h-3 text-[#00f0ff]" /> HD ACCOUNTS ({(subWallets || []).length})
                </span>
                <span className="text-[9px] bg-[#d4ff00] text-black px-1 font-black uppercase border border-black">
                  BIP-44
                </span>
              </div>

              {/* Sub-Wallets List */}
              <div className="max-h-48 overflow-y-auto no-scrollbar space-y-1.5">
                {(subWallets || []).map((w) => {
                  if (!w) return null;
                  const isActive = w.id === activeWalletId;
                  const addrStr = w.address || '';
                  const shortAddr = addrStr.length > 10 ? `${addrStr.slice(0, 6)}...${addrStr.slice(-4)}` : addrStr;

                  return (
                    <div
                      key={w.id}
                      onClick={() => {
                        setActiveWalletId(w.id);
                        setIsWalletMenuOpen(false);
                      }}
                      className={`p-2 border-2 text-xs cursor-pointer flex items-center justify-between transition-all ${
                        isActive
                          ? 'bg-[#00f0ff] text-black border-black font-black shadow-[2px_2px_0px_0px_#000]'
                          : 'bg-[#0a0b0e] text-white border-white/30 hover:border-white'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-black shrink-0"
                          style={{ backgroundColor: w.colorTag || '#00f0ff' }}
                        />
                        <div className="truncate">
                          <div className="truncate font-black text-[11px]">{w.name || 'Sub Wallet'}</div>
                          <div className={`text-[9px] ${isActive ? 'text-black/70' : 'text-slate-400'}`}>
                            {w.derivationPath || "m/44'/60'/0'/0/0"} • {shortAddr}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={(e) => handleCopyAddr(e, w.address)}
                        className={`p-1 border border-black text-[9px] cursor-pointer ${
                          isActive ? 'bg-black text-[#00f0ff]' : 'bg-[#181c28] text-white'
                        }`}
                        title="Copy Address"
                      >
                        {copiedAddr === w.address ? <Check className="w-3 h-3 stroke-[3]" /> : <Copy className="w-3 h-3 stroke-[2.5]" />}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Create Sub-Wallet Inline Form */}
              {isCreatingWallet ? (
                <div className="p-2 bg-[#0a0b0e] border-2 border-white space-y-2">
                  <input
                    type="text"
                    placeholder="ACCOUNT LABEL (e.g. Trading)"
                    value={newWalletName}
                    onChange={(e) => setNewWalletName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateNewSubWallet()}
                    className="w-full bg-[#181c28] border border-white p-1.5 text-xs text-white focus:outline-none"
                    autoFocus
                  />
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleCreateNewSubWallet()}
                      className="flex-1 py-1 bg-[#ccff00] text-black font-black text-[10px] uppercase border border-black cursor-pointer hover:bg-[#d8ff33]"
                    >
                      CREATE WALLET
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsCreatingWallet(false)}
                      className="px-2 py-1 bg-[#181820] text-white font-black text-[10px] uppercase border border-white cursor-pointer"
                    >
                      CANCEL
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setIsCreatingWallet(true)}
                    className="flex-1 py-2 bg-[#ccff00] text-black font-black text-xs uppercase border-2 border-black shadow-[2px_2px_0px_0px_#000] cursor-pointer hover:bg-[#d8ff33] flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" /> CUSTOM LABEL
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCreateNewSubWallet()}
                    className="py-2 px-3 bg-[#00f0ff] text-black font-black text-xs uppercase border-2 border-black shadow-[2px_2px_0px_0px_#000] cursor-pointer hover:bg-[#33f3ff] flex items-center justify-center gap-1"
                    title="Instantly add sub-wallet"
                  >
                    + QUICK ADD
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Active Chain Selector */}
        <div>
          <CustomSelect
            options={[
              ...SUPPORTED_CHAINS.map((chain) => ({
                value: chain.id,
                label: chain.name,
                icon: <img src={chain.icon} alt={chain.name} className="w-4 h-4 object-contain bg-white/10 p-0.5 border border-white/20" />,
              })),
              ...(customNetworks || []).map((chain) => ({
                value: chain.id,
                label: chain.name,
                icon: <Zap className="w-4 h-4 text-[#00f0ff]" />,
                badge: 'CUSTOM'
              })),
              { value: 'add_custom', label: '+ ADD CUSTOM NETWORK', badge: 'NEW' }
            ]}
            value={activeChain}
            onChange={(val) => {
              if (val === 'add_custom') {
                if (onNavigateNetworkManager) {
                  onNavigateNetworkManager();
                }
              } else {
                setActiveChain(val as any);
              }
            }}
            variant="yellow"
            align="right"
          />
        </div>

        {/* Notification Bell Badge with interactive popover */}
        <div className="relative hidden xs:block z-50">
          <button
            onClick={() => {
              setIsNotifOpen(!isNotifOpen);
              setIsWalletMenuOpen(false);
            }}
            className="p-1.5 sm:p-2.5 bg-[#00f0ff] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000] sm:shadow-[3px_3px_0px_0px_#000] transition-all cursor-pointer hover:bg-[#33f3ff] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none relative"
            title="Notifications"
          >
            <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black stroke-[3]" />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 px-1 sm:px-1.5 py-0.2 sm:py-0.5 rounded-none bg-[#ff007f] text-white text-[8px] sm:text-[9px] font-black border border-black shadow-[1px_1px_0px_0px_#000]">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Popover */}
          {isNotifOpen && (
            <div className="absolute right-0 top-11 sm:top-12 w-[calc(100vw-24px)] max-w-xs sm:w-88 bg-[#141419] border-2 border-white shadow-[6px_6px_0px_0px_#ff007f] p-3 z-50 space-y-3 font-mono animate-fadeIn">
              <div className="flex items-center justify-between border-b-2 border-white pb-2">
                <div className="flex items-center gap-1.5">
                  <Bell className="w-4 h-4 text-[#00f0ff]" />
                  <span className="text-xs font-black text-white uppercase tracking-tight">NOTIFICATIONS</span>
                  {unreadCount > 0 && (
                    <span className="bg-[#ff007f] text-white text-[9px] font-black px-1.5 py-0.2 border border-black">
                      {unreadCount} NEW
                    </span>
                  )}
                </div>

                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[10px] text-[#ccff00] font-black hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCheck className="w-3.5 h-3.5" /> MARK ALL READ
                  </button>
                )}
              </div>

              {/* Notification Items List */}
              <div className="max-h-64 overflow-y-auto no-scrollbar space-y-2">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => {
                      setNotifications((prev) =>
                        prev.map((item) => (item.id === n.id ? { ...item, read: true } : item))
                      );
                    }}
                    className={`p-2.5 border-2 text-xs transition-all cursor-pointer ${
                      n.read
                        ? 'bg-[#0a0a0c] border-white/20 text-slate-400'
                        : 'bg-[#1a1a24] border-white text-white font-bold shadow-[2px_2px_0px_0px_#00f0ff]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        {n.type === 'alert' && <ShieldAlert className="w-3.5 h-3.5 text-[#ff007f] shrink-0" />}
                        {n.type === 'success' && <Zap className="w-3.5 h-3.5 text-[#ccff00] shrink-0" />}
                        {n.type === 'info' && <ArrowLeftRight className="w-3.5 h-3.5 text-[#00f0ff] shrink-0" />}
                        <span className="font-black text-[11px] uppercase tracking-tight text-white">{n.title}</span>
                      </div>
                      <span className="text-[9px] text-slate-400 shrink-0">{n.time}</span>
                    </div>
                    <p className="text-[10px] text-slate-300 mt-1 leading-tight font-sans font-normal">
                      {n.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar Pill */}
        <div className="flex items-center gap-2 pl-1 sm:pl-2 border-l-2 border-white/20">
          <BlockiesAvatar address={activeSubWallet?.address || '0x0000000000000000000000000000000000000000'} size={36} />
        </div>
      </div>
      {/* Add Custom Network Modal */}
      {isAddingNetwork && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn font-mono">
          <div className="bg-[#0a0a0c] border-2 border-white shadow-[8px_8px_0px_0px_#00f0ff] w-full max-w-md p-6 space-y-4">
            <div className="flex justify-between items-center border-b-2 border-white pb-3">
              <h3 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#00f0ff]" /> ADD CUSTOM NETWORK
              </h3>
              <button onClick={() => setIsAddingNetwork(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-black text-[#00f0ff] mb-1">NETWORK NAME</label>
                <input type="text" value={customNetData.name} onChange={e => setCustomNetData(prev => ({...prev, name: e.target.value}))} placeholder="e.g. Polygon Mumbai" className="w-full bg-[#181820] border-2 border-white p-2.5 text-xs text-white focus:outline-none focus:border-[#00f0ff]" />
              </div>
              <div>
                <label className="block text-xs font-black text-[#00f0ff] mb-1">RPC URL (Required)</label>
                <input type="text" value={customNetData.rpcUrl} onChange={e => setCustomNetData(prev => ({...prev, rpcUrl: e.target.value}))} placeholder="https://..." className="w-full bg-[#181820] border-2 border-white p-2.5 text-xs text-white focus:outline-none focus:border-[#00f0ff]" />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-black text-[#00f0ff] mb-1">CHAIN ID</label>
                  <input type="number" value={customNetData.chainId} onChange={e => setCustomNetData(prev => ({...prev, chainId: e.target.value}))} placeholder="e.g. 137" className="w-full bg-[#181820] border-2 border-white p-2.5 text-xs text-white focus:outline-none focus:border-[#00f0ff]" />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-black text-[#00f0ff] mb-1">SYMBOL</label>
                  <input type="text" value={customNetData.symbol} onChange={e => setCustomNetData(prev => ({...prev, symbol: e.target.value}))} placeholder="e.g. MATIC" className="w-full bg-[#181820] border-2 border-white p-2.5 text-xs text-white focus:outline-none focus:border-[#00f0ff]" />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button onClick={handleAddCustomNetwork} className="w-full py-3 bg-[#00f0ff] text-black font-black text-sm uppercase border-2 border-black shadow-[4px_4px_0px_0px_#000] cursor-pointer hover:bg-[#33f3ff]">
                SAVE NETWORK
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};



