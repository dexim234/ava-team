import { useAuthStore } from '@/store/authStore'
import { useThemeStore } from '@/store/themeStore'
import { Task, TaskStatus } from '@/types'
import {
  Clipboard, // Для копирования ссылки
  Edit,
  Trash2,
  ArrowRightCircle,
  User as UserIcon, // Изменил имя, чтобы избежать конфликта
} from 'lucide-react'
import { formatDate } from '@/utils/dateUtils'
import { getUserNicknameSync } from '@/utils/userUtils'
import { CATEGORY_ICONS } from './categoryIcons'

interface TaskCardProps {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (taskId: string) => void
  onMove: (taskId: string, newStatus: TaskStatus) => void // Добавил TaskStatus в props
  onViewDetails: (task: Task) => void
  onCopyLink: (taskId: string) => void
}

export const TaskCard = ({ task, onEdit, onDelete, onMove, onViewDetails, onCopyLink }: TaskCardProps) => {
  const { user } = useAuthStore()
  const { theme } = useThemeStore()
  
  const headingColor = theme === 'dark' ? 'text-white' : 'text-gray-900'
  const cardBg = theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-white'
  const borderColor = theme === 'dark' ? 'border-gray-800' : 'border-gray-300'
  
  const CategoryIcon = CATEGORY_ICONS[task.category] || UserIcon; // Fallback icon

  const canEdit = user?.id === task.createdBy // Редактировать может только создатель
  const canDelete = user?.id === task.createdBy // Удалять может только создатель

  const getStatusClasses = (status: TaskStatus) => {
    if (status === 'in_progress') return theme === 'dark' ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700'
    if (status === 'completed') return theme === 'dark' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
    if (status === 'closed') return theme === 'dark' ? 'bg-gray-500/20 text-gray-400' : 'bg-gray-100 text-gray-700'
    return ''
  }

  const getPriorityClasses = (priority: TaskPriority) => {
    if (priority === 'urgent') return theme === 'dark' ? 'bg-rose-600/20 text-rose-100' : 'bg-rose-50 text-rose-700'
    if (priority === 'high') return theme === 'dark' ? 'bg-red-500/15 text-red-100' : 'bg-red-50 text-red-700'
    if (priority === 'medium') return theme === 'dark' ? 'bg-amber-500/15 text-amber-100' : 'bg-amber-50 text-amber-700'
    if (priority === 'low') return theme === 'dark' ? 'bg-gray-500/15 text-gray-100' : 'bg-gray-50 text-gray-700'
    return ''
  }

  const handleMoveClick = (currentStatus: TaskStatus) => {
    // В реальной реализации здесь будет всплывающее окно для выбора нового статуса
    // Пока что упрощенно: круговое переключение статуса
    let newStatus: TaskStatus;
    if (currentStatus === 'in_progress') {
      newStatus = 'completed';
    } else if (currentStatus === 'completed') {
      newStatus = 'closed';
    } else {
      newStatus = 'in_progress';
    }
    onMove(task.id, newStatus);
  }

  return (
    <div
      className={`${cardBg} rounded-xl border-2 ${borderColor} p-4 shadow-lg hover:shadow-xl transition-all cursor-pointer ${
        theme === 'dark' 
          ? 'hover:border-[#4E6E49]/50' 
          : 'hover:border-[#4E6E49]'
      }`}
      onClick={() => onViewDetails(task)} // Открываем полную карточку задачи по клику
    >
      {/* ID и кнопки действий */}
      <div className="flex justify-between items-center mb-4">
        <span className={`px-2 py-1 rounded-md text-xs font-semibold ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>
          ID: {task.id.substring(0, 7)}...
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation() // Предотвращаем открытие полной карточки
              onCopyLink(task.id)
            }}
            className={`p-1.5 rounded-md transition-colors ${theme === 'dark' ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
            title="Скопировать ссылку"
          >
            <Clipboard className="w-4 h-4" />
          </button>
          {canEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onEdit(task)
              }}
              className={`p-1.5 rounded-md transition-colors ${theme === 'dark' ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
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
              className={`p-1.5 rounded-md transition-colors ${theme === 'dark' ? 'text-red-400 hover:bg-red-500/20' : 'text-red-600 hover:bg-red-100'}`}
              title="Удалить"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleMoveClick(task.status)
            }}
            className={`p-1.5 rounded-md transition-colors ${theme === 'dark' ? 'text-blue-400 hover:bg-blue-500/20' : 'text-blue-600 hover:bg-blue-100'}`}
            title="Переместить (изменить статус)"
          >
            <ArrowRightCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Название задачи */}
      <h3 className={`text-lg font-bold ${headingColor} mb-2 line-clamp-1`}>
        {task.title}
      </h3>

      {/* Приоритет и Категория */}
      <div className="flex justify-between items-center text-sm mb-2">
        <span className={`px-2 py-0.5 rounded-md font-medium ${getPriorityClasses(task.priority)}`}>
          {task.priority === 'urgent' && 'Экстренный'}
          {task.priority === 'high' && 'Высокий'}
          {task.priority === 'medium' && 'Средний'}
          {task.priority === 'low' && 'Низкий'}
        </span>
        <span className={`px-2 py-0.5 rounded-md font-medium ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'} flex items-center gap-1`}>
          <CategoryIcon className="w-3 h-3" />
          {task.category === 'trading' && 'Торговля'}
          {task.category === 'development' && 'Разработка'}
          {task.category === 'stream' && 'Стрим'}
          {task.category === 'education' && 'Изучение'}
        </span>
      </div>

      {/* Исполнитель */}
      {task.assignedTo && task.assignedTo.length > 0 && (
        <div className="flex items-center gap-2 text-sm mb-2">
          <div className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-xs text-gray-600 dark:text-gray-300">
            <UserIcon className="w-4 h-4" />
          </div>
          <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
            {getUserNicknameSync(task.assignedTo[0])}
          </span>
        </div>
      )}

      {/* Дедлайн */}
      {(task.dueDate || task.dueTime) && (
        <div className={`flex items-center gap-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          <span className="font-medium">Дедлайн:</span>
          <span>{formatDate(new Date(task.dueDate), 'dd.MM.yyyy')} {task.dueTime}</span>
        </div>
      )}

      {/* Статус задачи внизу */}
      <div className={`mt-4 pt-4 border-t ${borderColor} flex justify-end`}>
        <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${getStatusClasses(task.status)}`}>
          {task.status === 'in_progress' && 'В работе'}
          {task.status === 'completed' && 'Выполнено'}
          {task.status === 'closed' && 'Закрыто'}
        </span>
      </div>
    </div>
  )
}
