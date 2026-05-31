import { create } from 'zustand'
import type { DeliveryOrder, DeliveryOrderStatus, DeliveryOrderType, RiderPosition, RiderProfile } from '@/data/types'
import { readJson, writeJson } from '@/utils/storage'

const LS_RIDER = 'campus_guide_delivery_rider'
const LS_ORDERS = 'campus_guide_delivery_orders'
const LS_RIDER_POS = 'campus_guide_delivery_rider_pos'

function nowStamp() {
  const d = new Date()
  const pad = (n: number) => `${n}`.padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

type State = {
  rider: RiderProfile | null
  riderPos: RiderPosition | null
  orders: DeliveryOrder[]

  setRider: (profile: RiderProfile) => void
  logoutRider: () => void

  createOrder: (payload: {
    type: DeliveryOrderType
    pickupPoiId: string
    dropoffPoiId: string
    note: string
    fee: number
  }) => void
  setOrderStatus: (id: string, status: DeliveryOrderStatus) => void
  acceptOrder: (id: string) => void

  setRiderPos: (pos: Omit<RiderPosition, 'updatedAt'>) => void
  clearRiderPos: () => void
}

function hydrate() {
  const rider = readJson<RiderProfile | null>(LS_RIDER, null)
  const orders = readJson<DeliveryOrder[]>(LS_ORDERS, [])
  const riderPos = readJson<RiderPosition | null>(LS_RIDER_POS, null)
  return { rider, orders, riderPos }
}

export const useDeliveryStore = create<State>((set, get) => {
  const h = hydrate()

  return {
    rider: h.rider,
    riderPos: h.riderPos,
    orders: h.orders,

    setRider: (profile) => {
      const next = { name: profile.name.trim(), phone: profile.phone.trim() }
      writeJson(LS_RIDER, next)
      set({ rider: next })
    },
    logoutRider: () => {
      localStorage.removeItem(LS_RIDER)
      set({ rider: null })
    },

    createOrder: (payload) => {
      const order: DeliveryOrder = {
        id: globalThis.crypto?.randomUUID?.() ?? `o_${Math.random().toString(16).slice(2)}`,
        type: payload.type,
        pickupPoiId: payload.pickupPoiId,
        dropoffPoiId: payload.dropoffPoiId,
        note: payload.note.trim(),
        fee: payload.fee,
        status: 'open',
        createdAt: nowStamp(),
        rider: null,
      }

      const next = [order, ...get().orders]
      writeJson(LS_ORDERS, next)
      set({ orders: next })
    },

    setOrderStatus: (id, status) => {
      const next = get().orders.map((o) => (o.id === id ? { ...o, status } : o))
      writeJson(LS_ORDERS, next)
      set({ orders: next })
    },

    acceptOrder: (id) => {
      const rider = get().rider
      if (!rider) return
      const active = get().orders.some((o) => o.rider && o.status !== 'done' && o.status !== 'cancelled')
      if (active) return
      const next = get().orders.map((o) => {
        if (o.id !== id) return o
        if (o.status !== 'open') return o
        return { ...o, status: 'accepted' as const, rider }
      })
      writeJson(LS_ORDERS, next)
      set({ orders: next })
    },

    setRiderPos: (pos) => {
      const next: RiderPosition = { ...pos, updatedAt: nowStamp() }
      writeJson(LS_RIDER_POS, next)
      set({ riderPos: next })
    },

    clearRiderPos: () => {
      localStorage.removeItem(LS_RIDER_POS)
      set({ riderPos: null })
    },
  }
})

export function maskPhone(phone: string) {
  const digits = phone.replace(/[^\d]/g, '')
  if (digits.length < 7) return phone
  return `${digits.slice(0, 3)}****${digits.slice(-4)}`
}

export function useActiveRiderOrder() {
  return useDeliveryStore((s) => s.orders.find((o) => o.rider && o.status !== 'done' && o.status !== 'cancelled') ?? null)
}

