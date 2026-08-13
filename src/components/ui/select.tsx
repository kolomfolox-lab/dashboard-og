import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Plus, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useLocale } from '@/context/LocaleContext';

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
  actionLabel?: string;
  onAction?: () => void;
  onDelete?: (value: string) => void;
}

export function Select({ options, value, onChange, placeholder, className, actionLabel, onAction, onDelete }: SelectProps) {
  const { t } = useLocale();
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
        className="flex w-full items-center justify-between gap-2 rounded-2xl border border-theme bg-[var(--input-bg)] px-4 py-3 text-sm text-theme-secondary outline-none whitespace-nowrap"
      >
        <span className="text-theme-muted shrink-0">{placeholder || t('select_placeholder', 'Select')}</span>
        <span className="text-sm font-semibold text-theme truncate max-w-[140px]">{selected?.label || placeholder || t('select_placeholder', 'Select')}</span>
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
                <motion.div key={opt.value} layout initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }} className="flex items-center">
                  <button
                    type="button"
                    onClick={() => { onChange(opt.value); setOpen(false); }}
                    className={`min-w-0 flex-1 px-4 py-3 text-left text-sm transition hover:bg-[var(--panel-bg)] ${opt.value === value ? 'font-semibold text-theme' : 'text-theme-secondary'}`}
                  >
                    <span className="block truncate">{opt.label}</span>
                  </button>
                  {onDelete ? (
                    <motion.button
                      type="button"
                      aria-label={`Удалить ${opt.label}`}
                      onClick={(event) => { event.stopPropagation(); onDelete(opt.value); }}
                      className="mr-2 rounded-lg p-2 text-theme-muted transition hover:bg-red-500/10 hover:text-red-300"
                      whileHover={{ scale: 1.12, rotate: 8 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </motion.button>
                  ) : null}
                </motion.div>
              ))}
            </div>
            {actionLabel && onAction ? (
              <button
                type="button"
                onClick={() => { onAction(); setOpen(false); }}
                className="flex w-full items-center gap-2 border-t border-theme px-4 py-3 text-left text-sm font-semibold text-[#f97360] transition hover:bg-[#f97360]/10"
              >
                <Plus className="h-4 w-4" />
                {actionLabel}
              </button>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
