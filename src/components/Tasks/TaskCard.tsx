import { Task, TaskStatus, TaskPriority, TaskCategory } from '@/types'
import { useThemeStore } from '@/store/themeStore'
import { Calendar, Clock, AlertTriangle, Share2, Edit, Trash2, CheckCircle2, Circle, XCircle } from 'lucide-react'
import { formatDate } from '@/utils/dateUtils'
import { CountdownTimer } from '@/components/Analytics/AnalyticsTable'
import Avatar from '@/components/Avatar'
import { UserNickname } from '@/components/UserNickname'
import { TASK_CATEGORIES } from '@/types'

interface TaskCardProps {
  task: Task
  onClick: () => void
  onEdit: (task: Task) => void
  onDelete: (taskId: string) => void
  onCopyLink: (taskId: string) => void
  onMove?: (taskId: string, newStatus: TaskStatus) => void
}

export const TaskCard = ({ task, onClick, onEdit, onDelete, onCopyLink, onMove }: TaskCardProps) => {
  const { theme } = useThemeStore()
  
  const headingColor = theme === 'dark' ? 'text-white' : 'text-gray-900'
  const subTextColor = theme === 'dark' ? 'text-gray-400' : 'text-gray-500'

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
      case 'in_progress': return { label: 'В работе', color: 'bg-blue-500', text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' }
      case 'completed': return { label: 'Выполнено', color: 'bg-emerald-500', text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' }
      case 'closed': return { label: 'Закрыто', color: 'bg-gray-500', text: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500/20' }
      default: return { label: 'В работе', color: 'bg-blue-500', text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' }
    }
  }

  const statusInfo = getStatusInfo(task.status)

  const isOverdue = () => {
    if (!task.dueDate || !task.dueTime) return false
    if (task.status === 'completed' || task.status === 'closed') return false
    const now = new Date().getTime()
    const deadline = new Date(`${task.dueDate}T${task.dueTime}`).getTime()
    return deadline < now
  }

  const overdue = isOverdue()

  // Get primary assignee (first from assignedTo array)
  const primaryAssignee = task.assignedTo?.[0]

  const handleAction = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation()
    action()
  }

  // Status change options for quick action
  const getNextStatus = (currentStatus: TaskStatus): TaskStatus => {
    switch (currentStatus) {
      case 'in_progress': return 'completed'
      case 'completed': return 'closed'
      case 'closed': return 'in_progress'
      default: return 'completed'
    }
  }

  const getNextStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case 'in_progress': return <Circle size={16} className="fill-blue-500 text-blue-500" />
      case 'completed': return <CheckCircle2 size={16} className="text-emerald-500" />
      case 'closed': return <XCircle size={16} className="text-gray-500" />
      default: return <Circle size={16} className="fill-blue-500 text-blue-500" />
    }
  }

  const nextStatus = getNextStatus(task.status)
  const isTaskCompleted = task.status === 'completed' || task.status === 'closed'
  const completionDate = task.completedAt || task.closedAt

  return (
    <div
      onClick={onClick}
      className={`${theme === 'dark' ? 'bg-[#0b1015]' : 'bg-white'} rounded-2xl p-6 border ${theme === 'dark' ? 'border-white/5' : 'border-gray-100'} cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-emerald-500/30 group`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <p className={`text-[10px] font-bold uppercase tracking-wider ${subTextColor}`}>
            #{task.id?.slice(0, 6) || 'NEW'}
          </p>
          <span className={`text-xs px-2 py-0.5 rounded-full border ${statusInfo.bg} ${statusInfo.border} ${statusInfo.text} font-bold`}>
            {statusInfo.label}
          </span>
        </div>
        <span className={`text-[10px] px-2 py-1 rounded-lg border font-bold uppercase ${getPriorityColor(task.priority)}`}>
          {getPriorityLabel(task.priority)}
        </span>
      </div>

      {/* Category */}
      <div className="mb-3">
        <span className={`text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-500'}`}>
          {getCategoryLabel(task.category)}
        </span>
      </div>

      {/* Title */}
      <h3 className={`text-lg font-bold mb-4 line-clamp-2 ${headingColor} group-hover:text-emerald-500 transition-colors`}>
        {task.title}
      </h3>

      {/* Footer */}
      <div className="space-y-3">
        {/* Assignee */}
        {primaryAssignee && (
          <div className={`flex items-center gap-3 p-2.5 rounded-xl ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'}`}>
            <Avatar userId={primaryAssignee} size="sm" className="ring-2 ring-emerald-500/20" />
            <div className="flex flex-col min-w-0">
              <span className={`text-[10px] uppercase font-bold tracking-wider ${subTextColor}`}>Исполнитель</span>
              <UserNickname userId={primaryAssignee} className={`text-xs font-medium truncate ${headingColor}`} />
            </div>
          </div>
        )}

        {/* Deadline */}
        <div className={`flex items-center justify-between p-2.5 rounded-xl ${overdue ? 'bg-red-500/10 border border-red-500/20' : 'bg-white/5 border border-white/5'}`}>
          <div className="flex items-center gap-2">
            <Calendar size={14} className={overdue ? 'text-red-500' : subTextColor} />
            <span className={`text-xs font-bold ${overdue ? 'text-red-500' : headingColor}`}>
              {task.dueDate ? formatDate(new Date(task.dueDate), 'dd.MM.yyyy') : '—'}
            </span>
          </div>
          {task.dueTime && (
            <div className="flex items-center gap-2">
              <Clock size={14} className={overdue ? 'text-red-500' : subTextColor} />
              <span className={`text-xs font-bold ${overdue ? 'text-red-500' : headingColor}`}>
                {task.dueTime}
              </span>
            </div>
          )}
        </div>

        {/* Timer or Completion Info */}
        {!isTaskCompleted && task.dueDate && task.dueTime ? (
          <div className={`flex items-center justify-between p-2.5 rounded-xl ${overdue ? 'bg-red-500/10' : 'bg-emerald-500/5'} border ${overdue ? 'border-red-500/20' : 'border-emerald-500/20'}`}>
            <div className="flex items-center gap-2">
              {overdue ? <AlertTriangle size={14} className="text-red-500" /> : <Clock size={14} className="text-emerald-400" />}
              <span className={`text-[10px] uppercase font-bold tracking-wider ${overdue ? 'text-red-500' : 'text-emerald-400'}`}>
                {overdue ? 'Просрочено' : 'До дедлайна'}
              </span>
            </div>
            <span className={`text-xs font-mono font-bold ${overdue ? 'text-red-500' : 'text-emerald-400'}`}>
              <CountdownTimer deadline={`${task.dueDate}T${task.dueTime}`} />
            </span>
          </div>
        ) : isTaskCompleted && completionDate ? (
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-emerald-500" />
              <span className={`text-[10px] uppercase font-bold tracking-wider text-emerald-400`}>
                Завершено
              </span>
            </div>
            <span className={`text-xs font-mono font-bold text-emerald-400`}>
              {formatDate(new Date(completionDate), 'dd.MM.yyyy HH:mm')}
            </span>
          </div>
        ) : null}

        {/* Quick Actions */}
        <div className="flex items-center gap-2 pt-2 border-t border-white/5">
          {onMove && (
            <button
              onClick={(e) => handleAction(e, () => onMove(task.id!, nextStatus))}
              className="p-2 rounded-lg transition-all hover:bg-blue-500/10 hover:text-blue-500"
              title={`Сменить статус на: ${statusInfo.label}`}
            >
              {getNextStatusIcon(nextStatus)}
            </button>
          )}
          <button
            onClick={(e) => handleAction(e, () => onCopyLink(task.id!))}
            className="p-2 rounded-lg transition-all hover:bg-emerald-500/10 hover:text-emerald-500"
            title="Поделиться"
          >
            <Share2 size={16} />
          </button>
          <button
            onClick={(e) => handleAction(e, () => onEdit(task))}
            className="p-2 rounded-lg transition-all hover:bg-blue-500/10 hover:text-blue-500"
            title="Редактировать"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={(e) => handleAction(e, () => onDelete(task.id!))}
            className="p-2 rounded-lg transition-all hover:bg-red-500/10 hover:text-red-500"
            title="Удалить"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
