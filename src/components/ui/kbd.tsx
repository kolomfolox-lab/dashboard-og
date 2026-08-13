import { cn } from '@/lib/utils';

function Kbd({ className, ...props }: React.ComponentProps<'kbd'>) {
  return (
    <kbd
      className={cn(
        'inline-flex h-5 w-fit items-center justify-center rounded-md border border-theme bg-white/5 px-1.5 font-mono text-[11px] font-medium text-theme-secondary',
        className,
      )}
      {...props}
    />
  );
}

function KbdGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('inline-flex gap-1', className)} {...props} />;
}

export { Kbd, KbdGroup };
