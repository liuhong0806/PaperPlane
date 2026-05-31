import type { CampusBuilding, CampusBuildingsPayload } from '@/data/types'

const R = 6378137
const S = 0.03

export function projectMeters(
  center: { lat: number; lon: number },
  lat: number,
  lon: number,
) {
  const dLat = ((lat - center.lat) * Math.PI) / 180
  const dLon = ((lon - center.lon) * Math.PI) / 180
  const x = dLon * Math.cos((center.lat * Math.PI) / 180) * R * S
  const z = -dLat * R * S
  return { x, z }
}

export function estimateHeightFromTags(tags: Record<string, string> | undefined) {
  const levelsRaw = tags?.['building:levels']
  const levels = levelsRaw ? Number(levelsRaw) : NaN
  if (!Number.isNaN(levels) && levels > 0) return Math.min(48, Math.max(6, levels * 3.2))
  const hRaw = tags?.height
  const h = hRaw ? Number(String(hRaw).replace(/[^\d.]/g, '')) : NaN
  if (!Number.isNaN(h) && h > 0) return Math.min(60, Math.max(5, h))
  return 10
}

type OverpassWay = {
  type: 'way'
  id: number
  tags?: Record<string, string>
  geometry?: Array<{ lat: number; lon: number }>
}

export async function fetchCampusBuildingsFromOverpass(args: {
  center: { lat: number; lon: number }
  radiusMeters: number
  endpoint?: string
}) {
  const query = [
    '[out:json][timeout:25];',
    `way(around:${Math.round(args.radiusMeters)},${args.center.lat},${args.center.lon})["building"];`,
    'out tags geom;',
  ].join('')

  const endpoint = args.endpoint ?? 'https://overpass-api.de/api/interpreter'
  const resp = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
    },
    body: new URLSearchParams({ data: query }),
  })
  if (!resp.ok) throw new Error(`overpass_http_${resp.status}`)
  const json = (await resp.json()) as { elements?: OverpassWay[] }
  const elements = json.elements ?? []

  const buildings: CampusBuilding[] = []
  for (const el of elements) {
    if (el.type !== 'way') continue
    const ring = (el.geometry ?? []).map((p) => {
      const m = projectMeters(args.center, p.lat, p.lon)
      return [m.x, m.z] as [number, number]
    })
    if (ring.length < 3) continue
    const first = ring[0]
    const last = ring[ring.length - 1]
    if (first[0] !== last[0] || first[1] !== last[1]) ring.push(first)

    buildings.push({
      id: `w${el.id}`,
      name: el.tags?.name,
      height: estimateHeightFromTags(el.tags),
      rings: [ring],
    })
  }

  const payload: CampusBuildingsPayload = { center: args.center, buildings }
  return payload
}
