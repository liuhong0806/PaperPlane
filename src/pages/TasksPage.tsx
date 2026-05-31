import { ChevronRight, MapPinned, CheckCircle2, Circle } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Pill from '@/components/ui/Pill'
import { useCampusStore, usePoiById } from '@/store/useCampusStore'
import { cn } from '@/utils/cn'
import { X } from 'lucide-react'

export default function TasksPage() {
  const navigate = useNavigate()
  const tasks = useCampusStore((s) => s.tasks)
  const taskDone = useCampusStore((s) => s.taskDone)
  const toggleTask = useCampusStore((s) => s.toggleTask)
  const [openId, setOpenId] = useState<string | null>(null)

  const grouped = useMemo(() => {
    const map = new Map<string, typeof tasks>()
    for (const t of tasks) {
      const list = map.get(t.group) ?? []
      list.push(t)
      map.set(t.group, list)
    }
    return [...map.entries()]
  }, [tasks])

  const doneCount = Object.keys(taskDone).length
  const total = tasks.length

  return (
    <div className="grid gap-5">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="font-display text-[26px] tracking-wide">新生任务清单</div>
          <div className="mt-1 text-sm text-app-ink/65">
            每条任务都绑定地点：点“去这里”直接跳到 3D 地图定位。
          </div>
        </div>
        <Card className="p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-medium">进度</div>
            <Pill className="bg-app-ink/6">{doneCount}/{total}</Pill>
          </div>
          <div className="mt-3 h-2 w-56 overflow-hidden rounded-full bg-app-ink/6">
            <div
              className="h-full rounded-full bg-app-accent transition-all"
              style={{ width: `${total === 0 ? 0 : (doneCount / total) * 100}%` }}
            />
          </div>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {grouped.map(([group, list]) => (
          <Card key={group} className="p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="font-medium">{group}</div>
              <Pill className="bg-app-ink/6">
                {list.filter((t) => taskDone[t.id]).length}/{list.length}
              </Pill>
            </div>

            <div className="mt-4 grid gap-2">
              {list.map((t) => {
                const done = Boolean(taskDone[t.id])
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setOpenId(t.id)}
                    className="group flex w-full items-center justify-between gap-3 rounded-2xl border border-app-line/10 bg-white/55 px-4 py-3 text-left transition hover:border-app-line/20 hover:bg-white/70"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className={cn('grid h-9 w-9 place-items-center rounded-xl', done ? 'bg-emerald-600 text-white' : 'bg-app-ink/6 text-app-ink/70')}>
                        {done ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                      </span>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">
                          {t.title}
                        </div>
                        <div className="mt-1 truncate text-xs text-app-ink/55">
                          {t.tip ?? t.description}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-app-ink/40 transition group-hover:translate-x-0.5 group-hover:text-app-ink/65" />
                  </button>
                )
              })}
            </div>
          </Card>
        ))}
      </div>

      <TaskSheet
        taskId={openId}
        onClose={() => setOpenId(null)}
        onGo={(poiId) => navigate(`/map?focus=${encodeURIComponent(poiId)}`)}
        onToggle={(taskId) => toggleTask(taskId)}
      />
    </div>
  )
}

function TaskSheet(props: {
  taskId: string | null
  onClose: () => void
  onGo: (poiId: string) => void
  onToggle: (taskId: string) => void
}) {
  const task = useCampusStore((s) => s.tasks.find((t) => t.id === props.taskId))
  const done = useCampusStore((s) => (props.taskId ? Boolean(s.taskDone[props.taskId]) : false))
  const poi = usePoiById(task?.poiId ?? '')

  if (!task) return null

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={props.onClose} />
      <div className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-6xl px-4 pb-4 md:inset-y-0 md:right-0 md:left-auto md:w-[520px] md:px-0 md:pb-0">
        <Card className="max-h-[82dvh] overflow-hidden rounded-3xl border-app-line/15 bg-white md:mt-20 md:max-h-[calc(100dvh-6rem)]">
          <div className="flex items-start justify-between gap-3 border-b border-app-line/10 px-5 py-4">
            <div className="min-w-0">
              <div className="font-display text-[18px] tracking-wide">{task.title}</div>
              <div className="mt-1 text-sm text-app-ink/65">
                {poi ? `关联地点：${poi.name}` : '关联地点：—'}
              </div>
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
            <div className="rounded-2xl border border-app-line/12 bg-app-ink/3 p-4">
              <div className="text-sm text-app-ink/75">{task.description}</div>
              {task.tip ? (
                <div className="mt-3 rounded-2xl bg-app-ink/6 px-3 py-2 text-xs text-app-ink/65">
                  提示：{task.tip}
                </div>
              ) : null}
            </div>

            <div className="mt-4">
              <div className="text-sm font-medium">材料清单</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {task.materials.map((m) => (
                  <Pill key={m}>{m}</Pill>
                ))}
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <Button variant="primary" onClick={() => props.onToggle(task.id)}>
                {done ? '标记未完成' : '标记已完成'}
              </Button>
              <Button
                variant="soft"
                onClick={() => {
                  props.onClose()
                  props.onGo(task.poiId)
                }}
              >
                <MapPinned className="h-4 w-4" />
                去这里（3D地图）
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
