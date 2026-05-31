import { Star } from 'lucide-react'
import { cn } from '@/utils/cn'

export default function RatingBadge(props: {
  value: number
  className?: string
}) {
  const v = Math.max(0, Math.min(5, props.value))
  const tone =
    v >= 4.6
      ? 'bg-emerald-600 text-white'
      : v >= 4
        ? 'bg-[rgb(var(--app-accent-2))] text-white'
        : v >= 3
          ? 'bg-[rgb(var(--app-accent))] text-white'
          : 'bg-app-ink/10 text-app-ink'

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide',
        tone,
        props.className,
      )}
    >
      <Star className="h-3.5 w-3.5" />
      <span>{v === 0 ? '暂无' : v.toFixed(1)}</span>
    </span>
  )
}

