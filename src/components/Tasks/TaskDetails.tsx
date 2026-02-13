import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useAdminStore } from '@/store/adminStore'
import { useThemeStore } from '@/store/themeStore'
import { Task, TaskPriority, TaskStatus, TASK_CATEGORIES, TEAM_MEMBERS } from '@/types'
import {
  Calendar,
  Clock,
  Copy,
  Edit,
  Trash2,
  User,
  Link as LinkIcon,
  X,
} from 'lucide-react'
import { formatDate } from '@/utils/dateUtils'
import { getUserNicknameSync } from '@/utils/userUtils'
import { CATEGORY_ICONS } from './categoryIcons'
import { updateTask } from '@/services/firestoreService'

interface TaskDetailsProps {
  task: Task
  onClose: () => void
  onEdit: (task: Task) => void
  onDelete: (taskId: string) => void
  onMove: (taskId: string, newStatus: TaskStatus) => void
  onCopyLink: (taskId: string) => void
}

export const TaskDetails = ({ task, onClose, onEdit, onDelete, onMove, onCopyLink }: TaskDetailsProps) => {
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

  const categoryInfo = TASK_CATEGORIES[task.category]
  const CategoryIcon = CATEGORY_ICONS[task.category]

  const assignedUsers = task.assignedTo.map(userId => {
    const member = TEAM_MEMBERS.find(m => m.id === userId)
    return member
  }).filter((member): member is typeof TEAM_MEMBERS[number] => member !== undefined)

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

  const statusColors: Record<TaskStatus, string> = {
    in_progress: theme === 'dark' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-blue-50 text-blue-700 border-blue-200',
    completed: theme === 'dark' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-emerald-50 text-emerald-700 border-emerald-200',
    closed: theme === 'dark' ? 'bg-gray-500/20 text-gray-400 border-gray-500/30' : 'bg-gray-50 text-gray-700 border-gray-200',
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
      <div className="fixed inset-0 bg-black/50 flex items-start sm:items-center justify-center z-[70] p-4 overflow-y-auto overscroll-contain modal-scroll touch-pan-y">
        <div
          className={`${cardBg} rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-2xl max-h-[calc(100vh-48px)] sm:max-h-[calc(100vh-64px)] overflow-y-auto border-2 touch-pan-y ${
            theme === 'dark'
              ? 'border-[#4E6E49]/30 bg-gradient-to-br from-[#1a1a1a] via-[#1a1a1a] to-[#0A0A0A]'
              : 'border-green-200 bg-gradient-to-br from-white via-green-50/30 to-white'
          } relative`}
        >
          <div className="flex flex-col h-full min-h-0">
            {/* Header */}
            <div className={`sticky top-0 ${cardBg} border-b ${borderColor} p-4 sm:p-6 flex items-start justify-between z-10`}>
              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-1 rounded-lg text-xs font-mono ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>
                    #{task.id.slice(0, 6)}
                  </span>
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${priorityColors[task.priority || 'medium']}`}>
                    {priorityLabels[task.priority || 'medium']}
                  </span>
                </div>
                <h2 className={`text-xl sm:text-2xl font-bold ${headingColor} break-words`}>
                  {task.title}
                </h2>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => onCopyLink(task.id)}
                  className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                  title="Скопировать ссылку"
                >
                  <Copy className="w-5 h-5" />
                </button>
                {canEdit && (
                  <button
                    onClick={() => onEdit(task)}
                    className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                    title="Редактировать"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                )}
                {canDelete && (
                  <button
                    onClick={() => onDelete(task.id)}
                    className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-red-500/20 text-red-400' : 'hover:bg-red-50 text-red-600'}`}
                    title="Удалить"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 flex-1 min-h-0 overflow-y-auto overscroll-contain modal-scroll touch-pan-y pb-10">
              {/* Status and Category */}
              <div className="flex flex-wrap items-center gap-3">
                <span className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${statusColors[task.status]}`}>
                  {statusLabels[task.status]}
                </span>
                <span className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${theme === 'dark' ? 'bg-[#4E6E49]/20 text-[#4E6E49] border-[#4E6E49]/30' : 'bg-green-50 text-[#4E6E49] border-green-200'} flex items-center gap-2`}>
                  <CategoryIcon className="w-4 h-4" />
                  {categoryInfo.label}
                </span>
                {(isAdmin || user?.id === task.createdBy) && (
                  <div className="relative">
                    <button
                      onClick={() => setShowMoveMenu(!showMoveMenu)}
                      disabled={loading}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${borderColor} ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'} ${headingColor} hover:border-[#4E6E49]/50 transition-colors flex items-center gap-2`}
                    >
                      <span>Изменить статус</span>
                    </button>
                    {showMoveMenu && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setShowMoveMenu(false)} />
                        <div className={`absolute top-full left-0 mt-1 ${cardBg} border ${borderColor} rounded-lg shadow-xl z-20 overflow-hidden min-w-[150px]`}>
                          {Object.entries(statusLabels).map(([status, label]) => (
                            <button
                              key={status}
                              onClick={() => handleMove(status as TaskStatus)}
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
              </div>

              {/* Description */}
              {task.description && (
                <div className="space-y-2">
                  <label className={`text-sm font-medium ${headingColor}`}>Описание</label>
                  <div className={`p-4 rounded-lg border ${borderColor} ${theme === 'dark' ? 'bg-[#0f0f0f]' : 'bg-gray-50'}`}>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} whitespace-pre-wrap`}>
                      {task.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Expected Result */}
              {task.expectedResult && (
                <div className="space-y-2">
                  <label className={`text-sm font-medium ${headingColor}`}>Ожидаемый результат</label>
                  <div className={`p-4 rounded-lg border ${borderColor} ${theme === 'dark' ? 'bg-[#0f0f0f]' : 'bg-gray-50'}`}>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} whitespace-pre-wrap`}>
                      {task.expectedResult}
                    </p>
                  </div>
                </div>
              )}

              {/* Links */}
              {task.links && task.links.length > 0 && (
                <div className="space-y-2">
                  <label className={`text-sm font-medium ${headingColor} flex items-center gap-2`}>
                    <LinkIcon className="w-4 h-4" />
                    Ссылки
                  </label>
                  <div className="space-y-2">
                    {task.links.map((link, index) => (
                      <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`p-3 rounded-lg border ${borderColor} ${theme === 'dark' ? 'bg-[#0f0f0f] hover:bg-gray-800' : 'bg-gray-50 hover:bg-gray-100'} transition-colors flex items-center gap-3`}
                      >
                        <LinkIcon className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                        <div className="flex-1 min-w-0">
                          <div className={`text-sm font-medium ${headingColor} truncate`}>
                            {link.name || `Ссылка #${index + 1}`}
                          </div>
                          <div className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} truncate`}>
                            {link.url}
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Executors */}
              <div className="space-y-2">
                <label className={`text-sm font-medium ${headingColor} flex items-center gap-2`}>
                  <User className="w-4 h-4" />
                  Исполнители
                </label>
                <div className="flex flex-wrap gap-2">
                  {assignedUsers.map(member => (
                    <div key={member.id} className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${borderColor} ${theme === 'dark' ? 'bg-[#0f0f0f]' : 'bg-gray-50'}`}>
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4E6E49] to-[#3d5639] flex items-center justify-center text-xs text-white font-bold">
                        {member.name.charAt(0)}
                      </div>
                      <span className={`text-sm ${headingColor}`}>{getUserNicknameSync(member.id)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Author */}
              <div className="space-y-2">
                <label className={`text-sm font-medium ${headingColor}`}>Автор</label>
                <div className={`flex items-center gap-3 px-3 py-2 rounded-lg border ${borderColor} ${theme === 'dark' ? 'bg-[#0f0f0f]' : 'bg-gray-50'}`}>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xs text-white font-bold">
                    {getUserNicknameSync(task.createdBy).charAt(0)}
                  </div>
                  <span className={`text-sm ${headingColor}`}>{getUserNicknameSync(task.createdBy)}</span>
                </div>
              </div>

              {/* Deadline */}
              <div className="space-y-2">
                <label className={`text-sm font-medium ${headingColor} flex items-center gap-2`}>
                  <Calendar className="w-4 h-4" />
                  Дедлайн
                </label>
                <div className={`p-4 rounded-lg border ${borderColor} ${theme === 'dark' ? 'bg-[#0f0f0f]' : 'bg-gray-50'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-[#4E6E49]/20' : 'bg-green-50'}`}>
                      <Clock className={`w-5 h-5 ${theme === 'dark' ? 'text-[#4E6E49]' : 'text-[#4E6E49]'}`} />
                    </div>
                    <div>
                      <div className={`text-lg font-bold ${headingColor}`}>
                        {formatDate(new Date(task.dueDate), 'dd MMMM yyyy')}
                      </div>
                      <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {task.dueTime}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dates info */}
              <div className={`p-4 rounded-lg border ${borderColor} ${theme === 'dark' ? 'bg-[#0f0f0f]' : 'bg-gray-50'}`}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} mb-1`}>Создана</div>
                    <div className={`font-medium ${headingColor}`}>
                      {formatDate(new Date(task.createdAt), 'dd MMM yyyy, HH:mm')}
                    </div>
                  </div>
                  <div>
                    <div className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} mb-1`}>Обновлена</div>
                    <div className={`font-medium ${headingColor}`}>
                      {formatDate(new Date(task.updatedAt), 'dd MMM yyyy, HH:mm')}
                    </div>
                  </div>
                  {task.completedAt && (
                    <div>
                      <div className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} mb-1`}>Выполнена</div>
                      <div className={`font-medium ${headingColor}`}>
                        {formatDate(new Date(task.completedAt), 'dd MMM yyyy, HH:mm')}
                      </div>
                    </div>
                  )}
                  {task.closedAt && (
                    <div>
                      <div className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} mb-1`}>Закрыта</div>
                      <div className={`font-medium ${headingColor}`}>
                        {formatDate(new Date(task.closedAt), 'dd MMM yyyy, HH:mm')}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
