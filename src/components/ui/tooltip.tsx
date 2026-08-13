import { TooltipProvider as TooltipProviderPrimitive, Tooltip as TooltipPrimitive, TooltipTrigger as TooltipTriggerPrimitive, TooltipContent as TooltipContentPrimitive, TooltipPortal as TooltipPortalPrimitive } from '@radix-ui/react-tooltip';

import { cn } from '@/lib/utils';

const TooltipProvider = TooltipProviderPrimitive;

const Tooltip = TooltipPrimitive;

const TooltipTrigger = TooltipTriggerPrimitive;

function TooltipContent({
  className,
  sideOffset = 4,
  children,
  ...props
}: React.ComponentProps<typeof TooltipContentPrimitive>) {
  return (
    <TooltipPortalPrimitive>
      <TooltipContentPrimitive
        sideOffset={sideOffset}
        className={cn(
          'z-[110] w-fit rounded-md bg-white px-3 py-1.5 text-xs text-slate-900 shadow-lg animate-in fade-in-0 zoom-in-95',
          className,
        )}
        {...props}
      >
        {children}
      </TooltipContentPrimitive>
    </TooltipPortalPrimitive>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
