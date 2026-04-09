import { ArrowRight } from 'lucide-react';

import type { SurfaceItem } from '@/components/landing/moonlauncher/data';

export function SurfaceCard({ title, host, body, href, cta, icon: Icon, accent }: SurfaceItem) {
  return (
    <article className="group relative overflow-hidden rounded-[34px] border border-white/10 bg-[#0a1724] p-6 shadow-[0_28px_90px_rgba(0,0,0,0.22)]">
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${accent} opacity-100 transition duration-300 group-hover:opacity-80`} />
      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/58">
              <Icon className="h-3.5 w-3.5" />
              {host}
            </div>
            <h3 className="mt-4 text-2xl font-black tracking-[-0.05em] text-white">{title}</h3>
          </div>
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-white/10 bg-black/20 text-white/78">
            <ArrowRight className="h-5 w-5 transition duration-300 group-hover:translate-x-0.5" />
          </div>
        </div>
        <p className="mt-4 text-sm leading-7 text-white/68">{body}</p>
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#b9ecff] transition hover:text-white"
        >
          {cta}
          <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </article>
  );
}
