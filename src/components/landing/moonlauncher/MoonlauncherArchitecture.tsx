import { Building2, Globe2 } from 'lucide-react';

import { hostRows } from '@/components/landing/moonlauncher/data';
import { SectionEyebrow } from '@/components/landing/moonlauncher/SectionEyebrow';

export function MoonlauncherArchitecture() {
  return (
    <section id="architecture" className="grid gap-4 xl:grid-cols-[0.86fr_1.14fr]">
      <div className="rounded-[36px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] px-5 py-6 md:px-8 md:py-8">
        <SectionEyebrow>Host architecture</SectionEyebrow>
        <h2 className="mt-3 text-3xl font-black tracking-[-0.06em] text-white md:text-5xl">
          A restaurant brand needs a clear map, not a pile of routes.
        </h2>
        <p className="mt-5 text-sm leading-8 text-white/64">
          Moonlauncher already has the right structural instinct:
          separate the public homepage, owner workspace, reviews layer, and docs host so every audience lands in the correct environment immediately.
        </p>

        <div className="mt-8 space-y-3">
          <div className="rounded-[28px] border border-[#ffac7d]/16 bg-[linear-gradient(135deg,rgba(255,140,97,0.14),rgba(255,255,255,0.03))] p-5">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-black/18">
                <Building2 className="h-5 w-5 text-[#ffd7bc]" />
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-white/38">Why it matters</div>
                <div className="mt-1 text-lg font-bold tracking-[-0.03em] text-white">Better comprehension creates a better brand.</div>
              </div>
            </div>
            <p className="mt-4 text-sm leading-7 text-white/68">
              Operators move faster when the control room feels focused.
              Guests trust the product more when the public layer feels intentional.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {hostRows.map((row) => (
          <article key={row.host} className="rounded-[34px] border border-white/10 bg-[#0a1724] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.18)]">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/54">
              <Globe2 className="h-3.5 w-3.5" />
              {row.host}
            </div>
            <h3 className="mt-4 text-2xl font-black tracking-[-0.05em] text-white">{row.title}</h3>
            <p className="mt-3 text-sm leading-7 text-white/64">{row.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
