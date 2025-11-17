// Rating card component
import { useThemeStore } from '@/store/themeStore'
import { getRatingColor } from '@/utils/ratingUtils'
import { RatingData, TEAM_MEMBERS } from '@/types'

interface RatingCardProps {
  rating: RatingData
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

      {/* Statistics */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className={mutedColor}>Заработок:</span>
          <span className={`${valueColor} font-medium`}>{rating.earnings.toFixed(2)} ₽</span>
        </div>
        <div className="flex justify-between">
          <span className={mutedColor}>Сообщений:</span>
          <span className={`${valueColor} font-medium`}>{rating.messages}</span>
        </div>
        <div className="flex justify-between">
          <span className={mutedColor}>Инициатив:</span>
          <span className={`${valueColor} font-medium`}>{rating.initiatives}</span>
        </div>
        <div className="flex justify-between">
          <span className={mutedColor}>Сигналов:</span>
          <span className={`${valueColor} font-medium`}>{rating.signals}</span>
        </div>
        <div className="flex justify-between">
          <span className={mutedColor}>Прибыльных:</span>
          <span className={`${valueColor} font-medium`}>{rating.profitableSignals}</span>
        </div>
        <div className="flex justify-between">
          <span className={mutedColor}>Приглашено:</span>
          <span className={`${valueColor} font-medium`}>{rating.referrals}</span>
        </div>
        <div className="flex justify-between">
          <span className={mutedColor}>Выходных:</span>
          <span className={`${valueColor} font-medium`}>{rating.daysOff}</span>
        </div>
        <div className="flex justify-between">
          <span className={mutedColor}>Больничных:</span>
          <span className={`${valueColor} font-medium`}>{rating.sickDays}</span>
        </div>
        <div className="flex justify-between">
          <span className={mutedColor}>Отпусков:</span>
          <span className={`${valueColor} font-medium`}>{rating.vacationDays}</span>
        </div>
        <div className="flex justify-between">
          <span className={mutedColor}>В пул:</span>
          <span className={`${valueColor} font-medium`}>{rating.poolAmount.toFixed(2)} ₽</span>
        </div>
      </div>
    </div>
  )
}



