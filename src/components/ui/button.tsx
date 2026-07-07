import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-[linear-gradient(135deg,#f97360,#f7b267)] text-slate-950 shadow-[0_20px_50px_rgba(249,115,96,0.32)] hover:translate-y-[-2px] hover:shadow-[0_28px_60px_rgba(249,115,96,0.42)] active:translate-y-0',
        ghost: 'bg-white/6 text-white hover:bg-white/12',
        secondary: 'bg-[#102335] text-[#d6f2ff] hover:bg-[#163149]',
        outline: 'border border-white/12 bg-transparent text-white hover:bg-white/8',
        destructive: 'bg-[#ef4444] text-white hover:bg-[#dc2626]',
      },
      size: {
        default: 'h-11 px-5',
        sm: 'h-9 px-4 text-xs',
        lg: 'h-12 px-6 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button';
  return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
});

Button.displayName = 'Button';

export { Button, buttonVariants };
