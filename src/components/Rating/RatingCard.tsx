import { useThemeStore } from '@/store/themeStore'
import { getRatingBreakdown, getExclusionStatus } from '@/utils/ratingUtils'
import { RatingData } from '@/types'
import { UserNickname } from '@/components/UserNickname'
import { Clock, DollarSign, Users, TrendingUp, AlertTriangle, Lightbulb, Shield } from 'lucide-react'
import React, { useState } from 'react'
import { useUserNickname, useUserAvatar } from '@/utils/userUtils'

interface RatingCardProps {
  rating: RatingData & { breakdown?: ReturnType<typeof getRatingBreakdown> }
  place?: { rank: number }
}

interface MetricInfo {
  icon: React.ReactNode
  label: string
  value: string
  points: number
  maxPoints: number
  what: string
  why: string
  how: string
  color: string
}

export const RatingCard = ({ rating, place }: RatingCardProps) => {
  console.log('RatingCard render - userId:', rating.userId, 'breakdown:', rating.breakdown)
  const { theme } = useThemeStore()
  const [expandedMetric, setExpandedMetric] = useState<number | null>(null)
  const headingColor = theme === 'dark' ? 'text-white' : 'text-gray-900'
  const mutedColor = theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
  const cardBg = theme === 'dark' ? 'bg-[#0f0f0f]' : 'bg-white'
  const borderColor = theme === 'dark' ? 'border-white/10' : 'border-gray-200'
  const hoverBg = theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-gray-50'
  const softSurface = theme === 'dark' ? 'bg-white/5' : 'bg-gray-50/80'

  // Максимальное количество баллов не ограничено, поэтому показываем прогресс относительно 100 как ориентир
  const barWidth = rating.rating <= 0 ? '4%' : `${Math.min(Math.max(rating.rating, 5), 100)}%`
  const bandColor =
    rating.rating >= 80
      ? 'bg-emerald-500'
      : rating.rating >= 60
        ? 'bg-blue-500'
        : rating.rating >= 50
          ? 'bg-amber-500'
          : 'bg-rose-500'

  const nickname = useUserNickname(rating.userId)
  const avatarUrl = useUserAvatar(rating.userId)

  const metrics: MetricInfo[] = rating.breakdown ? [
    {
      icon: <Clock className="w-5 h-5" />,
      label: 'Часы работы',
      value: `${rating.breakdown.weeklyHours.toFixed(1)} ч/нед`,
      points: rating.breakdown.weeklyHoursPoints,
      maxPoints: 15,
      what: `Отработано ${rating.breakdown.weeklyHours.toFixed(1)} часов за неделю. Шкала: <15ч = 0 баллов, 15-20ч = 5 баллов, 20-30ч = 10 баллов, ≥30ч = 15 баллов.`,
      why: 'Часы работы показывают твой вклад в общее время команды. Это базовый показатель активности — чем больше часов, тем выше твой вклад.',
      how: rating.breakdown.weeklyHoursPoints < 15
        ? rating.breakdown.weeklyHoursPoints === 0
          ? 'Твоя активность ниже нормы. Для получения баллов нужно минимум 15 часов в неделю. Берите больше слотов и задач.'
          : rating.breakdown.weeklyHoursPoints === 5
          ? 'Хороший старт! Цель: 20-30 часов в неделю для 10-15 баллов.'
          : 'Почти у цели! Добавь ещё несколько часов для максимальных 15 баллов.'
        : 'Отличный результат! Ты активно работаешь и вносишь максимальный вклад.',
      color: 'bg-blue-200 text-blue-900 dark:bg-blue-500/20 dark:text-blue-400'
    },
    {
      icon: <DollarSign className="w-5 h-5" />,
      label: 'Заработок (неделя)',
      value: `${Math.round(rating.breakdown.weeklyEarnings).toLocaleString()} ₽`,
      points: rating.breakdown.weeklyEarningsPoints,
      maxPoints: 30,
      what: `Заработано ${Math.round(rating.breakdown.weeklyEarnings).toLocaleString()} ₽ за неделю. Шкала: <10K = 0, 10-20K = 10, 20-40K = 20, ≥40K = 30 баллов.`,
      why: 'Недельный доход — ключевой показатель эффективности твоих действий. Это результат работы и умения находить профитные возможности.',
      how: rating.breakdown.weeklyEarningsPoints < 30
        ? rating.breakdown.weeklyEarningsPoints === 0
          ? 'Доход ниже порога для баллов. Минимум 10 000 ₽ для получения баллов. Анализируй рынок и ищи возможности.'
          : rating.breakdown.weeklyEarningsPoints === 10
          ? 'Хороший результат! Цель: 20 000+ ₽ для 20 баллов или 40 000+ ₽ для максимальных 30.'
          : 'Отличный прогресс! До 30 баллов осталось чуть больше 20 000 ₽.'
        : 'Супер! Твой доход на высоте — ты получаешь максимальные баллы за этот показатель.',
      color: 'bg-emerald-200 text-emerald-900 dark:bg-emerald-500/20 dark:text-emerald-400'
    },
    {
      icon: <Users className="w-5 h-5" />,
      label: 'Рефералы (месяц)',
      value: `${rating.breakdown.referrals} чел.`,
      points: rating.breakdown.referralsPoints,
      maxPoints: 20,
      what: `Привлечено ${rating.breakdown.referrals} рефералов за 30 дней. Шкала: <5 = 0, 5-15 = 5, 15-30 = 10, >30 = 20 баллов.`,
      why: 'Рост комьюнити важен для масштабирования и новых возможностей. Рефералы показывают твой вклад в развитие сообщества.',
      how: rating.breakdown.referralsPoints < 20
        ? rating.breakdown.referralsPoints === 0
          ? 'Рефералов пока нет. Начни с 5 приглашённых для первых 5 баллов. Делись реферальной ссылкой.'
          : rating.breakdown.referralsPoints === 5
          ? 'Хорошее начало! Цель: 15-30 рефералов для 10-20 баллов.'
          : 'Отличный прогресс! До максимальных 20 баллов осталось ещё несколько приглашений.'
        : 'Превосходно! Ты активно помогаешь развивать комьюнити.',
      color: 'bg-pink-200 text-pink-900 dark:bg-pink-500/20 dark:text-pink-400'
    },
    {
      icon: <Lightbulb className="w-5 h-5" />,
      label: 'Инициативы (месяц)',
      value: `${rating.breakdown.initiatives}`,
      points: rating.breakdown.initiativesPoints,
      maxPoints: 15,
      what: `Предложено ${rating.breakdown.initiatives} инициатив за месяц. Шкала: <1 = 0, 1-5 = 5, 5-10 = 10, >10 = 15 баллов.`,
      why: 'Проактивность помогает развивать проект и улучшать процессы. Инициативы показывают твою вовлечённость в развитие команды.',
      how: rating.breakdown.initiativesPoints < 15
        ? rating.breakdown.initiativesPoints === 0
          ? 'Инициатив пока нет. Предложи хотя бы 1 идею для первых 5 баллов. Это может быть улучшение процессов, новый инструмент или предложение.'
          : rating.breakdown.initiativesPoints === 5
          ? 'Хороший старт! Цель: 5-10 инициатив для 10-15 баллов.'
          : 'Почти у цели! Ещё несколько инициатив для максимальных 15 баллов.'
        : 'Отлично! Ты активно вносишь вклад в развитие проекта.',
      color: 'bg-indigo-200 text-indigo-900 dark:bg-indigo-500/20 dark:text-indigo-400'
    },
    {
      icon: <Shield className="w-5 h-5" />,
      label: 'Отсутствия (месяц)',
      value: `${rating.breakdown.absenceDays} дн.`,
      points: rating.breakdown.absenceDaysPoints,
      maxPoints: 10,
      what: `Отсутствий: ${rating.breakdown.absenceDays} за месяц (с согласованием). Шкала: <5 = +10, 5-10 = 0, >10 = -20 баллов.`,
      why: 'Минимум отсутствий показывает твою ответственность и надёжность как участника команды. Меньше 5 дней в месяц — бонус.',
      how: rating.breakdown.absenceDaysPoints < 10
        ? rating.breakdown.absenceDaysPoints === -20
          ? 'Слишком много отсутствий! Ты теряешь 20 баллов. Старайся минимизировать отсутствия и лучше планировать своё время.'
          : 'Нейтральный показатель. Для получения +10 баллов постарайся держать отсутствия ниже 5 дней в месяц.'
        : 'Отличная посещаемость! Ты получаешь бонус за стабильность.',
      color: rating.breakdown.absenceDaysPoints < 0
        ? 'bg-red-200 text-red-900 dark:bg-red-500/20 dark:text-red-400'
        : 'bg-amber-200 text-amber-900 dark:bg-amber-500/20 dark:text-amber-400'
    },
    {
      icon: <AlertTriangle className="w-5 h-5" />,
      label: 'Прогулы (месяц)',
      value: `${rating.breakdown.truancyDays} дн.`,
      points: rating.breakdown.truancyDaysPoints,
      maxPoints: 0,
      what: `Прогулов: ${rating.breakdown.truancyDays} за месяц (без согласования). Шкала: >3 = -15, >6 = -30 баллов.`,
      why: 'Прогул — серьёзное нарушение дисциплины. >3 прогулов — штраф -15 баллов, >6 — двойной штраф -30 баллов. Это влияет на возможность оставаться в команде.',
      how: rating.breakdown.truancyDaysPoints < 0
        ? rating.breakdown.truancyDaysPoints === -30
          ? 'Критичная ситуация! Прогулы недопустимы. Ты теряешь 30 баллов и рискуешь быть исключённым из команды. Обязательно предупреждай об отсутствиях заранее!'
          : 'Внимание! Прогулы влияют на рейтинг. Ты теряешь 15 баллов. Предупреждай об отсутствиях заранее через статус "Отсутствие".'
        : 'Дисциплина в норме. Продолжай предупреждать о планах заранее.',
      color: rating.breakdown.truancyDaysPoints < 0
        ? 'bg-red-300 text-red-900 dark:bg-red-500/30 dark:text-red-400'
        : 'bg-green-200 text-green-900 dark:bg-green-500/20 dark:text-green-400'
    },
  ] : []

  const totalPoints = rating.breakdown?.totalRating || rating.rating
  const exclusionStatus = getExclusionStatus(rating.rating)

  // Place badge
  const placeBadge = (() => {
    if (!place) return null
    const rank = place.rank

    return (
      <div className={`inline-flex px-3 py-1.5 rounded-xl text-sm font-bold border-2 ${
        rank === 1
          ? 'bg-amber-500/10 border-amber-500/50 text-amber-600 dark:text-amber-400'
          : rank === 2
            ? 'bg-slate-500/10 border-slate-500/50 text-slate-500 dark:text-slate-400'
            : rank === 3
              ? 'bg-orange-500/10 border-orange-500/50 text-orange-500 dark:text-orange-400'
              : 'bg-gray-500/10 border-gray-500/50 text-gray-500 dark:text-gray-400'
      }`}>
        {rank} {rank === 1 ? 'место' : 'место'}
      </div>
    )
  })()

  return (
    <div className={`relative rounded-2xl p-6 ${cardBg} shadow-xl border ${borderColor} transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 overflow-hidden`}>
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-blue-500/5 pointer-events-none" />

      {/* Header with name and rating */}
      <div className="relative mb-6 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className={`text-[10px] uppercase tracking-[0.15em] font-bold ${mutedColor} mb-2`}>Участник команды</p>
            <div className="flex items-center gap-2 mb-2">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-bold`}>
                  {nickname ? nickname.charAt(0).toUpperCase() : '-'}
                </div>
              )}
              <h3 className={`text-3xl font-black ${headingColor} truncate bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent dark:from-emerald-400 dark:to-blue-400`}>
                <UserNickname userId={rating.userId} fallback="unknown" />
              </h3>
            </div>
            {placeBadge}
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className={`text-4xl font-black bg-gradient-to-br from-emerald-600 to-blue-600 bg-clip-text text-transparent dark:from-emerald-400 dark:to-blue-400`}>
              {rating.rating.toFixed(1)}
            </span>
            <span className={`text-[10px] uppercase tracking-wider font-bold ${mutedColor}`}>баллов</span>
          </div>
        </div>

        {/* Main rating progress bar */}
        <div className="space-y-2">
          <div className="relative w-full h-8 bg-gradient-to-r from-gray-200/50 to-gray-300/50 dark:from-gray-800/50 dark:to-gray-700/50 rounded-2xl overflow-hidden shadow-inner backdrop-blur-sm">
            <div
              className={`h-full transition-all duration-700 ease-out flex items-center justify-end pr-3 ${bandColor} relative overflow-hidden`}
              style={{
                width: barWidth,
                minWidth: rating.rating <= 0 ? '50px' : undefined,
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent" />
              {rating.rating >= 5 && <span className="text-sm font-black text-white drop-shadow-lg relative z-10">{rating.rating.toFixed(1)}</span>}
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className={`text-xs font-semibold ${mutedColor}`}>Общий рейтинг</span>
            <span className={`text-xs font-black ${headingColor} px-2 py-0.5 rounded-lg ${theme === 'dark' ? 'bg-white/10' : 'bg-gray-100'}`}>
              {totalPoints} баллов
            </span>
          </div>
        </div>

        {/* Exclusion Status */}
        <div className="mt-2">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 text-sm font-bold shadow-lg backdrop-blur-sm"
            style={{
              backgroundColor: `${exclusionStatus.color}20`,
              borderColor: `${exclusionStatus.color}60`,
              color: exclusionStatus.color
            }}
          >
            <div
              className="w-2.5 h-2.5 rounded-full animate-pulse shadow-lg"
              style={{ backgroundColor: exclusionStatus.color, boxShadow: `0 0 10px ${exclusionStatus.color}` }}
            />
            <span className="uppercase tracking-wide text-xs">{exclusionStatus.label}</span>
          </div>
          <p className={`text-xs mt-2 ${mutedColor} font-medium`}>{exclusionStatus.description}</p>
        </div>
      </div>

      {/* Metrics Breakdown */}
      {rating.breakdown && (
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className={`w-5 h-5 ${mutedColor}`} />
            <h4 className={`text-lg font-semibold ${headingColor}`}>Детальный разбор</h4>
          </div>

          {metrics.map((metric, index) => {
            const percentage = metric.maxPoints > 0 ? Math.min(Math.max((metric.points / metric.maxPoints) * 100, 0), 100) : 0
            const isExpanded = expandedMetric === index

            return (
              <div
                key={index}
                className={`rounded-lg border ${borderColor} overflow-hidden transition-all ${isExpanded ? 'shadow-md' : ''}`}
              >
                <button
                  onClick={() => setExpandedMetric(isExpanded ? null : index)}
                  className={`w-full p-4 flex items-center justify-between ${hoverBg} transition-colors`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`p-2 rounded-lg ${metric.color} flex-shrink-0`}>
                      {metric.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-semibold ${headingColor} truncate`}>
                          {metric.label}
                        </span>
                        <span className={`font-bold ml-2 ${metric.points > 0 ? 'text-[#4E6E49]' : metric.points < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                          {metric.points > 0 ? '+' : ''}{metric.points}{metric.maxPoints > 0 ? `/${metric.maxPoints}` : ''}
                        </span>
                      </div>
                      {metric.maxPoints > 0 && (
                        <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${metric.color}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      )}
                      <div className="flex items-center justify-between mt-1">
                        <span className={`text-xs ${mutedColor} truncate mr-2`}>{metric.value}</span>
                      </div>
                    </div>
                    <AlertTriangle className={`w-4 h-4 flex-shrink-0 ml-2 ${mutedColor} transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                {isExpanded && (
                  <div className={`px-4 pb-4 pt-2 border-t ${borderColor} ${softSurface}`}>
                    <div className="space-y-3 mt-1">
                      <div>
                        <span className={`text-[10px] uppercase font-bold tracking-wider opacity-60 ${headingColor}`}>Что это</span>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} leading-relaxed`}>{metric.what}</p>
                      </div>
                      <div>
                        <span className={`text-[10px] uppercase font-bold tracking-wider opacity-60 ${headingColor}`}>Почему это важно</span>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} leading-relaxed`}>{metric.why}</p>
                      </div>
                      <div>
                        <span className={`text-[10px] uppercase font-bold tracking-wider opacity-60 ${headingColor}`}>Как улучшить</span>
                        <div className={`mt-1 p-2 rounded-lg border ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-emerald-50 border-emerald-100'}`}>
                          <p className={`text-sm ${metric.points >= metric.maxPoints && metric.maxPoints > 0 ? 'text-gray-500 dark:text-gray-400' : 'text-emerald-600 dark:text-emerald-400'} font-medium`}>
                            {metric.how}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
