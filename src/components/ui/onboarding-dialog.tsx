import * as React from 'react';
import { motion } from 'motion/react';
import useEmblaCarousel from 'embla-carousel-react';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/context/LocaleContext';
import { cn } from '@/lib/utils';

function useTranslations() {
  const { t } = useLocale();
  return {
    slides: [
      {
        id: 'hq',
        alt: t('onboardingDialog_alt_hq', 'Executive dashboard view'),
        title: t('onboardingDialog_title_hq', 'One operating screen for the whole business'),
        description: t('onboardingDialog_desc_hq', 'Watch revenue, staff performance, keys, and subscription health from a command center built for actual operators.'),
        image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80',
      },
      {
        id: 'owner',
        alt: t('onboardingDialog_alt_owner', 'Restaurant owner overview'),
        title: t('onboardingDialog_title_owner', 'Owners see the floor and the money together'),
        description: t('onboardingDialog_desc_owner', 'Track active orders, team output, top dishes, and shift momentum without jumping through five screens.'),
        image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
      },
      {
        id: 'team',
        alt: t('onboardingDialog_alt_team', 'Team workflow image'),
        title: t('onboardingDialog_title_team', 'Every panel is structured like a control room'),
        description: t('onboardingDialog_desc_team', 'Cleaner hierarchy, stronger contrast, and better spacing mean people can actually work fast under pressure.'),
        image: 'https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=1200&q=80',
      },
      {
        id: 'launch',
        alt: t('onboardingDialog_alt_launch', 'Analytics and launch visual'),
        title: t('onboardingDialog_title_launch', 'Built to scale into production rollout'),
        description: t('onboardingDialog_desc_launch', 'This React shell is ready for email OTP, Telegram auth, backend analytics, and future subdomain deployment.'),
        image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
      },
    ] as const,
  };
}

export function OnboardingDialog({ defaultOpen = true, onComplete }: { defaultOpen?: boolean; onComplete?: () => void }) {
  const { t } = useLocale();
  const { slides } = useTranslations();
  const [open, setOpen] = React.useState(defaultOpen);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });
  const [activeIndex, setActiveIndex] = React.useState(0);

  React.useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setActiveIndex(emblaApi.selectedScrollSnap());
    onSelect();
    emblaApi.on('select', onSelect);
    return () => { emblaApi.off('select', onSelect); };
  }, [emblaApi]);

  const currentSlide = slides[activeIndex] ?? slides[0];
  const isFirstSlide = activeIndex === 0;
  const isLastSlide = activeIndex === slides.length - 1;

  const close = () => {
    setOpen(false);
    onComplete?.();
  };

  const handleNext = () => {
    if (isLastSlide) {
      close();
      return;
    }
    emblaApi?.scrollNext();
  };

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#02060b]/82 backdrop-blur-md" onClick={close} />
      <div className="relative w-full max-w-[760px] overflow-hidden rounded-[36px] border border-white/10 bg-[#07111d]/96 shadow-[0_32px_120px_rgba(0,0,0,0.58)]">
        <div className="p-4 sm:p-6">
          <div ref={emblaRef} className="overflow-hidden rounded-[28px] border border-white/8">
            <div className="flex">
              {slides.map((slide) => (
                <div key={slide.id} className="min-w-0 flex-[0_0_100%]">
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <img src={slide.image} alt={slide.alt} className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,17,29,0)_0%,rgba(7,17,29,0.72)_100%)]" />
                    <div className="absolute inset-x-0 bottom-0 p-6">
                      <span className="inline-flex rounded-full border border-white/16 bg-black/24 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/72">
                        {t('onboardingDialog_badge', 'Waitly onboarding')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-center gap-2">
            {slides.map((slide, index) => (
              <motion.div key={slide.id} animate={{ opacity: index === activeIndex ? 1 : 0.45, width: index === activeIndex ? 28 : 16 }} initial={false} transition={{ duration: 0.22, ease: 'easeOut' }}>
                <button
                  onClick={() => emblaApi?.scrollTo(index)}
                  aria-label={`Go to ${slide.title}`}
                  className={cn('h-2 w-full rounded-full transition-colors', index === activeIndex ? 'bg-white' : 'bg-white/16 hover:bg-white/28')}
                />
              </motion.div>
            ))}
          </div>

          <div className="mt-5 grid gap-3 px-1">
            <div className="text-[11px] font-semibold uppercase tracking-[0.34em] text-[#85d6ff]">{t('onboardingDialog_launch_walkthrough', 'Launch walkthrough')}</div>
            <h2 className="font-display text-3xl text-white">{currentSlide.title}</h2>
            <p className="max-w-2xl text-sm leading-7 text-white/64">{currentSlide.description}</p>
          </div>

          <div className="mt-7 flex items-center justify-between px-1">
            <div>
              {!isFirstSlide && (
                  <Button variant="ghost" onClick={() => emblaApi?.scrollPrev()}>
                    {t('onboardingDialog_back', 'Back')}
                  </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={close}>{t('onboardingDialog_skip', 'Skip')}</Button>
              <Button onClick={handleNext}>{isLastSlide ? t('onboardingDialog_open_workspace', 'Open workspace') : t('onboardingDialog_next', 'Next')}</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

