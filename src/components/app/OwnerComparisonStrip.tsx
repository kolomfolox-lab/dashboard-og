import { cn } from '@/lib/utils';

type Tone = 'coral' | 'cyan' | 'mint' | 'sand';

const toneStyles: Record<Tone, { glow: string; bar: string; text: string }> = {
  coral: {
    glow: 'from-[#ff8a66]/22 to-transparent',
    bar: 'from-[#ff8a66] to-[#f97360]',
    text: 'text-[#ffd7c4]',
  },
  cyan: {
    glow: 'from-[#7dd3fc]/20 to-transparent',
    bar: 'from-[#7dd3fc] to-[#0ea5e9]',
    text: 'text-[#dbf4ff]',
  },
  mint: {
    glow: 'from-[#34d399]/18 to-transparent',
    bar: 'from-[#34d399] to-[#10b981]',
    text: 'text-[#d5fff0]',
  },
  sand: {
    glow: 'from-[#f7b267]/18 to-transparent',
    bar: 'from-[#f7b267] to-[#f59e0b]',
    text: 'text-[#ffe9c8]',
  },
};

export type OwnerComparisonItem = {
  label: string;
  value: string | number;
  detail: string;
  delta?: number | null;
  tone?: Tone;
};

export function OwnerComparisonStrip({ items }: { items: OwnerComparisonItem[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => {
        const tone = toneStyles[item.tone || 'coral'];
        const delta = typeof item.delta === 'number' && Number.isFinite(item.delta) ? item.delta : null;
        const width = delta === null ? 18 : Math.max(10, Math.min(100, Math.abs(delta)));

        return (
          <div key={item.label} className={cn('relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.045] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.16)]', `bg-gradient-to-br ${tone.glow}`)}>
            <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/38">{item.label}</div>
            <div className={cn('mt-3 font-display text-2xl font-bold', tone.text)}>{item.value}</div>
            <div className="mt-2 text-sm leading-6 text-white/52">{item.detail}</div>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/8">
              <div className={cn('h-full rounded-full bg-gradient-to-r transition-all duration-500', tone.bar)} style={{ width: `${width}%` }} />
            </div>
            <div className={cn('mt-3 text-xs font-bold uppercase tracking-[0.18em]', delta === null ? 'text-white/34' : delta >= 0 ? 'text-emerald-300' : 'text-red-300')}>
              {delta === null ? 'No baseline' : `${delta >= 0 ? '+' : ''}${delta.toFixed(1)}%`}
            </div>
          </div>
        );
      })}
    </div>
  );
}
