import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import LandingPage    from './pages/LandingPage.jsx'
import LoginPage      from './pages/LoginPage.jsx'
import RegisterPage   from './pages/RegisterPage.jsx'
import DashboardPage  from './pages/DashboardPage.jsx'
import StudyPage      from './pages/StudyPage.jsx'
import HistoryPage    from './pages/HistoryPage.jsx'
import ProfilePage    from './pages/ProfilePage.jsx'
import AdminPage      from './pages/AdminPage.jsx'
import StudyPlanPage  from './pages/StudyPlanPage.jsx'
import NotFoundPage   from './pages/NotFoundPage.jsx'

function Spinner() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-violet border-t-transparent animate-spin" />
    </div>
  )
}

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <Spinner />
  return user ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <Spinner />
  return !user ? children : <Navigate to="/dashboard" replace />
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <Spinner />
  return user?.role === 'admin' ? children : <Navigate to="/dashboard" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/"          element={<LandingPage />} />
        <Route path="/login"     element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register"  element={<PublicRoute><RegisterPage /></PublicRoute>} />
        <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
        <Route path="/study"     element={<PrivateRoute><StudyPage /></PrivateRoute>} />
        <Route path="/history"   element={<PrivateRoute><HistoryPage /></PrivateRoute>} />
        <Route path="/plan"      element={<PrivateRoute><StudyPlanPage /></PrivateRoute>} />
        <Route path="/profile"   element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
        <Route path="/admin"     element={<AdminRoute><AdminPage /></AdminRoute>} />
        <Route path="*"          element={<NotFoundPage />} />
      </Routes>
    </AuthProvider>
  )
}
