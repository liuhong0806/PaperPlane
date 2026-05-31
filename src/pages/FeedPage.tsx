import { Plus, Sparkles, MapPin, Star } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Pill from '@/components/ui/Pill'
import { useCampusStore, usePoiById } from '@/store/useCampusStore'
import { cn } from '@/utils/cn'

export default function FeedPage() {
  const navigate = useNavigate()
  const pois = useCampusStore((s) => s.pois)
  const reviews = useCampusStore((s) => s.reviews)
  const addReview = useCampusStore((s) => s.addReview)
  const [open, setOpen] = useState(false)
  const [poiId, setPoiId] = useState(pois[0]?.id ?? '')
  const [score, setScore] = useState<1 | 2 | 3 | 4 | 5>(5)
  const [tags, setTags] = useState('')
  const [content, setContent] = useState('')

  const grouped = useMemo(() => {
    const list = reviews.slice(0, 50)
    return list
  }, [reviews])

  return (
    <div className="grid gap-5">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="font-display text-[26px] tracking-wide">口碑·风景打卡</div>
          <div className="mt-1 text-sm text-app-ink/65">
            只发布地点相关内容：出片点位、排队时段、踩坑提醒都会沉淀到地点卡片。
          </div>
        </div>
        <Button variant="primary" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" />
          发布打卡
        </Button>
      </div>

      {open ? (
        <Card className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-app-ink text-app">
                <Sparkles className="h-5 w-5" />
              </span>
              <div>
                <div className="font-medium">发布地点打卡</div>
                <div className="text-xs text-app-ink/55">
                  必须绑定地点；内容会同步到该地点卡片。
                </div>
              </div>
            </div>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              收起
            </Button>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-xs text-app-ink/60">地点</span>
              <select
                className="h-10 w-full rounded-xl border border-app-line/20 bg-white/70 px-3 text-sm outline-none transition focus:border-app-accent/60 focus:ring-2 focus:ring-app-accent/20"
                value={poiId}
                onChange={(e) => setPoiId(e.target.value)}
              >
                {pois.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid gap-2">
              <span className="text-xs text-app-ink/60">评分</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setScore(n as 1 | 2 | 3 | 4 | 5)}
                    className={cn(
                      'grid h-10 w-10 place-items-center rounded-xl text-sm font-semibold transition',
                      score >= n
                        ? 'bg-app-accent text-white'
                        : 'bg-app-ink/6 text-app-ink/70 hover:bg-app-ink/10',
                    )}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-3 grid gap-3">
            <Input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="标签（可选），用逗号分隔：出片,排队长,性价比..."
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="写点有用的：什么时候人少、怎么走、哪个角度最好看…"
              className="min-h-24 w-full resize-none rounded-2xl border border-app-line/20 bg-white/70 px-3 py-3 text-sm shadow-sm outline-none transition focus:border-app-accent/60 focus:ring-2 focus:ring-app-accent/20"
            />
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs text-app-ink/55">
                建议写具体：时间段、路线、窗口/角度、注意事项。
              </div>
              <Button
                variant="primary"
                onClick={() => {
                  if (!content.trim() || !poiId) return
                  addReview({
                    poiId,
                    nickname: '我',
                    score,
                    tags: tags
                      .split(',')
                      .map((t) => t.trim())
                      .filter(Boolean)
                      .slice(0, 5),
                    content,
                  })
                  setContent('')
                  setTags('')
                  setOpen(false)
                }}
              >
                发布
              </Button>
            </div>
          </div>
        </Card>
      ) : null}

      <div className="grid gap-3">
        {grouped.map((r) => (
          <PostRow key={r.id} reviewId={r.id} onOpenPoi={(id) => navigate(`/poi/${id}`)} />
        ))}
      </div>
    </div>
  )
}

function PostRow(props: { reviewId: string; onOpenPoi: (poiId: string) => void }) {
  const review = useCampusStore((s) => s.reviews.find((r) => r.id === props.reviewId))
  const poi = usePoiById(review?.poiId ?? '')
  if (!review || !poi) return null

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-sm font-medium">{review.nickname}</div>
            <span className="text-xs text-app-ink/50">{review.createdAt}</span>
          </div>
          <button
            type="button"
            onClick={() => props.onOpenPoi(poi.id)}
            className="mt-2 inline-flex items-center gap-2 rounded-xl bg-app-ink/6 px-3 py-2 text-sm text-app-ink/75 transition hover:bg-app-ink/10"
          >
            <MapPin className="h-4 w-4" />
            <span className="font-medium">{poi.name}</span>
            <span className="text-xs text-app-ink/55">查看地点卡片</span>
          </button>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-app-ink/6 px-3 py-2 text-xs text-app-ink/70">
          <Star className="h-4 w-4 text-app-accent" />
          <span className="font-semibold">{review.score}</span>
        </div>
      </div>

      <div className="mt-4 text-sm leading-relaxed text-app-ink/75">{review.content}</div>

      {review.tags.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {review.tags.map((t) => (
            <Pill key={`${review.id}_${t}`}>{t}</Pill>
          ))}
        </div>
      ) : null}
    </Card>
  )
}

