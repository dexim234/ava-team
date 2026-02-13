import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useAdminStore } from '@/store/adminStore'
import { useThemeStore } from '@/store/themeStore'
import { Task, TaskPriority, TaskStatus, TASK_CATEGORIES, TEAM_MEMBERS } from '@/types'
import {
  Calendar,
  Copy,
  Edit,
  Trash2,
  ArrowRight,
} from 'lucide-react'
import { formatDate } from '@/utils/dateUtils'
import { getUserNicknameSync } from '@/utils/userUtils'
import { CATEGORY_ICONS } from './categoryIcons'

interface TaskCardProps {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (taskId: string) => void
  onMove: (taskId: string, newStatus: TaskStatus) => void
  onCopyLink: (taskId: string) => void
  onOpenDetails: (task: Task) => void
}

export const TaskCard = ({ task, onEdit, onDelete, onMove, onCopyLink, onOpenDetails }: TaskCardProps) => {
  const { user } = useAuthStore()
  const { isAdmin } = useAdminStore()
  const { theme } = useThemeStore()
  
  const [showMoveMenu, setShowMoveMenu] = useState(false)
  const [loading, setLoading] = useState(false)

  const headingColor = theme === 'dark' ? 'text-white' : 'text-gray-900'
  const cardBg = theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-white'
  const borderColor = theme === 'dark' ? 'border-gray-800' : 'border-gray-300'
  
  const canEdit = isAdmin || user?.id === task.createdBy
  const canDelete = isAdmin || user?.id === task.createdBy
  const canMove = isAdmin || user?.id === task.createdBy

  const categoryInfo = TASK_CATEGORIES[task.category]
  const CategoryIcon = CATEGORY_ICONS[task.category]

  const mainExecutor = task.assignedTo[0]
  const executorMember = TEAM_MEMBERS.find(m => m.id === mainExecutor)

  const priorityColors: Record<TaskPriority, string> = {
    urgent: theme === 'dark' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' : 'bg-rose-50 text-rose-700 border-rose-200',
    high: theme === 'dark' ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-red-50 text-red-700 border-red-200',
    medium: theme === 'dark' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-amber-50 text-amber-700 border-amber-200',
    low: theme === 'dark' ? 'bg-gray-500/20 text-gray-400 border-gray-500/30' : 'bg-gray-50 text-gray-700 border-gray-200',
  }

  const priorityLabels: Record<TaskPriority, string> = {
    urgent: 'Экстренный',
    high: 'Высокий',
    medium: 'Средний',
    low: 'Низкий',
  }

  const statusLabels: Record<TaskStatus, string> = {
    in_progress: 'В работе',
    completed: 'Выполнено',
    closed: 'Закрыто',
  }

  const handleMove = async (newStatus: TaskStatus) => {
    setShowMoveMenu(false)
    setLoading(true)
    try {
      const { updateTask } = await import('@/services/firestoreService')
      await updateTask(task.id, { status: newStatus, updatedAt: new Date().toISOString() })
      onMove(task.id, newStatus)
    } catch (error) {
      console.error('Error moving task:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div
        onClick={() => onOpenDetails(task)}
        className={`${cardBg} rounded-xl border-2 ${borderColor} p-4 shadow-lg hover:shadow-xl transition-all cursor-pointer ${
          theme === 'dark' 
            ? 'hover:border-[#4E6E49]/50' 
            : 'hover:border-[#4E6E49]'
        }`}
      >
        {/* Header: ID and Actions */}
        <div className="flex items-start justify-between gap-3 mb-3">
          {/* ID Badge */}
          <span className={`px-2 py-1 rounded-lg text-xs font-mono ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>
            #{task.id.slice(0, 6)}
          </span>

          {/* Action Buttons */}
          <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => onCopyLink(task.id)}
              className={`p-1.5 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              title="Скопировать ссылку"
            >
              <Copy className="w-4 h-4" />
            </button>
            {canMove && (
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowMoveMenu(!showMoveMenu)
                  }}
                  disabled={loading}
                  className={`p-1.5 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                  title="Переместить"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
                {showMoveMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowMoveMenu(false)} />
                    <div className={`absolute top-full right-0 mt-1 ${cardBg} border ${borderColor} rounded-lg shadow-xl z-20 overflow-hidden min-w-[120px]`}>
                      {Object.entries(statusLabels).map(([status, label]) => (
                        <button
                          key={status}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleMove(status as TaskStatus)
                          }}
                          disabled={loading || task.status === status}
                          className={`w-full px-3 py-2 text-left text-sm font-medium transition-colors ${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-gray-100'} ${task.status === status ? 'text-[#4E6E49]' : headingColor} disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
            {canEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit(task)
                }}
                className={`p-1.5 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                title="Редактировать"
              >
                <Edit className="w-4 h-4" />
              </button>
            )}
            {canDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(task.id)
                }}
                className={`p-1.5 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-red-500/20 text-red-400' : 'hover:bg-red-50 text-red-600'}`}
                title="Удалить"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Priority and Category */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${priorityColors[task.priority || 'medium']}`}>
            {priorityLabels[task.priority || 'medium']}
          </span>
          <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${theme === 'dark' ? 'bg-[#4E6E49]/20 text-[#4E6E49] border-[#4E6E49]/30' : 'bg-green-50 text-[#4E6E49] border-green-200'} flex items-center gap-1.5`}>
            <CategoryIcon className="w-3.5 h-3.5" />
            {categoryInfo.label}
          </span>
        </div>

        {/* Title */}
        <h3 className={`text-base sm:text-lg font-bold ${headingColor} mb-3 line-clamp-2`}>
          {task.title}
        </h3>

        {/* Executor */}
        {executorMember && (
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4E6E49] to-[#3d5639] flex items-center justify-center text-xs text-white font-bold flex-shrink-0">
              {executorMember.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className={`text-sm ${headingColor} truncate`}>
                {getUserNicknameSync(executorMember.id)}
              </div>
              <div className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                Исполнитель
              </div>
            </div>
          </div>
        )}

        {/* Deadline */}
        <div className={`flex items-center gap-2 p-2.5 rounded-lg ${theme === 'dark' ? 'bg-[#0f0f0f]' : 'bg-gray-50'}`}>
          <Calendar className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
          <div className="flex-1 min-w-0">
            <div className={`text-sm font-medium ${headingColor} truncate`}>
              {formatDate(new Date(task.dueDate), 'dd MMM yyyy')}
            </div>
            <div className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
              {task.dueTime}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
