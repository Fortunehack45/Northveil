import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  X,
  Compass,
} from 'lucide-react';

export interface TourStep {
  targetId: string;
  title: string;
  description: string;
  preferredPosition?: 'top' | 'bottom' | 'left' | 'right';
}

const TOUR_STEPS: TourStep[] = [
  {
    targetId: 'tour-vault-balance',
    title: 'Vault Net Worth & Balance',
    description:
      'Real-time aggregated portfolio balance tracking across Ethereum, Solana, Base, Arbitrum, and Polygon with live high-frequency price feeds.',
    preferredPosition: 'bottom',
  },
  {
    targetId: 'tour-action-bar',
    title: 'Instant Action Bar',
    description:
      'Send tokens with hardware/biometric security, generate deposit addresses, add funds via OTC, or inspect the approvals queue in one click.',
    preferredPosition: 'bottom',
  },
  {
    targetId: 'tour-token-holdings',
    title: 'Multi-Chain Asset Holdings',
    description:
      'Your verified on-chain assets and token balances with instant live 24h market price changes and network tags.',
    preferredPosition: 'right',
  },
  {
    targetId: 'tour-connected-agents',
    title: 'MCP AI Agents Gateway',
    description:
      'Connect Claude Desktop or ChatGPT Custom Actions to safely execute autonomous queries, swaps, and token deployments through your local MCP server.',
    preferredPosition: 'left',
  },
  {
    targetId: 'tour-network-switcher',
    title: 'Network & Chain Switcher',
    description:
      'Quickly toggle between Ethereum Mainnet, Solana, Layer 2 networks (Base, Arbitrum, Optimism), and Sepolia Testnet.',
    preferredPosition: 'bottom',
  },
  {
    targetId: 'tour-navigation',
    title: 'Vault Navigation & Tools',
    description:
      'Navigate between Sub-Accounts, Connected AI Agents, Smart Contract Studio, Tax & History Reports, and Instant Vault Lock.',
    preferredPosition: 'right',
  },
];

interface InteractiveTourModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InteractiveTourModal: React.FC<InteractiveTourModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const step = TOUR_STEPS[currentStepIndex];

  const updateTargetPosition = useCallback(() => {
    if (!isOpen || !step) return;
    const el = document.getElementById(step.targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
      const rect = el.getBoundingClientRect();
      setTargetRect(rect);
    } else {
      // Fallback center if element not on screen
      setTargetRect(null);
    }
  }, [isOpen, step]);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStepIndex(0);
      setTargetRect(null);
      return;
    }

    updateTargetPosition();
    const handleResize = () => updateTargetPosition();
    const handleScroll = () => updateTargetPosition();
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, true);

    const timer = setTimeout(updateTargetPosition, 100);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll, true);
      clearTimeout(timer);
    };
  }, [isOpen, currentStepIndex, updateTargetPosition]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        if (currentStepIndex < TOUR_STEPS.length - 1) {
          setCurrentStepIndex((prev) => prev + 1);
        } else {
          onClose();
        }
      } else if (e.key === 'ArrowLeft') {
        if (currentStepIndex > 0) {
          setCurrentStepIndex((prev) => prev - 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStepIndex, onClose]);

  if (!isOpen || !step) return null;

  // Tooltip positioning logic
  const getTooltipStyle = (): React.CSSProperties => {
    if (!targetRect) {
      return {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      };
    }

    const padding = 16;
    const tooltipWidth = Math.min(360, window.innerWidth - 32);
    let top = targetRect.bottom + padding;
    let left = targetRect.left;

    // Adjust horizontal position so it stays in viewport
    if (left + tooltipWidth > window.innerWidth - 16) {
      left = window.innerWidth - tooltipWidth - 16;
    }
    if (left < 16) {
      left = 16;
    }

    // If bottom runs off screen, place above target
    if (top + 220 > window.innerHeight && targetRect.top > 240) {
      top = Math.max(16, targetRect.top - 220);
    }

    return {
      position: 'fixed',
      top: `${Math.max(16, Math.min(window.innerHeight - 240, top))}px`,
      left: `${left}px`,
      width: `${tooltipWidth}px`,
      transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
    };
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] pointer-events-auto select-none">
      {/* Target Element Spotlight Cutout */}
      {targetRect ? (
        <div
          style={{
            position: 'fixed',
            top: targetRect.top - 8,
            left: targetRect.left - 8,
            width: targetRect.width + 16,
            height: targetRect.height + 16,
            borderRadius: 24,
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.78), 0 0 30px rgba(255, 255, 255, 0.15)',
            border: '2px solid rgba(255, 255, 255, 0.9)',
            pointerEvents: 'none',
            transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />
      ) : (
        <div className="fixed inset-0 bg-black/80" />
      )}

      {/* Floating Tooltip Card */}
      <div
        style={getTooltipStyle()}
        className="bg-white dark:bg-[#121215] border border-black/[0.1] dark:border-white/[0.12] rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 text-zinc-900 dark:text-white z-[100000] mono-animate-in"
      >
        {/* Header Badge & Close Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-black/[0.06] dark:bg-white/[0.08] text-zinc-900 dark:text-white">
              <Compass className="w-3.5 h-3.5" />
            </span>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-black/[0.06] dark:bg-white/[0.08] text-zinc-700 dark:text-zinc-300 uppercase">
              STEP {currentStepIndex + 1} OF {TOUR_STEPS.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white p-1 rounded-full hover:bg-black/[0.06] dark:hover:bg-white/[0.08] transition-colors cursor-pointer"
            title="Skip Tour"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Title & Description */}
        <div className="space-y-1.5">
          <h3 className="text-base font-bold text-zinc-900 dark:text-white tracking-tight">
            {step.title}
          </h3>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            {step.description}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-black/[0.06] dark:bg-white/[0.06] h-1 rounded-full overflow-hidden">
          <div
            className="bg-black dark:bg-white h-full transition-all duration-300 ease-out"
            style={{
              width: `${((currentStepIndex + 1) / TOUR_STEPS.length) * 100}%`,
            }}
          />
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-1">
          <button
            onClick={() => {
              if (currentStepIndex > 0) setCurrentStepIndex((prev) => prev - 1);
            }}
            disabled={currentStepIndex === 0}
            className={`px-3.5 py-2 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              currentStepIndex === 0
                ? 'opacity-30 cursor-not-allowed text-zinc-400 dark:text-zinc-500'
                : 'bg-black/[0.04] dark:bg-white/[0.04] text-zinc-700 dark:text-zinc-300 hover:bg-black/[0.08] dark:hover:bg-white/[0.08] hover:text-black dark:hover:text-white'
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>

          {currentStepIndex < TOUR_STEPS.length - 1 ? (
            <button
              onClick={() => setCurrentStepIndex((prev) => prev + 1)}
              className="px-5 py-2 rounded-full bg-black text-white dark:bg-white dark:text-black text-xs font-semibold hover:opacity-85 active:scale-[0.98] transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              Next <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-full bg-black text-white dark:bg-white dark:text-black text-xs font-semibold hover:opacity-85 active:scale-[0.98] transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Check className="w-3.5 h-3.5" /> Finish Tour
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
