import { Map as MapIcon, NotebookText, Salad, Sparkles, ArrowUpRight, Search } from 'lucide-react'
import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Pill from '@/components/ui/Pill'
import PoiCard from '@/components/poi/PoiCard'
import { useCampusStore } from '@/store/useCampusStore'
import { cn } from '@/utils/cn'

type Entry = {
  title: string
  subtitle: string
  icon: React.ReactNode
  path: string
  tone: string
}

export default function HomePage() {
  const navigate = useNavigate()
  const pois = useCampusStore((s) => s.pois)
  const reviews = useCampusStore((s) => s.reviews)
  const [q, setQ] = useState('')

  const entries: Entry[] = useMemo(
    () => [
      {
        title: '3D 校园地图',
        subtitle: '旋转浏览 · 点地点看口碑',
        icon: <MapIcon className="h-5 w-5" />,
        path: '/map',
        tone:
          'from-[rgb(var(--app-accent-2))/0.14] via-white/35 to-[rgb(var(--app-accent))/0.10]',
      },
      {
        title: '新生任务清单',
        subtitle: '不慌：一步步办完必备事项',
        icon: <NotebookText className="h-5 w-5" />,
        path: '/tasks',
        tone:
          'from-[rgb(var(--app-ink))/0.06] via-white/35 to-[rgb(var(--app-accent-2))/0.08]',
      },
      {
        title: '吃喝指南',
        subtitle: '食堂榜单 · 高峰提示 · 踩坑记录',
        icon: <Salad className="h-5 w-5" />,
        path: '/food',
        tone:
          'from-[rgb(var(--app-accent))/0.12] via-white/35 to-[rgb(var(--app-ink))/0.06]',
      },
      {
        title: '口碑·风景打卡',
        subtitle: '只发地点相关，信息不跑偏',
        icon: <Sparkles className="h-5 w-5" />,
        path: '/feed',
        tone:
          'from-[rgb(var(--app-accent-2))/0.10] via-white/35 to-[rgb(var(--app-ink))/0.05]',
      },
    ],
    [],
  )

  const filtered = useMemo(() => {
    const s = q.trim()
    if (!s) return []
    const lower = s.toLowerCase()
    return pois
      .filter((p) => {
        const bag = [p.name, p.summary, ...p.tags].join(' ').toLowerCase()
        return bag.includes(lower)
      })
      .slice(0, 6)
  }, [pois, q])

  const hotPois = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const r of reviews) counts[r.poiId] = (counts[r.poiId] ?? 0) + 1
    return [...pois]
      .sort((a, b) => (counts[b.id] ?? 0) - (counts[a.id] ?? 0))
      .slice(0, 3)
  }, [pois, reviews])

  return (
    <div className="grid gap-8">
      <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr] md:items-start">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
            className="font-display text-[34px] leading-[1.05] tracking-wide md:text-[44px]"
          >
            一张 3D 地图，
            <br />
            把校园“生活经验”装进地点里
          </motion.h1>
          <div className="mt-4 max-w-xl text-sm leading-relaxed text-app-ink/70">
            点建筑、看口碑、跟着清单办事。每条评价都绑定地点——信息不发散，新生也能一眼上手。
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <Pill className="bg-app-ink/6">地点（POI）底座</Pill>
            <Pill className="bg-app-ink/6">评价沉淀到地图</Pill>
            <Pill className="bg-app-ink/6">清单一键定位</Pill>
            <Pill className="bg-app-ink/6">桌面优先 · 移动适配</Pill>
          </div>
        </div>

        <Card className="relative overflow-hidden p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="font-medium">全局搜索地点</div>
            <span className="text-xs text-app-ink/55">支持标签/分类/关键词</span>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-app-ink/6 text-app-ink/70">
              <Search className="h-4 w-4" />
            </div>
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="试试：一食堂 / 晚霞 / 快递 / 自习..."
            />
          </div>

          <div className="mt-4 grid gap-3">
            {(q.trim() ? filtered : hotPois).map((p) => (
              <PoiCard
                key={p.id}
                compact
                poi={p}
                onClick={() => navigate(`/poi/${p.id}`)}
              />
            ))}
          </div>

          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-app-accent/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-12 -left-10 h-48 w-48 rounded-full bg-app-accent-2/12 blur-2xl" />
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {entries.map((e, idx) => (
          <motion.button
            key={e.title}
            type="button"
            onClick={() => navigate(e.path)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.55,
              delay: 0.06 * idx,
              ease: [0.2, 0.8, 0.2, 1],
            }}
            className="group text-left"
          >
            <Card className="relative overflow-hidden p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="grid h-10 w-10 place-items-center rounded-2xl bg-app-ink/6 text-app-ink/80 transition group-hover:bg-app-ink/10">
                      {e.icon}
                    </span>
                    <div className="font-display text-[18px] tracking-wide">
                      {e.title}
                    </div>
                  </div>
                  <div className="mt-3 text-sm text-app-ink/65">
                    {e.subtitle}
                  </div>
                </div>
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-app-ink/6 text-app-ink/70 transition group-hover:bg-app-ink/10 group-hover:text-app-ink">
                  <ArrowUpRight className="h-5 w-5" />
                </span>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <Pill className="bg-white">入口</Pill>
                <Pill className="bg-white">地点联动</Pill>
                <Pill className="bg-white">可写评价</Pill>
              </div>

              <div className={cn('pointer-events-none absolute inset-0 bg-gradient-to-br', e.tone)} />
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.2),transparent)]" />
            </Card>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
