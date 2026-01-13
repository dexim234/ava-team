import { useState } from 'react'
import { useThemeStore } from '@/store/themeStore'
import { TaskCategory, TaskStatus, TASK_CATEGORIES } from '@/types'
import { MemberSelector } from '@/components/Management/MemberSelector'
import { Filter, ChevronDown, X } from 'lucide-react'

interface TaskFiltersProps {
  selectedCategory: TaskCategory | 'all'
  selectedStatus: TaskStatus | 'all'
  selectedUsers: string[]
  onCategoryChange: (category: TaskCategory | 'all') => void
  onStatusChange: (status: TaskStatus | 'all') => void
  onUsersChange: (userIds: string[]) => void
  onAddTask?: () => void
}

export const TaskFilters = ({
  selectedCategory,
  selectedStatus,
  selectedUsers,
  onCategoryChange,
  onStatusChange,
  onUsersChange,
  onAddTask
}: TaskFiltersProps) => {
  const { theme } = useThemeStore()
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  const cardBg = theme === 'dark' ? 'bg-[#151a21]/50' : 'bg-white'
  const borderColor = theme === 'dark' ? 'border-white/5' : 'border-gray-200'
  const headingColor = theme === 'dark' ? 'text-white' : 'text-gray-900'
  const mutedColor = theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
  const inputBg = theme === 'dark' ? 'bg-[#0f1216]' : 'bg-gray-100'

  const statusOptions = [
    { value: 'all', label: 'Все' },
    { value: 'in_progress', label: 'В работе' },
    { value: 'completed', label: 'Выполнено' },
    { value: 'closed', label: 'Закрыто' }
  ]

  const categories = Object.entries(TASK_CATEGORIES).map(([key, { label }]) => ({
    key: key as TaskCategory,
    label
  }))

  return (
    <div className="space-y-3">
      {/* Mobile: Filters toggle + Add button */}
      <div className="flex items-center justify-between gap-3 lg:hidden">
        <button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border font-medium transition-all flex-1 justify-center ${
            theme === 'dark' 
              ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' 
              : 'bg-gray-100 border-gray-200 text-gray-900 hover:bg-gray-200'
          }`}
        >
          <Filter className="w-4 h-4" />
          <span>Фильтры</span>
          {showMobileFilters ? (
            <X className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
        
        <button
          onClick={onAddTask}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-900/20 active:scale-95 flex-1 justify-center"
        >
          <span className="text-lg">+</span>
          <span>Новая задача</span>
        </button>
      </div>

      {/* Filters content */}
      <div className={`rounded-xl border ${borderColor} ${cardBg} shadow-lg transition-all duration-300 ${
        showMobileFilters ? 'block' : 'hidden lg:block'
      }`}>
        {/* Status Tabs */}
        <div className="p-2 sm:p-3">
          <div className={`flex p-1 rounded-lg ${inputBg} overflow-x-auto scrollbar-hide`}>
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => onStatusChange(option.value as TaskStatus | 'all')}
                className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                  selectedStatus === option.value
                    ? theme === 'dark' ? 'bg-[#2A3441] text-white shadow' : 'bg-white text-gray-900 shadow'
                    : theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category & User filters row */}
        <div className="px-2 sm:px-3 pb-3 flex flex-col sm:flex-row gap-3">
          {/* Category dropdown (mobile-friendly) */}
          <div className="relative flex-1">
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value as TaskCategory | 'all')}
              className={`w-full appearance-none px-3 py-2 rounded-lg text-sm font-medium border ${borderColor} ${inputBg} ${headingColor} cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/50`}
            >
              <option value="all">🏷️ Все категории</option>
              {categories.map(({ key, label }) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
            <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${mutedColor}`} />
          </div>

          {/* Member selector */}
          <div className="w-full sm:w-48">
            <MemberSelector
              selectedUserId={selectedUsers[0] || null}
              onSelect={(userId) => onUsersChange(userId ? [userId] : [])}
            />
          </div>
        </div>

        {/* Categories scrollable chips (desktop only) */}
        <div className="hidden lg:flex items-center gap-2 px-3 pb-3 overflow-x-auto scrollbar-hide">
          <span className={`text-xs font-bold uppercase whitespace-nowrap ${mutedColor}`}>
            Категории:
          </span>
          <button
            onClick={() => onCategoryChange('all')}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors whitespace-nowrap ${selectedCategory === 'all'
              ? theme === 'dark' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-emerald-50 text-emerald-600 border-emerald-200'
              : theme === 'dark' ? 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
              }`}
          >
            Все
          </button>
          {categories.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => onCategoryChange(key)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors whitespace-nowrap ${selectedCategory === key
                ? theme === 'dark' ? 'bg-[#2A3441] text-white border-white/20' : 'bg-gray-800 text-white border-gray-800'
                : theme === 'dark' ? 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop Add Task button */}
      <div className="hidden lg:block">
        <button
          onClick={onAddTask}
          className="whitespace-nowrap flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-900/20 active:scale-95"
        >
          <span className="text-lg">+</span>
          <span>Новая задача</span>
        </button>
      </div>
    </div>
  )
}
