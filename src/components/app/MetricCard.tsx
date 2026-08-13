import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardDescription, CardHeader } from '@/components/ui/card';

const tones = {
  coral: 'from-[#ff8a66]/30 to-[#f97360]/8 text-[#ffd7c4]',
  cyan: 'from-[#7dd3fc]/28 to-[#0ea5e9]/8 text-[#dbf4ff]',
  sand: 'from-[#f7b267]/26 to-[#f59e0b]/8 text-[#ffe9c8]',
  mint: 'from-[#34d399]/24 to-[#10b981]/8 text-[#d5fff0]',
} as const;

export function MetricCard({ title, value, note, icon: Icon, tone = 'coral', trend }: { title: string; value: string | number; note?: string; icon: LucideIcon; tone?: keyof typeof tones; trend?: { direction: 'up' | 'down'; label: string } }) {
  return (
    <Card className="border-theme bg-[var(--panel-bg)] shadow-[0_14px_50px_rgba(0,0,0,0.18)]">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-xs font-semibold uppercase tracking-[0.28em] text-theme-muted">{title}</div>
            <div className="mt-4 font-display text-3xl font-black text-theme">{value}</div>
            {trend ? (
              <div className={cn('mt-3 flex items-center gap-1.5 text-sm font-semibold', trend.direction === 'up' ? 'text-emerald-400' : 'text-red-400')}>
                <span>{trend.direction === 'up' ? '↑' : '↓'}</span>
                <span>{trend.label}</span>
              </div>
            ) : null}
          </div>
          <div className={cn('grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br', tones[tone])}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardHeader>
      {note && !trend ? <CardDescription className="px-5 pb-5 text-theme-secondary">{note}</CardDescription> : null}
    </Card>
  );
}
