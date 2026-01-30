import React from 'react'
import { useAuthStore } from '@/store/authStore'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: string
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user } = useAuthStore()

  if (!user) {
    return <div className="text-center p-8">Необходима авторизация</div>
  }

  return <>{children}</>
}