import * as React from 'react'
import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { CheckIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

function Checkbox({
  className,
  ...props
}) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        'peer border-input dark-input/30 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark-[state=checked]:bg-primary data-[state=checked]:border-primary focus:visible-ring focus:visible-ring/50 aria-invalid-destructive/20 dark-invalid-destructive/40 aria-invalid-destructive size-4 shrink-0 rounded-[4px] border shadow-xs transition-shadow outline-none focus:visible-[3px] disabled-not-allowed disabled-50',
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-current transition:none"
      >
        <CheckIcon className="size:3.5" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
