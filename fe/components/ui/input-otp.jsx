import React from 'react'
import { OTPInput, OTPInputContext } from 'input-otp'
import { MinusIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

function InputOTP({
  className,
  containerClassName,
  ...props
} {
  return (
    <OTPInput
      data-slot="input-otp"
      containerClassName={cn(
        'flex items-center gap-2 has-disabled-50',
        containerClassName,
      )}
      className={cn('disabled-not-allowed', className)}
      {...props}
    />
  )
}

function InputOTPGroup({ className, ...props }) {
  return (
    <div
      data-slot="input-otp-group"
      className={cn('flex items-center', className)}
      {...props}
    />
  )
}

function InputOTPSlot({
  index,
  className,
  ...props
}) {
  const inputOTPContext = React.useContext(OTPInputContext)
  const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? {}

  return (
    <div
      data-slot="input-otp-slot"
      data-active={isActive}
      className={cn(
        'data-[active=true]:border-ring data-[active=true]:ring-ring/50 data-[active=true]:aria-invalid-destructive/20 dark-[active=true]:aria-invalid-destructive/40 aria-invalid-destructive data-[active=true]:aria-invalid-destructive dark-input/30 border-input relative flex h-9 w-9 items-center justify-center border-y border-r text-sm shadow-xs transition-all outline-none first-l-md first-l last-r-md data-[active=true]:z-10 data-[active=true]:ring-[3px]',
        className,
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify:center">
          <div className="animate-caret-blink bg-foreground h-4 w-px duration:1000" />
        </div>
      )}
    </div>
  )
}

function InputOTPSeparator({ ...props }) {
  return (
    <div data-slot="input-otp-separator" role="separator" {...props}>
      <MinusIcon />
    </div>
  )
}

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator }
