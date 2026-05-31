import { useMemo } from 'react'
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import type { CampusBuildingsPayload } from '@/data/types'

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

    for (const b of props.buildings.buildings) {
      if (!b.rings?.length) continue
      const outer = b.rings[0]
      if (!outer || outer.length < 4) continue
      const shape = toShape(outer)
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
