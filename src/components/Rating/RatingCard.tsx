// Rating card component
import { useThemeStore } from '@/store/themeStore'
import { getRatingColor, getRatingBreakdown } from '@/utils/ratingUtils'
import { RatingData, TEAM_MEMBERS } from '@/types'
import { formatHours } from '@/utils/dateUtils'

interface RatingCardProps {
  rating: RatingData & { breakdown?: ReturnType<typeof getRatingBreakdown> }
}

export const RatingCard = ({ rating }: RatingCardProps) => {
  const { theme } = useThemeStore()
  const member = TEAM_MEMBERS.find((m) => m.id === rating.userId)
  const color = getRatingColor(rating.rating)
  const headingColor = theme === 'dark' ? 'text-white' : 'text-gray-900'
  const labelColor = theme === 'dark' ? 'text-white' : 'text-gray-800'
  const mutedColor = theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
  const valueColor = theme === 'dark' ? 'text-white' : 'text-gray-900'
  const barWidth = rating.rating <= 0 ? '4%' : `${Math.min(rating.rating, 100)}%`

  return (
    <div className={`rounded-lg p-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
      <div className="mb-4">
        <h3 className={`text-xl font-bold mb-2 ${headingColor}`}>{member?.name || 'Неизвестно'}</h3>

        {/* Rating progress bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm font-semibold ${labelColor}`}>Рейтинг</span>
            <span className={`text-sm font-semibold ${labelColor}`}>{rating.rating.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-6 overflow-hidden">
            <div
              className="h-full transition-all duration-300 flex items-center justify-center text-xs font-semibold text-white"
              style={{
                width: barWidth,
                backgroundColor: color,
                minWidth: rating.rating <= 0 ? '40px' : undefined,
              }}
            >
              {rating.rating >= 10 && <span>{rating.rating.toFixed(0)}%</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Rating Breakdown */}
      {rating.breakdown && (
        <div className="mb-4 space-y-2 text-sm">
          <div className={`text-xs font-semibold ${mutedColor} mb-2`}>Параметры рейтинга:</div>
          <div className="flex justify-between">
            <span className={mutedColor}>Выходные:</span>
            <span className={`${valueColor} font-medium`}>{rating.breakdown.daysOffPoints}% ({rating.breakdown.daysOff} день)</span>
          </div>
          <div className="flex justify-between">
            <span className={mutedColor}>Больничные:</span>
            <span className={`${valueColor} font-medium`}>{rating.breakdown.sickDaysPoints}% ({rating.breakdown.sickDays} дней)</span>
          </div>
          <div className="flex justify-between">
            <span className={mutedColor}>Отпуск:</span>
            <span className={`${valueColor} font-medium`}>{rating.breakdown.vacationDaysPoints}% ({rating.breakdown.vacationDays} дней)</span>
          </div>
          <div className="flex justify-between">
            <span className={mutedColor}>Часы (неделя):</span>
            <span className={`${valueColor} font-medium`}>{rating.breakdown.weeklyHoursPoints}% ({formatHours(rating.breakdown.weeklyHours)})</span>
          </div>
          <div className="flex justify-between">
            <span className={mutedColor}>Заработок (неделя):</span>
            <span className={`${valueColor} font-medium`}>{rating.breakdown.weeklyEarningsPoints}% ({rating.breakdown.weeklyEarnings.toFixed(2)} ₽)</span>
          </div>
          <div className="flex justify-between">
            <span className={mutedColor}>Рефералы:</span>
            <span className={`${valueColor} font-medium`}>{rating.breakdown.referralsPoints}% ({rating.breakdown.referrals})</span>
          </div>
          <div className="flex justify-between">
            <span className={mutedColor}>Сообщения (неделя):</span>
            <span className={`${valueColor} font-medium`}>{rating.breakdown.weeklyMessagesPoints}% ({rating.breakdown.weeklyMessages})</span>
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="space-y-2 text-sm">
        <div className={`text-xs font-semibold ${mutedColor} mb-2`}>Общая статистика:</div>
        <div className="flex justify-between">
          <span className={mutedColor}>Заработок (месяц):</span>
          <span className={`${valueColor} font-medium`}>{rating.earnings.toFixed(2)} ₽</span>
        </div>
        <div className="flex justify-between">
          <span className={mutedColor}>В пул:</span>
          <span className={`${valueColor} font-medium`}>{rating.poolAmount.toFixed(2)} ₽</span>
        </div>
        <div className="flex justify-between">
          <span className={mutedColor}>Рефералов:</span>
          <span className={`${valueColor} font-medium`}>{rating.referrals}</span>
        </div>
      </div>
    </div>
  )
}



