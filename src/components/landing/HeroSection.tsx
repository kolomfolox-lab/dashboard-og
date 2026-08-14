import { ArrowRight, BadgeCheck, Sparkles } from 'lucide-react';

import { heroStats, liveSignals, miniBoards } from '@/components/landing/data';
import { LandingSection, MiniBoard, SignalRow, StatPill } from '@/components/landing/LandingPrimitives';

export function HeroSection() {
  return (
    <LandingSection className="relative overflow-hidden bg-[linear-gradient(135deg,#f8f3eb_0%,#f3ecde_42%,#ebe2d1_100%)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.95),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(210,184,139,0.20),transparent_30%)]" />
      <div className="absolute right-[-4%] top-[-8%] h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.75),rgba(255,255,255,0))]" />
      <div className="relative grid gap-8 px-6 py-8 md:px-10 md:py-10 xl:grid-cols-[1.08fr_0.92fr] xl:items-end">
        <div className="max-w-5xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/70 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.3em] text-black/52 backdrop-blur">
            <Sparkles className="h-4 w-4" />
            Moonlauncher Platform
          </div>

          <h1 className="mt-6 max-w-5xl text-5xl font-black tracking-[-0.08em] text-[#121212] md:text-7xl xl:text-[92px]">
            Run the restaurant.
            <br />
            Show the restaurant.
            <br />
            Grow the restaurant.
          </h1>

          <p className="mt-6 max-w-3xl text-[15px] leading-8 text-black/64 md:text-lg">
            Waitly brings together the operational side of restaurants and the public side of trust:
            QR order flow, owner control, reviews, bookings, branding, and guest-facing menu surfaces.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="https://app.waitly.uz"
              className="inline-flex items-center gap-2 rounded-full bg-[#141414] px-6 py-3 text-sm font-semibold text-white transition hover:translate-y-[-1px] hover:bg-black"
            >
              Open Waitly Control
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="https://reviews.waitly.uz"
              className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/80 px-6 py-3 text-sm font-semibold text-[#171717] transition hover:bg-white"
            >
              Explore Reviews Hub
            </a>
            <a
              href="https://api.waitly.uz/api/docs/"
              className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/60 px-6 py-3 text-sm font-semibold text-black/68 transition hover:bg-white/85"
            >
              API Docs
            </a>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            {heroStats.map((item) => (
              <StatPill key={item.label} label={item.label} value={item.value} />
            ))}
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-[34px] border border-black/8 bg-[#111111] p-5 text-white shadow-[0_24px_70px_rgba(17,17,17,0.18)] md:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-white/38">Live system story</div>
                <h2 className="mt-3 text-2xl font-black tracking-[-0.05em]">The product line is already split into clear surfaces.</h2>
              </div>
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/8 text-white">
                <BadgeCheck className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {liveSignals.map((row) => (
                <SignalRow key={row.label} icon={row.icon} label={row.label} value={row.value} />
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {miniBoards.map((board) => (
              <MiniBoard key={board.title} eyebrow={board.eyebrow} title={board.title} body={board.body} />
            ))}
          </div>
        </div>
      </div>
    </LandingSection>
  );
}
