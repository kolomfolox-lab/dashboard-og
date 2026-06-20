import { Button } from '@/components/ui/button';
import { SectionEyebrow } from '@/components/landing/moonlauncher/SectionEyebrow';

export function WaitlyFinalCta() {
  return (
    <section className="relative overflow-hidden rounded-[40px] border border-white/10 bg-[linear-gradient(135deg,#fff4e7_0%,#f0efe8_42%,#dceef5_100%)] px-5 py-6 text-[#101010] shadow-[0_28px_110px_rgba(0,0,0,0.18)] md:px-8 md:py-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(255,184,129,0.30),transparent_24%),radial-gradient(circle_at_90%_10%,rgba(92,184,255,0.22),transparent_22%)]" />
      <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-3xl">
          <SectionEyebrow>Launch the stack</SectionEyebrow>
          <h2 className="mt-3 text-3xl font-black tracking-[-0.06em] text-[#101010] md:text-5xl">
            Move from software clutter to a restaurant system that reads as one brand.
          </h2>
          <p className="mt-4 text-sm leading-8 text-black/64 md:text-base">
            Waitly is strongest when the homepage frames the whole architecture clearly, then hands visitors to the exact surface they need.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button asChild size="lg">
            <a href="https://app.moonlauncher.org" target="_blank" rel="noreferrer">
              Open Waitly Control
            </a>
          </Button>
          <Button asChild variant="secondary" size="lg">
            <a href="https://reviews.moonlauncher.org" target="_blank" rel="noreferrer">
              Explore public surfaces
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
