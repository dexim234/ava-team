import { Task, TaskStatus, TaskPriority, TaskCategory } from '@/types'
import { useThemeStore } from '@/store/themeStore'
import { Calendar, Clock, AlertTriangle } from 'lucide-react'
import { formatDate } from '@/utils/dateUtils'
import { CountdownTimer } from '@/components/Analytics/AnalyticsTable'
import Avatar from '@/components/Avatar'
import { UserNickname } from '@/components/UserNickname'

interface TaskCardProps {
  task: Task
  onClick: () => void
}

export const TaskCard = ({ task, onClick }: TaskCardProps) => {
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

  const getCategoryIcon = (category: TaskCategory) => {
    switch (category) {
      case 'trading': return '📈'
      case 'development': return '💻'
      case 'stream': return '🎥'
      case 'learning': return '📚'
      default: return '📋'
    }
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

  return (
    <div
      onClick={onClick}
      className={`${theme === 'dark' ? 'bg-[#0b1015]' : 'bg-white'} rounded-2xl p-5 border ${theme === 'dark' ? 'border-white/5' : 'border-gray-100'} cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-emerald-500/30 group`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className={`text-2xl`}>{getCategoryIcon(task.category)}</span>
          <div>
            <p className={`text-[10px] font-bold uppercase tracking-wider ${subTextColor}`}>
              #{task.id?.slice(0, 6) || 'NEW'}
            </p>
            <span className={`text-xs px-2 py-0.5 rounded-full border ${statusInfo.bg} ${statusInfo.border} ${statusInfo.text} font-bold`}>
              {statusInfo.label}
            </span>
          </div>
        </div>
        <span className={`text-[10px] px-2 py-1 rounded-lg border font-bold uppercase ${getPriorityColor(task.priority)}`}>
          {task.priority === 'urgent' ? '🔴' : task.priority === 'high' ? '🟠' : task.priority === 'medium' ? '🟡' : '⚪'} {task.priority || 'medium'}
        </span>
      </div>

      {/* Title */}
      <h3 className={`text-base font-bold mb-3 line-clamp-2 ${headingColor} group-hover:text-emerald-500 transition-colors`}>
        {task.title}
      </h3>

      {/* Description preview */}
      {task.description && (
        <p className={`text-sm mb-4 line-clamp-2 ${subTextColor}`}>
          {task.description}
        </p>
      )}

      {/* Footer */}
      <div className="space-y-3">
        {/* Author and Assignee */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar userId={task.createdBy} size="sm" />
            <div className="flex flex-col">
              <span className={`text-[10px] uppercase font-bold tracking-wider ${subTextColor}`}>Автор</span>
              <UserNickname userId={task.createdBy} className={`text-xs font-medium ${headingColor}`} />
            </div>
          </div>
          {primaryAssignee && (
            <div className="flex items-center gap-2">
              <Avatar userId={primaryAssignee} size="sm" />
              <div className="flex flex-col">
                <span className={`text-[10px] uppercase font-bold tracking-wider ${subTextColor}`}>Исполнитель</span>
                <UserNickname userId={primaryAssignee} className={`text-xs font-medium ${headingColor}`} />
              </div>
            </div>
          )}
        </div>

        {/* Deadline */}
        <div className={`flex items-center justify-between p-2 rounded-xl ${overdue ? 'bg-red-500/10 border border-red-500/20' : 'bg-white/5 border border-white/5'}`}>
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

        {/* Timer */}
        {task.dueDate && task.dueTime && (
          <div className={`flex items-center justify-between p-2 rounded-xl ${overdue ? 'bg-red-500/10' : 'bg-emerald-500/5'} border ${overdue ? 'border-red-500/20' : 'border-emerald-500/20'}`}>
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
        )}
      </div>
    </div>
  )
}
