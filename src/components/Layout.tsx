// Main layout component with navigation and theme toggle
import { Link, useLocation } from 'react-router-dom'
import { useThemeStore } from '@/store/themeStore'
import { useAdminStore } from '@/store/adminStore'
import { useAuthStore } from '@/store/authStore'
import { getApprovalRequests } from '@/services/firestoreService'
import { formatDate } from '@/utils/dateUtils'
import {
  Moon,
  Sun,
  Shield,
  CheckCircle2,
  Zap,
  Settings,
  Calendar,
  DollarSign,
  CheckSquare,
  TrendingUp,
  User,
  ChevronDown,
  Info,
  ArrowUpRight,
  Bell,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import logo from '@/assets/logo.png'
import { useState, useEffect } from 'react'

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const { theme, toggleTheme } = useThemeStore()
  const { isAdmin } = useAdminStore()
  const { user } = useAuthStore()
  const location = useLocation()
  const [showFunctionalityMenu, setShowFunctionalityMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState<{ id: string; text: string; time: string; status: string }[]>([])

  const functionalitySubItems: { path: string; label: string; icon: LucideIcon }[] = [
    { path: '/management', label: 'Расписание', icon: Calendar },
    { path: '/earnings', label: 'Заработок', icon: DollarSign },
    { path: '/tasks', label: 'Задачи', icon: CheckSquare },
    { path: '/rating', label: 'Рейтинг', icon: TrendingUp },
    { path: '/call', label: 'HUB', icon: Zap },
    { path: '/approvals', label: 'Согласования', icon: CheckCircle2 },
  ]

  const isFunctionalityActive = functionalitySubItems.some(item => location.pathname === item.path)
  const isFunctionalitySubItemActive = (path: string) => location.pathname === path

  useEffect(() => {
    setShowFunctionalityMenu(false)
  }, [location.pathname])

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        if (!user && !isAdmin) {
          setNotifications([])
          return
        }
        const approvals = await getApprovalRequests()
        const cutoff = Date.now() - 6 * 60 * 60 * 1000 // 6 hours
        
        // Получаем просмотренные уведомления из localStorage
        const viewedKey = `viewedNotifications_${user?.id || 'admin'}`
        const viewedIds = JSON.parse(localStorage.getItem(viewedKey) || '[]')
        
        const filtered = approvals.filter((a) => {
          if (!isAdmin && user && a.authorId !== user.id && a.targetUserId !== user.id) return false
          const ts = Date.parse(a.updatedAt || a.createdAt)
          if (Number.isNaN(ts) || ts < cutoff) return false
          // Исключаем уже просмотренные
          if (viewedIds.includes(a.id)) return false
          return true
        })
        setNotifications(
          filtered.map((a) => ({
            id: a.id,
            status: a.status,
            text: `${a.entity === 'slot' ? 'Слот' : 'Статус'} • ${a.status === 'approved' ? 'Подтверждено' : a.status === 'rejected' ? 'Отклонено' : 'На согласовании'}${a.adminComment ? `: ${a.adminComment}` : ''}`,
            time: formatDate(a.updatedAt || a.createdAt || new Date().toISOString(), 'dd.MM HH:mm'),
          }))
        )
      } catch (err) {
        console.error('Failed to load notifications', err)
      }
    }

    loadNotifications()
    const id = setInterval(loadNotifications, 2 * 60 * 1000)
    return () => clearInterval(id)
  }, [user, isAdmin])

  const handleCloseNotifications = () => {
    // При закрытии сохраняем ID всех текущих уведомлений как просмотренные
    if (notifications.length > 0) {
      const viewedKey = `viewedNotifications_${user?.id || 'admin'}`
      const existing = JSON.parse(localStorage.getItem(viewedKey) || '[]')
      const newIds = notifications.map(n => n.id)
      const updated = [...new Set([...existing, ...newIds])]
      localStorage.setItem(viewedKey, JSON.stringify(updated))
      setNotifications([])
    }
    setShowNotifications(false)
  }

  return (
    <div className="app-shell">
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-24 -left-12 w-80 h-80 bg-gradient-to-br from-[#4E6E49]/25 via-transparent to-transparent blur-3xl" />
        <div className="absolute top-8 right-0 w-[520px] h-[520px] bg-gradient-to-bl from-blue-500/12 via-purple-500/10 to-transparent blur-3xl" />
        <div className="absolute bottom-[-120px] left-12 w-96 h-96 bg-gradient-to-tr from-amber-400/10 to-[#4E6E49]/12 blur-3xl" />
        <div className="floating-grid" />
      </div>

      <header className="sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 pt-4 pb-2">
          <div className="glass-panel rounded-2xl px-4 lg:px-6 py-3 flex items-center gap-4 shadow-2xl">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative w-12 h-12 rounded-2xl bg-white/80 dark:bg-white/5 border border-white/50 dark:border-white/10 shadow-lg overflow-hidden flex items-center justify-center">
                <img src={logo} alt="ApeVault Logo" className="w-10 h-10 object-contain" />
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent dark:from-white/5" />
              </div>
              <div className="leading-tight">
                <p className={`text-xs uppercase tracking-[0.16em] ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  ApeVault Black Ops
                </p>
                <p className={`text-xl font-extrabold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Панель команды
                </p>
              </div>
            </div>

            <nav className="hidden lg:flex items-center gap-2 flex-1 justify-center">
              <Link
                to="/call"
                data-active={location.pathname === '/call'}
                className="nav-chip"
              >
                <Zap className="w-4 h-4" />
                <span>HUB</span>
                <ArrowUpRight className="w-4 h-4 opacity-70" />
              </Link>

              <div className="relative">
                <button
                  onClick={() => {
                    setShowFunctionalityMenu(!showFunctionalityMenu)
                  }}
                  data-active={isFunctionalityActive}
                  className="nav-chip"
                >
                  <Settings className="w-4 h-4" />
                  <span>Функционал</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showFunctionalityMenu ? 'rotate-180' : ''}`} />
                </button>
                {showFunctionalityMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowFunctionalityMenu(false)} />
                    <div className="absolute top-[calc(100%+12px)] left-0 min-w-[220px] glass-panel rounded-2xl border border-white/40 dark:border-white/10 shadow-2xl z-50 overflow-hidden">
                      <div className="accent-dots" />
                      <div className="relative z-10 divide-y divide-gray-100/60 dark:divide-white/5">
                        {functionalitySubItems.map((item) => (
                          <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setShowFunctionalityMenu(false)}
                            className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                              isFunctionalitySubItemActive(item.path)
                                ? 'bg-gradient-to-r from-[#4E6E49]/15 to-[#4E6E49]/5 text-[#4E6E49] dark:from-[#4E6E49]/20 dark:text-[#4E6E49]'
                                : theme === 'dark'
                                ? 'hover:bg-white/5 text-gray-200'
                                : 'hover:bg-gray-50 text-gray-800'
                            }`}
                          >
                            <item.icon className="w-4 h-4 flex-shrink-0" />
                          <span className="font-semibold flex-1">{item.label}</span>
                          <ArrowUpRight className="w-4 h-4 opacity-70" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <Link
                to="/about"
                data-active={location.pathname === '/about'}
                className="nav-chip"
              >
                <Info className="w-4 h-4" />
                <span>О нас</span>
                <ArrowUpRight className="w-4 h-4 opacity-70" />
              </Link>

              <Link
                to="/profile"
                data-active={location.pathname === '/profile'}
                className="nav-chip"
              >
                <User className="w-4 h-4" />
                <span>ЛК</span>
                <ArrowUpRight className="w-4 h-4 opacity-70" />
              </Link>

              {isAdmin && (
                <Link
                  to="/admin"
                  data-active={location.pathname === '/admin'}
                  className="nav-chip"
                >
                  <Shield className="w-4 h-4" />
                  <span>Админ</span>
                  <ArrowUpRight className="w-4 h-4 opacity-70" />
                </Link>
              )}
              {isAdmin && (
                <Link
                  to="/approvals"
                  data-active={location.pathname === '/approvals'}
                  className="nav-chip"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Согласования</span>
                  <ArrowUpRight className="w-4 h-4 opacity-70" />
                </Link>
              )}
            </nav>

            <div className="flex items-center gap-3 ml-auto relative">
              <div className="relative">
                <button
                  onClick={() => {
                    if (showNotifications) {
                      handleCloseNotifications()
                    } else {
                      setShowNotifications(true)
                    }
                  }}
                  className="nav-chip px-3 py-2"
                  data-active={showNotifications}
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-red-500 text-white">
                      {notifications.length}
                    </span>
                  )}
                </button>
                {showNotifications && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={handleCloseNotifications} />
                    <div className={`absolute right-0 mt-2 w-80 max-w-[88vw] glass-panel rounded-2xl border border-white/60 dark:border-white/10 shadow-2xl z-50 overflow-hidden`}>
                      <div className="p-4 space-y-2 max-h-[360px] overflow-y-auto">
                        {notifications.length === 0 ? (
                          <p className="text-sm text-gray-600 dark:text-gray-300">Новых уведомлений нет (храним до 6 часов).</p>
                        ) : (
                          notifications.map((n) => (
                            <div key={n.id} className="rounded-xl border border-white/40 dark:border-white/10 bg-white/80 dark:bg-white/5 p-3 space-y-1">
                              <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{n.time}</div>
                              <div className="text-sm font-semibold text-gray-900 dark:text-white">{n.text}</div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <button
                onClick={toggleTheme}
                className="nav-chip px-3 py-2"
                data-active="false"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5 text-amber-300" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-700" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="page-shell">
        {children}
      </main>

      <nav className="lg:hidden fixed bottom-4 left-0 right-0 px-3 z-50">
        <div className="max-w-5xl mx-auto">
          <div className="glass-panel rounded-2xl shadow-2xl border border-white/60 dark:border-white/10">
            <div className="grid grid-cols-4 divide-x divide-white/40 dark:divide-white/5">
              <Link
                to="/call"
                className={`flex flex-col items-center justify-center gap-1 py-3 ${location.pathname === '/call' ? 'text-[#4E6E49]' : theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
              >
                <Zap className="w-5 h-5" />
                <div className="flex items-center gap-1">
                  <span className="text-[11px] font-semibold">HUB</span>
                  <ArrowUpRight className="w-3 h-3 opacity-70" />
                </div>
              </Link>
              <button
                onClick={() => {
                  setShowFunctionalityMenu(!showFunctionalityMenu)
                }}
                className={`flex flex-col items-center justify-center gap-1 py-3 ${isFunctionalityActive ? 'text-[#4E6E49]' : theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
              >
                <Settings className="w-5 h-5" />
                <div className="flex items-center gap-1">
                  <span className="text-[11px] font-semibold">Функционал</span>
                  <ChevronDown className="w-3 h-3 opacity-70" />
                </div>
              </button>
              <Link
                to="/about"
                className={`flex flex-col items-center justify-center gap-1 py-3 ${location.pathname === '/about' ? 'text-[#4E6E49]' : theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
              >
                <Info className="w-5 h-5" />
                <div className="flex items-center gap-1">
                  <span className="text-[11px] font-semibold">О нас</span>
                  <ArrowUpRight className="w-3 h-3 opacity-70" />
                </div>
              </Link>
              <Link
                to="/profile"
                className={`flex flex-col items-center justify-center gap-1 py-3 ${location.pathname === '/profile' ? 'text-[#4E6E49]' : theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
              >
                <User className="w-5 h-5" />
                <div className="flex items-center gap-1">
                  <span className="text-[11px] font-semibold">ЛК</span>
                  <ArrowUpRight className="w-3 h-3 opacity-70" />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {showFunctionalityMenu && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={() => setShowFunctionalityMenu(false)}>
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 w-[88%] max-w-sm glass-panel rounded-2xl shadow-2xl border border-white/50 dark:border-white/10 overflow-hidden">
            <div className="accent-dots" />
            <div className="relative z-10 divide-y divide-gray-100/60 dark:divide-white/5">
              {functionalitySubItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setShowFunctionalityMenu(false)}
                  className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                    isFunctionalitySubItemActive(item.path)
                      ? 'bg-gradient-to-r from-[#4E6E49]/15 to-[#4E6E49]/5 text-[#4E6E49] dark:from-[#4E6E49]/20 dark:text-[#4E6E49]'
                      : theme === 'dark'
                      ? 'hover:bg-white/5 text-gray-200'
                      : 'hover:bg-gray-50 text-gray-800'
                  }`}
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                <span className="font-semibold flex-1">{item.label}</span>
                <ArrowUpRight className="w-4 h-4 opacity-70" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
