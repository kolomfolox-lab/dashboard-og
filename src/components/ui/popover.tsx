import { Popover as PopoverPrimitive, PopoverTrigger as PopoverTriggerPrimitive, PopoverContent as PopoverContentPrimitive, PopoverAnchor as PopoverAnchorPrimitive, PopoverPortal as PopoverPortalPrimitive } from '@radix-ui/react-popover';

import { cn } from '@/lib/utils';

const Popover = PopoverPrimitive;

const PopoverTrigger = PopoverTriggerPrimitive;

const PopoverAnchor = PopoverAnchorPrimitive;

function PopoverContent({
  className,
  align = 'center',
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof PopoverContentPrimitive>) {
  return (
    <PopoverPortalPrimitive>
      <PopoverContentPrimitive
        align={align}
        sideOffset={sideOffset}
        className={cn(
          'z-[110] w-72 rounded-2xl border border-theme bg-[var(--modal-bg)] p-4 text-theme shadow-[0_24px_70px_rgba(0,0,0,0.4)] outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          className,
        )}
        {...props}
      />
    </PopoverPortalPrimitive>
  );
}

function PopoverHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('mb-3', className)} {...props} />;
}

function PopoverTitle({ className, ...props }: React.ComponentProps<'h3'>) {
  return <h3 className={cn('font-semibold text-theme', className)} {...props} />;
}

function PopoverDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return <p className={cn('mt-1 text-sm text-theme-secondary', className)} {...props} />;
}

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor, PopoverHeader, PopoverTitle, PopoverDescription };
