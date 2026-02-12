import { useState, useEffect } from 'react'
import { useThemeStore } from '@/store/themeStore'
import { useAuthStore } from '@/store/authStore'
import { useAdminStore, ADMIN_PASSWORD } from '@/store/adminStore'
import { useViewedUserStore } from '@/store/viewedUserStore'
import { useEffectiveUserId } from '@/hooks/useEffectiveUserId'
import {
  getRatingData,
  getEarnings,
  getDayStatuses,
  getReferrals,
  getWorkSlots,
} from '@/services/firestoreService'
import {
  getWeekRange,
  getLastNDaysRange,
  formatDate,
  calculateHours,
  countDaysInPeriod
} from '@/utils/dateUtils'
import { calculateRating, getRatingBreakdown } from '@/utils/ratingUtils'
import { RatingData, Earnings, DayStatus, WorkSlot } from '@/types'
import {
  LogOut,
  TrendingUp,
  Shield,
  Info,
  DollarSign,
  BookOpen,
  Zap,
  Wallet,
  PiggyBank,
  Clock,
  Users,
  AlertTriangle,
  Lightbulb,
} from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'
import { TEAM_MEMBERS } from '@/types'
import { useUserAvatar } from '@/utils/userUtils'

export const Profile = () => {
  const { theme } = useThemeStore()
  const { user, logout } = useAuthStore()
  const { isAdmin, deactivateAdmin } = useAdminStore()
  const { isViewingOtherUser } = useViewedUserStore()
  const effectiveUserId = useEffectiveUserId()
  const navigate = useNavigate()

  // Use effective user ID (viewed user or current user)
  const targetUserId = effectiveUserId || user?.id || 'admin'

  const [rating, setRating] = useState<RatingData | null>(null)
  const [ratingBreakdown, setRatingBreakdown] = useState<ReturnType<typeof getRatingBreakdown> | null>(null)
  const [earningsSummary, setEarningsSummary] = useState<{
    total: number
    pool: number
    net: number
    weekly: { gross: number; pool: number; net: number }
  } | null>(null)
  const [loading, setLoading] = useState(true)

  // Get viewed user info if viewing other user
  const viewedUserMember = effectiveUserId ? TEAM_MEMBERS.find(m => m.id === effectiveUserId) : null

  const userData = user || (isAdmin ? { id: 'admin', name: 'Администратор', login: 'admin', password: ADMIN_PASSWORD, avatar: undefined } : null)
  const profileAvatar = useUserAvatar(targetUserId, userData?.id === targetUserId ? userData?.avatar : undefined)
  const profileInitial = userData?.name ? userData.name.charAt(0).toUpperCase() : 'A'

  const headingColor = theme === 'dark' ? 'text-white' : 'text-gray-900'

  useEffect(() => {
    if (user || isAdmin) {
      loadProfileData()
    }
  }, [user, isAdmin])

  const loadProfileData = async () => {
    if (!user && !isAdmin) return

    setLoading(true)
    try {
      // Use effective user ID (viewed user or current user)
      const targetUserId = effectiveUserId || user?.id || 'admin'

      if (user) {
        const weekRange = getWeekRange()
        const weekStart = formatDate(weekRange.start, 'yyyy-MM-dd')
        const weekEnd = formatDate(weekRange.end, 'yyyy-MM-dd')

        const monthRange = getLastNDaysRange(30)
        const monthStart = formatDate(monthRange.start, 'yyyy-MM-dd')
        const monthEnd = formatDate(monthRange.end, 'yyyy-MM-dd')
        const monthIsoStart = monthRange.start.toISOString()
        const monthIsoEnd = monthRange.end.toISOString()

        const weekEarnings = await getEarnings(targetUserId, weekStart, weekEnd)
        const weeklyEarningsAmount = weekEarnings.reduce((sum: number, e: Earnings) => {
          const participantCount = e.participants && e.participants.length > 0 ? e.participants.length : 1
          return sum + (e.amount / participantCount)
        }, 0)
        const weeklyPool = weekEarnings.reduce((sum: number, e: Earnings) => {
          const participantCount = e.participants && e.participants.length > 0 ? e.participants.length : 1
          return sum + (e.poolAmount / participantCount)
        }, 0)

        const monthEarnings = await getEarnings(targetUserId, monthStart, monthEnd)
        const totalEarnings = monthEarnings.reduce((sum: number, e: Earnings) => {
          const participantCount = e.participants && e.participants.length > 0 ? e.participants.length : 1
          return sum + (e.amount / participantCount)
        }, 0)
        const poolAmount = monthEarnings.reduce((sum: number, e: Earnings) => {
          const participantCount = e.participants && e.participants.length > 0 ? e.participants.length : 1
          return sum + (e.poolAmount / participantCount)
        }, 0)

        const statuses = await getDayStatuses(targetUserId)
        const monthStatuses = statuses.filter((s: DayStatus) => {
          const statusStart = s.date
          const statusEnd = s.endDate || s.date
          return statusStart <= monthEnd && statusEnd >= monthStart
        })

        const absenceDays = monthStatuses
          .filter((s: DayStatus) => s.type === 'absence')
          .reduce((sum: number, s: DayStatus) => sum + countDaysInPeriod(s.date, s.endDate, monthStart, monthEnd), 0)
        const truancyDays = monthStatuses
          .filter((s: DayStatus) => s.type === 'truancy')
          .reduce((sum: number, s: DayStatus) => sum + countDaysInPeriod(s.date, s.endDate, monthStart, monthEnd), 0)

        const slots = await getWorkSlots(targetUserId)
        const weekSlots = slots.filter((s: WorkSlot) => s.date >= weekStart && s.date <= weekEnd)
        const weeklyHours = weekSlots.reduce((sum: number, slot: WorkSlot) => sum + calculateHours(slot.slots), 0)

        const existingRatings = await getRatingData(targetUserId)
        const ratingData = existingRatings[0] || {
          userId: targetUserId,
          earnings: 0,
          messages: 0,
          initiatives: 0,
          signals: 0,
          profitableSignals: 0,
          referrals: 0,
          daysOff: 0,
          sickDays: 0,
          vacationDays: 0,
          absenceDays: 0,
          internshipDays: 0,
          poolAmount: 0,
          rating: 0,
          lastUpdated: new Date().toISOString(),
        }

        const currentReferrals = await getReferrals(undefined, monthIsoStart, monthIsoEnd)
        const userReferrals = currentReferrals.filter((referral: any) => referral.ownerId === targetUserId).length

        const updatedData: Omit<RatingData, 'rating'> = {
          userId: targetUserId,
          earnings: totalEarnings,
          messages: ratingData.messages || 0,
          initiatives: ratingData.initiatives || 0,
          signals: ratingData.signals || 0,
          profitableSignals: ratingData.profitableSignals || 0,
          referrals: userReferrals,
          daysOff: 0,
          sickDays: 0,
          vacationDays: 0,
          absenceDays,
          truancyDays,
          internshipDays: 0,
          poolAmount,
          lastUpdated: new Date().toISOString(),
        }

        console.log('Profile.tsx calculateRating call for user:', targetUserId, {
          weeklyHours,
          weeklyEarnings: weeklyEarningsAmount,
          updatedData
        })

        const calculatedRating = calculateRating(
          updatedData,
          weeklyHours,
          weeklyEarningsAmount,
          0,
          0,
          0
        )

        const breakdown = getRatingBreakdown(
          updatedData,
          weeklyHours,
          weeklyEarningsAmount,
          0,
          0,
          0
        )

        setRating({ ...updatedData, rating: calculatedRating })
        setRatingBreakdown(breakdown)

        setEarningsSummary({
          total: totalEarnings,
          pool: poolAmount,
          net: Math.max(0, totalEarnings - poolAmount),
          weekly: {
            gross: weeklyEarningsAmount,
            pool: weeklyPool,
            net: Math.max(0, weeklyEarningsAmount - weeklyPool),
          },
        })
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

  if (!userData) {
    return (
      <div className="text-center py-12">
        <p className={headingColor}>Необходима авторизация</p>
      </div>
    )
  }

  const weeklyNetStatus = earningsSummary?.weekly.net && earningsSummary.weekly.net >= 10000
  const weeklyStatusText = weeklyNetStatus ? 'Вывод доступен' : 'Ожидание порога'
  const weeklyStatusClass = weeklyNetStatus
    ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-500'
    : 'border-amber-500/20 bg-amber-500/10 text-amber-500'
  const weeklyStatusBadge = weeklyNetStatus ? 'Доступно к выводу' : 'Перенос суммы'

  return (
    <div className="space-y-6">
      {/* New Header */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#4E6E49]/10 rounded-2xl border border-[#4E6E49]/20 shadow-lg shadow-[#4E6E49]/5 flex items-center justify-center min-w-[80px] min-h-[80px]">
              {profileAvatar ? (
                <img
                  src={profileAvatar}
                  alt={userData?.name}
                  className="w-14 h-14 rounded-xl object-cover"
                />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#4E6E49] to-emerald-600 flex items-center justify-center text-2xl font-black text-white">
                  {profileInitial}
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${theme === 'dark' ? 'text-[#4E6E49]' : 'text-[#4E6E49]'}`}>
                  Личный кабинет
                </span>
                {isViewingOtherUser() && (
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500 text-[9px] font-black tracking-widest uppercase border border-amber-500/20">
                    Просмотр
                  </span>
                )}
              </div>
              <h1 className={`text-2xl md:text-4xl font-black tracking-tight ${headingColor}`}>{isViewingOtherUser() ? viewedUserMember?.name || 'Пользователь' : userData.name}</h1>
              <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                AVA - Team — Личный кабинет. Ваши данные и показатели.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/rules"
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border transition-all font-bold text-sm ${theme === 'dark'
                ? 'bg-white/5 border-white/10 hover:bg-white/10 text-white'
                : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-900 shadow-sm'
                }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Правила</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm transition-all shadow-lg shadow-rose-500/20 hover:scale-105 active:scale-95"
            >
              <LogOut className="w-4 h-4" />
              <span>Выйти</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: 'Рейтинг',
              value: rating ? `${rating.rating.toFixed(1)}` : '—',
              note: rating?.rating && rating.rating >= 50 ? 'В команде' : rating?.rating && rating.rating >= 30 ? 'Риск исключения' : 'Не в команде',
              icon: <Zap className="w-5 h-5 text-amber-400" />,
              bgClass: 'bg-amber-500/5',
              borderClass: 'border-amber-500/10'
            },
            {
              label: 'Недельный доход',
              value: earningsSummary ? `${Math.round(earningsSummary.weekly.net).toLocaleString()} ₽` : '0 ₽',
              note: earningsSummary?.weekly.net && earningsSummary.weekly.net >= 10000 ? 'Доступно к выводу' : 'Ниже порога',
              icon: <Wallet className="w-5 h-5 text-emerald-400" />,
              bgClass: 'bg-emerald-500/5',
              borderClass: 'border-emerald-500/10'
            },
            {
              label: 'Заработок (месяц)',
              value: earningsSummary ? `${Math.round(earningsSummary.total).toLocaleString()} ₽` : '0 ₽',
              note: 'За последние 30 дней',
              icon: <DollarSign className="w-5 h-5 text-green-400" />,
              bgClass: 'bg-green-500/5',
              borderClass: 'border-green-500/10'
            },
            {
              label: 'Статус аккаунта',
              value: isAdmin ? 'Admin' : 'Member',
              note: 'Постоянный доступ',
              icon: <Shield className="w-5 h-5 text-purple-400" />,
              bgClass: 'bg-purple-500/5',
              borderClass: 'border-purple-500/10'
            }
          ].map((item, idx) => (
            <div
              key={idx}
              className={`relative overflow-hidden rounded-2xl p-5 border transition-all duration-300 hover:shadow-xl group ${theme === 'dark'
                ? `${item.bgClass} ${item.borderClass} hover:border-white/20`
                : 'bg-white border-gray-100 hover:border-[#4E6E49]/20 shadow-sm'
                }`}
            >
              <div className="flex justify-between items-start mb-6">
                <span className={`text-[10px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                  {item.label}
                </span>
                <div className={`p-2 rounded-xl ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'}`}>
                  {item.icon}
                </div>
              </div>
              <div className="space-y-1">
                <div className={`text-2xl md:text-3xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {item.value}
                </div>
                <div className={`text-[11px] font-bold ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                  {item.note}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {loading ? (
        <div className={`rounded-xl p-8 text-center ${theme === 'dark' ? 'bg-white/5 text-white' : 'bg-white text-gray-800'} shadow`}>Загрузка...</div>
      ) : (
        <div className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
            {/* Rating Card */}
            {rating && ratingBreakdown && (
              <div className={`rounded-2xl p-6 border ${theme === 'dark' ? 'border-white/5 bg-[#1a1a1a]' : 'border-gray-200 bg-white'} shadow`}>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${theme === 'dark' ? 'bg-purple-500/10 text-purple-400' : 'bg-purple-50 text-purple-600'}`}>
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className={`text-sm font-black uppercase tracking-widest ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Рейтинг</h2>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Детальная оценка</p>
                    </div>
                  </div>
                  <div className={`px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest border border-purple-500/20 bg-purple-500/5 text-purple-500`}>
                    {rating.rating.toFixed(1)} баллов
                  </div>
                </div>

                <div className={`p-5 rounded-xl border ${theme === 'dark' ? 'border-white/5 bg-black/20' : 'border-gray-100 bg-gray-50'} mb-6`}>
                  <div className={`text-4xl font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{rating.rating.toFixed(1)}</div>
                  <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} font-medium`}>
                    {rating.rating >= 80 ? 'Эталон' : rating.rating >= 50 ? 'В команде' : rating.rating >= 30 ? 'Риск исключения' : 'Не в команде'}
                  </p>
                  <p className={`text-[10px] mt-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                    Минимум для нахождения в команде: 50 баллов
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  {[
                    { label: 'Часы', value: `${ratingBreakdown.weeklyHours.toFixed(1)} ч/нед`, pts: ratingBreakdown.weeklyHoursPoints, max: 15, icon: <Clock className="w-4 h-4" />, color: theme === 'dark' ? 'bg-blue-500/5 border-blue-500/10 text-blue-400' : 'bg-blue-50 border-blue-100 text-blue-600' },
                    { label: 'Заработок', value: `${Math.round(ratingBreakdown.weeklyEarnings).toLocaleString()} ₽`, pts: ratingBreakdown.weeklyEarningsPoints, max: 30, icon: <DollarSign className="w-4 h-4" />, color: theme === 'dark' ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-400' : 'bg-emerald-50 border-emerald-100 text-emerald-600' },
                    { label: 'Рефералы', value: `${ratingBreakdown.referrals}`, pts: ratingBreakdown.referralsPoints, max: 20, icon: <Users className="w-4 h-4" />, color: theme === 'dark' ? 'bg-purple-500/5 border-purple-500/10 text-purple-400' : 'bg-purple-50 border-purple-100 text-purple-600' },
                    { label: 'Инициативы', value: `${ratingBreakdown.initiatives}`, pts: ratingBreakdown.initiativesPoints, max: 15, icon: <Lightbulb className="w-4 h-4" />, color: theme === 'dark' ? 'bg-indigo-500/5 border-indigo-500/10 text-indigo-400' : 'bg-indigo-50 border-indigo-100 text-indigo-600' },
                    { label: 'Отсутствия', value: `${ratingBreakdown.absenceDays} дн`, pts: ratingBreakdown.absenceDaysPoints, max: 10, icon: <AlertTriangle className="w-4 h-4" />, color: ratingBreakdown.absenceDaysPoints < 0 ? (theme === 'dark' ? 'bg-red-500/5 border-red-500/10 text-red-400' : 'bg-red-50 border-red-100 text-red-600') : (theme === 'dark' ? 'bg-amber-500/5 border-amber-500/10 text-amber-500' : 'bg-amber-50 border-amber-100 text-amber-600') },
                    { label: 'Прогулы', value: `${ratingBreakdown.truancyDays} дн`, pts: ratingBreakdown.truancyDaysPoints, max: 0, icon: <AlertTriangle className="w-4 h-4" />, color: ratingBreakdown.truancyDaysPoints < 0 ? (theme === 'dark' ? 'bg-red-900/5 border-red-900/10 text-red-900' : 'bg-red-100 border-red-200 text-red-800') : (theme === 'dark' ? 'bg-green-500/5 border-green-500/10 text-green-400' : 'bg-green-50 border-green-100 text-green-600') }
                  ].map(item => (
                    <div key={item.label} className={`p-3 rounded-xl border shadow-sm transition-all hover:scale-[1.02] ${item.color}`}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1">
                          {item.icon}
                          <div className="text-[8px] font-black uppercase tracking-widest opacity-80">{item.label}</div>
                        </div>
                        {item.max > 0 && (
                          <div className="text-[8px] font-black opacity-60">
                            {item.pts > 0 ? '+' : ''}{item.pts}/{item.max}
                          </div>
                        )}
                      </div>
                      <div className={`text-sm font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{item.value}</div>
                      {item.max > 0 && (
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1 mt-1.5">
                          <div
                            className={`h-full transition-all duration-300 ${item.pts > 0 ? 'bg-[#4E6E49]' : 'bg-gray-400'}`}
                            style={{ width: `${Math.min(Math.max((item.pts / item.max) * 100, 0), 100)}%` }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className={`mt-auto p-4 rounded-xl border ${theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-gray-100 bg-gray-50'}`}>
                  <h3 className={`text-sm font-bold ${headingColor} mb-2 flex items-center gap-2`}>
                    <Info className="w-4 h-4" />
                    Как считается рейтинг
                  </h3>
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    6 параметров: часы работы (неделя), заработок (неделя), рефералы (месяц), инициативы (месяц), отсутствия (месяц), прогулы (месяц). Максимум баллов не ограничен. Минимум 50 баллов для нахождения в команде.
                  </p>
                </div>
              </div>
            )}

            {/* Earnings Card */}
            {earningsSummary && (
              <div className={`rounded-2xl p-6 border ${theme === 'dark' ? 'border-white/5 bg-[#1a1a1a]' : 'border-gray-200 bg-white'} shadow`}>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${theme === 'dark' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-emerald-50 text-emerald-600'}`}>
                      <DollarSign className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className={`text-sm font-black uppercase tracking-widest ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Мой заработок</h2>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Суммы с учётом долей</p>
                    </div>
                  </div>

                  <div className={`px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest border ${weeklyStatusClass}`}>
                    {weeklyStatusText}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  {[
                    { label: 'Всего заработано', value: earningsSummary.total, icon: <TrendingUp className="w-3 h-3" /> },
                    { label: 'Отправлено в пул', value: earningsSummary.pool, icon: <PiggyBank className="w-3 h-3" /> },
                    { label: 'Чистыми', value: earningsSummary.net, icon: <Wallet className="w-3 h-3" /> },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className={`p-4 rounded-xl border shadow-sm ${theme === 'dark' ? 'border-white/5 bg-black/20' : 'border-gray-100 bg-gray-50'}`}
                    >
                      <div className="flex items-center gap-2 mb-2 opacity-70">
                        {item.icon}
                        <p className="text-[9px] font-black uppercase tracking-widest">{item.label}</p>
                      </div>
                      <p className={`text-xl font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{Math.round(item.value).toLocaleString('ru-RU')} ₽</p>
                    </div>
                  ))}
                </div>

                <div className={`p-5 rounded-xl border ${theme === 'dark' ? 'border-white/5 bg-emerald-500/5' : 'border-emerald-100 bg-emerald-50/50'} flex flex-col gap-4`}>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div>
                      <p className={`text-xs font-black uppercase tracking-wider ${theme === 'dark' ? 'text-emerald-500/80' : 'text-emerald-700'}`}>Активная неделя</p>
                      <p className={`text-[10px] ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Пн, Ср, Пт, Сб — дни вывода</p>
                    </div>
                    <span className={`text-[9px] font-black tracking-widest px-3 py-1 rounded-full border ${weeklyStatusClass}`}>
                      {weeklyStatusBadge}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { label: 'Заработано', value: earningsSummary.weekly.gross },
                      { label: 'В пул', value: earningsSummary.weekly.pool },
                      { label: 'Чистыми', value: earningsSummary.weekly.net },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className={`p-3 rounded-lg border shadow-sm ${theme === 'dark' ? 'border-white/5 bg-[#151a21]' : 'border-gray-100 bg-gray-50'}`}
                      >
                        <p className="text-[8px] font-black uppercase tracking-widest opacity-70">{item.label}</p>
                        <p className={`text-base font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{Math.round(item.value).toLocaleString('ru-RU')} ₽</p>
                      </div>
                    ))}
                  </div>
                  {earningsSummary.weekly.net < 10000 && (
                    <p className={`text-[10px] font-medium ${theme === 'dark' ? 'text-amber-500/80' : 'text-amber-700'}`}>
                      Менее 10 000 ₽ чистыми — вывод недоступен, сумма переносится.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
