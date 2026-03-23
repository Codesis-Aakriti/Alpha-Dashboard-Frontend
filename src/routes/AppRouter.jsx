import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AuthPage from '../pages/Auth/AuthPage'
import VerificationPage from '../pages/Verification/VerificationPage'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth */}
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/verify" element={<VerificationPage />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
