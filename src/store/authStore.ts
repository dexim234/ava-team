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
          // 1. Get all users from Firestore to find a match or check if user is managed
          const firestoreUsers = await getAllUsers()

          // Find user by login in Firestore
          const firestoreUser = firestoreUsers.find((u) => u.login === login)

          if (firestoreUser) {
            // User exists in Firestore - strictly check password from Firestore
            if (firestoreUser.password === password) {
              set({ user: firestoreUser, isAuthenticated: true })
              return true
            }
            // Wrong password for a managed user
            return false
          }

          // 2. Fallback to TEAM_MEMBERS ONLY if user is NOT in Firestore
          const teamMember = TEAM_MEMBERS.find(
            (u) => u.login === login && u.password === password
          )

          if (teamMember) {
            set({ user: teamMember, isAuthenticated: true })
            return true
          }

          return false
        } catch (error) {
          console.error('Login error:', error)
          // Final desperate fallback if Firestore fails COMPLETELY
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



