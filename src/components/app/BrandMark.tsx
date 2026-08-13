import logoUrl from '@/assets/waitly-lil.webp';
import { useLocale } from '@/context/LocaleContext';
import { cn } from '@/lib/utils';

export function BrandMark({ compact = false, className }: { compact?: boolean; className?: string }) {
  const { t } = useLocale();

  return (
    <div className={cn('flex items-center gap-4', className)}>
      <img src={logoUrl} alt="Waitly" className="h-24 w-24 object-contain" />
      {!compact ? (
        <div>
          <div className="font-display text-[1.65rem] font-bold leading-none tracking-tight text-white">{t('brand_title', 'Waitly Control')}</div>
          <div className="mt-1 text-sm uppercase tracking-[0.22em] text-white/42">{t('brand_subtitle', 'Панель управления')}</div>
        </div>
      ) : null}
    </div>
  );
}
