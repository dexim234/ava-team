// Hook for tracking user activity (login time, browser, session duration)
import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { addUserActivity, markActivityAsInactive, updateUserActivity } from '@/services/firestoreService'
import { PageView } from '@/types'

// Map route paths to human-readable section names
const getSectionName = (path: string): string => {
  const routeMap: Record<string, string> = {
    '/management': 'Расписание',
    '/earnings': 'Заработок',
    '/tasks': 'Задачи',
    '/rating': 'Рейтинг',
    '/call': 'HUB',
    '/profile': 'Профиль',
    '/approvals': 'Согласования',
    '/admin': 'Админ-панель',
    '/about': 'О проекте',
    '/rules': 'Правила',
    '/login': 'Вход',
  }
  return routeMap[path] || path
}

// Helper to detect browser from user agent
const detectBrowser = (userAgent: string): string => {
  if (userAgent.includes('Chrome') && !userAgent.includes('Edg') && !userAgent.includes('OPR')) {
    return 'Chrome'
  }
  if (userAgent.includes('Firefox')) {
    return 'Firefox'
  }
  if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    return 'Safari'
  }
  if (userAgent.includes('Edg')) {
    return 'Edge'
  }
  if (userAgent.includes('OPR')) {
    return 'Opera'
  }
  return 'Unknown'
}

export const useUserActivity = () => {
  const { user } = useAuthStore()
  const location = useLocation()
  const activityIdRef = useRef<string | null>(null)
  const loginTimeRef = useRef<number>(Date.now())
  const isTrackingRef = useRef<boolean>(false)
  const currentPageRef = useRef<string | null>(null)
  const pageStartTimeRef = useRef<number>(Date.now())
  const pageViewsRef = useRef<PageView[]>([])

  useEffect(() => {
    if (!user?.id || isTrackingRef.current) return

    const startTracking = async () => {
      isTrackingRef.current = true
      loginTimeRef.current = Date.now()
      const userAgent = navigator.userAgent
      const browser = detectBrowser(userAgent)

      try {
        const activityId = await addUserActivity({
          userId: user.id,
          loginAt: new Date().toISOString(),
          browser,
          userAgent,
          isActive: true,
        })
        activityIdRef.current = activityId
      } catch (error) {
        console.error('Failed to track user activity:', error)
      }
    }

    startTracking()

    // Track when user leaves/closes tab
    const handleBeforeUnload = () => {
      if (activityIdRef.current) {
        const logoutTime = Date.now()
        const sessionDuration = Math.floor((logoutTime - loginTimeRef.current) / 1000) // in seconds

        // Try to update activity - may not always work on page unload
        // but we'll also update periodically while page is active
        markActivityAsInactive(activityIdRef.current, new Date().toISOString(), sessionDuration).catch(
          (err) => console.error('Failed to update activity on unload:', err)
        )
      }
    }

    // Periodically update session duration while user is active
    const updateInterval = setInterval(async () => {
      if (activityIdRef.current && !document.hidden) {
        const currentTime = Date.now()
        const sessionDuration = Math.floor((currentTime - loginTimeRef.current) / 1000)
        
        try {
          await updateUserActivity(activityIdRef.current, {
            sessionDuration,
            isActive: true,
          })
        } catch (error) {
          console.error('Failed to update activity duration:', error)
        }
      }
    }, 30000) // Update every 30 seconds

    // Track visibility change (tab switch, minimize, etc.)
    const handleVisibilityChange = async () => {
      if (document.hidden && activityIdRef.current) {
        // User switched tab or minimized window - mark as inactive
        const logoutTime = Date.now()
        const sessionDuration = Math.floor((logoutTime - loginTimeRef.current) / 1000)

        try {
          await markActivityAsInactive(activityIdRef.current, new Date().toISOString(), sessionDuration)
        } catch (error) {
          console.error('Failed to update activity on visibility change:', error)
        }
      } else if (!document.hidden && activityIdRef.current) {
        // User came back - reactivate current session
        // Don't update loginTimeRef - we want to track total time from first login
        try {
          await updateUserActivity(activityIdRef.current, {
            isActive: true,
          })
        } catch (error) {
          console.error('Failed to reactivate activity:', error)
        }
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      clearInterval(updateInterval)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)

      // Final update on unmount
      if (activityIdRef.current) {
        const logoutTime = Date.now()
        const sessionDuration = Math.floor((logoutTime - loginTimeRef.current) / 1000)
        markActivityAsInactive(activityIdRef.current, new Date().toISOString(), sessionDuration).catch(
          (error) => console.error('Failed to update activity on unmount:', error)
        )
      }
    }
  }, [user?.id])

  // Track page navigation
  useEffect(() => {
    if (!activityIdRef.current || !user?.id) return

    const currentPath = location.pathname
    const now = Date.now()

    // If user navigated to a new page
    if (currentPageRef.current && currentPageRef.current !== currentPath) {
      // Calculate duration on previous page
      const previousPageDuration = Math.floor((now - pageStartTimeRef.current) / 1000)
      
      // Update the previous page view duration
      const previousPageView = pageViewsRef.current[pageViewsRef.current.length - 1]
      if (previousPageView) {
        previousPageView.duration = previousPageDuration
      }
    }

    // Add new page view (skip if it's the same page and we just started tracking)
    if (currentPageRef.current !== currentPath) {
      const newPageView: PageView = {
        path: currentPath,
        sectionName: getSectionName(currentPath),
        viewedAt: new Date().toISOString(),
      }
      pageViewsRef.current.push(newPageView)
      currentPageRef.current = currentPath
      pageStartTimeRef.current = now

      // Update activity with new page views
      updateUserActivity(activityIdRef.current, {
        pageViews: [...pageViewsRef.current],
      }).catch((error) => {
        console.error('Failed to update page views:', error)
      })
    }

    // Update duration for current page periodically
    const updatePageInterval = setInterval(() => {
      if (activityIdRef.current && currentPageRef.current === currentPath && !document.hidden) {
        const currentPageDuration = Math.floor((Date.now() - pageStartTimeRef.current) / 1000)
        const currentPageView = pageViewsRef.current[pageViewsRef.current.length - 1]
        if (currentPageView && currentPageView.path === currentPath) {
          currentPageView.duration = currentPageDuration
          
          updateUserActivity(activityIdRef.current, {
            pageViews: [...pageViewsRef.current],
          }).catch((error) => {
            console.error('Failed to update current page duration:', error)
          })
        }
      }
    }, 10000) // Update every 10 seconds

    return () => {
      clearInterval(updatePageInterval)
      
      // Final update for current page when path changes
      if (activityIdRef.current && currentPageRef.current === currentPath) {
        const finalDuration = Math.floor((Date.now() - pageStartTimeRef.current) / 1000)
        const currentPageView = pageViewsRef.current[pageViewsRef.current.length - 1]
        if (currentPageView && currentPageView.path === currentPath) {
          currentPageView.duration = finalDuration
          
          updateUserActivity(activityIdRef.current, {
            pageViews: [...pageViewsRef.current],
          }).catch((error) => {
            console.error('Failed to update final page duration:', error)
          })
        }
      }
    }
  }, [location.pathname, user?.id])
}
