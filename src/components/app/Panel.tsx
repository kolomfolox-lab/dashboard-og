import { cn } from '@/lib/utils';

export function Panel({ title, eyebrow, description, action, className, children }: { title: string; eyebrow?: string; description?: string; action?: React.ReactNode; className?: string; children: React.ReactNode }) {
  return (
    <section className={cn('rounded-[32px] border border-white/10 bg-white/[0.045] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.18)] backdrop-blur-2xl', className)}>
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          {eyebrow ? <div className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#8fd4ff]">{eyebrow}</div> : null}
          <h2 className="mt-2 font-display text-2xl text-white">{title}</h2>
          {description ? <p className="mt-2 max-w-2xl text-sm leading-7 text-white/56">{description}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
