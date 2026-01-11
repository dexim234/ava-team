// Task filters component
import React from 'react'
import { useThemeStore } from '@/store/themeStore'
import { TaskCategory, TaskStatus, TASK_CATEGORIES } from '@/types'
import { MemberSelector } from '@/components/Management/MemberSelector'

interface TaskFiltersProps {
  selectedCategory: TaskCategory | 'all'
  selectedStatus: TaskStatus | 'all'
  selectedUsers: string[]
  onCategoryChange: (category: TaskCategory | 'all') => void
  onStatusChange: (status: TaskStatus | 'all') => void
  onUsersChange: (userIds: string[]) => void
  children?: React.ReactNode
}

export const TaskFilters = ({
  selectedCategory,
  selectedStatus,
  selectedUsers,
  onCategoryChange,
  onStatusChange,
  onUsersChange,
  children
}: TaskFiltersProps) => {
  const { theme } = useThemeStore()

  const cardBg = theme === 'dark' ? 'bg-[#151a21]/50' : 'bg-white'
  const borderColor = theme === 'dark' ? 'border-white/5' : 'border-gray-200'

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
    <div className={`rounded-xl border ${borderColor} ${cardBg} p-2 sm:p-3 shadow-lg space-y-4`}>
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        {/* Status Tabs */}
        <div className={`flex p-1 rounded-lg ${theme === 'dark' ? 'bg-[#0f1216]' : 'bg-gray-100'} overflow-x-auto`}>
          {statusOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onStatusChange(option.value as TaskStatus | 'all')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap ${selectedStatus === option.value
                ? theme === 'dark' ? 'bg-[#2A3441] text-white shadow' : 'bg-white text-gray-900 shadow'
                : theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'
                }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4 w-full lg:w-auto">
          <div className="flex-1 lg:min-w-[280px]">
            <div className="relative">
              <MemberSelector
                selectedUserId={selectedUsers[0] || null}
                onSelect={(userId) => onUsersChange(userId ? [userId] : [])}
              />
            </div>
          </div>
          {children}
        </div>
      </div>

      {/* Categories */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        <span className={`text-xs font-bold uppercase whitespace-nowrap ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
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
  )
}
