import { cn } from '@/lib/utils';

type InputGroupProps = React.ComponentProps<'div'>;

function InputGroup({ className, ...props }: InputGroupProps) {
  return (
    <div data-slot="input-group" className={cn('group/input-group relative flex w-full items-stretch min-w-0', className)} {...props} />
  );
}

type InputGroupAddonProps = React.ComponentProps<'div'> & {
  align?: 'inline-start' | 'inline-end' | 'block-start' | 'block-end';
};

function InputGroupAddon({ align = 'inline-start', className, ...props }: InputGroupAddonProps) {
  return (
    <div
      data-slot="input-group-addon"
      data-align={align}
      className={cn(
        'pointer-events-none absolute z-10 flex items-center gap-2 text-theme-muted [&_svg]:size-4',
        align === 'inline-start' && 'inset-y-0 left-0 pl-3',
        align === 'inline-end' && 'inset-y-0 right-0 pr-3',
        align === 'block-start' && 'left-0 right-0 top-0 justify-start pt-3 pl-3',
        align === 'block-end' && 'bottom-0 left-0 right-0 justify-start pb-3 pl-3',
        className,
      )}
      {...props}
    />
  );
}

function InputGroupText({ className, ...props }: React.ComponentProps<'span'>) {
  return <span data-slot="input-group-text" className={cn('text-sm whitespace-nowrap', className)} {...props} />;
}

function InputGroupButton({ className, ...props }: React.ComponentProps<'button'>) {
  return (
    <button
      data-slot="input-group-button"
      type="button"
      className={cn(
        'inline-flex items-center justify-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-sm font-medium text-theme transition hover:bg-white/15 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-3.5',
        className,
      )}
      {...props}
    />
  );
}

function InputGroupInput({ className, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      data-slot="input-group-control"
      className={cn(
        'w-full min-w-0 rounded-2xl border border-theme bg-[var(--input-bg)] px-4 py-3 text-sm text-theme outline-none transition placeholder:text-theme-muted focus:border-[#f97360]/60 focus:ring-2 focus:ring-[#f97360]/20',
        className,
      )}
      {...props}
    />
  );
}

function InputGroupTextarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="input-group-control"
      className={cn(
        'w-full min-w-0 rounded-2xl border border-theme bg-[var(--input-bg)] px-4 py-3 text-sm text-theme outline-none transition placeholder:text-theme-muted focus:border-[#f97360]/60 focus:ring-2 focus:ring-[#f97360]/20',
        className,
      )}
      {...props}
    />
  );
}

export { InputGroup, InputGroupAddon, InputGroupText, InputGroupButton, InputGroupInput, InputGroupTextarea };
