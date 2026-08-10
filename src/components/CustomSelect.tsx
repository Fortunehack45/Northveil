import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string;
  description?: string;
  color?: string;
}

export interface CustomSelectProps {
  options: (string | SelectOption)[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  variant?: 'yellow' | 'cyan' | 'magenta' | 'green' | 'dark' | 'outline';
  className?: string;
  buttonClassName?: string;
  menuClassName?: string;
  disabled?: boolean;
  align?: 'left' | 'right';
  menuWidth?: string;
  compact?: boolean;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  variant = 'yellow',
  className = '',
  buttonClassName = '',
  menuClassName = '',
  disabled = false,
  align = 'left',
  menuWidth,
  compact = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Normalize options to object format with 100% defensive safety
  const safeOptions = Array.isArray(options) ? options : [];
  const normalizedOptions: SelectOption[] = safeOptions
    .filter(Boolean)
    .map((opt) => {
      if (typeof opt === 'string') {
        return { value: opt, label: opt };
      }
      return {
        value: opt.value || '',
        label: opt.label || opt.value || 'Option',
        icon: opt.icon,
        badge: opt.badge,
        description: opt.description,
        color: opt.color,
      };
    });

  const selectedOption: SelectOption = normalizedOptions.find((opt) => opt && opt.value === value) || {
    value: value || '',
    label: value || placeholder || 'Select...',
  };

  // Auto-detect viewport boundary to open upwards if near bottom of screen
  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      if (spaceBelow < 220 && rect.top > 220) {
        setOpenUpward(true);
      } else {
        setOpenUpward(false);
      }
    }
  }, [isOpen]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Variant classes for the trigger button
  const variantStyles = {
    yellow: 'bg-[#ffe600] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000] hover:bg-[#fff033]',
    green: 'bg-[#ccff00] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000] hover:bg-[#d8ff33]',
    cyan: 'bg-[#00f0ff] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000] hover:bg-[#33f3ff]',
    magenta: 'bg-[#ff007f] text-white border-2 border-black shadow-[2px_2px_0px_0px_#000] hover:bg-[#ff3399]',
    dark: 'bg-[#0a0a0c] text-white border-2 border-white shadow-[2px_2px_0px_0px_#000] hover:bg-[#141419]',
    outline: 'bg-[#141419] text-white border-2 border-white/40 hover:border-white shadow-[2px_2px_0px_0px_#000]',
  };

  const currentVariantStyle = variantStyles[variant] || variantStyles.yellow;

  return (
    <div className={`relative inline-block font-mono select-none min-w-0 max-w-full ${isOpen ? 'z-[100]' : 'z-10'} ${className}`} ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={(e) => {
          e.stopPropagation();
          if (!disabled) setIsOpen((prev) => !prev);
        }}
        className={`w-full flex items-center justify-between gap-2 font-black uppercase text-left transition-all cursor-pointer ${
          compact ? 'px-2 py-1 text-[10px]' : 'px-3 py-1.5 text-xs'
        } ${currentVariantStyle} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${buttonClassName}`}
      >
        <div className="flex items-center gap-1.5 min-w-0 flex-1 truncate">
          {selectedOption.icon && <span className="shrink-0">{selectedOption.icon}</span>}
          <span className="truncate">{selectedOption.label}</span>
          {selectedOption.badge && (
            <span className="px-1 py-0.2 bg-black text-[#ccff00] text-[9px] font-black border border-[#ccff00] shrink-0">
              {selectedOption.badge}
            </span>
          )}
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 stroke-[3] ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Built-in Custom Dropdown Menu Popup */}
      {isOpen && (
        <div
          className={`absolute ${openUpward ? 'bottom-full mb-1.5 top-auto' : 'top-full mt-1.5'} z-[999] bg-[#0a0a0c] border-2 border-white p-1.5 shadow-[6px_6px_0px_0px_#ccff00] max-h-64 overflow-y-auto no-scrollbar font-mono ${
            align === 'right' ? 'right-0' : 'left-0'
          } ${menuWidth || 'min-w-[180px] w-full'} ${menuClassName}`}
        >
          {normalizedOptions.map((opt, index) => {
            if (!opt) return null;
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value || `opt-${index}`}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-2.5 py-1.5 text-xs font-mono font-black uppercase flex items-center justify-between gap-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#ccff00] text-black border border-black shadow-[1.5px_1.5px_0px_0px_#000]'
                    : 'text-slate-200 hover:bg-[#181820] hover:text-[#ccff00]'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1 truncate">
                  {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                  <div className="min-w-0 flex-1">
                    <div className="truncate flex items-center gap-1.5">
                      <span className="truncate">{opt.label}</span>
                      {opt.badge && (
                        <span
                          className={`px-1 py-0.2 text-[8px] font-black uppercase border ${
                            isSelected
                              ? 'bg-black text-[#ccff00] border-black'
                              : 'bg-[#ff007f] text-white border-black'
                          }`}
                        >
                          {opt.badge}
                        </span>
                      )}
                    </div>
                    {opt.description && (
                      <div
                        className={`text-[9px] font-normal lowercase truncate ${
                          isSelected ? 'text-black/70' : 'text-slate-400'
                        }`}
                      >
                        {opt.description}
                      </div>
                    )}
                  </div>
                </div>

                {isSelected && <Check className="w-3.5 h-3.5 text-black shrink-0 stroke-[3]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
