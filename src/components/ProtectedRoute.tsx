// Protected route component - requires authentication and access permissions
import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useAdminStore } from '@/store/adminStore'
import { checkUserAccess } from '@/services/firestoreService'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuthStore()
  const { isAdmin } = useAdminStore()
  const location = useLocation()
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)
  const [accessReason, setAccessReason] = useState<string>('')

  // Allow access if user is authenticated OR if admin mode is active
  if (!isAuthenticated && !isAdmin) {
    return <Navigate to="/login" replace />
  }

  // Determine feature based on current path
  const getFeatureFromPath = (path: string): string => {
    if (path === '/admin') return 'admin'
    if (path === '/management') return 'slots'
    if (path === '/earnings') return 'earnings'
    if (path === '/tasks') return 'tasks'
    if (path === '/rating') return 'rating'
    if (path === '/profile') return 'profile'
    if (path === '/approvals') return 'admin' // Approvals require admin access
    return 'login' // Default - require login
  }

  useEffect(() => {
    const checkAccess = async () => {
      if (!user || isAdmin) {
        setHasAccess(true)
        return
      }

      const feature = getFeatureFromPath(location.pathname)
      try {
        const accessResult = await checkUserAccess(user.id, feature)
        setHasAccess(accessResult.hasAccess)
        setAccessReason(accessResult.reason || 'Доступ запрещен')
      } catch (error) {
        console.error('Error checking access:', error)
        setHasAccess(true) // Default to allow on error
      }
    }

    checkAccess()
  }, [user, isAdmin, location.pathname])

  // Show loading while checking access
  if (hasAccess === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#4E6E49] border-t-transparent"></div>
      </div>
    )
  }

  // Block access if not authorized
  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Доступ запрещен</h2>
          <p className="text-gray-600">{accessReason}</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}



