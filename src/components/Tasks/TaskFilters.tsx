// Task filters component
import React from 'react'
import { useThemeStore } from '@/store/themeStore'
import { TaskCategory, TaskStatus, TASK_CATEGORIES } from '@/types'
import { useUsers } from '@/hooks/useUsers'

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

  const { users: allMembers } = useUsers()

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
          <div className="flex-1 lg:w-64">
            <div className="relative">
              <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none`}>
                <span className={`text-gray-500 text-xs font-bold uppercase`}>Исполнитель</span>
              </div>
              <select
                value={selectedUsers[0] || ''}
                onChange={(e) => onUsersChange(e.target.value ? [e.target.value] : [])}
                className={`block w-full pl-24 pr-10 py-2 sm:text-sm rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#4E6E49] ${theme === 'dark'
                  ? 'bg-[#1a1a1a] border-white/10 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
                  }`}
              >
                <option value="">Все</option>
                {allMembers.map(user => (
                  <option key={user.id} value={user.id}>{user.name}</option>
                ))}
              </select>
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

