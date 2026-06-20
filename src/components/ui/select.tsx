import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function Select({ options, value, onChange, placeholder, className }: SelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find(o => o.value === value);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} className={`relative ${className || ''}`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-2xl border border-theme bg-[var(--input-bg)] px-4 py-3 text-sm text-theme-secondary outline-none whitespace-nowrap"
      >
        <span className="text-theme-muted shrink-0">{placeholder || 'Select'}</span>
        <span className="text-sm font-semibold text-theme truncate max-w-[140px]">{selected?.label || placeholder || 'Select'}</span>
        <ChevronDown className="h-4 w-4 shrink-0 text-theme-secondary transition-transform" style={{ transform: open ? 'rotate(180deg)' : '' }} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full z-50 mt-2 w-full min-w-[200px] overflow-hidden rounded-2xl border border-theme bg-[var(--modal-bg)] shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
          >
            <div className="max-h-[200px] overflow-y-auto">
              {options.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { onChange(opt.value); setOpen(false); }}
                  className={`w-full px-4 py-3 text-left text-sm transition hover:bg-[var(--panel-bg)] ${opt.value === value ? 'font-semibold text-theme' : 'text-theme-secondary'}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
