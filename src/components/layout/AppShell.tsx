import { Compass, Map as MapIcon, NotebookText, Salad, Sparkles } from 'lucide-react'
import { clsx } from 'clsx'
import { motion } from 'framer-motion'
import { ReactNode, useMemo } from 'react'

type NavItem = {
  key: string
  label: string
  path: string
  icon: ReactNode
}

export default function AppShell(props: {
  currentPath: string
  onNavigate: (path: string) => void
  children: ReactNode
}) {
  const nav = useMemo<NavItem[]>(
    () => [
      { key: 'home', label: '首页', path: '/', icon: <Compass className="h-4 w-4" /> },
      { key: 'map', label: '3D地图', path: '/map', icon: <MapIcon className="h-4 w-4" /> },
      { key: 'tasks', label: '新生清单', path: '/tasks', icon: <NotebookText className="h-4 w-4" /> },
      { key: 'food', label: '吃喝指南', path: '/food', icon: <Salad className="h-4 w-4" /> },
      { key: 'feed', label: '口碑打卡', path: '/feed', icon: <Sparkles className="h-4 w-4" /> },
    ],
    [],
  )

  return (
    <div className="min-h-dvh bg-app text-app-ink">
      <header className="sticky top-0 z-40 border-b border-app-line/70 bg-app/75 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-4">
          <button
            type="button"
            onClick={() => props.onNavigate('/')}
            className="group flex items-center gap-2 rounded-xl px-2 py-1 text-left transition hover:bg-app-ink/5"
          >
            <span className="relative grid h-8 w-8 place-items-center overflow-hidden rounded-xl bg-app-ink text-app">
              <span className="text-[11px] font-semibold tracking-wide">暖校</span>
            </span>
            <div className="leading-tight">
              <div className="font-display text-[15px] tracking-wide">校园生活指南</div>
              <div className="text-xs text-app-ink/60">地点内容底座 · 新生友好</div>
            </div>
          </button>

          <nav className="hidden items-center gap-1 md:flex">
            {nav.slice(1).map((item) => {
              const active = props.currentPath === item.path
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => props.onNavigate(item.path)}
                  className={clsx(
                    'relative flex items-center gap-2 rounded-full px-4 py-2 text-sm transition',
                    active
                      ? 'text-app-ink'
                      : 'text-app-ink/70 hover:bg-app-ink/5 hover:text-app-ink',
                  )}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {active ? (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 -z-10 rounded-full bg-app-ink/7"
                      transition={{ type: 'spring', stiffness: 420, damping: 40 }}
                    />
                  ) : null}
                </button>
              )
            })}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-5 pb-16 pt-8 md:pt-10">
        {props.children}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-app-line/70 bg-app/80 backdrop-blur md:hidden">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-5 px-2 py-2">
          {nav.map((item) => {
            const active = props.currentPath === item.path
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => props.onNavigate(item.path)}
                className={clsx(
                  'flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-[11px] transition',
                  active ? 'bg-app-ink/6 text-app-ink' : 'text-app-ink/60',
                )}
              >
                <span className={clsx('grid h-8 w-8 place-items-center rounded-xl', active ? 'bg-app-ink/6' : '')}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
