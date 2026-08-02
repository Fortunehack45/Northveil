import React, { useState } from 'react';
import {
  Grid,
  List,
  Shield,
  Search,
  Filter,
  EyeOff,
  ExternalLink,
  Send,
  Sparkles,
  Share2,
  Check,
} from 'lucide-react';

import { useWallet } from '../context/WalletContext';
import { NFTAsset } from '../types';

export const NFTSectionView: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState<'all' | 'hidden' | 'spam'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNft, setSelectedNft] = useState<NFTAsset | null>(null);
  const [copiedAddress, setCopiedAddress] = useState(false);

  const { ownedNFTs } = useWallet();
  const nfts = ownedNFTs;

  const filteredNfts = nfts.filter((nft) => {
    const isSpam = false; // Add spam detection logic here if needed
    const isHidden = false; // Add hidden logic here if needed
    
    if (activeTab === 'spam') return isSpam;
    if (activeTab === 'hidden') return isHidden;
    if (isSpam || isHidden) return false;
    
    if (searchQuery) {
      return (
        (nft.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (nft.collection || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return true;
  });

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 pb-12 w-full">
      {/* Header Banner */}
      <div className="bg-[#141419] border-2 border-white p-6 sm:p-8 shadow-[8px_8px_0px_0px_#ff007f] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="px-2.5 py-1 bg-[#ff007f] text-white text-[10px] font-black font-mono uppercase border border-black shadow-[2px_2px_0px_0px_#000]">
            MULTICHAIN VAULT
          </span>
          <h2 className="text-2xl font-black text-white font-mono uppercase tracking-tight mt-2">
            NFT GALLERY & DIGITAL ASSETS
          </h2>
          <p className="text-xs text-slate-300 font-mono mt-1">
            VERIFIED METADATA, SPAM AIRDROP FILTERING, AND ONE-CLICK TRANSFER PROTOCOL.
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-2 bg-[#0a0a0c] p-1.5 border-2 border-white shadow-[4px_4px_0px_0px_#000]">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1.5 font-mono text-xs font-black uppercase flex items-center gap-1.5 border-2 cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-[#ccff00] text-black border-black shadow-[2px_2px_0px_0px_#000]'
                : 'bg-transparent text-white border-transparent'
            }`}
          >
            <Grid className="w-4 h-4" /> GRID
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 font-mono text-xs font-black uppercase flex items-center gap-1.5 border-2 cursor-pointer ${
              viewMode === 'list'
                ? 'bg-[#ccff00] text-black border-black shadow-[2px_2px_0px_0px_#000]'
                : 'bg-transparent text-white border-transparent'
            }`}
          >
            <List className="w-4 h-4" /> LIST
          </button>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-[#141419] border-2 border-white p-4 shadow-[6px_6px_0px_0px_#00f0ff] flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Category tabs */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 font-mono text-xs font-black uppercase border-2 shadow-[2px_2px_0px_0px_#000] cursor-pointer ${
              activeTab === 'all'
                ? 'bg-[#00f0ff] text-black border-black'
                : 'bg-[#0a0a0c] text-slate-300 border-white/40'
            }`}
          >
            COLLECTION ({nfts.length})
          </button>
          <button
            onClick={() => setActiveTab('hidden')}
            className={`px-4 py-2 font-mono text-xs font-black uppercase border-2 shadow-[2px_2px_0px_0px_#000] cursor-pointer ${
              activeTab === 'hidden'
                ? 'bg-[#ffe600] text-black border-black'
                : 'bg-[#0a0a0c] text-slate-300 border-white/40'
            }`}
          >
            HIDDEN (0)
          </button>
          <button
            onClick={() => setActiveTab('spam')}
            className={`px-4 py-2 font-mono text-xs font-black uppercase border-2 shadow-[2px_2px_0px_0px_#000] cursor-pointer ${
              activeTab === 'spam'
                ? 'bg-[#ff007f] text-white border-black'
                : 'bg-[#0a0a0c] text-slate-300 border-white/40'
            }`}
          >
            SPAM SHIELD (0)
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 stroke-[3]" />
          <input
            type="text"
            placeholder="SEARCH NFT OR COLLECTION..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0a0a0c] border-2 border-white py-2 pl-9 pr-3 text-xs font-mono font-bold text-white focus:outline-none"
          />
        </div>
      </div>

      {/* NFT Grid / List Display */}
      {filteredNfts.length === 0 ? (
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-white/20 text-slate-500 font-mono text-xs uppercase min-h-[400px] bg-[#0a0a0c]">
          <List className="w-12 h-12 mb-4 opacity-50 text-[#ccff00]" />
          <span className="text-lg font-black text-white">NO NFTS IN VAULT</span>
          <span className="mt-2 text-slate-400">CONNECT OMNICHAIN API KEY OR DEPOSIT AN NFT</span>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNfts.map((nft) => (
            <div
              key={nft.id}
              onClick={() => setSelectedNft(nft)}
              className="bg-[#141419] border-2 border-white p-4 shadow-[6px_6px_0px_0px_#ccff00] hover:translate-x-0.5 hover:-translate-y-0.5 transition-all cursor-pointer flex flex-col justify-between space-y-4"
            >
              <div className="relative aspect-square border-2 border-white overflow-hidden bg-black">
                <img src={nft.image} alt={nft.name} className="w-full h-full object-cover" />
                <span className="absolute top-2 left-2 bg-[#0a0a0c] text-[#ccff00] font-mono font-black text-[10px] px-2 py-0.5 border border-white uppercase shadow-[2px_2px_0px_0px_#000]">
                  {nft.network}
                </span>
              </div>

              <div>
                <div className="text-[10px] font-mono font-black text-[#00f0ff] uppercase">{nft.collection}</div>
                <h3 className="text-lg font-black text-white font-mono uppercase tracking-tight truncate">{nft.name}</h3>
                <div className="flex items-center justify-between mt-2 pt-2 border-t-2 border-white/20 font-mono text-xs">
                  <span className="text-slate-400">FLOOR PRICE:</span>
                  <span className="text-[#ccff00] font-black">{nft.floorPrice}</span>
                </div>
              </div>

              <button className="w-full py-2 bg-[#ccff00] text-black font-mono font-black text-xs uppercase border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:bg-[#d8ff33]">
                INSPECT & TRANSFER
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[#141419] border-2 border-white p-4 shadow-[6px_6px_0px_0px_#ccff00] space-y-3">
          {filteredNfts.map((nft) => (
            <div
              key={nft.id}
              onClick={() => setSelectedNft(nft)}
              className="bg-[#0a0a0c] border-2 border-white p-3 flex items-center justify-between gap-4 cursor-pointer hover:bg-[#181822] shadow-[3px_3px_0px_0px_#000]"
            >
              <div className="flex items-center gap-4">
                <img src={nft.image} alt={nft.name} className="w-14 h-14 object-cover border-2 border-white" />
                <div>
                  <div className="text-[10px] font-mono font-black text-[#00f0ff] uppercase">{nft.collection}</div>
                  <h4 className="text-base font-black text-white font-mono uppercase">{nft.name}</h4>
                  <div className="text-[10px] font-mono text-slate-400">{nft.tokenId} • {nft.contract}</div>
                </div>
              </div>
              <div className="text-right font-mono">
                <div className="text-xs text-slate-300">FLOOR</div>
                <div className="text-sm font-black text-[#ccff00]">{nft.floorPrice}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* NFT Details Modal */}
      {selectedNft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-[#141419] border-4 border-white p-6 max-w-lg w-full shadow-[10px_10px_0px_0px_#ff007f] relative space-y-5 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between border-b-2 border-white pb-3">
              <h3 className="text-xl font-black text-white font-mono uppercase">{selectedNft.name}</h3>
              <button
                onClick={() => setSelectedNft(null)}
                className="px-2 py-1 bg-[#ff007f] text-white font-mono font-black border-2 border-black"
              >
                ✕
              </button>
            </div>

            <div className="aspect-square border-2 border-white overflow-hidden bg-black">
              <img src={selectedNft.image} alt={selectedNft.name} className="w-full h-full object-cover" />
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between p-2.5 bg-[#0a0a0c] border-2 border-white">
                <span className="text-slate-400">COLLECTION:</span>
                <span className="text-[#00f0ff] font-bold">{selectedNft.collection}</span>
              </div>
              <div className="flex justify-between p-2.5 bg-[#0a0a0c] border-2 border-white">
                <span className="text-slate-400">TOKEN ID:</span>
                <span className="text-white font-bold">{selectedNft.tokenId}</span>
              </div>
              <div className="flex justify-between p-2.5 bg-[#0a0a0c] border-2 border-white">
                <span className="text-slate-400">CONTRACT:</span>
                <span className="text-[#ccff00] font-bold">{selectedNft.contract}</span>
              </div>

              <div>
                <span className="text-slate-300 font-bold uppercase">TRAITS & ATTRIBUTES:</span>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {selectedNft.attributes.map((attr, idx) => (
                    <div key={idx} className="bg-[#0a0a0c] border border-white p-2">
                      <div className="text-[10px] text-slate-400 uppercase">{attr.trait}</div>
                      <div className="text-xs text-[#ccff00] font-black uppercase">{attr.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 font-mono">
              <button
                onClick={() => alert(`Initiating Transfer for ${selectedNft.name}`)}
                className="py-3 bg-[#ccff00] text-black font-black text-xs uppercase border-2 border-black shadow-[4px_4px_0px_0px_#000] cursor-pointer flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" /> TRANSFER NFT
              </button>
              <button
                onClick={() => setSelectedNft(null)}
                className="py-3 bg-[#0a0a0c] text-white font-black text-xs uppercase border-2 border-white shadow-[4px_4px_0px_0px_#000] cursor-pointer"
              >
                CLOSE DETAILS
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
