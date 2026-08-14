import { ArrowRight } from 'lucide-react';

import { LandingSection } from '@/components/landing/LandingPrimitives';

export function FinalCtaSection() {
  return (
    <LandingSection className="mt-4 bg-[linear-gradient(135deg,#ffffff_0%,#f7f4ee_100%)] px-6 py-8 md:px-10 md:py-10">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl">
          <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-black/36">Call to action</div>
          <h2 className="mt-3 text-3xl font-black tracking-[-0.06em] text-[#151515] md:text-5xl">
            Move from restaurant software clutter to one sharper stack.
          </h2>
        </div>

        <div className="flex flex-wrap gap-3">
          <a
            href="https://app.waitly.uz"
            className="inline-flex items-center gap-2 rounded-full bg-[#151515] px-6 py-3 text-sm font-semibold text-white transition hover:bg-black"
          >
            Launch Waitly Control
            <ArrowRight className="h-4 w-4" />
          </a>
          <a
            href="https://reviews.waitly.uz"
            className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-6 py-3 text-sm font-semibold text-[#171717] transition hover:bg-[#fbfaf7]"
          >
            Open public surfaces
          </a>
        </div>
      </div>
    </LandingSection>
  );
}
