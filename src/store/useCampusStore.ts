import { create } from 'zustand'
import type { Poi, Review, Task } from '@/data/types'
import { mockPois, mockReviews, mockTasks } from '@/data/mock'
import { readJson, writeJson } from '@/utils/storage'

const LS_USER = 'campus_guide_user'
const LS_FAVORITES = 'campus_guide_favorites'
const LS_REVIEWS = 'campus_guide_reviews'
const LS_TASKS = 'campus_guide_tasks'

type User = {
  nickname: string
}

type CampusState = {
  user: User | null
  pois: Poi[]
  tasks: Task[]
  reviews: Review[]
  favorites: Record<string, true>
  taskDone: Record<string, true>

  ensureUser: (nickname?: string) => User
  logout: () => void

  toggleFavorite: (poiId: string) => void
  addReview: (payload: Omit<Review, 'id' | 'createdAt'>) => void
  toggleTask: (taskId: string) => void
}

function nowStamp() {
  const d = new Date()
  const pad = (n: number) => `${n}`.padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function calcPoiRating(poiId: string, reviews: Review[]) {
  const list = reviews.filter((r) => r.poiId === poiId)
  if (list.length === 0) return 0
  const sum = list.reduce((acc, r) => acc + r.score, 0)
  return Math.round((sum / list.length) * 10) / 10
}

function hydrate() {
  const user = readJson<User | null>(LS_USER, null)
  const favorites = readJson<Record<string, true>>(LS_FAVORITES, {})
  const taskDone = readJson<Record<string, true>>(LS_TASKS, {})
  const reviews = readJson<Review[]>(LS_REVIEWS, mockReviews)

  const pois = mockPois.map((p) => ({ ...p }))
  return { user, favorites, taskDone, reviews, pois }
}

export const useCampusStore = create<CampusState>((set, get) => {
  const h = hydrate()
  const tasks = mockTasks

  return {
    user: h.user,
    pois: h.pois,
    tasks,
    reviews: h.reviews,
    favorites: h.favorites,
    taskDone: h.taskDone,

    ensureUser: (nickname) => {
      const existing = get().user
      if (existing) return existing
      const next = { nickname: nickname?.trim() || `同学${Math.floor(Math.random() * 900 + 100)}` }
      writeJson(LS_USER, next)
      set({ user: next })
      return next
    },
    logout: () => {
      localStorage.removeItem(LS_USER)
      set({ user: null })
    },

    toggleFavorite: (poiId) => {
      const next = { ...get().favorites }
      if (next[poiId]) delete next[poiId]
      else next[poiId] = true
      writeJson(LS_FAVORITES, next)
      set({ favorites: next })
    },

    addReview: (payload) => {
      const user = get().ensureUser(payload.nickname)
      const review: Review = {
        id: globalThis.crypto?.randomUUID?.() ?? `r_${Math.random().toString(16).slice(2)}`,
        poiId: payload.poiId,
        nickname: user.nickname,
        score: payload.score,
        tags: payload.tags,
        content: payload.content.trim(),
        createdAt: nowStamp(),
      }
      const nextReviews = [review, ...get().reviews]
      writeJson(LS_REVIEWS, nextReviews)

      const nextPois = get().pois.map((p) => {
        if (p.id !== payload.poiId) return p
        const rating = calcPoiRating(p.id, nextReviews)
        return { ...p, rating }
      })

      set({ reviews: nextReviews, pois: nextPois })
    },

    toggleTask: (taskId) => {
      const next = { ...get().taskDone }
      if (next[taskId]) delete next[taskId]
      else next[taskId] = true
      writeJson(LS_TASKS, next)
      set({ taskDone: next })
    },
  }
})

export function usePoiById(id: string) {
  return useCampusStore((s) => s.pois.find((p) => p.id === id))
}

export function usePoiRating(poiId: string) {
  return useCampusStore((s) => {
    const list = s.reviews.filter((r) => r.poiId === poiId)
    if (list.length === 0) return 0
    const sum = list.reduce((acc, r) => acc + r.score, 0)
    return Math.round((sum / list.length) * 10) / 10
  })
}
