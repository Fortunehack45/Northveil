import React, { useState, useMemo } from 'react';
import { useWallet } from '../context/WalletContext';
import { CustomSelect } from './CustomSelect';
import { Layers, TrendingUp, Sparkles, Gift, ShieldCheck, ArrowUpRight, Calculator } from 'lucide-react';

export const StakingView: React.FC = () => {
  const {
    assets,
    stakingPositions,
    stakeCrypto,
    unstakeCrypto,
    claimRewards,
    triggerBiometricAuth,
  } = useWallet();

  const [selectedAssetId, setSelectedAssetId] = useState<string>('eth-main');
  const [stakeAmount, setStakeAmount] = useState<string>('1.0');
  const [isStakingModalOpen, setIsStakingModalOpen] = useState<boolean>(false);
  const [unstakePositionId, setUnstakePositionId] = useState<string | null>(null);
  const [calcAmount, setCalcAmount] = useState<number>(1000);

  // Totals
  const totalStakedUsd = useMemo(() => {
    return stakingPositions.reduce((sum, pos) => {
      const asset = assets.find((a) => a.id === pos.assetId || a.symbol === pos.assetSymbol);
      const price = asset ? asset.priceUsd : 0;
      return sum + pos.amountStaked * price;
    }, 0);
  }, [stakingPositions, assets]);

  const totalPendingUsd = useMemo(() => {
    return stakingPositions.reduce((sum, pos) => {
      const asset = assets.find((a) => a.id === pos.assetId || a.symbol === pos.assetSymbol);
      const price = asset ? asset.priceUsd : 0;
      return sum + pos.pendingRewards * price;
    }, 0);
  }, [stakingPositions, assets]);

  const handleClaim = (posId: string, symbol: string) => {
    triggerBiometricAuth(`Claim Staking Rewards for ${symbol}`, () => {
      claimRewards(posId);
    });
  };

  const handleConfirmStake = () => {
    const num = parseFloat(stakeAmount);
    if (!num || num <= 0) return;

    triggerBiometricAuth(`Stake ${num} ${selectedAssetId}`, async () => {
      await stakeCrypto({
        assetId: selectedAssetId,
        amount: num,
        validatorName: 'Apex Institutional Validator Pool',
      });
      setIsStakingModalOpen(false);
    });
  };

  const handleConfirmUnstake = (posId: string, amount: number) => {
    triggerBiometricAuth(`Unstake ${amount} Token`, async () => {
      await unstakeCrypto(posId, amount);
      setUnstakePositionId(null);
    });
  };

  // Calculator projections
  const calcYearlyUsd = (calcAmount * 0.065).toFixed(2);
  const calcMonthlyUsd = (calcAmount * (0.065 / 12)).toFixed(2);

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 pb-12 w-full">
      {/* Top Banner & Overview Metrics */}
      <div className="bg-[#141419] border-2 border-white p-6 sm:p-8 shadow-[8px_8px_0px_0px_#ccff00]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8 border-b-2 border-white pb-6">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-6 h-6 text-[#ccff00] stroke-[3]" />
              <h2 className="text-2xl font-black text-white font-mono uppercase tracking-tight">STAKING YIELD DASHBOARD</h2>
            </div>
            <p className="text-xs text-slate-300 font-mono mt-1 max-w-xl">
              EARN AUTOMATED PASSIVE PROOF-OF-STAKE REWARDS NATIVELY WITHOUT LOCKUPS. REAL-TIME COMPOUNDING YIELDS.
            </p>
          </div>

          <button
            onClick={() => setIsStakingModalOpen(true)}
            className="px-6 py-3 bg-[#ccff00] text-black font-mono font-black text-xs uppercase tracking-wider border-2 border-black shadow-[4px_4px_0px_0px_#000] hover:bg-[#d8ff33] active:translate-x-1 active:translate-y-1 active:shadow-none flex items-center gap-2 cursor-pointer transition-all"
          >
            <Sparkles className="w-4 h-4 text-black stroke-[3]" />
            <span>STAKE NEW ASSET</span>
          </button>
        </div>

        {/* Overview Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#0a0a0c] p-5 border-2 border-white shadow-[4px_4px_0px_0px_#000]">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-black tracking-wider">TOTAL VALUE STAKED</span>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono mt-1">
              ${totalStakedUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span className="text-[10px] font-mono text-[#ccff00] font-black mt-1 inline-block uppercase">
              ACROSS {stakingPositions.length} ACTIVE POSITIONS
            </span>
          </div>

          <div className="bg-[#0a0a0c] p-5 border-2 border-white shadow-[4px_4px_0px_0px_#ff007f]">
            <span className="text-[10px] font-mono text-[#ff007f] uppercase font-black tracking-wider flex items-center gap-1">
              <Gift className="w-3.5 h-3.5 stroke-[3]" />
              UNCLAIMED PENDING REWARDS
            </span>
            <div className="text-2xl sm:text-3xl font-black text-[#ccff00] font-mono mt-1">
              ${totalPendingUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
            </div>
            <span className="text-[10px] text-slate-300 font-mono mt-1 inline-block uppercase">
              COMPOUNDING EVERY 3S
            </span>
          </div>

          <div className="bg-[#0a0a0c] p-5 border-2 border-white shadow-[4px_4px_0px_0px_#00f0ff]">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-black tracking-wider">WEIGHTED AVG APY</span>
            <div className="text-2xl sm:text-3xl font-black text-[#00f0ff] font-mono mt-1">
              ~6.42%
            </div>
            <span className="text-[10px] text-slate-300 font-mono mt-1 inline-block uppercase">
              NON-CUSTODIAL SMART CONTRACTS
            </span>
          </div>
        </div>
      </div>

      {/* Active Staking Positions List */}
      <div className="bg-[#141419] border-2 border-white p-6 shadow-[8px_8px_0px_0px_#ff007f] space-y-4">
        <h3 className="text-lg font-black text-white font-mono uppercase tracking-tight border-b-2 border-white pb-3">YOUR ACTIVE STAKING POSITIONS</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stakingPositions.map((pos) => {
            const asset = assets.find((a) => a.id === pos.assetId || a.symbol === pos.assetSymbol);
            const price = asset ? asset.priceUsd : 100;
            const stakedUsd = pos.amountStaked * price;
            const pendingUsd = pos.pendingRewards * price;

            return (
              <div
                key={pos.id}
                className="bg-[#0a0a0c] border-2 border-white p-5 space-y-4 flex flex-col justify-between shadow-[4px_4px_0px_0px_#000]"
              >
                <div>
                  <div className="flex items-center justify-between border-b-2 border-white/20 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">⚡</span>
                      <div>
                        <div className="font-mono font-black text-white uppercase">{pos.assetSymbol} STAKING</div>
                        <div className="text-[10px] font-mono text-slate-400 uppercase">{pos.validatorName}</div>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 text-xs font-mono font-black bg-[#ccff00] text-black border border-black shadow-[2px_2px_0px_0px_#000]">
                      {pos.apy}% APY
                    </span>
                  </div>

                  <div className="mt-4 space-y-2 font-mono text-xs">
                    <div className="flex justify-between text-slate-300">
                      <span>STAKED AMOUNT:</span>
                      <strong className="text-white font-bold">
                        {pos.amountStaked} {pos.assetSymbol} (${stakedUsd.toFixed(2)})
                      </strong>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>PENDING REWARD:</span>
                      <strong className="text-[#ccff00] font-black">
                        {pos.pendingRewards.toFixed(5)} {pos.assetSymbol} (${pendingUsd.toFixed(2)})
                      </strong>
                    </div>
                    <div className="flex justify-between text-slate-400 text-[10px]">
                      <span>STAKED DATE:</span>
                      <span>{pos.stakedDate}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t-2 border-white/20">
                  <button
                    disabled={pos.pendingRewards <= 0}
                    onClick={() => handleClaim(pos.id, pos.assetSymbol)}
                    className="flex-1 py-2.5 bg-[#ccff00] disabled:bg-[#202028] disabled:text-slate-600 border-2 border-black text-black font-mono font-black text-xs uppercase shadow-[2px_2px_0px_0px_#000] hover:bg-[#d8ff33] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Gift className="w-3.5 h-3.5 stroke-[3]" />
                    <span>CLAIM</span>
                  </button>
                  <button
                    onClick={() => handleConfirmUnstake(pos.id, pos.amountStaked)}
                    className="py-2.5 px-3 bg-[#ff007f] text-white font-mono font-black text-xs uppercase border-2 border-black shadow-[2px_2px_0px_0px_#000] hover:bg-[#ff3399] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer"
                  >
                    UNSTAKE
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* APY Yield Calculator Widget */}
      <div className="bg-[#141419] border-2 border-white p-6 shadow-[8px_8px_0px_0px_#00f0ff]">
        <div className="flex items-center gap-2 mb-4 border-b-2 border-white pb-3">
          <Calculator className="w-5 h-5 text-[#00f0ff] stroke-[3]" />
          <h3 className="text-lg font-black text-white font-mono uppercase tracking-tight">APY YIELD PROJECTION CALCULATOR</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="space-y-2">
            <label className="text-xs font-mono font-bold text-slate-300 uppercase">DEPOSIT AMOUNT (USD)</label>
            <input
              type="number"
              value={calcAmount}
              onChange={(e) => setCalcAmount(Number(e.target.value))}
              className="w-full bg-[#0a0a0c] border-2 border-white px-4 py-3 text-white font-mono font-bold text-lg focus:outline-none focus:bg-[#181820]"
            />
          </div>

          <div className="bg-[#0a0a0c] p-4 border-2 border-white text-center shadow-[3px_3px_0px_0px_#000]">
            <span className="text-xs font-mono text-slate-300 uppercase">ESTIMATED MONTHLY INCOME</span>
            <div className="text-2xl font-black text-[#ccff00] font-mono mt-1">
              +${calcMonthlyUsd} USD
            </div>
          </div>

          <div className="bg-[#0a0a0c] p-4 border-2 border-white text-center shadow-[3px_3px_0px_0px_#000]">
            <span className="text-xs font-mono text-slate-300 uppercase">ESTIMATED ANNUAL (1Y) INCOME</span>
            <div className="text-2xl font-black text-[#00f0ff] font-mono mt-1">
              +${calcYearlyUsd} USD
            </div>
          </div>
        </div>
      </div>

      {/* Stake Modal */}
      {isStakingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-[#141419] border-4 border-white p-6 max-w-md w-full shadow-[8px_8px_0px_0px_#ccff00] space-y-4">
            <h3 className="text-xl font-black text-white font-mono uppercase tracking-tight">STAKE CRYPTO ASSETS</h3>
            
            <div className="space-y-2">
              <label className="text-xs font-mono font-bold text-slate-300 uppercase">SELECT TOKEN</label>
              <CustomSelect
                options={assets.filter((a) => a.isStakable).map((a) => ({
                  value: a.id,
                  label: `${a.symbol} (${a.apy}% APY)`,
                }))}
                value={selectedAssetId}
                onChange={(val) => setSelectedAssetId(val)}
                variant="yellow"
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono font-bold text-slate-300 uppercase">STAKE AMOUNT</label>
              <input
                type="number"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                className="w-full bg-[#0a0a0c] border-2 border-white p-3 text-white font-mono font-bold text-lg focus:outline-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleConfirmStake}
                className="flex-1 py-3 bg-[#ccff00] text-black font-mono font-black border-2 border-black text-xs uppercase shadow-[3px_3px_0px_0px_#000] cursor-pointer"
              >
                CONFIRM STAKE
              </button>
              <button
                onClick={() => setIsStakingModalOpen(false)}
                className="py-3 px-4 bg-[#ff007f] text-white font-mono font-black text-xs uppercase border-2 border-black shadow-[3px_3px_0px_0px_#000] cursor-pointer"
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
