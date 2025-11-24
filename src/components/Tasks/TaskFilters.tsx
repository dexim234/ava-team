// Task filters component
import { useThemeStore } from '@/store/themeStore'
import { TaskCategory, TaskStatus, TEAM_MEMBERS, TASK_CATEGORIES, TASK_STATUSES } from '@/types'
import { Filter, X } from 'lucide-react'

interface TaskFiltersProps {
  selectedCategory: TaskCategory | 'all'
  selectedStatus: TaskStatus | 'all'
  selectedUser: string | 'all'
  onCategoryChange: (category: TaskCategory | 'all') => void
  onStatusChange: (status: TaskStatus | 'all') => void
  onUserChange: (userId: string | 'all') => void
  onClear: () => void
}

export const TaskFilters = ({
  selectedCategory,
  selectedStatus,
  selectedUser,
  onCategoryChange,
  onStatusChange,
  onUserChange,
  onClear,
}: TaskFiltersProps) => {
  const { theme } = useThemeStore()
  
  const headingColor = theme === 'dark' ? 'text-white' : 'text-gray-900'
  const cardBg = theme === 'dark' ? 'bg-gray-800' : 'bg-white'
  const borderColor = theme === 'dark' ? 'border-gray-600' : 'border-gray-300'
  const buttonBg = theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
  const activeButtonBg = theme === 'dark' ? 'bg-green-500/20 border-green-500' : 'bg-green-50 border-green-500'

  const hasActiveFilters = selectedCategory !== 'all' || selectedStatus !== 'all' || selectedUser !== 'all'

  return (
    <div className={`${cardBg} rounded-xl border-2 ${borderColor} p-4 sm:p-6 shadow-lg`}>
      <div className="flex items-center gap-2 mb-4">
        <Filter className={`w-5 h-5 ${headingColor}`} />
        <h3 className={`text-lg font-bold ${headingColor}`}>Фильтры</h3>
        {hasActiveFilters && (
          <button
            onClick={onClear}
            className={`ml-auto px-3 py-1.5 rounded-lg text-sm transition-colors flex items-center gap-2 ${
              theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            <X className="w-4 h-4" />
            Сбросить
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* Category Filter */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${headingColor}`}>
            Категория
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onCategoryChange('all')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all border-2 ${
                selectedCategory === 'all'
                  ? activeButtonBg
                  : `${buttonBg} ${borderColor}`
              }`}
            >
              Все
            </button>
            {Object.entries(TASK_CATEGORIES).map(([key, { label, icon }]) => (
              <button
                key={key}
                onClick={() => onCategoryChange(key as TaskCategory)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all border-2 ${
                  selectedCategory === key
                    ? activeButtonBg
                    : `${buttonBg} ${borderColor}`
                }`}
              >
                {icon} {label}
              </button>
            ))}
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${headingColor}`}>
            Статус
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onStatusChange('all')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all border-2 ${
                selectedStatus === 'all'
                  ? activeButtonBg
                  : `${buttonBg} ${borderColor}`
              }`}
            >
              Все
            </button>
            {Object.entries(TASK_STATUSES).map(([key, { label }]) => (
              <button
                key={key}
                onClick={() => onStatusChange(key as TaskStatus)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all border-2 ${
                  selectedStatus === key
                    ? activeButtonBg
                    : `${buttonBg} ${borderColor}`
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* User Filter */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${headingColor}`}>
            Участник
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onUserChange('all')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all border-2 ${
                selectedUser === 'all'
                  ? activeButtonBg
                  : `${buttonBg} ${borderColor}`
              }`}
            >
              Все
            </button>
            {TEAM_MEMBERS.map((member) => (
              <button
                key={member.id}
                onClick={() => onUserChange(member.id)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all border-2 ${
                  selectedUser === member.id
                    ? activeButtonBg
                    : `${buttonBg} ${borderColor}`
                }`}
              >
                {member.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

