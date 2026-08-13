import { Group as PanelGroupPrimitive, Panel as PanelPrimitive, Separator as SeparatorPrimitive } from 'react-resizable-panels';
import { GripVertical } from 'lucide-react';

import { cn } from '@/lib/utils';

function ResizablePanelGroup({
  className,
  ...props
}: React.ComponentProps<typeof PanelGroupPrimitive>) {
  return (
    <PanelGroupPrimitive
      data-slot="resizable-panel-group"
      className={cn('flex h-full w-full', className)}
      {...props}
    />
  );
}

function ResizablePanel({ className, ...props }: React.ComponentProps<typeof PanelPrimitive>) {
  return <PanelPrimitive data-slot="resizable-panel" className={cn('flex h-full min-w-0', className)} {...props} />;
}

function ResizableHandle({
  withHandle,
  className,
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive> & { withHandle?: boolean }) {
  return (
    <SeparatorPrimitive
      data-slot="resizable-handle"
      className={cn(
        'relative flex w-px items-center justify-center bg-white/10 after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:outline-none',
        className,
      )}
      {...props}
    >
      {withHandle ? (
        <div className="z-10 flex h-4 w-3 items-center justify-center rounded-sm border border-theme bg-[var(--panel-bg)]">
          <GripVertical className="h-2.5 w-2.5" />
        </div>
      ) : null}
    </SeparatorPrimitive>
  );
}

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
