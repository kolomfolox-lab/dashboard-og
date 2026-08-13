import { Accordion as AccordionPrimitive, AccordionItem as AccordionItemPrimitive, AccordionHeader as AccordionHeaderPrimitive, AccordionTrigger as AccordionTriggerPrimitive, AccordionContent as AccordionContentPrimitive } from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';

import { cn } from '@/lib/utils';

const Accordion = AccordionPrimitive;

function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionItemPrimitive>) {
  return <AccordionItemPrimitive className={cn('border-b border-theme', className)} {...props} />;
}

function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionTriggerPrimitive>) {
  return (
    <AccordionHeaderPrimitive className="flex">
      <AccordionTriggerPrimitive
        className={cn(
          'flex flex-1 items-center justify-between py-4 text-sm font-medium text-theme transition-all hover:opacity-80 [&[data-state=open]>svg]:rotate-180',
          className,
        )}
        {...props}
      >
        {children}
        <ChevronDown className="h-4 w-4 shrink-0 text-theme-secondary transition-transform duration-200" />
      </AccordionTriggerPrimitive>
    </AccordionHeaderPrimitive>
  );
}

function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionContentPrimitive>) {
  return (
    <AccordionContentPrimitive
      className="overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
      {...props}
    >
      <div className={cn('pb-4 pt-0 text-theme-secondary', className)}>{children}</div>
    </AccordionContentPrimitive>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
