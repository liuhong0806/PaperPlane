import { forwardRef } from 'react'
import { cn } from '@/utils/cn'

type Props = React.InputHTMLAttributes<HTMLInputElement>

const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { className, ...rest },
  ref,
) {
  return (
    <input
      ref={ref}
      className={cn(
        'h-10 w-full rounded-xl border border-app-line/20 bg-white/70 px-3 text-sm text-app-ink placeholder:text-app-ink/45 shadow-sm outline-none transition focus:border-[rgb(var(--app-accent)/0.55)] focus:ring-2 focus:ring-[rgb(var(--app-accent)/0.18)]',
        className,
      )}
      {...rest}
    />
  )
})

export default Input

