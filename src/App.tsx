import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { useAdminStore } from './store/adminStore'
import { useThemeStore } from './store/themeStore'
import { useEffect } from 'react'
import { Login } from './pages/Login'
import { CallPage } from './pages/Call'
import { Management } from './pages/Management'
import { Earnings } from './pages/Earnings'
import { Rating } from './pages/Rating'
import { Tasks } from './pages/Tasks'
import { Admin } from './pages/Admin'
import { Profile } from './pages/Profile'
import { Controls } from './pages/Controls'
import { About } from './pages/About'
import { Rules } from './pages/Rules'
import { Approvals } from './pages/Approvals'
import { Strategies } from './pages/Strategies'
import { EventsPage } from './pages/Events'
import { Referrals } from './pages/Referrals'
import { Analytics } from './pages/Analytics'
import { NotFound } from './pages/NotFound'
import { Initiatives } from './pages/Initiatives'
import { Challenges } from './pages/Challenges'
import { Docs } from './pages/Docs'
import { AIReview } from './pages/AIReview'

import { ProtectedRoute } from './components/ProtectedRoute'
import { AccessBlockScreen } from './components/AccessBlockScreen'
import { cleanupOldData } from './services/firestoreService'

import { AppLayout } from './components/AppLayout'
import { useAuthSecurity } from './hooks/useAuthSecurity'

function App() {
  const { isAuthenticated } = useAuthStore()
  const { isAdmin } = useAdminStore()
  const { theme } = useThemeStore()

  // Monitor session security and auto-logout if credentials change
  useAuthSecurity()

  useEffect(() => {
    // Apply theme on mount
    document.body.classList.toggle('dark', theme === 'dark')
  }, [theme])

  useEffect(() => {
    cleanupOldData().catch((error) => console.error('Cleanup failed', error))
  }, [])

  return (
    <BrowserRouter>
      <AccessBlockScreen />
      <Routes>
        <Route
          path="/login"
          element={
            (!isAuthenticated && !isAdmin) ? (
              <Login />
            ) : (
              <Navigate to="/about" replace />
            )
          }
        />

        {/* Layout wrapper for all pages with navigation */}
        <Route element={<AppLayout />}>
          <Route
            path="/hub"
            element={
              <ProtectedRoute>
                <CallPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lead"
            element={
              <ProtectedRoute>
                <Management />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pnl"
            element={
              <ProtectedRoute>
                <Earnings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/track-record"
            element={
              <ProtectedRoute>
                <Rating />
              </ProtectedRoute>
            }
          />
          <Route
            path="/invite-earn"
            element={
              <ProtectedRoute>
                <Referrals />
              </ProtectedRoute>
            }
          />
          <Route
            path="/operations"
            element={
              <ProtectedRoute>
                <Tasks />
              </ProtectedRoute>
            }
          />
          <Route
            path="/about"
            element={
              <ProtectedRoute>
                <About />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rules"
            element={
              <ProtectedRoute>
                <Rules />
              </ProtectedRoute>
            }
          />
          <Route
            path="/controls"
            element={
              <ProtectedRoute adminOnly={true}>
                <Controls />
              </ProtectedRoute>
            }
          />
          <Route
            path="/approvals"
            element={
              <ProtectedRoute>
                <Approvals />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/strategies"
            element={
              <ProtectedRoute>
                <Strategies />
              </ProtectedRoute>
            }
          />
          <Route
            path="/events"
            element={
              <ProtectedRoute>
                <EventsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lab"
            element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/initiatives"
            element={
              <ProtectedRoute>
                <Initiatives />
              </ProtectedRoute>
            }
          />
          <Route
            path="/challenges"
            element={
              <ProtectedRoute>
                <Challenges />
              </ProtectedRoute>
            }
          />
          <Route
            path="/docs"
            element={
              <ProtectedRoute>
                <Docs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ai-review"
            element={
              <ProtectedRoute>
                <AIReview />
              </ProtectedRoute>
            }
          />

        </Route>

        <Route path="/" element={<Navigate to={(isAuthenticated || isAdmin) ? "/about" : "/login"} replace />} />

        {/* Legacy redirects for old URLs */}
        <Route path="/call" element={<Navigate to="/hub" replace />} />
        <Route path="/analytics" element={<Navigate to="/lab" replace />} />
        <Route path="/management" element={<Navigate to="/lead" replace />} />
        <Route path="/earnings" element={<Navigate to="/pnl" replace />} />
        <Route path="/tasks" element={<Navigate to="/operations" replace />} />
        <Route path="/rating" element={<Navigate to="/track-record" replace />} />
        <Route path="/referrals" element={<Navigate to="/invite-earn" replace />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
