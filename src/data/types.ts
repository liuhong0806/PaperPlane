export type PoiCategory =
  | 'canteen'
  | 'scenery'
  | 'express'
  | 'service'
  | 'study'
  | 'building'

export type Poi = {
  id: string
  name: string
  category: PoiCategory
  summary: string
  rating?: number
  tags: string[]
  position: { x: number; y: number; z: number }
  size: { x: number; y: number; z: number }
}

export type Review = {
  id: string
  poiId: string
  nickname: string
  score: 1 | 2 | 3 | 4 | 5
  tags: string[]
  content: string
  createdAt: string
}

export type Task = {
  id: string
  group: string
  title: string
  description: string
  materials: string[]
  poiId: string
  tip?: string
}
