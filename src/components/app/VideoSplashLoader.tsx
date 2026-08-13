import { useEffect, useState } from 'react';

import { cn } from '@/lib/utils';
import { useLocale } from '@/context/LocaleContext';

interface VideoSplashLoaderProps {
  title?: string;
  subtitle?: string;
  className?: string;
  compact?: boolean;
  durationMs?: number;
}

export function VideoSplashLoader({
  title,
  subtitle,
  className,
  compact = false,
  durationMs = 4000,
}: VideoSplashLoaderProps) {
  const { t } = useLocale();
  const resolvedTitle = title ?? t('videoSplash_title', 'Waitly is getting things ready.');
  const resolvedSubtitle = subtitle ?? t('videoSplash_subtitle', 'Preparing your workspace.');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setProgress(0);
    const startedAt = Date.now();
    const timer = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const ratio = Math.min(1, elapsed / durationMs);
      const eased = 1 - Math.pow(1 - ratio, 2.2);
      setProgress(eased * 100);
      if (ratio >= 1) {
        window.clearInterval(timer);
      }
    }, 32);

    return () => window.clearInterval(timer);
  }, [durationMs]);

  return (
    <div
      className={cn(
        'grid place-items-center overflow-hidden bg-[#f8f7f4] text-[#1f2328]',
        compact ? 'min-h-[220px] rounded-[28px]' : 'min-h-screen',
        className,
      )}
    >
      <div className="w-full max-w-[560px] px-6 py-10 text-center md:px-8 md:py-12">
        <div className="mx-auto flex justify-center">
          <div className="w-[132px] overflow-hidden rounded-[30px] bg-transparent md:w-[164px]">
            <video
              className="block h-auto w-full"
              src="/waitly-loader.webm"
              autoPlay
              loop
              muted
              playsInline
            />
          </div>
        </div>

        <h2 className="mt-7 text-[31px] font-medium tracking-[-0.04em] text-[#202327] md:text-[38px]">{resolvedTitle}</h2>
        <p className="mx-auto mt-3 max-w-[420px] text-[15px] leading-7 text-[#6a6f76] md:text-[16px]">{resolvedSubtitle}</p>

        <div className="mx-auto mt-8 w-full max-w-[320px]">
          <div className="h-[3px] overflow-hidden rounded-full bg-black/8">
            <div
              className="h-full rounded-full bg-[#202327] transition-[width] duration-75 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-3 text-[11px] font-medium uppercase tracking-[0.28em] text-black/32">{Math.round(progress)}%</div>
        </div>
      </div>
    </div>
  );
}

