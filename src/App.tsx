import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import AppShell from '@/components/layout/AppShell'
import HomePage from '@/pages/HomePage'
import MapPage from '@/pages/MapPage'
import TasksPage from '@/pages/TasksPage'
import FoodPage from '@/pages/FoodPage'
import FeedPage from '@/pages/FeedPage'
import PoiPage from '@/pages/PoiPage'
import DeliveryPage from '@/pages/DeliveryPage'

export default function App() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <AppShell
      currentPath={location.pathname}
      onNavigate={(path) => navigate(path)}
    >
      <AnimatePresence mode="wait" initial={false}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<HomePage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/food" element={<FoodPage />} />
          <Route path="/feed" element={<FeedPage />} />
          <Route path="/delivery" element={<DeliveryPage />} />
          <Route path="/poi/:id" element={<PoiPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </AppShell>
  )
}
