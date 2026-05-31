import { useMemo } from 'react'
import type { Poi, PoiCategory } from '@/data/types'
import { cn } from '@/utils/cn'

const categoryTone: Record<PoiCategory, { fill: string; border: string }> = {
  canteen: { fill: 'bg-[rgb(236_119_46)]', border: 'border-[rgb(236_119_46)]' },
  scenery: { fill: 'bg-[rgb(23_92_74)]', border: 'border-[rgb(23_92_74)]' },
  express: { fill: 'bg-[rgb(17_28_23)]', border: 'border-[rgb(17_28_23)]' },
  service: { fill: 'bg-[rgb(42_94_82)]', border: 'border-[rgb(42_94_82)]' },
  study: { fill: 'bg-[rgb(14_46_37)]', border: 'border-[rgb(14_46_37)]' },
  building: { fill: 'bg-[rgb(26_42_34)]', border: 'border-[rgb(26_42_34)]' },
  sports: { fill: 'bg-[rgb(11_59_47)]', border: 'border-[rgb(11_59_47)]' },
}

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n))
}

export default function CampusFallback(props: {
  pois: Poi[]
  poiOverrides?: Record<string, { x: number; y: number; z: number }>
  activePoiId?: string | null
  onSelect: (p: { poiId: string }) => void
}) {
  const items = useMemo(() => {
    return props.pois.map((p) => {
      const override = props.poiOverrides?.[p.id]
      const pos = override ?? p.position
      return { poi: p, pos }
    })
  }, [props.poiOverrides, props.pois])

  const box = useMemo(() => {
    const xs = items.map((i) => i.pos.x)
    const zs = items.map((i) => i.pos.z)
    const minX = xs.length ? Math.min(...xs) : -10
    const maxX = xs.length ? Math.max(...xs) : 10
    const minZ = zs.length ? Math.min(...zs) : -10
    const maxZ = zs.length ? Math.max(...zs) : 10
    const pad = 12
    const w = Math.max(40, maxX - minX + pad * 2)
    const h = Math.max(40, maxZ - minZ + pad * 2)
    const cx = (minX + maxX) / 2
    const cz = (minZ + maxZ) / 2
    return { minX: cx - w / 2, minZ: cz - h / 2, w, h }
  }, [items])

  return (
    <div className="relative h-[70dvh] overflow-hidden rounded-3xl border border-app-line/15 bg-white shadow-[0_30px_80px_-60px_rgb(0_0_0/0.35)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_25%,rgb(var(--app-accent)/0.16),transparent_55%),radial-gradient(circle_at_85%_75%,rgb(var(--app-accent-2)/0.16),transparent_55%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.75),rgba(255,255,255,0.92))]" />

      <div className="absolute inset-0">
        <svg viewBox={`${box.minX} ${box.minZ} ${box.w} ${box.h}`} className="h-full w-full">
          <g opacity={0.16}>
            {Array.from({ length: 12 }).map((_, i) => {
              const x = box.minX + (box.w * (i + 1)) / 13
              return <line key={`gx_${i}`} x1={x} y1={box.minZ} x2={x} y2={box.minZ + box.h} stroke="rgb(var(--app-line))" strokeWidth={0.3} />
            })}
            {Array.from({ length: 12 }).map((_, i) => {
              const y = box.minZ + (box.h * (i + 1)) / 13
              return <line key={`gz_${i}`} x1={box.minX} y1={y} x2={box.minX + box.w} y2={y} stroke="rgb(var(--app-line))" strokeWidth={0.3} />
            })}
          </g>
        </svg>
      </div>

      <div className="relative h-full">
        {items.map(({ poi, pos }) => {
          const left = ((pos.x - box.minX) / box.w) * 100
          const top = ((pos.z - box.minZ) / box.h) * 100
          const w = clamp((poi.size.x / box.w) * 100 * 1.05, 1.6, 14)
          const h = clamp((poi.size.z / box.h) * 100 * 1.05, 1.6, 14)
          const active = poi.id === props.activePoiId
          const tone = categoryTone[poi.category]

          return (
            <button
              key={poi.id}
              type="button"
              onClick={() => props.onSelect({ poiId: poi.id })}
              className={cn(
                'group absolute -translate-x-1/2 -translate-y-1/2 rounded-2xl border shadow-[0_16px_40px_-28px_rgb(0_0_0/0.55)] transition hover:-translate-y-[calc(50%+2px)]',
                tone.border,
                active ? 'ring-2 ring-[rgb(var(--app-accent))] ring-offset-2 ring-offset-white' : '',
              )}
              style={{ left: `${left}%`, top: `${top}%`, width: `${w}%`, height: `${h}%` }}
            >
              <span className={cn('absolute inset-0 rounded-2xl opacity-85', tone.fill)} />
              <span className="absolute inset-0 rounded-2xl bg-[linear-gradient(to_bottom,rgba(255,255,255,0.18),transparent)]" />
              <span className="absolute inset-0 grid place-items-center px-2">
                <span className="truncate text-[11px] font-semibold tracking-wide text-white drop-shadow">
                  {poi.name}
                </span>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

