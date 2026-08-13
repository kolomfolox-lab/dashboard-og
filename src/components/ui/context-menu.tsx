import { ContextMenu as ContextMenuPrimitive, ContextMenuTrigger as ContextMenuTriggerPrimitive, ContextMenuPortal as ContextMenuPortalPrimitive, ContextMenuContent as ContextMenuContentPrimitive, ContextMenuItem as ContextMenuItemPrimitive, ContextMenuGroup as ContextMenuGroupPrimitive, ContextMenuLabel as ContextMenuLabelPrimitive, ContextMenuSeparator as ContextMenuSeparatorPrimitive, ContextMenuCheckboxItem as ContextMenuCheckboxItemPrimitive, ContextMenuRadioGroup as ContextMenuRadioGroupPrimitive, ContextMenuRadioItem as ContextMenuRadioItemPrimitive, ContextMenuSub as ContextMenuSubPrimitive, ContextMenuSubTrigger as ContextMenuSubTriggerPrimitive, ContextMenuSubContent as ContextMenuSubContentPrimitive, ContextMenuItemIndicator as ContextMenuItemIndicatorPrimitive } from '@radix-ui/react-context-menu';
import { Check, ChevronRight, Circle } from 'lucide-react';

import { cn } from '@/lib/utils';

const ContextMenu = ContextMenuPrimitive;

const ContextMenuTrigger = ContextMenuTriggerPrimitive;

const ContextMenuGroup = ContextMenuGroupPrimitive;

const ContextMenuPortal = ContextMenuPortalPrimitive;

const ContextMenuSub = ContextMenuSubPrimitive;

const ContextMenuRadioGroup = ContextMenuRadioGroupPrimitive;

function ContextMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof ContextMenuSubTriggerPrimitive> & { inset?: boolean }) {
  return (
    <ContextMenuSubTriggerPrimitive
      className={cn(
        'flex cursor-default items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-theme outline-none select-none data-[inset]:pl-8 focus:bg-white/10',
        className,
      )}
      {...props}
    >
      {children}
      <ChevronRight className="ml-auto h-4 w-4" />
    </ContextMenuSubTriggerPrimitive>
  );
}

function ContextMenuSubContent({
  className,
  ...props
}: React.ComponentProps<typeof ContextMenuSubContentPrimitive>) {
  return (
    <ContextMenuSubContentPrimitive
      className={cn(
        'z-[110] min-w-40 overflow-hidden rounded-2xl border border-theme bg-[var(--modal-bg)] p-1.5 text-theme shadow-xl',
        className,
      )}
      {...props}
    />
  );
}

function ContextMenuContent({
  className,
  ...props
}: React.ComponentProps<typeof ContextMenuContentPrimitive>) {
  return (
    <ContextMenuPortalPrimitive>
      <ContextMenuContentPrimitive
        className={cn(
          'z-[110] min-w-40 overflow-hidden rounded-2xl border border-theme bg-[var(--modal-bg)] p-1.5 text-theme shadow-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          className,
        )}
        {...props}
      />
    </ContextMenuPortalPrimitive>
  );
}

function ContextMenuItem({
  className,
  inset,
  variant = 'default',
  ...props
}: React.ComponentProps<typeof ContextMenuItemPrimitive> & {
  inset?: boolean;
  variant?: 'default' | 'destructive';
}) {
  return (
    <ContextMenuItemPrimitive
      data-inset={inset}
      data-variant={variant}
      className={cn(
        'relative flex cursor-default items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-theme outline-none select-none data-[inset]:pl-8 focus:bg-white/10 data-[variant=destructive]:text-red-400',
        className,
      )}
      {...props}
    />
  );
}

function ContextMenuCheckboxItem({
  className,
  children,
  checked,
  ...props
}: React.ComponentProps<typeof ContextMenuCheckboxItemPrimitive>) {
  return (
    <ContextMenuCheckboxItemPrimitive
      className={cn('relative flex cursor-default items-center rounded-lg py-1.5 pr-2 pl-8 text-sm text-theme outline-none select-none focus:bg-white/10', className)}
      checked={checked}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <ContextMenuItemIndicatorPrimitive>
          <Check className="h-4 w-4" />
        </ContextMenuItemIndicatorPrimitive>
      </span>
      {children}
    </ContextMenuCheckboxItemPrimitive>
  );
}

function ContextMenuRadioItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof ContextMenuRadioItemPrimitive>) {
  return (
    <ContextMenuRadioItemPrimitive
      className={cn('relative flex cursor-default items-center rounded-lg py-1.5 pr-2 pl-8 text-sm text-theme outline-none select-none focus:bg-white/10', className)}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <ContextMenuItemIndicatorPrimitive>
          <Circle className="h-2 w-2 fill-current" />
        </ContextMenuItemIndicatorPrimitive>
      </span>
      {children}
    </ContextMenuRadioItemPrimitive>
  );
}

function ContextMenuLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof ContextMenuLabelPrimitive> & { inset?: boolean }) {
  return (
    <ContextMenuLabelPrimitive
      className={cn('px-2 py-1.5 text-xs font-semibold uppercase tracking-widest text-theme-muted data-[inset]:pl-8', className)}
      {...props}
    />
  );
}

function ContextMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof ContextMenuSeparatorPrimitive>) {
  return <ContextMenuSeparatorPrimitive className={cn('-mx-1 my-1 h-px bg-white/10', className)} {...props} />;
}

function ContextMenuShortcut({ className, ...props }: React.ComponentProps<'span'>) {
  return <span className={cn('ml-auto text-xs tracking-widest text-theme-muted', className)} {...props} />;
}

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
};
