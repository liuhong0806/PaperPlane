import { MapPin } from 'lucide-react'
import type { Poi } from '@/data/types'
import { cn } from '@/utils/cn'
import Card from '@/components/ui/Card'
import Pill from '@/components/ui/Pill'
import RatingBadge from '@/components/poi/RatingBadge'
import { usePoiRating } from '@/store/useCampusStore'

const categoryLabel: Record<Poi['category'], string> = {
  canteen: '食堂',
  scenery: '风景',
  express: '快递点',
  service: '办事',
  study: '自习',
  building: '建筑',
}

export default function PoiCard(props: {
  poi: Poi
  onClick?: () => void
  className?: string
  compact?: boolean
}) {
  const rating = usePoiRating(props.poi.id)

  return (
    <Card
      className={cn(
        'group cursor-pointer transition hover:-translate-y-0.5 hover:border-app-line/25',
        props.compact ? 'p-4' : 'p-5',
        props.className,
      )}
    >
      <button
        type="button"
        onClick={props.onClick}
        className="w-full text-left"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <div className="font-display text-[16px] tracking-wide">
                {props.poi.name}
              </div>
              <Pill className="bg-app-ink/5 text-app-ink/70">
                {categoryLabel[props.poi.category]}
              </Pill>
            </div>
            <div className="mt-2 line-clamp-2 text-sm text-app-ink/65">
              {props.poi.summary}
            </div>
          </div>

          <RatingBadge value={rating} className="shrink-0" />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {props.poi.tags.slice(0, props.compact ? 2 : 3).map((t) => (
            <Pill key={t}>{t}</Pill>
          ))}
          <span className="ml-auto inline-flex items-center gap-1 text-xs text-app-ink/55">
            <MapPin className="h-3.5 w-3.5" />
            <span>点此查看位置</span>
          </span>
        </div>
      </button>
    </Card>
  )
}

