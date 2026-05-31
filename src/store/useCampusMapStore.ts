import { create } from 'zustand'
import type { CampusBuildingsPayload } from '@/data/types'
import { readJson, writeJson } from '@/utils/storage'

const LS_BUILDINGS = 'campus_guide_buildings'
const LS_POI_OVERRIDES = 'campus_guide_poi_overrides'

type PoiOverride = Record<string, { x: number; y: number; z: number }>

type State = {
  buildings: CampusBuildingsPayload | null
  poiOverrides: PoiOverride
  setBuildings: (payload: CampusBuildingsPayload | null) => void
  setPoiOverride: (poiId: string, pos: { x: number; y: number; z: number }) => void
  clearPoiOverride: (poiId: string) => void
}

export const useCampusMapStore = create<State>((set, get) => ({
  buildings: readJson<CampusBuildingsPayload | null>(LS_BUILDINGS, null),
  poiOverrides: readJson<PoiOverride>(LS_POI_OVERRIDES, {}),

  setBuildings: (payload) => {
    writeJson(LS_BUILDINGS, payload)
    set({ buildings: payload })
  },

  setPoiOverride: (poiId, pos) => {
    const next = { ...get().poiOverrides, [poiId]: pos }
    writeJson(LS_POI_OVERRIDES, next)
    set({ poiOverrides: next })
  },

  clearPoiOverride: (poiId) => {
    const next = { ...get().poiOverrides }
    delete next[poiId]
    writeJson(LS_POI_OVERRIDES, next)
    set({ poiOverrides: next })
  },
}))

