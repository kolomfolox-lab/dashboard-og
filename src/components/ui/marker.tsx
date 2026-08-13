import { cn } from '@/lib/utils';
import { Spinner } from '@/components/ui/spinner';

function Marker({
  variant = 'default',
  className,
  ...props
}: React.ComponentProps<'div'> & {
  variant?: 'default' | 'border' | 'separator';
}) {
  return (
    <div
      data-slot="marker"
      data-variant={variant}
      className={cn(
        'flex items-start gap-2 text-sm',
        variant === 'border' && 'border-b border-theme pb-2',
        variant === 'separator' &&
          'before:bg-border after:bg-border relative flex items-center justify-center gap-3 before:h-px before:flex-1 after:h-px after:flex-1',
        className,
      )}
      {...props}
    />
  );
}

function MarkerIcon({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      aria-hidden="true"
      data-slot="marker-icon"
      className={cn('flex items-center justify-center text-theme-secondary [&_svg]:h-4 [&_svg]:w-4', className)}
      {...props}
    />
  );
}

function MarkerContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="marker-content"
      className={cn('flex-1 text-theme-secondary', className)}
      {...props}
    />
  );
}

function MarkerStatus({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      role="status"
      data-slot="marker-status"
      className={cn('inline-flex items-center gap-2', className)}
      {...props}
    >
      <Spinner className="h-3.5 w-3.5" />
      <span>{props.children}</span>
    </span>
  );
}

export { Marker, MarkerIcon, MarkerContent, MarkerStatus };
