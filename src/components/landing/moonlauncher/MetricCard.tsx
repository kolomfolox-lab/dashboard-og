import type { MetricItem } from '@/components/landing/moonlauncher/data';

export function MetricCard({ value, label }: MetricItem) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur">
      <div className="text-3xl font-black tracking-[-0.08em] text-white md:text-4xl">{value}</div>
      <div className="mt-2 max-w-[16rem] text-sm leading-6 text-white/64">{label}</div>
    </div>
  );
}
