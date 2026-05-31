import { useNavigate, useParams } from 'react-router-dom'
import PoiSheet from '@/components/poi/PoiSheet'

export default function PoiPage() {
  const navigate = useNavigate()
  const params = useParams()
  const id = params.id ?? null

  return (
    <PoiSheet
      poiId={id}
      onClose={() => navigate(-1)}
      onGoMap={(poiId) => navigate(`/map?focus=${encodeURIComponent(poiId)}`)}
    />
  )
}

