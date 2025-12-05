// Profile page - Personal Cabinet
import { useState, useEffect } from 'react'
import { Layout } from '@/components/Layout'
import { useThemeStore } from '@/store/themeStore'
import { useAuthStore } from '@/store/authStore'
import { useAdminStore } from '@/store/adminStore'
import { 
  getTasks, 
  getRatingData,
  getEarnings,
  getDayStatuses,
  getReferrals,
  getWorkSlots,
  getWeeklyMessages
} from '@/services/firestoreService'
import { 
  getWeekRange, 
  getLastNDaysRange, 
  formatDate, 
  calculateHours, 
  countDaysInPeriod 
} from '@/utils/dateUtils'
import { calculateRating, getRatingBreakdown } from '@/utils/ratingUtils'
import { Task, RatingData } from '@/types'
import { 
  User, 
  LogOut, 
  Eye, 
  EyeOff, 
  CheckSquare, 
  TrendingUp, 
  Shield,
  Sparkles,
  Copy,
  Check,
  Info,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export const Profile = () => {
  const { theme } = useThemeStore()
  const { user, logout } = useAuthStore()
  const { isAdmin, deactivateAdmin } = useAdminStore()
  const navigate = useNavigate()
  
  const [showPassword, setShowPassword] = useState(false)
  const [passwordCopied, setPasswordCopied] = useState(false)
  const [tasks, setTasks] = useState<Task[]>([])
  const [rating, setRating] = useState<RatingData | null>(null)
  const [ratingBreakdown, setRatingBreakdown] = useState<ReturnType<typeof getRatingBreakdown> | null>(null)
  const [loading, setLoading] = useState(true)

  const headingColor = theme === 'dark' ? 'text-white' : 'text-gray-900'
  const cardBg = theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-white'
  const borderColor = theme === 'dark' ? 'border-gray-800' : 'border-gray-300'

  useEffect(() => {
    if (user || isAdmin) {
      loadProfileData()
    }
  }, [user, isAdmin])

  const loadProfileData = async () => {
    if (!user && !isAdmin) return
    
    setLoading(true)
    try {
      const userId = user?.id || 'admin'
      
      // Load tasks
      const userTasks = await getTasks({ assignedTo: userId })
      setTasks(userTasks)

      // Load rating data
      if (user) {
        const weekRange = getWeekRange()
        const weekStart = formatDate(weekRange.start, 'yyyy-MM-dd')
        const weekEnd = formatDate(weekRange.end, 'yyyy-MM-dd')

        const monthRange = getLastNDaysRange(30)
        const monthStart = formatDate(monthRange.start, 'yyyy-MM-dd')
        const monthEnd = formatDate(monthRange.end, 'yyyy-MM-dd')
        const monthIsoStart = monthRange.start.toISOString()
        const monthIsoEnd = monthRange.end.toISOString()

        const weekEarnings = await getEarnings(userId, weekStart, weekEnd)
        // Если у записи несколько участников, сумма делится поровну между ними
        const weeklyEarnings = weekEarnings.reduce((sum, e) => {
          const participantCount = e.participants && e.participants.length > 0 ? e.participants.length : 1
          return sum + (e.amount / participantCount)
        }, 0)

        const monthEarnings = await getEarnings(userId, monthStart, monthEnd)
        // Если у записи несколько участников, сумма делится поровну между ними
        const totalEarnings = monthEarnings.reduce((sum, e) => {
          const participantCount = e.participants && e.participants.length > 0 ? e.participants.length : 1
          return sum + (e.amount / participantCount)
        }, 0)
        const poolAmount = monthEarnings.reduce((sum, e) => {
          const participantCount = e.participants && e.participants.length > 0 ? e.participants.length : 1
          return sum + (e.poolAmount / participantCount)
        }, 0)

        const statuses = await getDayStatuses(userId)
        const monthStatuses = statuses.filter(s => {
          const statusStart = s.date
          const statusEnd = s.endDate || s.date
          return statusStart <= monthEnd && statusEnd >= monthStart
        })

        const daysOff = monthStatuses
          .filter(s => s.type === 'dayoff')
          .reduce((sum, s) => sum + countDaysInPeriod(s.date, s.endDate, monthStart, monthEnd), 0)
        const sickDays = monthStatuses
          .filter(s => s.type === 'sick')
          .reduce((sum, s) => sum + countDaysInPeriod(s.date, s.endDate, monthStart, monthEnd), 0)
        const vacationDays = monthStatuses
          .filter(s => s.type === 'vacation')
          .reduce((sum, s) => sum + countDaysInPeriod(s.date, s.endDate, monthStart, monthEnd), 0)

        const slots = await getWorkSlots(userId)
        const weekSlots = slots.filter(s => s.date >= weekStart && s.date <= weekEnd)
        const weeklyHours = weekSlots.reduce((sum, slot) => sum + calculateHours(slot.slots), 0)

        const weeklyMessages = await getWeeklyMessages(userId, weekStart, weekEnd)
        const existingRatings = await getRatingData(userId)
        const ratingData = existingRatings[0] || {
          userId,
          earnings: 0,
          messages: 0,
          initiatives: 0,
          signals: 0,
          profitableSignals: 0,
          referrals: 0,
          daysOff: 0,
          sickDays: 0,
          vacationDays: 0,
          poolAmount: 0,
          rating: 0,
          lastUpdated: new Date().toISOString(),
        }

        const currentReferrals = await getReferrals(undefined, monthIsoStart, monthIsoEnd)
        const userReferrals = currentReferrals.filter((referral) => referral.ownerId === userId).length

        const updatedData: Omit<RatingData, 'rating'> = {
          userId,
          earnings: totalEarnings,
          messages: ratingData.messages || 0,
          initiatives: ratingData.initiatives || 0,
          signals: ratingData.signals || 0,
          profitableSignals: ratingData.profitableSignals || 0,
          referrals: userReferrals,
          daysOff,
          sickDays,
          vacationDays,
          poolAmount,
          lastUpdated: new Date().toISOString(),
        }

        const calculatedRating = calculateRating(
          updatedData,
          weeklyHours,
          weeklyEarnings,
          weeklyMessages
        )

        const breakdown = getRatingBreakdown(
          updatedData,
          weeklyHours,
          weeklyEarnings,
          weeklyMessages
        )

        setRating({ ...updatedData, rating: calculatedRating })
        setRatingBreakdown(breakdown)
      }
    } catch (error) {
      console.error('Error loading profile data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    if (isAdmin) {
      deactivateAdmin()
    }
    logout()
    navigate('/login')
  }

  const handleCopyPassword = () => {
    if (user?.password) {
      navigator.clipboard.writeText(user.password)
      setPasswordCopied(true)
      setTimeout(() => setPasswordCopied(false), 2000)
    }
  }

  const userData = user || (isAdmin ? { name: 'Администратор', login: 'admin', password: 'admin' } : null)
  const pendingTasks = tasks.filter(t => t.status === 'pending').length
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length
  const completedTasks = tasks.filter(t => t.status === 'completed').length

  if (!userData) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className={headingColor}>Необходима авторизация</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="section-card rounded-2xl p-5 sm:p-6 md:p-7 border border-white/60 dark:border-white/10 shadow-xl relative overflow-hidden">
          <div className="accent-dots" />
          <div className="relative z-10 flex flex-col gap-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className={`p-3 sm:p-4 rounded-2xl shadow-lg ${theme === 'dark' ? 'bg-gradient-to-br from-[#4E6E49] to-emerald-700' : 'bg-gradient-to-br from-[#4E6E49] to-emerald-700'} text-white`}>
                  <User className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <div>
                  <p className={`text-xs uppercase tracking-[0.14em] ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>ApeVault Black Ops</p>
                  <h1 className={`text-2xl sm:text-3xl md:text-4xl font-extrabold ${headingColor} flex items-center gap-2`}>
                    Личный кабинет
                    <Sparkles className={`w-5 h-5 sm:w-6 sm:h-6 ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`} />
                  </h1>
                  <p className={`text-sm sm:text-base ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Закрытый контур Black Ops для управления профилем.</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <div className="pill" data-active="true">
                  <User className="w-4 h-4" />
                  <span>{userData.name}</span>
                </div>
                {isAdmin && (
                  <div className="pill" data-active="true">
                    <Shield className="w-4 h-4" />
                    <span>Администратор</span>
                  </div>
                )}
                <div className="pill" data-active="false">
                  <CheckSquare className="w-4 h-4" />
                  <span>{tasks.length} задач</span>
                </div>
                {rating && (
                  <div className="pill" data-active="false">
                    <TrendingUp className="w-4 h-4" />
                    <span>{rating.rating.toFixed(1)}%</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className={`${cardBg} rounded-xl p-8 text-center ${headingColor}`}>
            <div className="animate-pulse">Загрузка...</div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-4 sm:gap-5">
              <div className="space-y-4 sm:space-y-5">
                <div className="section-card rounded-2xl p-5 sm:p-6 border border-white/60 dark:border-white/10 shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl ${theme === 'dark' ? 'bg-blue-500/15 text-blue-200' : 'bg-blue-50 text-blue-700'}`}>
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className={`text-lg sm:text-xl font-bold ${headingColor}`}>Профиль</h2>
                        <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Ваши данные и доступ</p>
                      </div>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="rounded-xl border border-white/50 dark:border-white/10 bg-white/70 dark:bg-white/5 p-4 shadow-sm">
                      <p className={`text-xs font-semibold uppercase tracking-wide ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Имя</p>
                      <p className={`mt-1 text-lg font-bold ${headingColor}`}>{userData.name}</p>
                    </div>
                    <div className="rounded-xl border border-white/50 dark:border-white/10 bg-white/70 dark:bg-white/5 p-4 shadow-sm">
                      <p className={`text-xs font-semibold uppercase tracking-wide ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Логин</p>
                      <p className={`mt-1 text-lg font-bold ${headingColor}`}>{userData.login}</p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <label className={`text-sm font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} block`}>
                      Пароль
                    </label>
                    <div className="flex items-center gap-2">
                      <div className={`flex-1 px-4 py-3 rounded-lg border ${theme === 'dark' ? 'border-white/10 bg-white/5 text-white' : 'border-gray-200 bg-white text-gray-900'} font-mono text-sm`}>
                        {showPassword ? userData.password : '•'.repeat(userData.password.length)}
                      </div>
                      <button
                        onClick={() => setShowPassword(!showPassword)}
                        className={`p-3 rounded-lg border ${theme === 'dark' ? 'border-white/10 bg-white/5 hover:border-white/30' : 'border-gray-200 bg-white hover:border-gray-300'} transition`}
                        title={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                      <button
                        onClick={handleCopyPassword}
                        className={`p-3 rounded-lg border transition ${passwordCopied ? 'bg-[#4E6E49] text-white border-[#4E6E49]' : theme === 'dark' ? 'border-white/10 bg-white/5 hover:border-white/30' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                        title="Скопировать пароль"
                      >
                        {passwordCopied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="section-card rounded-2xl p-5 sm:p-6 border border-white/60 dark:border-white/10 shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl ${theme === 'dark' ? 'bg-[#4E6E49]/20 text-[#4E6E49]' : 'bg-green-50 text-[#4E6E49]'}`}>
                        <CheckSquare className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className={`text-lg sm:text-xl font-bold ${headingColor}`}>Мои задачи</h2>
                        <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Сводка по статусам</p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                    {[
                      { label: 'На согласовании', value: pendingTasks, tone: 'yellow' },
                      { label: 'В работе', value: inProgressTasks, tone: 'blue' },
                      { label: 'Выполнена', value: completedTasks, tone: 'green' },
                      { label: 'Всего', value: tasks.length, tone: 'gray' },
                    ].map(({ label, value, tone }) => (
                      <div
                        key={label}
                        className={`p-4 rounded-xl border transition-all hover:-translate-y-0.5 ${
                          tone === 'yellow'
                            ? theme === 'dark' ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-yellow-50 border-yellow-200'
                            : tone === 'blue'
                            ? theme === 'dark' ? 'bg-blue-500/10 border-blue-500/30' : 'bg-blue-50 border-blue-200'
                            : tone === 'green'
                            ? theme === 'dark' ? 'bg-[#4E6E49]/10 border-[#4E6E49]/30' : 'bg-green-50 border-green-200'
                            : theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className={`text-xs font-semibold mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{label}</div>
                        <div className={`text-3xl font-extrabold ${headingColor}`}>{value}</div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => navigate('/tasks')}
                    className={`w-full px-4 py-3 rounded-lg font-semibold transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 ${
                      theme === 'dark'
                        ? 'bg-gradient-to-r from-[#4E6E49]/25 to-emerald-700/25 text-[#4E6E49] border border-[#4E6E49]/50 hover:border-[#4E6E49]'
                        : 'bg-gradient-to-r from-green-50 to-emerald-50 text-[#4E6E49] border border-green-200 hover:border-[#4E6E49]'
                    }`}
                  >
                    <CheckSquare className="w-4 h-4" />
                    Перейти к задачам
                  </button>
                </div>

                <div className="section-card rounded-2xl p-5 sm:p-6 border border-white/60 dark:border-white/10 shadow-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2.5 rounded-xl ${theme === 'dark' ? 'bg-red-500/15 text-red-300' : 'bg-red-50 text-red-700'}`}>
                      <LogOut className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className={`text-lg font-bold ${headingColor}`}>Выход</h2>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Завершить сессию и деактивировать доступ</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className={`w-full px-6 py-3.5 rounded-lg font-semibold transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 ${
                      theme === 'dark'
                        ? 'bg-gradient-to-r from-red-500/25 to-pink-500/25 text-red-300 border border-red-500/50 hover:border-red-400'
                        : 'bg-gradient-to-r from-red-50 to-pink-50 text-red-700 border border-red-200 hover:border-red-300'
                    }`}
                  >
                    <LogOut className="w-5 h-5" />
                    Выйти из аккаунта
                  </button>
                </div>
              </div>

              <div className="space-y-4 sm:space-y-5">
                {rating && ratingBreakdown && (
                  <div className="section-card rounded-2xl p-5 sm:p-6 border border-white/60 dark:border-white/10 shadow-xl">
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl ${theme === 'dark' ? 'bg-purple-500/20 text-purple-200' : 'bg-purple-50 text-purple-700'}`}>
                          <TrendingUp className="w-5 h-5" />
                        </div>
                        <div>
                          <h2 className={`text-lg sm:text-xl font-bold ${headingColor}`}>Рейтинг эффективности</h2>
                          <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Детальный разбор параметров</p>
                        </div>
                      </div>
                      <div className="pill" data-active="true">
                        <span className="font-bold">{rating.rating.toFixed(1)}%</span>
                      </div>
                    </div>

                    <div className={`p-5 rounded-2xl border ${theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-white/70'} shadow-inner mb-5`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`text-xs uppercase tracking-wide ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Общая оценка</p>
                          <p className={`text-4xl sm:text-5xl font-extrabold ${headingColor}`}>{rating.rating.toFixed(1)}%</p>
                          <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {rating.rating >= 70 ? 'Отличный результат! 🎉' : rating.rating >= 50 ? 'Хороший темп — продолжаем!' : 'Усилите часы, доход и активность.'}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="pill" data-active="false">
                            <span className="text-xs">Часы/нед</span>
                            <strong>{ratingBreakdown.weeklyHours.toFixed(1)}</strong>
                          </div>
                          <div className="pill mt-2" data-active="false">
                            <span className="text-xs">Доход/нед</span>
                            <strong>{ratingBreakdown.weeklyEarnings.toFixed(0)} ₽</strong>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      {[
                        { label: 'Выходные', value: `${rating.daysOff} дн`, pts: ratingBreakdown.daysOffPoints, color: 'gray', icon: '📅' },
                        { label: 'Больничные', value: `${rating.sickDays} дн`, pts: ratingBreakdown.sickDaysPoints, color: 'gray', icon: '🏥' },
                        { label: 'Отпуск', value: `${rating.vacationDays} дн`, pts: ratingBreakdown.vacationDaysPoints, color: 'gray', icon: '🏖️' },
                        { label: 'Часы', value: `${ratingBreakdown.weeklyHours.toFixed(1)} ч/нед`, pts: ratingBreakdown.weeklyHoursPoints, color: 'blue', icon: '⏰' },
                        { label: 'Заработок', value: `${ratingBreakdown.weeklyEarnings.toFixed(0)} ₽/нед`, pts: ratingBreakdown.weeklyEarningsPoints, color: 'green', icon: '💰' },
                        { label: 'Рефералы', value: `${rating.referrals}`, pts: ratingBreakdown.referralsPoints, color: 'purple', icon: '👥' },
                        { label: 'Сообщения', value: `${ratingBreakdown.weeklyMessages} сообщ/нед`, pts: ratingBreakdown.weeklyMessagesPoints, color: 'orange', icon: '💬' },
                      ].map(({ label, value, pts, color, icon }) => (
                        <div
                          key={label}
                          className={`rounded-2xl border p-4 shadow-sm ${
                            color === 'blue'
                              ? theme === 'dark' ? 'bg-blue-500/10 border-blue-500/30' : 'bg-blue-50 border-blue-200'
                              : color === 'green'
                              ? theme === 'dark' ? 'bg-[#4E6E49]/10 border-[#4E6E49]/30' : 'bg-green-50 border-green-200'
                              : color === 'purple'
                              ? theme === 'dark' ? 'bg-purple-500/10 border-purple-500/30' : 'bg-purple-50 border-purple-200'
                              : color === 'orange'
                              ? theme === 'dark' ? 'bg-orange-500/10 border-orange-500/30' : 'bg-orange-50 border-orange-200'
                              : theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <p className={`text-xs uppercase tracking-wide ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{label}</p>
                              <p className={`text-lg font-bold ${headingColor}`}>{value}</p>
                            </div>
                            <span className="text-lg">{icon}</span>
                          </div>
                          <div className="mt-2 text-sm font-semibold">
                            {pts.toFixed(1)}%
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className={`mt-4 p-4 rounded-2xl border ${theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-white/70'}`}>
                      <h3 className={`text-sm font-bold ${headingColor} mb-2 flex items-center gap-2`}>
                        <Info className="w-4 h-4" />
                        Как рассчитывается рейтинг?
                      </h3>
                      <p className={`text-xs leading-relaxed ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Выходные, больничные, отпуск учитываются за месяц; часы, заработок, рефералы и сообщения — за неделю. Максимальный рейтинг: 100%.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

