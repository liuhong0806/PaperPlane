import { forwardRef } from 'react'
import { cn } from '@/utils/cn'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost' | 'soft'
  size?: 'sm' | 'md'
}

const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { className, variant = 'soft', size = 'md', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition focus:outline-none focus:ring-2 focus:ring-[rgb(var(--app-accent)/0.35)]',
        size === 'sm' ? 'h-9 px-3 text-sm' : 'h-10 px-4 text-sm',
        variant === 'primary' &&
          'bg-[rgb(var(--app-ink))] text-[rgb(var(--app-bg))] hover:brightness-110',
        variant === 'soft' &&
          'bg-[rgb(var(--app-ink)/0.06)] text-app-ink hover:bg-[rgb(var(--app-ink)/0.09)]',
        variant === 'ghost' &&
          'bg-transparent text-app-ink/80 hover:bg-[rgb(var(--app-ink)/0.06)] hover:text-app-ink',
        className,
      )}
      {...rest}
    />
  )
})

export default Button

