import { cn } from '@/lib/utils';

type ButtonGroupProps = React.ComponentProps<'div'> & {
  orientation?: 'horizontal' | 'vertical';
};

function ButtonGroup({
  orientation = 'horizontal',
  className,
  role = 'group',
  ...props
}: ButtonGroupProps) {
  return (
    <div
      role={role}
      data-orientation={orientation}
      data-slot="button-group"
      className={cn(
        'flex items-stretch',
        orientation === 'horizontal'
          ? 'flex-row [&>button:not(:first-child)]:rounded-l-none [&>button:not(:last-child)]:rounded-r-none'
          : 'flex-col [&>button:not(:first-child)]:rounded-t-none [&>button:not(:last-child)]:rounded-b-none',
        className,
      )}
      {...props}
    />
  );
}

type ButtonGroupSeparatorProps = React.ComponentProps<'span'> & {
  orientation?: 'horizontal' | 'vertical';
};

function ButtonGroupSeparator({
  orientation = 'vertical',
  className,
  ...props
}: ButtonGroupSeparatorProps) {
  return (
    <span
      data-slot="button-group-separator"
      data-orientation={orientation}
      aria-hidden="true"
      className={cn(
        'bg-border mx-auto my-1 w-px shrink-0',
        orientation === 'vertical' ? 'h-auto' : 'h-px w-auto',
        className,
      )}
      {...props}
    />
  );
}

type ButtonGroupTextProps = React.ComponentProps<'span'> & { asChild?: boolean };

function ButtonGroupText({ className, ...props }: ButtonGroupTextProps) {
  return (
    <span
      data-slot="button-group-text"
      className={cn('inline-flex items-center px-3 text-sm text-theme-secondary', className)}
      {...props}
    />
  );
}

export { ButtonGroup, ButtonGroupSeparator, ButtonGroupText };
