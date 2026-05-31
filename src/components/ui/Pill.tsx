import { cn } from '@/utils/cn'

export default function Pill(props: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border border-app-line/12 bg-app-ink/5 px-2.5 py-1 text-xs text-app-ink/75',
        props.className,
      )}
    >
      {props.children}
    </span>
  )
}
