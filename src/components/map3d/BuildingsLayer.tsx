import { useMemo } from 'react'
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import type { CampusBuildingsPayload } from '@/data/types'

function simplifyRing(ring: Array<[number, number]>) {
  if (ring.length <= 40) return ring
  const stride = Math.ceil(ring.length / 40)
  const out: Array<[number, number]> = []
  for (let i = 0; i < ring.length; i += stride) out.push(ring[i])
  const last = ring[ring.length - 1]
  if (out.length && (out[out.length - 1][0] !== last[0] || out[out.length - 1][1] !== last[1])) out.push(last)
  return out
}

function toShape(ring: Array<[number, number]>) {
  const s = new THREE.Shape()
  for (let i = 0; i < ring.length; i++) {
    const [x, z] = ring[i]
    if (i === 0) s.moveTo(x, z)
    else s.lineTo(x, z)
  }
  return s
}

export default function BuildingsLayer(props: { buildings: CampusBuildingsPayload }) {
  const merged = useMemo(() => {
    const geos: THREE.BufferGeometry[] = []
    const maxBuildings = 240

    for (const b of props.buildings.buildings.slice(0, maxBuildings)) {
      if (!b.rings?.length) continue
      const outer = b.rings[0]
      if (!outer || outer.length < 4) continue
      const ring = simplifyRing(outer)
      if (ring.length < 4) continue
      const shape = toShape(ring)
      const geo = new THREE.ExtrudeGeometry(shape, {
        depth: b.height,
        bevelEnabled: false,
        steps: 1,
      })
      geo.rotateX(-Math.PI / 2)
      geo.translate(0, 0, 0)
      geos.push(geo)
    }

    if (!geos.length) return null
    const m = mergeGeometries(geos, false)
    return m
  }, [props.buildings])

  if (!merged) return null

  return (
    <mesh geometry={merged} position={[0, 0, 0]}>
      <meshStandardMaterial color="#1a2a22" roughness={0.95} metalness={0.02} opacity={0.72} transparent />
    </mesh>
  )
}
