import { metrics } from '@/components/landing/moonlauncher/data';
import { MetricCard } from '@/components/landing/moonlauncher/MetricCard';

export function MoonlauncherMetrics() {
  return (
    <section className="grid gap-3 md:grid-cols-3">
      {metrics.map((item) => (
        <MetricCard key={item.label} {...item} />
      ))}
    </section>
  );
}
