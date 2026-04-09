import type { ComponentType, ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';

export function LandingSection({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-[36px] border border-black/8 shadow-[0_24px_90px_rgba(17,17,17,0.06)] ${className}`}>{children}</section>;
}

export function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[24px] border border-black/8 bg-white/70 px-4 py-4 backdrop-blur">
      <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-black/34">{label}</div>
      <div className="mt-2 text-2xl font-black tracking-[-0.06em] text-[#151515]">{value}</div>
    </div>
  );
}

export function SignalRow({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[22px] border border-white/8 bg-white/4 px-4 py-4">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/8 text-white">
          <Icon className="h-4.5 w-4.5" />
        </div>
        <div>
          <div className="text-sm font-semibold text-white">{label}</div>
          <div className="mt-1 text-xs uppercase tracking-[0.24em] text-white/34">Surface state</div>
        </div>
      </div>
      <div className="text-right text-sm font-semibold text-[#ffd9b2]">{value}</div>
    </div>
  );
}

export function MiniBoard({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-[30px] border border-black/8 bg-[#f8f3ea] p-5 shadow-[0_16px_50px_rgba(17,17,17,0.05)]">
      <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-black/34">{eyebrow}</div>
      <div className="mt-3 text-2xl font-black tracking-[-0.05em] text-[#151515]">{title}</div>
      <div className="mt-3 text-sm leading-7 text-black/60">{body}</div>
    </div>
  );
}

export function FeatureTile({
  icon: Icon,
  title,
  body,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-[24px] border border-black/8 bg-[#faf7f0] p-4">
      <div className="flex items-start gap-3">
        <div className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-2xl bg-[#171717] text-white">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="text-base font-semibold text-[#171717]">{title}</div>
          <div className="mt-1 text-sm leading-7 text-black/60">{body}</div>
        </div>
      </div>
    </div>
  );
}

export function SurfaceCard({
  icon: Icon,
  title,
  body,
  href,
  cta,
  accent,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  body: string;
  href: string;
  cta: string;
  accent: string;
}) {
  return (
    <a
      href={href}
      className={`group rounded-[34px] border p-5 shadow-[0_20px_60px_rgba(17,17,17,0.06)] transition hover:translate-y-[-2px] ${accent}`}
    >
      <div className="grid h-12 w-12 place-items-center rounded-2xl border border-current/10 bg-current/5">
        <Icon className="h-5 w-5" />
      </div>
      <div className="mt-6 text-[11px] font-bold uppercase tracking-[0.28em] opacity-55">Product surface</div>
      <h3 className="mt-3 text-3xl font-black tracking-[-0.06em]">{title}</h3>
      <p className="mt-4 text-sm leading-8 opacity-75">{body}</p>
      <div className="mt-8 inline-flex items-center gap-2 text-sm font-semibold">
        {cta}
        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
      </div>
    </a>
  );
}

export function HostPanel({
  host,
  title,
  body,
  icon: Icon,
}: {
  host: string;
  title: string;
  body: string;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-[28px] border border-white/8 bg-white/4 p-5">
      <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/8 text-white">
        <Icon className="h-5 w-5" />
      </div>
      <div className="mt-4 text-[11px] font-bold uppercase tracking-[0.28em] text-white/34">{host}</div>
      <div className="mt-3 text-xl font-black tracking-[-0.04em] text-white">{title}</div>
      <div className="mt-3 text-sm leading-7 text-white/60">{body}</div>
    </div>
  );
}
