import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface Option {
  value: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string;
}

interface CustomSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  variant?: 'pill' | 'form' | 'dark' | 'light' | 'glass';
  placeholder?: string;
  align?: 'left' | 'right';
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  value,
  onChange,
  className = '',
  variant = 'pill',
  placeholder = 'Select an option...',
  align = 'left',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isFormVariant = variant === 'form';

  return (
    <div className={`relative ${className}`} ref={selectRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2 text-xs transition-all cursor-pointer select-none ${
          isFormVariant
            ? 'px-3 py-2.5 rounded-xl bg-black/[0.05] dark:bg-black text-zinc-900 dark:text-white border border-black/[0.08] dark:border-white/[0.08] hover:bg-black/[0.08] dark:hover:bg-zinc-900'
            : 'px-3 py-2 rounded-full bg-black/[0.05] dark:bg-white/[0.05] hover:bg-black/[0.09] dark:hover:bg-white/[0.09] text-zinc-900 dark:text-white'
        }`}
      >
        <div className="flex items-center gap-2.5 truncate min-w-0">
          {selectedOption?.icon && (
            <span className="shrink-0 flex items-center justify-center">
              {selectedOption.icon}
            </span>
          )}
          <span className="truncate font-medium text-xs">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-zinc-400 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-zinc-900 dark:text-white' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div
          className={`absolute z-50 mt-1.5 min-w-[200px] w-full max-h-60 overflow-y-auto no-scrollbar rounded-2xl bg-white dark:bg-[#131317] border border-black/[0.08] dark:border-white/[0.08] p-1.5 shadow-2xl mono-animate-in ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between gap-2.5 px-3 py-2 text-xs rounded-xl transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-black text-white dark:bg-white dark:text-black font-semibold'
                    : 'text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06]'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate min-w-0">
                  {option.icon && (
                    <span className="shrink-0 flex items-center justify-center">
                      {option.icon}
                    </span>
                  )}
                  <span className="truncate">{option.label}</span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {option.badge && (
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                        isSelected ? 'bg-white text-black dark:bg-black dark:text-white' : 'bg-black/[0.06] text-zinc-900 dark:bg-white/[0.08] dark:text-white'
                      }`}
                    >
                      {option.badge}
                    </span>
                  )}
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
