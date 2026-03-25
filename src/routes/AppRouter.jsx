import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import AuthPage from '../pages/Auth/AuthPage'
import VerificationPage from '../pages/Verification/VerificationPage'
import PendingApproval from '../pages/PendingApproval/PendingApproval'
import DashboardLayout from '../components/DashboardLayout/DashboardLayout'
import ParticipantDashboard from '../pages/Dashboard/ParticipantDashboard'
import Leaderboard from '../pages/Leaderboard/Leaderboard'

function ProtectedRoute({ children }) {
  const { idToken } = useSelector((state) => state.auth)
  if (!idToken) return <Navigate to="/auth" replace />
  return children
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/auth" element={<AuthPage />} />

        {/* Protected */}
        <Route path="/verify" element={<ProtectedRoute><VerificationPage /></ProtectedRoute>} />
        <Route path="/pending-approval" element={<ProtectedRoute><PendingApproval /></ProtectedRoute>} />
        {/* 
        <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<ParticipantDashboard />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
        </Route> */}

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
