import { CameraControls, Html, RoundedBox, Text, useCursor } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import type { Poi, PoiCategory } from '@/data/types'
import ErrorBoundary from '@/components/ui/ErrorBoundary'

type SelectPayload = {
  poiId: string
}

const categoryColor: Record<PoiCategory, string> = {
  canteen: '#EC772E',
  scenery: '#175C4A',
  express: '#101C17',
  service: '#2A5E52',
  study: '#0E2E25',
  building: '#1A2A22',
}

function Ground() {
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.01, 0]}>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#f6f1e6" />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, 0]}>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial
          color="#fff"
          opacity={0.12}
          transparent
          roughness={1}
          metalness={0}
        />
      </mesh>
    </group>
  )
}

function PoiMesh(props: {
  poi: Poi
  active: boolean
  dimmed: boolean
  onSelect: (p: SelectPayload) => void
}) {
  const [hovered, setHovered] = useState(false)
  useCursor(hovered)

  const color = categoryColor[props.poi.category]
  const base = useMemo(() => new THREE.Color(color), [color])
  const tone = props.dimmed ? base.clone().lerp(new THREE.Color('#ffffff'), 0.65) : base

  return (
    <group
      position={[props.poi.position.x, props.poi.position.y, props.poi.position.z]}
      onPointerOver={(e) => {
        e.stopPropagation()
        setHovered(true)
      }}
      onPointerOut={() => setHovered(false)}
      onClick={(e) => {
        e.stopPropagation()
        props.onSelect({ poiId: props.poi.id })
      }}
    >
      <RoundedBox
        args={[props.poi.size.x, props.poi.size.y, props.poi.size.z]}
        radius={0.25}
        smoothness={5}
        position={[0, props.poi.size.y / 2, 0]}
      >
        <meshStandardMaterial
          color={tone}
          roughness={0.85}
          metalness={0.06}
          emissive={props.active ? new THREE.Color('#ffffff') : new THREE.Color('#000000')}
          emissiveIntensity={props.active ? 0.08 : hovered ? 0.03 : 0}
        />
      </RoundedBox>

      <mesh position={[0, props.poi.size.y + 0.55, 0]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color="#111c17" emissive="#111c17" emissiveIntensity={hovered ? 0.35 : 0.2} />
      </mesh>

      <Html center distanceFactor={18} position={[0, props.poi.size.y + 1.0, 0]} transform>
        <div
          style={{
            pointerEvents: 'none',
            transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
            transition: 'transform 220ms ease',
          }}
          className="rounded-full border border-app-line/20 bg-app/85 px-2.5 py-1 text-[11px] text-app-ink/80 shadow-sm backdrop-blur"
        >
          {props.poi.name}
        </div>
      </Html>
    </group>
  )
}

function Scene(props: {
  pois: Poi[]
  focusPoiId?: string | null
  activePoiId?: string | null
  filter: PoiCategory | 'all'
  onSelect: (p: SelectPayload) => void
}) {
  const cam = useRef<CameraControls | null>(null)
  const [ready, setReady] = useState(false)

  const filtered = useMemo(() => {
    if (props.filter === 'all') return props.pois
    return props.pois.filter((p) => p.category === props.filter)
  }, [props.filter, props.pois])

  const focusTarget = useMemo(() => {
    const id = props.focusPoiId || props.activePoiId
    if (!id) return null
    const poi = props.pois.find((p) => p.id === id)
    if (!poi) return null
    return poi
  }, [props.activePoiId, props.focusPoiId, props.pois])

  useEffect(() => {
    if (!ready || !focusTarget) return
    const t = focusTarget.position
    const s = focusTarget.size
    cam.current?.setLookAt(
      t.x + 8,
      Math.max(7, s.y * 3.2),
      t.z + 10,
      t.x,
      0.8,
      t.z,
      true,
    )
  }, [focusTarget, ready])

  return (
    <>
      <color attach="background" args={['#fbf8f1']} />
      <fog attach="fog" args={['#fbf8f1', 26, 78]} />

      <ambientLight intensity={0.75} />
      <directionalLight position={[12, 18, 8]} intensity={1.15} />
      <directionalLight position={[-10, 12, -6]} intensity={0.55} />

      <Ground />

      <group>
        {props.pois.map((poi) => {
          const dimmed = props.filter !== 'all' && poi.category !== props.filter
          const visible = props.filter === 'all' || poi.category === props.filter
          if (!visible) return null
          return (
            <PoiMesh
              key={poi.id}
              poi={poi}
              dimmed={dimmed}
              active={poi.id === props.activePoiId}
              onSelect={props.onSelect}
            />
          )
        })}
      </group>

      <Text
        position={[0, 0.02, -18]}
        rotation-x={-Math.PI / 2}
        fontSize={0.85}
        color="#111c17"
        anchorX="center"
        anchorY="middle"
      >
        新生友好  ·  可点地点看口碑
      </Text>

      <CameraControls
        ref={(r) => {
          cam.current = r
          if (r && !ready) setReady(true)
        }}
        maxDistance={62}
        minDistance={12}
        dollySpeed={0.4}
        smoothTime={0.25}
      />
    </>
  )
}

export default function CampusCanvas(props: {
  pois: Poi[]
  filter: PoiCategory | 'all'
  focusPoiId?: string | null
  activePoiId?: string | null
  onSelect: (p: SelectPayload) => void
}) {
  const [webglOk, setWebglOk] = useState(true)

  useEffect(() => {
    try {
      const c = document.createElement('canvas')
      const ok = Boolean(c.getContext('webgl2') || c.getContext('webgl'))
      setWebglOk(ok)
    } catch {
      setWebglOk(false)
    }
  }, [])

  if (!webglOk) {
    return (
      <div className="relative grid h-[70dvh] place-items-center overflow-hidden rounded-3xl border border-app-line/15 bg-white/55 px-6 text-center shadow-[0_30px_80px_-60px_rgb(0_0_0/0.45)]">
        <div className="max-w-md">
          <div className="font-display text-[20px] tracking-wide">当前设备不支持 3D 渲染</div>
          <div className="mt-3 text-sm leading-relaxed text-app-ink/65">
            可能是浏览器禁用了 WebGL 或硬件加速。你仍然可以使用其它入口（新生清单/吃喝指南/口碑打卡）。
          </div>
          <div className="mt-4 text-xs text-app-ink/55">
            建议：使用 Chrome/Edge 打开，并开启“硬件加速”后刷新页面。
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-[70dvh] overflow-hidden rounded-3xl border border-app-line/15 bg-white/50 shadow-[0_30px_80px_-60px_rgb(0_0_0/0.45)]">
      <ErrorBoundary
        fallback={
          <div className="grid h-full place-items-center px-6 text-center">
            <div className="max-w-md">
              <div className="font-display text-[20px] tracking-wide">3D 地图加载失败</div>
              <div className="mt-3 text-sm leading-relaxed text-app-ink/65">
                可能是浏览器 WebGL 环境异常。可以刷新重试，或先使用其它入口。
              </div>
            </div>
          </div>
        }
      >
        <Canvas
          camera={{ position: [16, 14, 18], fov: 45, near: 0.1, far: 200 }}
          dpr={[1, 1.7]}
        >
          <Suspense fallback={null}>
            <Scene
              pois={props.pois}
              filter={props.filter}
              focusPoiId={props.focusPoiId}
              activePoiId={props.activePoiId}
              onSelect={props.onSelect}
            />
          </Suspense>
        </Canvas>
      </ErrorBoundary>
    </div>
  )
}
