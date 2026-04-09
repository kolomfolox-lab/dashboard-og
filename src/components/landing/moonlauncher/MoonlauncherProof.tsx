import { BadgeCheck, ScanLine, ShieldCheck, Star } from 'lucide-react';

import { proofCards } from '@/components/landing/moonlauncher/data';
import { SectionEyebrow } from '@/components/landing/moonlauncher/SectionEyebrow';

export function MoonlauncherProof() {
  return (
    <section id="proof" className="grid gap-4 xl:grid-cols-[1.02fr_0.98fr]">
      <div className="rounded-[36px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] px-5 py-6 md:px-8 md:py-8">
        <SectionEyebrow>Proof of direction</SectionEyebrow>
        <h2 className="mt-3 text-3xl font-black tracking-[-0.06em] text-white md:text-5xl">
          The product already points toward a stronger category story.
        </h2>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-[28px] border border-white/10 bg-[#0a1724] p-5">
            <Star className="h-5 w-5 text-[#ffd38b]" />
            <div className="mt-4 text-2xl font-black tracking-[-0.05em] text-white">Brand</div>
            <p className="mt-2 text-sm leading-7 text-white/64">One visual language across control, reviews, and public restaurant surfaces.</p>
          </div>
          <div className="rounded-[28px] border border-white/10 bg-[#0a1724] p-5">
            <ScanLine className="h-5 w-5 text-[#8fe6d8]" />
            <div className="mt-4 text-2xl font-black tracking-[-0.05em] text-white">Flow</div>
            <p className="mt-2 text-sm leading-7 text-white/64">QR, menu, booking, and reputation can behave like one connected guest journey.</p>
          </div>
          <div className="rounded-[28px] border border-white/10 bg-[#0a1724] p-5">
            <ShieldCheck className="h-5 w-5 text-[#9dd2ff]" />
            <div className="mt-4 text-2xl font-black tracking-[-0.05em] text-white">Focus</div>
            <p className="mt-2 text-sm leading-7 text-white/64">Host separation keeps each audience in the right context without product noise.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {proofCards.map((card) => (
          <article key={card.author} className="rounded-[34px] border border-white/10 bg-[#0a1724] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.18)]">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/52">
              <BadgeCheck className="h-3.5 w-3.5" />
              Direction signal
            </div>
            <p className="mt-5 text-lg leading-8 text-white/82">"{card.quote}"</p>
            <div className="mt-6 text-sm font-semibold text-white">{card.author}</div>
            <div className="text-sm text-white/46">{card.role}</div>
          </article>
        ))}
      </div>
    </section>
  );
}
