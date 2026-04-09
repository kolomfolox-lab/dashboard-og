import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const tones = {
  coral: 'from-[#ff8a66]/30 to-[#f97360]/8 text-[#ffd7c4]',
  cyan: 'from-[#7dd3fc]/28 to-[#0ea5e9]/8 text-[#dbf4ff]',
  sand: 'from-[#f7b267]/26 to-[#f59e0b]/8 text-[#ffe9c8]',
  mint: 'from-[#34d399]/24 to-[#10b981]/8 text-[#d5fff0]',
} as const;

export function MetricCard({ title, value, note, icon: Icon, tone = 'coral' }: { title: string; value: string | number; note?: string; icon: LucideIcon; tone?: keyof typeof tones }) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/[0.045] p-5 shadow-[0_14px_50px_rgba(0,0,0,0.18)] backdrop-blur-xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.28em] text-white/40">{title}</div>
          <div className="mt-4 font-display text-3xl font-bold text-white">{value}</div>
          {note ? <div className="mt-3 text-sm text-white/52">{note}</div> : null}
        </div>
        <div className={cn('grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br', tones[tone])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
