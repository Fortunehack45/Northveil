import fs from 'fs';

const path = 'c:/Users/USER PC/Desktop/Northveil/src/components/PortfolioView.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Destructure ownedNFTs and userSettings
content = content.replace(
  `    activeSubWallet,
    setActiveWalletId,
    createSubWallet,
  } = useWallet();`,
  `    activeSubWallet,
    setActiveWalletId,
    createSubWallet,
    ownedNFTs,
    userSettings,
  } = useWallet();`
);

// 2. Remove hardcoded ownedNFTs array
const hardcodedRegex = /\/\/ Owned NFTs displayed directly in the dashboard's middle left section[\s\S]*?\];\n/;
content = content.replace(hardcodedRegex, '// Removed hardcoded NFTs, utilizing dynamic ownedNFTs from WalletContext.\n');

// 3. Fix grid view mapping and add empty state
content = content.replace(
  `            {/* NFT Rendering: Grid or List */}
            {nftViewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-3.5">
                {ownedNFTs.map((nft) => (`,
  `            {/* NFT Rendering: Grid or List */}
            {nftViewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-3.5 min-h-[250px]">
                {ownedNFTs.length > 0 ? ownedNFTs.map((nft) => (`
);

content = content.replace(
  `                    <div className="pt-2 mt-3 border-t border-white/20 flex items-center justify-between">
                      <div>
                        <span className="text-[9px] text-slate-400 font-bold block uppercase">FLOOR</span>
                        <span className="text-xs font-black text-[#ccff00]">{nft.floorPrice}</span>
                      </div>
                      <span className="text-[10px] text-slate-300 font-bold px-1.5 py-0.5 bg-[#141419] border border-white/40">
                        {nft.estUsd}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (`,
  `                    <div className="pt-2 mt-3 border-t border-white/20 flex items-center justify-between">
                      <div>
                        <span className="text-[9px] text-slate-400 font-bold block uppercase">FLOOR</span>
                        <span className="text-xs font-black text-[#ccff00]">{nft.floorPrice}</span>
                      </div>
                      <span className="text-[10px] text-slate-300 font-bold px-1.5 py-0.5 bg-[#141419] border border-white/40">
                        {nft.estUsd}
                      </span>
                    </div>
                  </div>
                )) : (
                  <div className="col-span-full flex flex-col items-center justify-center border-2 border-dashed border-white/20 text-slate-500 font-mono text-xs uppercase min-h-[250px] bg-[#0a0a0c]">
                    <ImageIcon className="w-8 h-8 mb-3 opacity-50" />
                    {!userSettings?.moralisApiKey ? (
                      <>
                        <span className="text-white font-black mb-1">NFT INDEXING DISABLED</span>
                        <span className="text-[9px] text-center max-w-xs leading-relaxed">
                          Please configure your Moralis API Key in system settings to fetch and display your digital collectibles.
                        </span>
                      </>
                    ) : (
                      <span>NO DIGITAL COLLECTIBLES DETECTED</span>
                    )}
                  </div>
                )}
              </div>
            ) : (`
);

// 4. Fix list view mapping and add empty state
content = content.replace(
  `              <div className="space-y-2.5">
                {ownedNFTs.map((nft) => (`,
  `              <div className="space-y-2.5 min-h-[250px]">
                {ownedNFTs.length > 0 ? ownedNFTs.map((nft) => (`
);

content = content.replace(
  `                      <button
                        type="button"
                        className="hidden xs:inline-block px-3 py-1 bg-[#00f0ff] text-black font-black text-[10px] uppercase border-2 border-black shadow-[1.5px_1.5px_0px_0px_#000]"
                      >
                        INSPECT
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>`,
  `                      <button
                        type="button"
                        className="hidden xs:inline-block px-3 py-1 bg-[#00f0ff] text-black font-black text-[10px] uppercase border-2 border-black shadow-[1.5px_1.5px_0px_0px_#000]"
                      >
                        INSPECT
                      </button>
                    </div>
                  </div>
                )) : (
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-white/20 text-slate-500 font-mono text-xs uppercase min-h-[250px] bg-[#0a0a0c]">
                    <ImageIcon className="w-8 h-8 mb-3 opacity-50" />
                    {!userSettings?.moralisApiKey ? (
                      <>
                        <span className="text-white font-black mb-1">NFT INDEXING DISABLED</span>
                        <span className="text-[9px] text-center max-w-xs leading-relaxed">
                          Please configure your Moralis API Key in system settings to fetch and display your digital collectibles.
                        </span>
                      </>
                    ) : (
                      <span>NO DIGITAL COLLECTIBLES DETECTED</span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>`
);

fs.writeFileSync(path, content);
console.log('PortfolioView updated successfully!');
