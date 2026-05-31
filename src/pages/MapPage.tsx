import { Filter, LocateFixed, Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import CampusCanvas from '@/components/map3d/CampusCanvas'
import PoiSheet from '@/components/poi/PoiSheet'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Pill from '@/components/ui/Pill'
import type { PoiCategory } from '@/data/types'
import { useCampusStore } from '@/store/useCampusStore'
import { cn } from '@/utils/cn'

const filters: Array<{ key: PoiCategory | 'all'; label: string }> = [
  { key: 'all', label: '全部' },
  { key: 'canteen', label: '食堂' },
  { key: 'scenery', label: '风景' },
  { key: 'express', label: '快递' },
  { key: 'service', label: '办事' },
  { key: 'study', label: '自习' },
]

export default function MapPage() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const pois = useCampusStore((s) => s.pois)
  const [filter, setFilter] = useState<PoiCategory | 'all'>('all')
  const [selectedPoiId, setSelectedPoiId] = useState<string | null>(null)
  const [q, setQ] = useState('')
  const focusPoiId = params.get('focus')

  useEffect(() => {
    if (!focusPoiId) return
    const ok = pois.some((p) => p.id === focusPoiId)
    if (ok) setSelectedPoiId(focusPoiId)
  }, [focusPoiId, pois])

  const searchResults = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return []
    return pois
      .filter((p) => {
        const bag = [p.name, p.summary, ...p.tags].join(' ').toLowerCase()
        return bag.includes(s)
      })
      .slice(0, 6)
  }, [pois, q])

  return (
    <div className="grid gap-5">
      <div className="grid gap-4 rounded-3xl border border-app-line/15 bg-white/55 p-5 shadow-[0_22px_60px_-55px_rgb(0_0_0/0.45)] backdrop-blur">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <div className="font-display text-[22px] tracking-wide">3D 校园地图</div>
            <div className="mt-1 text-sm text-app-ink/65">
              旋转浏览周围环境 · 点地点看口碑 · 从清单/榜单一键定位
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="soft"
              onClick={() => {
                setSelectedPoiId('p_building_1')
                setParams((p) => {
                  p.set('focus', 'p_building_1')
                  return p
                })
              }}
            >
              <LocateFixed className="h-4 w-4" />
              <span>定位中心区</span>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => navigate('/')}
            >
              返回首页
            </Button>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
          <div className="flex items-center gap-2">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-app-ink/6 text-app-ink/70">
              <Search className="h-4 w-4" />
            </div>
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="搜索地点：食堂/湖畔/快递/图书馆..."
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Pill className="bg-app-ink/6 text-app-ink/70">
              <Filter className="mr-1 inline-block h-3.5 w-3.5" />
              分类筛选
            </Pill>
            {filters.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                className={cn(
                  'rounded-full px-3 py-1.5 text-xs font-medium transition',
                  filter === f.key
                    ? 'bg-app-ink text-app'
                    : 'bg-app-ink/6 text-app-ink/70 hover:bg-app-ink/10 hover:text-app-ink',
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {q.trim() ? (
          <div className="grid gap-2 rounded-2xl border border-app-line/10 bg-app/70 p-3">
            <div className="text-xs text-app-ink/60">搜索结果</div>
            <div className="flex flex-wrap gap-2">
              {searchResults.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setSelectedPoiId(p.id)
                    setParams((ps) => {
                      ps.set('focus', p.id)
                      return ps
                    })
                  }}
                  className="rounded-full bg-white/70 px-3 py-1.5 text-xs text-app-ink/75 transition hover:bg-white"
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <CampusCanvas
        pois={pois}
        filter={filter}
        focusPoiId={focusPoiId}
        activePoiId={selectedPoiId}
        onSelect={(p) => {
          setSelectedPoiId(p.poiId)
          setParams((ps) => {
            ps.set('focus', p.poiId)
            return ps
          })
        }}
      />

      <PoiSheet
        poiId={selectedPoiId}
        onClose={() => {
          setSelectedPoiId(null)
          setParams((ps) => {
            ps.delete('focus')
            return ps
          })
        }}
        onGoMap={(poiId) => {
          setSelectedPoiId(poiId)
          setParams((ps) => {
            ps.set('focus', poiId)
            return ps
          })
        }}
      />
    </div>
  )
}

