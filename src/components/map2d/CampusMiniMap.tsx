import { useMemo } from 'react'
import type { Poi } from '@/data/types'
import { cn } from '@/utils/cn'

type Marker = {
  id: string
  name: string
  position: { x: number; y: number; z: number }
  color: string
  radius?: number
}

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n))
}

export default function CampusMiniMap(props: {
  pois: Poi[]
  poiOverrides?: Record<string, { x: number; y: number; z: number }>
  markers?: Marker[]
  focusPoiId?: string | null
  activePoiId?: string | null
  onSelect?: (poiId: string) => void
  className?: string
}) {
  const points = useMemo(() => {
    const out: Array<{ id: string; name: string; x: number; z: number; kind: 'poi' | 'marker'; color?: string; r: number }> = []

    for (const p of props.pois) {
      const override = props.poiOverrides?.[p.id]
      const pos = override ?? p.position
      out.push({ id: p.id, name: p.name, x: pos.x, z: pos.z, kind: 'poi', r: 2.2 })
    }

    for (const m of props.markers ?? []) {
      out.push({
        id: m.id,
        name: m.name,
        x: m.position.x,
        z: m.position.z,
        kind: 'marker',
        color: m.color,
        r: (m.radius ?? 0.22) * 14,
      })
    }

    return out
  }, [props.markers, props.poiOverrides, props.pois])

  const box = useMemo(() => {
    const xs = points.map((p) => p.x)
    const zs = points.map((p) => p.z)
    const minX = xs.length ? Math.min(...xs) : -10
    const maxX = xs.length ? Math.max(...xs) : 10
    const minZ = zs.length ? Math.min(...zs) : -10
    const maxZ = zs.length ? Math.max(...zs) : 10
    const pad = 8
    const w = Math.max(30, maxX - minX + pad * 2)
    const h = Math.max(30, maxZ - minZ + pad * 2)
    const cx = (minX + maxX) / 2
    const cz = (minZ + maxZ) / 2
    return { minX: cx - w / 2, minZ: cz - h / 2, w, h }
  }, [points])

  const focus = useMemo(() => {
    const id = props.focusPoiId || props.activePoiId
    if (!id) return null
    const poi = props.pois.find((p) => p.id === id)
    if (!poi) return null
    const override = props.poiOverrides?.[poi.id]
    const pos = override ?? poi.position
    return { x: pos.x, z: pos.z, name: poi.name }
  }, [props.activePoiId, props.focusPoiId, props.poiOverrides, props.pois])

  const viewBox = useMemo(() => {
    if (!focus) return `${box.minX} ${box.minZ} ${box.w} ${box.h}`
    const w = clamp(box.w * 0.85, 40, 180)
    const h = clamp(box.h * 0.85, 40, 180)
    return `${focus.x - w / 2} ${focus.z - h / 2} ${w} ${h}`
  }, [box, focus])

  return (
    <div className={cn('relative overflow-hidden rounded-3xl border border-app-line/15 bg-white shadow-[0_30px_80px_-60px_rgb(0_0_0/0.25)]', props.className)}>
      <div className="flex items-center justify-between gap-3 border-b border-app-line/10 px-5 py-4">
        <div className="font-display text-[18px] tracking-wide">平面定位</div>
        <div className="text-xs text-app-ink/55">
          {focus ? `已聚焦：${focus.name}` : '点击地点可聚焦'}
        </div>
      </div>

      <div className="h-[62dvh] bg-[radial-gradient(circle_at_20%_20%,rgb(var(--app-accent)/0.10),transparent_55%),radial-gradient(circle_at_80%_80%,rgb(var(--app-accent-2)/0.10),transparent_55%)]">
        <svg viewBox={viewBox} className="h-full w-full">
          <rect x={box.minX} y={box.minZ} width={box.w} height={box.h} fill="transparent" />

          <g opacity={0.18}>
            {Array.from({ length: 10 }).map((_, i) => {
              const x = box.minX + (box.w * (i + 1)) / 11
              return <line key={`gx_${i}`} x1={x} y1={box.minZ} x2={x} y2={box.minZ + box.h} stroke="rgb(var(--app-line))" strokeWidth={0.25} />
            })}
            {Array.from({ length: 10 }).map((_, i) => {
              const y = box.minZ + (box.h * (i + 1)) / 11
              return <line key={`gz_${i}`} x1={box.minX} y1={y} x2={box.minX + box.w} y2={y} stroke="rgb(var(--app-line))" strokeWidth={0.25} />
            })}
          </g>

          {focus ? (
            <g>
              <circle cx={focus.x} cy={focus.z} r={4.8} fill="rgb(var(--app-accent)/0.10)" />
              <circle cx={focus.x} cy={focus.z} r={2.8} fill="rgb(var(--app-accent)/0.22)" />
            </g>
          ) : null}

          <g>
            {points
              .filter((p) => p.kind === 'poi')
              .map((p) => (
                <circle
                  key={`p_${p.id}`}
                  cx={p.x}
                  cy={p.z}
                  r={p.r}
                  fill="rgb(var(--app-ink)/0.18)"
                  onClick={() => props.onSelect?.(p.id)}
                  style={{ cursor: props.onSelect ? 'pointer' : 'default' }}
                />
              ))}
          </g>

          <g>
            {points
              .filter((p) => p.kind === 'marker')
              .map((p) => (
                <g key={`m_${p.id}`}>
                  <circle cx={p.x} cy={p.z} r={p.r + 2} fill="rgb(255 255 255 / 0.9)" />
                  <circle cx={p.x} cy={p.z} r={p.r} fill={p.color ?? 'rgb(var(--app-accent))'} opacity={0.95} />
                </g>
              ))}
          </g>
        </svg>
      </div>
    </div>
  )
}

