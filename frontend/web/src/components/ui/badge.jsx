import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus:visible-ring focus:visible-ring/50 focus:visible-[3px] aria-invalid-destructive/20 dark-invalid-destructive/40 aria-invalid-destructive transition-[color,box-shadow] overflow-hidden',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground [a&]:hover:primary/90',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground [a&]:hover:secondary/90',
        destructive:
          'border-transparent bg-destructive text-white [a&]:hover:destructive/90 focus:visible-destructive/20 dark-visible-destructive/40 dark-destructive/60',
        outline:
          'text-foreground [a&]:hover:accent [a&]:hover:accent-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot : 'span'

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
