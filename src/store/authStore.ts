import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User, TEAM_MEMBERS } from '@/types'
import { getAllUsers } from '@/services/firestoreService'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  login: (login: string, password: string) => Promise<boolean>
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: async (login: string, password: string) => {
        try {
          // 1. Check dynamic users from Firestore
          const users = await getAllUsers()
          let user = users.find(
            (u) => u.login === login && u.password === password
          )

          // 2. Fallback to hardcoded TEAM_MEMBERS if not found in Firestore
          if (!user) {
            user = TEAM_MEMBERS.find(
              (u) => u.login === login && u.password === password
            )
          }

          if (user) {
            set({ user, isAuthenticated: true })
            return true
          }
          return false
        } catch (error) {
          console.error('Login error:', error)
          // Final fallback to hardcoded members even if Firestore fails
          const user = TEAM_MEMBERS.find(
            (u) => u.login === login && u.password === password
          )
          if (user) {
            set({ user, isAuthenticated: true })
            return true
          }
          return false
        }
      },
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'ava-auth',
    }
  )
)



