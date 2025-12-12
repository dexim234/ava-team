// Utility functions for user data
import { TEAM_MEMBERS } from '@/types'
import { getUserLoginValue } from '@/services/firestoreService'

// Cache for custom logins to avoid multiple async calls
const loginCache = new Map<string, string | null>()

/**
 * Get user login (nickname) - checks custom login first, then default
 * This is a synchronous version that uses cache
 */
export const getUserLoginSync = (userId: string): string => {
  // Check cache first
  const cached = loginCache.get(userId)
  if (cached !== undefined) {
    return cached || TEAM_MEMBERS.find((m) => m.id === userId)?.login || userId
  }
  
  // Return default if not in cache
  return TEAM_MEMBERS.find((m) => m.id === userId)?.login || userId
}

/**
 * Get user login (nickname) - async version that fetches from Firestore
 * Use this when you need the most up-to-date value
 */
export const getUserLoginAsync = async (userId: string): Promise<string> => {
  try {
    const customLogin = await getUserLoginValue(userId)
    if (customLogin) {
      loginCache.set(userId, customLogin)
      return customLogin
    }
    
    const defaultLogin = TEAM_MEMBERS.find((m) => m.id === userId)?.login || userId
    loginCache.set(userId, null) // Cache null to indicate no custom login
    return defaultLogin
  } catch (error) {
    console.error('Error fetching user login:', error)
    return getUserLoginSync(userId)
  }
}

/**
 * Clear login cache for a user (call after login change is approved)
 */
export const clearLoginCache = (userId: string) => {
  loginCache.delete(userId)
}

/**
 * Clear all login cache
 */
export const clearAllLoginCache = () => {
  loginCache.clear()
}
