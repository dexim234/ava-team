import { useState, useEffect } from 'react'
import { Task, TaskStatus, TaskPriority, TaskCategory } from '@/types'
import { useThemeStore } from '@/store/themeStore'
import { X, Edit, Trash2, Share, Calendar, Clock, Target, User, Link2, ExternalLink, AlertTriangle, CheckCircle2, Circle, XCircle } from 'lucide-react'
import { formatDate } from '@/utils/dateUtils'
import { CountdownTimer } from '@/components/Analytics/AnalyticsTable'
import Avatar from '@/components/Avatar'
import { UserNickname } from '@/components/UserNickname'
import { TASK_CATEGORIES } from '@/types'

interface TaskDetailsProps {
  task: Task
  onClose: () => void
  onEdit: (task: Task) => void
  onDelete: (taskId: string) => void
  onMove: (taskId: string, newStatus: TaskStatus) => void
  onCopyLink: (taskId: string) => void
}

export const TaskDetails = ({ task, onClose, onEdit, onDelete, onMove, onCopyLink }: TaskDetailsProps) => {
  const { theme } = useThemeStore()
  const [localTask, setLocalTask] = useState<Task>(task)

  const headingColor = theme === 'dark' ? 'text-white' : 'text-gray-900'
  const subTextColor = theme === 'dark' ? 'text-gray-400' : 'text-gray-500'

  // Обновляем локальное состояние когда task меняется извне
  useEffect(() => {
    setLocalTask(task)
  }, [task])

  const getPriorityColor = (priority?: TaskPriority) => {
    switch (priority) {
      case 'low': return theme === 'dark' ? 'bg-gray-500/20 text-gray-400 border-gray-500/20' : 'bg-gray-100 text-gray-600 border-gray-200'
      case 'medium': return theme === 'dark' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20' : 'bg-yellow-100 text-yellow-600 border-yellow-200'
      case 'high': return theme === 'dark' ? 'bg-orange-500/20 text-orange-400 border-orange-500/20' : 'bg-orange-100 text-orange-600 border-orange-200'
      case 'urgent': return theme === 'dark' ? 'bg-red-500/20 text-red-400 border-red-500/20' : 'bg-red-100 text-red-600 border-red-200'
      default: return theme === 'dark' ? 'bg-gray-500/20 text-gray-400 border-gray-500/20' : 'bg-gray-100 text-gray-600 border-gray-200'
    }
  }

  const getPriorityLabel = (priority?: TaskPriority) => {
    switch (priority) {
      case 'low': return 'Низкий'
      case 'medium': return 'Средний'
      case 'high': return 'Высокий'
      case 'urgent': return 'Срочный'
      default: return 'Средний'
    }
  }

  const getCategoryLabel = (category: TaskCategory) => {
    return TASK_CATEGORIES[category]?.label || category
  }

  const getStatusInfo = (status: TaskStatus) => {
    switch (status) {
      case 'in_progress': return { label: 'В работе', icon: <Circle size={16} className="fill-blue-500 text-blue-500" />, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' }
      case 'completed': return { label: 'Выполнено', icon: <CheckCircle2 size={16} className="text-emerald-500" />, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' }
      case 'closed': return { label: 'Закрыто', icon: <XCircle size={16} className="text-gray-500" />, color: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500/20' }
      default: return { label: 'В работе', icon: <Circle size={16} className="fill-blue-500 text-blue-500" />, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' }
    }
  }

  const statusInfo = getStatusInfo(localTask.status)

  const isOverdue = () => {
    if (!localTask.dueDate || !localTask.dueTime) return false
    if (localTask.status === 'completed' || localTask.status === 'closed') return false
    const now = new Date().getTime()
    const deadline = new Date(`${localTask.dueDate}T${localTask.dueTime}`).getTime()
    return deadline < now
  }

  const overdue = isOverdue()

  const statusOptions: { status: TaskStatus; label: string; icon: React.ReactNode }[] = [
    { status: 'in_progress', label: 'В работе', icon: <Circle size={14} className="fill-blue-500 text-blue-500" /> },
    { status: 'completed', label: 'Выполнено', icon: <CheckCircle2 size={14} className="text-emerald-500" /> },
    { status: 'closed', label: 'Закрыто', icon: <XCircle size={14} className="text-gray-500" /> }
  ]

  // Get primary assignee (first from assignedTo array)
  const primaryAssignee = localTask.assignedTo?.[0]

  const isTaskCompleted = localTask.status === 'completed' || localTask.status === 'closed'
  const completionDate = localTask.completedAt || localTask.closedAt

  const handleStatusChange = (newStatus: TaskStatus) => {
    // Update local state immediately
    const updates: Partial<Task> = {
      status: newStatus,
      updatedAt: new Date().toISOString()
    }
    if (newStatus === 'completed') {
      updates.completedAt = new Date().toISOString()
    } else if (newStatus === 'closed') {
      updates.closedAt = new Date().toISOString()
    } else if (newStatus === 'in_progress') {
      updates.completedAt = undefined
      updates.closedAt = undefined
    }
    setLocalTask(prev => ({ ...prev, ...updates }))
    // Call parent handler
    onMove(localTask.id!, newStatus)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className={`${theme === 'dark' ? 'bg-[#0f141a]' : 'bg-white'} w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border ${theme === 'dark' ? 'border-white/10' : 'border-gray-100'}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div>
              <p className={`text-[10px] font-bold uppercase tracking-wider ${subTextColor}`}>
                #{localTask.id?.slice(0, 6) || 'NEW'}
              </p>
              <h2 className={`text-xl font-black tracking-tight ${headingColor}`}>
                {localTask.title}
              </h2>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Status and Priority */}
          <div className="flex items-center gap-3">
            <span className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${statusInfo.bg} ${statusInfo.border} ${statusInfo.color} font-bold text-sm`}>
              {statusInfo.icon}
              {statusInfo.label}
            </span>
            <span className={`text-xs px-3 py-1.5 rounded-lg border font-bold uppercase ${getPriorityColor(localTask.priority)}`}>
              {getPriorityLabel(localTask.priority)}
            </span>
            <span className={`text-xs px-3 py-1.5 rounded-lg border font-bold uppercase ${theme === 'dark' ? 'bg-white/5 border-white/10 text-gray-400' : 'bg-gray-100 border-gray-200 text-gray-600'}`}>
              {getCategoryLabel(localTask.category)}
            </span>
          </div>
          {/* Completed Badge */}
          {isTaskCompleted && completionDate && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <CheckCircle2 size={14} className="text-emerald-500" />
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Завершено {formatDate(new Date(completionDate), 'dd.MM.yyyy HH:mm')}
              </span>
            </div>
          )}

          {/* Author */}
          <div className={`p-4 rounded-xl border border-white/5 bg-white/5`}>
            <div className="flex items-center gap-2 mb-2">
              <User size={14} className={subTextColor} />
              <span className={`text-[10px] uppercase font-bold tracking-wider ${subTextColor}`}>Автор</span>
            </div>
            <div className="flex items-center gap-2">
              <Avatar userId={localTask.createdBy} size="md" />
              <UserNickname userId={localTask.createdBy} className={`text-sm font-bold ${headingColor}`} />
            </div>
          </div>

          {/* Assignee */}
          {primaryAssignee && primaryAssignee !== localTask.createdBy && (
            <div className={`p-4 rounded-xl border border-white/5 bg-white/5`}>
              <div className="flex items-center gap-2 mb-2">
                <User size={14} className={subTextColor} />
                <span className={`text-[10px] uppercase font-bold tracking-wider ${subTextColor}`}>Исполнитель</span>
              </div>
              <div className="flex items-center gap-2">
                <Avatar userId={primaryAssignee} size="md" />
                <UserNickname userId={primaryAssignee} className={`text-sm font-bold ${headingColor}`} />
              </div>
            </div>
          )}

          {/* Deadline */}
          <div className={`p-4 rounded-xl border ${overdue ? 'border-red-500/20 bg-red-500/5' : 'border-white/5 bg-white/5'}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Calendar size={16} className={overdue ? 'text-red-500' : subTextColor} />
                <span className={`text-[10px] uppercase font-bold tracking-wider ${overdue ? 'text-red-500' : subTextColor}`}>Дедлайн</span>
              </div>
              {overdue && (
                <div className="flex items-center gap-1 text-red-500">
                  <AlertTriangle size={14} />
                  <span className="text-xs font-bold">Просрочено</span>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`text-lg font-bold ${overdue ? 'text-red-500' : headingColor}`}>
                  {localTask.dueDate ? formatDate(new Date(localTask.dueDate), 'dd.MM.yyyy') : '—'}
                </span>
                {localTask.dueTime && (
                  <span className={`text-lg font-bold ${overdue ? 'text-red-500' : headingColor}`}>
                    {localTask.dueTime}
                  </span>
                )}
              </div>
              {!isTaskCompleted && localTask.dueDate && localTask.dueTime && (
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${overdue ? 'bg-red-500/10' : 'bg-emerald-500/10'} border ${overdue ? 'border-red-500/20' : 'border-emerald-500/20'}`}>
                  <Clock size={14} className={overdue ? 'text-red-500' : 'text-emerald-400'} />
                  <span className={`text-xs font-mono font-bold ${overdue ? 'text-red-500' : 'text-emerald-400'}`}>
                    <CountdownTimer deadline={`${localTask.dueDate}T${localTask.dueTime}`} />
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {localTask.description && (
            <div>
              <h3 className={`text-[10px] uppercase font-bold tracking-wider ${subTextColor} mb-2`}>Описание</h3>
              <p className={`text-sm leading-relaxed ${headingColor} whitespace-pre-wrap`}>
                {localTask.description}
              </p>
            </div>
          )}

          {/* Expected Result */}
          {localTask.expectedResult && (
            <div>
              <h3 className={`text-[10px] uppercase font-bold tracking-wider ${subTextColor} mb-2 flex items-center gap-2`}>
                <Target size={14} /> Ожидаемый результат
              </h3>
              <p className={`text-sm leading-relaxed ${headingColor} whitespace-pre-wrap`}>
                {localTask.expectedResult}
              </p>
            </div>
          )}

          {/* Links */}
          {localTask.links && localTask.links.length > 0 && (
            <div>
              <h3 className={`text-[10px] uppercase font-bold tracking-wider ${subTextColor} mb-2 flex items-center gap-2`}>
                <Link2 size={14} /> Ссылки
              </h3>
              <div className="space-y-2">
                {localTask.links.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-2 p-3 rounded-xl border ${theme === 'dark' ? 'border-white/5 bg-white/5 hover:bg-white/10' : 'border-gray-100 bg-gray-50 hover:bg-gray-100'} transition-all group`}
                  >
                    <ExternalLink size={14} className={`${subTextColor} group-hover:text-emerald-500 transition-colors`} />
                    <span className={`text-sm font-medium ${headingColor} group-hover:text-emerald-500 transition-colors`}>
                      {link.name || link.url}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Status Actions */}
          <div>
            <h3 className={`text-[10px] uppercase font-bold tracking-wider ${subTextColor} mb-2`}>Изменить статус</h3>
            <div className="flex gap-2">
              {statusOptions.map((option) => (
                <button
                  key={option.status}
                  onClick={() => handleStatusChange(option.status)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-bold text-sm transition-all ${
                    localTask.status === option.status
                      ? theme === 'dark'
                        ? 'bg-blue-500/20 border-blue-500 text-blue-400 ring-2 ring-blue-500/50'
                        : 'bg-blue-100 border-blue-400 text-blue-600 ring-2 ring-blue-400/50'
                      : theme === 'dark'
                        ? 'bg-white/5 border-white/10 hover:bg-white/10 text-gray-400 hover:text-white'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {option.icon}
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 p-6 border-t border-white/5">
          <button
            onClick={() => onCopyLink(localTask.id!)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border font-bold text-sm transition-all hover:bg-emerald-500/10 hover:border-emerald-500/20 hover:text-emerald-500"
          >
            <Share size={16} />
            <span>Копировать ссылку</span>
          </button>
          <button
            onClick={() => onEdit(localTask)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border font-bold text-sm transition-all hover:bg-blue-500/10 hover:border-blue-500/20 hover:text-blue-500"
          >
            <Edit size={16} />
            <span>Редактировать</span>
          </button>
          <button
            onClick={() => onDelete(localTask.id!)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-500/20 text-red-500 font-bold text-sm transition-all hover:bg-red-500/10"
          >
            <Trash2 size={16} />
            <span>Удалить</span>
          </button>
        </div>
      </div>
    </div>
  )
}
