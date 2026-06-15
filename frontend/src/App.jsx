import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import MainLayout from './layouts/MainLayout'
import HomePage from './pages/HomePage'
import UniformPage from './pages/UniformPage'
import RanksPage from './pages/RanksPage'
import CadetsPage from './pages/CadetsPage'
import AttendancePage from './pages/AttendancePage'
import CampsPage from './pages/CampsPage'
import CampGalleryPage from './pages/CampGalleryPage'
import AdminDashboard from './pages/AdminDashboard'
import NominalRollPage from './pages/NominalRollPage'
import ComingSoonPage from './pages/ComingSoonPage'
import AuthPage from './pages/AuthPage'
import CadetDashboard from './pages/CadetDashboard'
import MakeAdminPage from './pages/MakeAdminPage'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Auth page — no layout (standalone glassmorphism) */}
        <Route path="/auth" element={<AuthPage />} />

        {/* Main layout with navbar/footer */}
        <Route element={<MainLayout />}>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/uniform" element={<UniformPage />} />
          <Route path="/ranks" element={<RanksPage />} />
          <Route path="/camps" element={<CampsPage />} />
          <Route path="/camp/:campName" element={<CampGalleryPage />} />
          <Route path="/events" element={<ComingSoonPage title="Events" icon="📅" />} />
          <Route path="/contact" element={<ComingSoonPage title="Contact" icon="📞" />} />

          {/* Protected: Cadet allowed content (any authenticated user) */}
          <Route path="/cadets" element={
            <ProtectedRoute>
              <CadetsPage />
            </ProtectedRoute>
          } />
          <Route path="/drills" element={
            <ProtectedRoute>
              <ComingSoonPage title="Drills" icon="🪖" />
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <CadetDashboard />
            </ProtectedRoute>
          } />

          {/* Protected: Admin routes */}
          <Route path="/attendance" element={
            <ProtectedRoute adminOnly>
              <AttendancePage />
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute adminOnly>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/nominal-roll" element={
            <ProtectedRoute adminOnly>
              <NominalRollPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/make-admin" element={
            <ProtectedRoute adminOnly>
              <MakeAdminPage />
            </ProtectedRoute>
          } />
        </Route>
      </Routes>
    </AuthProvider>
  )
}
