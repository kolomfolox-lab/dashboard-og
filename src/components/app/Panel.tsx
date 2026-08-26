import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function Panel({ title, eyebrow, description, action, className, children }: { title?: React.ReactNode; eyebrow?: string; description?: string; action?: React.ReactNode; className?: string; children: React.ReactNode }) {
  return (
    <Card className={cn('border-theme bg-[var(--panel-bg)] shadow-[0_20px_80px_rgba(0,0,0,0.18)]', className)}>
      <CardHeader>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            {eyebrow ? <div className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#8fd4ff]">{eyebrow}</div> : null}
            <CardTitle className="mt-2 font-display text-2xl text-theme">{title}</CardTitle>
            {description ? <CardDescription className="mt-2 max-w-2xl leading-7 text-theme-secondary">{description}</CardDescription> : null}
          </div>
          {action}
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
