import { Bike, MapPinned, Navigation, User, UserCheck, LocateFixed } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import CampusCanvas from '@/components/map3d/CampusCanvas'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Pill from '@/components/ui/Pill'
import type { DeliveryOrder, DeliveryOrderType, Poi } from '@/data/types'
import { useCampusMapStore } from '@/store/useCampusMapStore'
import { useCampusStore } from '@/store/useCampusStore'
import { maskPhone, useActiveRiderOrder, useDeliveryStore } from '@/store/useDeliveryStore'
import { projectMeters } from '@/utils/geo'
import { cn } from '@/utils/cn'

type Mode = 'user' | 'rider'

const typeLabel: Record<DeliveryOrderType, string> = {
  campus_food: '校内食物/奶茶',
  gate_pickup: '校门口外卖代取',
}

export default function DeliveryPage() {
  const pois = useCampusStore((s) => s.pois)
  const buildings = useCampusMapStore((s) => s.buildings)
  const poiOverrides = useCampusMapStore((s) => s.poiOverrides)

  const rider = useDeliveryStore((s) => s.rider)
  const riderPos = useDeliveryStore((s) => s.riderPos)
  const setRider = useDeliveryStore((s) => s.setRider)
  const logoutRider = useDeliveryStore((s) => s.logoutRider)
  const createOrder = useDeliveryStore((s) => s.createOrder)
  const setOrderStatus = useDeliveryStore((s) => s.setOrderStatus)
  const acceptOrder = useDeliveryStore((s) => s.acceptOrder)
  const setRiderPos = useDeliveryStore((s) => s.setRiderPos)
  const clearRiderPos = useDeliveryStore((s) => s.clearRiderPos)
  const orders = useDeliveryStore((s) => s.orders)
  const active = useActiveRiderOrder()

  const [mode, setMode] = useState<Mode>('user')
  const [orderType, setOrderType] = useState<DeliveryOrderType>('campus_food')
  const [pickupPoiId, setPickupPoiId] = useState('')
  const [dropoffPoiId, setDropoffPoiId] = useState('')
  const [note, setNote] = useState('')
  const [fee, setFee] = useState(3)
  const [selectedPoiId, setSelectedPoiId] = useState<string | null>(null)

  const gates = useMemo(() => pois.filter((p) => p.id.startsWith('p_gate_')), [pois])
  const canteens = useMemo(() => pois.filter((p) => p.category === 'canteen'), [pois])
  const nonGates = useMemo(() => pois.filter((p) => !p.id.startsWith('p_gate_')), [pois])

  useEffect(() => {
    const nextPickup = orderType === 'gate_pickup'
      ? gates[0]?.id ?? ''
      : canteens[0]?.id ?? nonGates[0]?.id ?? ''
    if (!pickupPoiId) setPickupPoiId(nextPickup)
    if (!dropoffPoiId) setDropoffPoiId(nonGates[0]?.id ?? '')
  }, [canteens, dropoffPoiId, gates, nonGates, orderType, pickupPoiId])

  const focusPoiId = useMemo(() => {
    if (selectedPoiId) return selectedPoiId
    if (active) return active.dropoffPoiId
    return dropoffPoiId || pickupPoiId || null
  }, [active, dropoffPoiId, pickupPoiId, selectedPoiId])

  const markers = useMemo(() => {
    const out: Array<{ id: string; name: string; position: { x: number; y: number; z: number }; color: string; radius?: number }> = []

    const addPoi = (id: string, name: string, color: string, radius?: number) => {
      const poi = pois.find((p) => p.id === id)
      if (!poi) return
      const override = poiOverrides?.[poi.id]
      const pos = override ?? poi.position
      out.push({ id: `poi_${id}`, name, position: pos, color, radius })
    }

    if (active) {
      addPoi(active.pickupPoiId, '取货点', '#EC772E', 0.25)
      addPoi(active.dropoffPoiId, '送达点', '#175C4A', 0.25)
    } else {
      if (pickupPoiId) addPoi(pickupPoiId, '取货点', '#EC772E', 0.22)
      if (dropoffPoiId) addPoi(dropoffPoiId, '送达点', '#175C4A', 0.22)
    }

    if (riderPos) {
      out.push({
        id: 'rider_pos',
        name: '骑手',
        position: { x: riderPos.x, y: riderPos.y, z: riderPos.z },
        color: '#2563EB',
        radius: 0.2,
      })
    }

    return out
  }, [active, dropoffPoiId, pickupPoiId, poiOverrides, pois, riderPos])

  return (
    <div className="grid gap-5">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="font-display text-[26px] tracking-wide">校园配送</div>
          <div className="mt-1 text-sm text-app-ink/65">
            支持校内食物/奶茶与校门口外卖代取，骑手实名并可定位展示（演示版）。
          </div>
        </div>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Pill className="bg-app-ink/6">
              <Bike className="mr-1 inline-block h-3.5 w-3.5" />
              配送模式
            </Pill>
            <button
              type="button"
              onClick={() => setMode('user')}
              className={cn(
                'inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition',
                mode === 'user' ? 'bg-app-ink text-app' : 'bg-app-ink/6 text-app-ink/70 hover:bg-app-ink/10 hover:text-app-ink',
              )}
            >
              <User className="h-3.5 w-3.5" />
              用户
            </button>
            <button
              type="button"
              onClick={() => setMode('rider')}
              className={cn(
                'inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition',
                mode === 'rider' ? 'bg-app-ink text-app' : 'bg-app-ink/6 text-app-ink/70 hover:bg-app-ink/10 hover:text-app-ink',
              )}
            >
              <UserCheck className="h-3.5 w-3.5" />
              骑手
            </button>
          </div>
        </Card>
      </div>

      <CampusCanvas
        pois={pois}
        filter="all"
        buildings={buildings}
        poiOverrides={poiOverrides}
        focusPoiId={focusPoiId}
        activePoiId={selectedPoiId}
        markers={markers}
        onSelect={(p) => setSelectedPoiId(p.poiId)}
      />

      <div className="grid gap-4 md:grid-cols-2">
        {mode === 'user' ? (
          <UserPanel
            pois={pois}
            gates={gates}
            nonGates={nonGates}
            orderType={orderType}
            setOrderType={setOrderType}
            pickupPoiId={pickupPoiId}
            setPickupPoiId={setPickupPoiId}
            dropoffPoiId={dropoffPoiId}
            setDropoffPoiId={setDropoffPoiId}
            note={note}
            setNote={setNote}
            fee={fee}
            setFee={setFee}
            createOrder={createOrder}
            orders={orders}
            setOrderStatus={setOrderStatus}
          />
        ) : (
          <RiderPanel
            rider={rider}
            setRider={setRider}
            logoutRider={logoutRider}
            pois={pois}
            orders={orders}
            active={active}
            acceptOrder={acceptOrder}
            setOrderStatus={setOrderStatus}
            buildingsCenter={buildings?.center ?? null}
            setRiderPos={setRiderPos}
            clearRiderPos={clearRiderPos}
          />
        )}

        <Card className="p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="font-medium">规则与隐私</div>
            <Pill className="bg-app-ink/6">演示版</Pill>
          </div>
          <div className="mt-4 grid gap-3 text-sm text-app-ink/70">
            <div className="rounded-2xl border border-app-line/12 bg-white/55 px-4 py-3">
              骑手实名：姓名 + 手机号（对用户脱敏展示）。
            </div>
            <div className="rounded-2xl border border-app-line/12 bg-white/55 px-4 py-3">
              一个骑手同一时间只能接一单（避免抢单/压单）。
            </div>
            <div className="rounded-2xl border border-app-line/12 bg-white/55 px-4 py-3">
              下单者不收集手机号，避免隐私风险；可通过备注说明交接方式。
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

function UserPanel(props: {
  pois: Poi[]
  gates: Poi[]
  nonGates: Poi[]
  orderType: DeliveryOrderType
  setOrderType: (t: DeliveryOrderType) => void
  pickupPoiId: string
  setPickupPoiId: (id: string) => void
  dropoffPoiId: string
  setDropoffPoiId: (id: string) => void
  note: string
  setNote: (v: string) => void
  fee: number
  setFee: (v: number) => void
  createOrder: (p: { type: DeliveryOrderType; pickupPoiId: string; dropoffPoiId: string; note: string; fee: number }) => void
  orders: DeliveryOrder[]
  setOrderStatus: (id: string, status: DeliveryOrder['status']) => void
}) {
  const pickupOptions = props.orderType === 'gate_pickup' ? props.gates : props.pois.filter((p) => p.category === 'canteen')
  const dropoffOptions = props.nonGates

  const canSubmit = Boolean(props.pickupPoiId && props.dropoffPoiId && props.pickupPoiId !== props.dropoffPoiId)

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="font-medium">下单</div>
        <Pill className="bg-app-ink/6">用户端</Pill>
      </div>

      <div className="mt-4 grid gap-3">
        <select
          className="h-10 w-full rounded-xl border border-app-line/20 bg-white/70 px-3 text-sm outline-none transition focus:border-app-accent/60 focus:ring-2 focus:ring-app-accent/20"
          value={props.orderType}
          onChange={(e) => props.setOrderType(e.target.value as DeliveryOrderType)}
        >
          <option value="campus_food">{typeLabel.campus_food}</option>
          <option value="gate_pickup">{typeLabel.gate_pickup}</option>
        </select>

        <div className="grid gap-2 md:grid-cols-2">
          <select
            className="h-10 w-full rounded-xl border border-app-line/20 bg-white/70 px-3 text-sm outline-none transition focus:border-app-accent/60 focus:ring-2 focus:ring-app-accent/20"
            value={props.pickupPoiId}
            onChange={(e) => props.setPickupPoiId(e.target.value)}
          >
            {pickupOptions.map((p) => (
              <option key={p.id} value={p.id}>
                取货：{p.name}
              </option>
            ))}
          </select>
          <select
            className="h-10 w-full rounded-xl border border-app-line/20 bg-white/70 px-3 text-sm outline-none transition focus:border-app-accent/60 focus:ring-2 focus:ring-app-accent/20"
            value={props.dropoffPoiId}
            onChange={(e) => props.setDropoffPoiId(e.target.value)}
          >
            {dropoffOptions.map((p) => (
              <option key={p.id} value={p.id}>
                送达：{p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-2 md:grid-cols-[1fr_auto] md:items-center">
          <Input
            value={props.note}
            onChange={(e) => props.setNote(e.target.value)}
            placeholder="备注：外卖在门口左侧/到宿舍楼下电话不方便…"
          />
          <div className="flex items-center gap-2">
            <div className="text-xs text-app-ink/55">跑腿费</div>
            <Input
              className="w-24"
              value={`${props.fee}`}
              inputMode="numeric"
              onChange={(e) => props.setFee(Number(e.target.value || 0))}
            />
          </div>
        </div>

        <Button
          variant="primary"
          disabled={!canSubmit}
          onClick={() => {
            if (!canSubmit) return
            props.createOrder({
              type: props.orderType,
              pickupPoiId: props.pickupPoiId,
              dropoffPoiId: props.dropoffPoiId,
              note: props.note,
              fee: props.fee,
            })
            props.setNote('')
          }}
        >
          <Navigation className="h-4 w-4" />
          发布订单
        </Button>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-medium">我的订单</div>
          <Pill className="bg-app-ink/6">{props.orders.length}</Pill>
        </div>
        <div className="mt-3 grid gap-2">
          {props.orders.map((o) => (
            <OrderRow
              key={o.id}
              order={o}
              onCancel={() => props.setOrderStatus(o.id, 'cancelled')}
              canCancel={o.status === 'open'}
            />
          ))}
          {!props.orders.length ? (
            <div className="rounded-2xl border border-app-line/12 bg-white/55 px-4 py-4 text-sm text-app-ink/60">
              还没有订单，先发一个试试。
            </div>
          ) : null}
        </div>
      </div>
    </Card>
  )
}

function RiderPanel(props: {
  rider: { name: string; phone: string } | null
  setRider: (p: { name: string; phone: string }) => void
  logoutRider: () => void
  pois: Poi[]
  orders: DeliveryOrder[]
  active: DeliveryOrder | null
  acceptOrder: (id: string) => void
  setOrderStatus: (id: string, status: DeliveryOrder['status']) => void
  buildingsCenter: { lat: number; lon: number } | null
  setRiderPos: (pos: { x: number; y: number; z: number }) => void
  clearRiderPos: () => void
}) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [geoError, setGeoError] = useState<string | null>(null)
  const watchId = useRef<number | null>(null)
  const simulateTimer = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (watchId.current != null) navigator.geolocation.clearWatch(watchId.current)
      if (simulateTimer.current != null) window.clearInterval(simulateTimer.current)
    }
  }, [])

  const openOrders = useMemo(() => props.orders.filter((o) => o.status === 'open'), [props.orders])
  const canAccept = Boolean(props.rider && !props.active)

  const pickupName = (id: string) => props.pois.find((p) => p.id === id)?.name ?? '—'

  const startWatch = () => {
    setGeoError(null)
    if (!navigator.geolocation) {
      setGeoError('当前浏览器不支持定位。')
      return
    }
    if (watchId.current != null) navigator.geolocation.clearWatch(watchId.current)
    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        if (!props.buildingsCenter) return
        const m = projectMeters(props.buildingsCenter, pos.coords.latitude, pos.coords.longitude)
        props.setRiderPos({ x: m.x, y: 0, z: m.z })
      },
      () => {
        setGeoError('定位失败或未授权，可用“模拟移动”用于演示。')
      },
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 8000 },
    )
  }

  const simulate = () => {
    if (!props.active) return
    const pickup = props.pois.find((p) => p.id === props.active!.pickupPoiId)
    const dropoff = props.pois.find((p) => p.id === props.active!.dropoffPoiId)
    if (!pickup || !dropoff) return
    const a = pickup.position
    const b = dropoff.position
    let t = 0
    if (simulateTimer.current != null) window.clearInterval(simulateTimer.current)
    simulateTimer.current = window.setInterval(() => {
      t = Math.min(1, t + 0.02)
      const x = a.x + (b.x - a.x) * t
      const z = a.z + (b.z - a.z) * t
      props.setRiderPos({ x, y: 0, z })
      if (t >= 1 && simulateTimer.current != null) window.clearInterval(simulateTimer.current)
    }, 250)
  }

  if (!props.rider) {
    const ok = name.trim().length >= 2 && phone.replace(/[^\d]/g, '').length >= 7
    return (
      <Card className="p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="font-medium">骑手实名</div>
          <Pill className="bg-app-ink/6">骑手端</Pill>
        </div>
        <div className="mt-4 grid gap-3">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="真实姓名" />
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="手机号（仅用于联系，展示会脱敏）" />
          <Button
            variant="primary"
            disabled={!ok}
            onClick={() => {
              if (!ok) return
              props.setRider({ name, phone })
            }}
          >
            <UserCheck className="h-4 w-4" />
            完成实名
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-medium">骑手面板</div>
          <div className="mt-1 text-sm text-app-ink/65">
            {props.rider.name} · {maskPhone(props.rider.phone)}
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={props.logoutRider}>
          退出
        </Button>
      </div>

      {props.active ? (
        <div className="mt-4 rounded-2xl border border-app-line/12 bg-white/55 px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-medium">当前订单</div>
            <Pill className="bg-app-ink/6">{statusLabel(props.active.status)}</Pill>
          </div>
          <div className="mt-3 grid gap-1 text-sm text-app-ink/70">
            <div>类型：{typeLabel[props.active.type]}</div>
            <div>取货：{pickupName(props.active.pickupPoiId)}</div>
            <div>送达：{pickupName(props.active.dropoffPoiId)}</div>
            <div>跑腿费：{props.active.fee} 元</div>
            {props.active.note ? <div>备注：{props.active.note}</div> : null}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {props.active.status === 'accepted' ? (
              <Button variant="primary" onClick={() => props.setOrderStatus(props.active!.id, 'delivering')}>
                <MapPinned className="h-4 w-4" />
                开始配送
              </Button>
            ) : null}
            {props.active.status === 'delivering' ? (
              <Button variant="primary" onClick={() => props.setOrderStatus(props.active!.id, 'done')}>
                完成送达
              </Button>
            ) : null}
            <Button variant="soft" onClick={startWatch}>
              <LocateFixed className="h-4 w-4" />
              开启定位
            </Button>
            <Button variant="ghost" onClick={simulate}>
              模拟移动
            </Button>
            <Button variant="ghost" onClick={props.clearRiderPos}>
              清除位置
            </Button>
          </div>
          {geoError ? (
            <div className="mt-3 rounded-2xl border border-app-line/12 bg-app/70 px-3 py-2 text-xs text-app-ink/65">
              {geoError}
            </div>
          ) : null}
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-app-line/12 bg-white/55 px-4 py-4 text-sm text-app-ink/60">
          当前没有接单。
        </div>
      )}

      <div className="mt-6">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-medium">待接订单</div>
          <Pill className="bg-app-ink/6">{openOrders.length}</Pill>
        </div>
        <div className="mt-3 grid gap-2">
          {openOrders.map((o) => (
            <div key={o.id} className="rounded-2xl border border-app-line/12 bg-white/55 px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-medium">{typeLabel[o.type]}</div>
                <Pill className="bg-app-ink/6">{o.fee} 元</Pill>
              </div>
              <div className="mt-2 text-sm text-app-ink/70">
                {pickupName(o.pickupPoiId)} → {pickupName(o.dropoffPoiId)}
              </div>
              {o.note ? (
                <div className="mt-2 text-xs text-app-ink/55">备注：{o.note}</div>
              ) : null}
              <div className="mt-3 flex items-center gap-2">
                <Button
                  variant="primary"
                  disabled={!canAccept}
                  onClick={() => props.acceptOrder(o.id)}
                >
                  接单
                </Button>
                {!canAccept ? (
                  <div className="text-xs text-app-ink/55">同一时间只能接一单</div>
                ) : null}
              </div>
            </div>
          ))}
          {!openOrders.length ? (
            <div className="rounded-2xl border border-app-line/12 bg-white/55 px-4 py-4 text-sm text-app-ink/60">
              暂无可接订单。
            </div>
          ) : null}
        </div>
      </div>
    </Card>
  )
}

function OrderRow(props: {
  order: DeliveryOrder
  canCancel: boolean
  onCancel: () => void
}) {
  return (
    <div className="rounded-2xl border border-app-line/12 bg-white/55 px-4 py-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-medium">{typeLabel[props.order.type]}</div>
          <div className="mt-1 text-xs text-app-ink/55">{props.order.createdAt}</div>
        </div>
        <Pill className="bg-app-ink/6">{statusLabel(props.order.status)}</Pill>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Pill className="bg-app-ink/6">{props.order.fee} 元</Pill>
        {props.order.rider ? (
          <Pill className="bg-app-ink/6">
            骑手：{props.order.rider.name} {maskPhone(props.order.rider.phone)}
          </Pill>
        ) : null}
      </div>
      {props.canCancel ? (
        <div className="mt-3">
          <Button size="sm" variant="ghost" onClick={props.onCancel}>
            取消
          </Button>
        </div>
      ) : null}
    </div>
  )
}

function statusLabel(status: DeliveryOrder['status']) {
  if (status === 'open') return '待接单'
  if (status === 'accepted') return '已接单'
  if (status === 'delivering') return '配送中'
  if (status === 'done') return '已完成'
  return '已取消'
}

