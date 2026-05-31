import { ArrowUpDown, UtensilsCrossed } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PoiCard from '@/components/poi/PoiCard'
import Card from '@/components/ui/Card'
import Pill from '@/components/ui/Pill'
import type { Poi } from '@/data/types'
import { useCampusStore } from '@/store/useCampusStore'

type SortKey = 'hot' | 'rating'

export default function FoodPage() {
  const navigate = useNavigate()
  const pois = useCampusStore((s) => s.pois)
  const reviews = useCampusStore((s) => s.reviews)
  const [sort, setSort] = useState<SortKey>('rating')

  const counts = useMemo(() => {
    const c: Record<string, number> = {}
    for (const r of reviews) c[r.poiId] = (c[r.poiId] ?? 0) + 1
    return c
  }, [reviews])

  const list = useMemo(() => {
    const canteens = pois.filter((p) => p.category === 'canteen')
    return [...canteens].sort((a, b) => {
      if (sort === 'hot') return (counts[b.id] ?? 0) - (counts[a.id] ?? 0)
      const ar = avg(a, reviews)
      const br = avg(b, reviews)
      return br - ar
    })
  }, [counts, pois, reviews, sort])

  return (
    <div className="grid gap-5">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="font-display text-[26px] tracking-wide">吃喝指南</div>
          <div className="mt-1 text-sm text-app-ink/65">
            用口碑把踩坑成本压到最低：评分、标签、错峰建议都沉淀到地点卡片。
          </div>
        </div>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Pill className="bg-app-ink/6">
              <UtensilsCrossed className="mr-1 inline-block h-3.5 w-3.5" />
              食堂榜单
            </Pill>
            <div className="text-xs text-app-ink/55">排序</div>
            <button
              type="button"
              onClick={() => setSort((s) => (s === 'hot' ? 'rating' : 'hot'))}
              className="inline-flex items-center gap-2 rounded-full bg-app-ink/6 px-3 py-1.5 text-xs font-medium text-app-ink/70 transition hover:bg-app-ink/10 hover:text-app-ink"
            >
              <ArrowUpDown className="h-3.5 w-3.5" />
              <span>{sort === 'hot' ? '按热度' : '按评分'}</span>
            </button>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {list.map((p) => (
          <PoiCard
            key={p.id}
            poi={p}
            onClick={() => navigate(`/poi/${p.id}`)}
          />
        ))}
      </div>

      <Card className="overflow-hidden p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="font-medium">就餐小贴士</div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <Tip title="晚高峰" desc="17:30–18:40 排队明显变长，建议错峰或先去快递点。" />
          <Tip title="窗口策略" desc="想吃热门菜：先看出餐速度，再决定排哪队。" />
          <Tip title="新生友好" desc="第一次来：优先选择窗口多、动线清晰的食堂。" />
        </div>
      </Card>
    </div>
  )
}

function Tip(props: { title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-app-line/12 bg-app-ink/3 px-4 py-4">
      <div className="text-sm font-medium">{props.title}</div>
      <div className="mt-2 text-sm text-app-ink/65">{props.desc}</div>
    </div>
  )
}

function avg(poi: Poi, reviews: { poiId: string; score: number }[]) {
  const list = reviews.filter((r) => r.poiId === poi.id)
  if (!list.length) return 0
  const sum = list.reduce((acc, r) => acc + r.score, 0)
  return sum / list.length
}
