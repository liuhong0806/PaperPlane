import { Heart, MapPinned, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { PoiCategory } from '@/data/types'
import { cn } from '@/utils/cn'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Pill from '@/components/ui/Pill'
import RatingBadge from '@/components/poi/RatingBadge'
import { useCampusStore, usePoiById, usePoiRating } from '@/store/useCampusStore'

const categoryName: Record<PoiCategory, string> = {
  canteen: '食堂',
  scenery: '风景点',
  express: '快递点',
  service: '办事点',
  study: '自习点',
  building: '建筑',
  sports: '运动场地',
}

function scoreHint(score: number) {
  if (score >= 5) return '封神'
  if (score >= 4) return '很可以'
  if (score >= 3) return '还行'
  if (score >= 2) return '一般'
  return '避雷'
}

export default function PoiSheet(props: {
  poiId: string | null
  onClose: () => void
  onGoMap?: (poiId: string) => void
}) {
  const poi = usePoiById(props.poiId ?? '')
  const rating = usePoiRating(props.poiId ?? '')
  const favorites = useCampusStore((s) => s.favorites)
  const toggleFavorite = useCampusStore((s) => s.toggleFavorite)
  const reviews = useCampusStore((s) => s.reviews)
  const addReview = useCampusStore((s) => s.addReview)

  const list = useMemo(() => {
    if (!props.poiId) return []
    return reviews.filter((r) => r.poiId === props.poiId)
  }, [props.poiId, reviews])

  const [writing, setWriting] = useState(false)
  const [score, setScore] = useState<1 | 2 | 3 | 4 | 5>(5)
  const [content, setContent] = useState('')
  const [tags, setTags] = useState<string>('')

  const open = Boolean(props.poiId && poi)
  if (!open) return null

  const isFav = Boolean(favorites[poi!.id])

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/45"
        onClick={props.onClose}
      />

      <div className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-6xl px-4 pb-4 md:inset-y-0 md:right-0 md:left-auto md:w-[460px] md:px-0 md:pb-0">
        <Card className="relative max-h-[82dvh] overflow-hidden rounded-3xl border border-app-line/15 bg-white md:mt-20 md:max-h-[calc(100dvh-6rem)]">
          <div className="flex items-start justify-between gap-3 border-b border-app-line/10 px-5 py-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <div className="font-display text-[18px] tracking-wide">
                  {poi!.name}
                </div>
                <Pill className="bg-app-ink/5">
                  {categoryName[poi!.category]}
                </Pill>
                <RatingBadge value={rating} />
              </div>
              <div className="mt-2 text-sm text-app-ink/65">{poi!.summary}</div>
            </div>
            <button
              type="button"
              onClick={props.onClose}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-app-ink/6 text-app-ink transition hover:bg-app-ink/10"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="max-h-[calc(82dvh-70px)] overflow-y-auto px-5 pb-5 pt-4 md:max-h-[calc(100dvh-6rem-70px)]">
            {poi!.photos?.length ? (
              <div className="mb-4 overflow-hidden rounded-2xl border border-app-line/12 bg-app-ink/3">
                <img
                  src={poi!.photos[0]}
                  alt={poi!.name}
                  className="h-44 w-full object-cover md:h-52"
                  loading="lazy"
                />
              </div>
            ) : null}

            <div className="flex flex-wrap items-center gap-2">
              {poi!.tags.map((t) => (
                <Pill key={t}>{t}</Pill>
              ))}
              <div className="ml-auto flex items-center gap-2">
                <Button
                  size="sm"
                  variant={isFav ? 'primary' : 'soft'}
                  onClick={() => toggleFavorite(poi!.id)}
                >
                  <Heart className="h-4 w-4" />
                  <span>{isFav ? '已收藏' : '收藏'}</span>
                </Button>
                <Button
                  size="sm"
                  variant="soft"
                  onClick={() => props.onGoMap?.(poi!.id)}
                >
                  <MapPinned className="h-4 w-4" />
                  <span>去这里</span>
                </Button>
              </div>
            </div>

            <div className="mt-5">
              <div className="flex items-center justify-between gap-3">
                <div className="font-medium">口碑精选</div>
                <Button size="sm" variant={list.length === 0 ? 'primary' : 'ghost'} onClick={() => setWriting((v) => !v)}>
                  {writing ? '收起' : '写评价'}
                </Button>
              </div>

              <div className="mt-3 space-y-3">
                {list.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-app-line/20 bg-app-ink/3 px-4 py-5 text-sm text-app-ink/65">
                    暂无评价，写一条就能生成评分并同步到食堂榜单。
                  </div>
                ) : (
                  list.slice(0, 6).map((r) => (
                    <div
                      key={r.id}
                      className="rounded-2xl border border-app-line/12 bg-white px-4 py-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-sm font-medium">{r.nickname}</div>
                        <div className="flex items-center gap-2 text-xs text-app-ink/60">
                          <span className="rounded-full bg-app-ink/6 px-2 py-1">
                            {r.score}·{scoreHint(r.score)}
                          </span>
                          <span>{r.createdAt}</span>
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-app-ink/75">{r.content}</div>
                      {r.tags.length ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {r.tags.map((t) => (
                            <Pill key={`${r.id}_${t}`} className="bg-app-ink/5">
                              {t}
                            </Pill>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ))
                )}
              </div>

              {writing ? (
                <div className="mt-4 rounded-2xl border border-app-line/15 bg-app-ink/3 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="text-sm font-medium">评分</div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setScore(n as 1 | 2 | 3 | 4 | 5)}
                          className={cn(
                            'grid h-9 w-9 place-items-center rounded-xl text-sm font-semibold transition',
                            score >= n
                              ? 'bg-[rgb(var(--app-accent))] text-white'
                              : 'bg-app-ink/6 text-app-ink/70 hover:bg-app-ink/10',
                          )}
                        >
                          {n}
                        </button>
                      ))}
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
                      placeholder="说点实用的：什么时候人少、哪一口好吃、哪儿拍照更出片..."
                      className="min-h-24 w-full resize-none rounded-2xl border border-app-line/20 bg-white px-3 py-3 text-sm text-app-ink shadow-sm outline-none transition focus:border-[rgb(var(--app-accent)/0.55)] focus:ring-2 focus:ring-[rgb(var(--app-accent)/0.18)]"
                    />
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-xs text-app-ink/55">发布后会更新该地点评分，并出现在口碑页。</div>
                      <Button
                        variant="primary"
                        onClick={() => {
                          if (!content.trim()) return
                          addReview({
                            poiId: poi!.id,
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
                          setWriting(false)
                        }}
                      >
                        发布
                      </Button>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
