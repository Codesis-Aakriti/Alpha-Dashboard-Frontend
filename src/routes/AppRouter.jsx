import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AuthPage from '../pages/Auth/AuthPage'
import VerificationPage from '../pages/Verification/VerificationPage'
import DashboardLayout from '../components/DashboardLayout/DashboardLayout'
import ParticipantDashboard from '../pages/Dashboard/ParticipantDashboard'
import Leaderboard from '../pages/Leaderboard/Leaderboard'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/auth"   element={<AuthPage />} />
        <Route path="/verify" element={<VerificationPage />} />

        {/* Protected — all share sidebar + header */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard"   element={<ParticipantDashboard />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
