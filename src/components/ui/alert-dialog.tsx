import { AlertDialog as AlertDialogPrimitive, AlertDialogTrigger as AlertDialogTriggerPrimitive, AlertDialogPortal as AlertDialogPortalPrimitive, AlertDialogOverlay as AlertDialogOverlayPrimitive, AlertDialogContent as AlertDialogContentPrimitive, AlertDialogTitle as AlertDialogTitlePrimitive, AlertDialogDescription as AlertDialogDescriptionPrimitive, AlertDialogAction as AlertDialogActionPrimitive, AlertDialogCancel as AlertDialogCancelPrimitive } from '@radix-ui/react-alert-dialog';
import { X } from 'lucide-react';

import { cn } from '@/lib/utils';

const AlertDialog = AlertDialogPrimitive;

const AlertDialogTrigger = AlertDialogTriggerPrimitive;

const AlertDialogPortal = AlertDialogPortalPrimitive;

function AlertDialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogOverlayPrimitive>) {
  return (
    <AlertDialogOverlayPrimitive
      className={cn(
        'fixed inset-0 z-[105] bg-black/70 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        className,
      )}
      {...props}
    />
  );
}

function AlertDialogContent({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogContentPrimitive>) {
  return (
    <AlertDialogPortalPrimitive>
      <AlertDialogOverlay />
      <AlertDialogContentPrimitive
        className={cn(
          'fixed left-1/2 top-1/2 z-[110] grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 rounded-[28px] border border-theme bg-[var(--modal-bg)] p-6 text-theme shadow-[0_30px_100px_rgba(0,0,0,0.5)] duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          className,
        )}
        {...props}
      />
    </AlertDialogPortalPrimitive>
  );
}

function AlertDialogHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('flex flex-col space-y-2 text-center sm:text-left', className)} {...props} />;
}

function AlertDialogFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)} {...props} />
  );
}

function AlertDialogTitle({ className, ...props }: React.ComponentProps<typeof AlertDialogTitlePrimitive>) {
  return (
    <AlertDialogTitlePrimitive
      className={cn('text-lg font-semibold text-theme', className)}
      {...props}
    />
  );
}

function AlertDialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogDescriptionPrimitive>) {
  return (
    <AlertDialogDescriptionPrimitive
      className={cn('text-sm text-theme-secondary', className)}
      {...props}
    />
  );
}

function AlertDialogAction({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogActionPrimitive>) {
  return (
    <AlertDialogActionPrimitive
      className={cn(
        'inline-flex items-center justify-center rounded-xl bg-[#f97360] px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110',
        className,
      )}
      {...props}
    />
  );
}

function AlertDialogCancel({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogCancelPrimitive>) {
  return (
    <AlertDialogCancelPrimitive
      className={cn(
        'inline-flex items-center justify-center rounded-xl border border-theme bg-transparent px-4 py-2.5 text-sm font-semibold text-theme-secondary transition hover:text-theme',
        className,
      )}
      {...props}
    />
  );
}

function AlertDialogClose({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogCancelPrimitive>) {
  return (
    <AlertDialogCancelPrimitive
      className={cn(
        'absolute right-4 top-4 rounded-full border-none p-1 text-theme-muted opacity-70 transition hover:opacity-100',
        className,
      )}
      {...props}
    >
      <X className="h-4 w-4" />
      <span className="sr-only">Close</span>
    </AlertDialogCancelPrimitive>
  );
}

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogClose,
  AlertDialogPortal,
  AlertDialogOverlay,
};
