import {
  ArrowRight,
  BadgeCheck,
  Globe2,
  QrCode,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';

import { ownerSignals } from '@/components/landing/moonlauncher/data';
import { Button } from '@/components/ui/button';

export function WaitlyHero() {
  return (
    <section className="relative overflow-hidden rounded-[40px] border border-white/10 bg-[linear-gradient(135deg,rgba(10,21,34,0.92),rgba(7,14,24,0.98))] px-5 py-6 shadow-[0_32px_120px_rgba(0,0,0,0.28)] md:px-8 md:py-8 xl:px-10 xl:py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(255,153,102,0.20),transparent_26%),radial-gradient(circle_at_88%_18%,rgba(127,213,255,0.16),transparent_22%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent_60%)]" />
      <div className="relative grid gap-8 xl:grid-cols-[1.05fr_0.95fr] xl:items-end">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.3em] text-[#d6e9f9] backdrop-blur">
            <Sparkles className="h-4 w-4 text-[#ffd29f]" />
            Waitly for restaurant teams
          </div>

          <h1 className="mt-6 max-w-5xl text-5xl font-black leading-[0.94] tracking-[-0.08em] text-white md:text-7xl xl:text-[92px]">
            One sharper stack
            <br />
            for how restaurants
            <br />
            operate and appear.
          </h1>

          <p className="mt-6 max-w-3xl text-[15px] leading-8 text-white/68 md:text-lg">
            Waitly turns scattered restaurant software into a clearer system:
            owner control, guest-facing trust, QR-driven experiences, and public product surfaces that all feel like one brand.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <a href="https://app.moonlauncher.org" target="_blank" rel="noreferrer">
                Launch Waitly Control
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href="https://reviews.moonlauncher.org" target="_blank" rel="noreferrer">
                Explore Reviews Hub
              </a>
            </Button>
            <Button asChild variant="ghost" size="lg">
              <a href="https://api.moonlauncher.org/api/docs/" target="_blank" rel="noreferrer">
                View API Docs
              </a>
            </Button>
          </div>

          <div className="mt-10 flex flex-wrap gap-3 text-sm text-white/60">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/16 px-4 py-2">
              <BadgeCheck className="h-4 w-4 text-[#8fe6d8]" />
              Brand studio + reviews profile control
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/16 px-4 py-2">
              <ScanLine className="h-4 w-4 text-[#ffb883]" />
              QR ordering and public menu flow
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/16 px-4 py-2">
              <ShieldCheck className="h-4 w-4 text-[#9ed4ff]" />
              Clear host architecture by purpose
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.22)] backdrop-blur">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-white/40">System snapshot</div>
                <h2 className="mt-3 text-2xl font-black tracking-[-0.05em] text-white">A cleaner product story from admin desk to guest page.</h2>
              </div>
              <div className="grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-black/22">
                <Globe2 className="h-5 w-5 text-[#d2ecff]" />
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[26px] border border-white/10 bg-[#081523] p-4">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-white/44">
                  <Users className="h-4 w-4" />
                  Owner workspace
                </div>
                <div className="mt-3 text-3xl font-black tracking-[-0.07em] text-white">7</div>
                <div className="mt-1 text-sm text-white/60">Core surfaces already visible in the product line</div>
              </div>
              <div className="rounded-[26px] border border-white/10 bg-[#081523] p-4">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-white/44">
                  <QrCode className="h-4 w-4" />
                  Guest signal
                </div>
                <div className="mt-3 text-3xl font-black tracking-[-0.07em] text-white">QR</div>
                <div className="mt-1 text-sm text-white/60">Menu, review, and booking journeys start from a scan-friendly layer</div>
              </div>
            </div>

            <div className="mt-4 rounded-[28px] border border-white/10 bg-[#081523] p-4">
              <div className="text-xs uppercase tracking-[0.24em] text-white/42">Active owner signals</div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {ownerSignals.map((signal) => (
                  <div key={signal} className="rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-3 text-sm text-white/72">
                    {signal}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
