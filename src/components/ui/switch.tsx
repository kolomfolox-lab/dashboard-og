import * as React from 'react';
import { cn } from '@/lib/utils';

export function Switch({ checked, onCheckedChange, className }: { checked: boolean; onCheckedChange: (v: boolean) => void; className?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className={cn('relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors', checked ? 'bg-[#2563eb]' : 'bg-zinc-200 dark:bg-zinc-700', className)}
    >
      <span className={cn('pointer-events-none block h-4 w-4 rounded-full bg-white shadow transition-transform', checked ? 'translate-x-4' : 'translate-x-0')} />
    </button>
  );
}
