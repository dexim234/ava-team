import { useAuthStore } from '@/store/authStore'
import { useThemeStore } from '@/store/themeStore'
import { Task, TaskLink, TaskStatus } from '@/types'
import {
  X,
  Calendar, // Для даты дедлайна
  Clock, // Для времени дедлайна
  Tag, // Для категории
  Sparkles, // Для приоритета
  Target, // Для ожидаемого результата
  Link as LinkIcon, // Для ссылок
  User,
  Info,
  CheckCircle,
  Copy,
  ArrowRightCircle,
  Edit,
  Trash2,
} from 'lucide-react'
import { formatDate } from '@/utils/dateUtils'
import { getUserNicknameSync } from '@/utils/userUtils'
import { CATEGORY_ICONS } from './categoryIcons'

interface TaskDetailsProps {
  task: Task
  onClose: () => void
  onEdit: (task: Task) => void
  onDelete: (taskId: string) => void
  onMove: (taskId: string, newStatus: TaskStatus) => void
  onCopyLink: (taskId: string) => void
}

export const TaskDetails = ({
  task,
  onClose,
  onEdit,
  onDelete,
  onMove,
  onCopyLink,
}: TaskDetailsProps) => {
  const { user } = useAuthStore()
  const { theme } = useThemeStore()

  const headingColor = theme === 'dark' ? 'text-white' : 'text-gray-900'
  const cardBg = theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-white'
  const borderColor = theme === 'dark' ? 'border-gray-800' : 'border-gray-300'

  const CategoryIcon = CATEGORY_ICONS[task.category] || User // Fallback icon

  const canEdit = user?.id === task.createdBy
  const canDelete = user?.id === task.createdBy

  const getStatusClasses = (status: TaskStatus) => {
    if (status === 'in_progress') return `inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${theme === 'dark' ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700'}`
    if (status === 'completed') return `inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${theme === 'dark' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'}`
    if (status === 'closed') return `inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${theme === 'dark' ? 'bg-gray-500/20 text-gray-400' : 'bg-gray-100 text-gray-700'}`
    return ''
  }

  const getPriorityClasses = (priority: TaskPriority) => {
    if (priority === 'urgent') return `inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${theme === 'dark' ? 'bg-rose-600/20 text-rose-100' : 'bg-rose-50 text-rose-700'}`
    if (priority === 'high') return `inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${theme === 'dark' ? 'bg-red-500/15 text-red-100' : 'bg-red-50 text-red-700'}`
    if (priority === 'medium') return `inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${theme === 'dark' ? 'bg-amber-500/15 text-amber-100' : 'bg-amber-50 text-amber-700'}`
    if (priority === 'low') return `inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${theme === 'dark' ? 'bg-gray-500/15 text-gray-100' : 'bg-gray-50 text-gray-700'}`
    return ''
  }

  const handleMoveClick = (currentStatus: TaskStatus) => {
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

  const handleLinkClick = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start sm:items-center justify-center z-[80] p-4 overflow-y-auto overscroll-contain modal-scroll touch-pan-y">
      <div
        className={`${cardBg} rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-3xl max-h-[calc(100vh-48px)] sm:max-h-[calc(100vh-64px)] overflow-y-auto border-2 touch-pan-y ${borderColor} relative`}
      >
        <div className="flex flex-col h-full min-h-0">
          <div className={`sticky top-0 ${cardBg} border-b ${borderColor} p-4 sm:p-6 flex items-center justify-between z-10`}>
            <h2 className={`text-xl sm:text-2xl font-bold ${headingColor} flex items-center gap-2`}>
              {task.title}
            </h2>
            <div className="flex items-center gap-2">
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
                onClick={() => handleMoveClick(task.status)}
                className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-blue-500/20 text-blue-400' : 'hover:bg-blue-50 text-blue-600'}`}
                title="Переместить (изменить статус)"
              >
                <ArrowRightCircle className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                title="Закрыть"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-6 space-y-6 flex-1 min-h-0 overflow-y-auto overscroll-contain modal-scroll pb-10">
            {/* ID задачи */}
            <div className="flex items-center gap-2 text-sm">
              <Info className="w-4 h-4 text-gray-500" />
              <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>ID: {task.id}</span>
            </div>

            {/* Описание задачи */}
            {task.description && (
              <div>
                <h3 className={`text-lg font-bold mb-2 ${headingColor}`}>Описание</h3>
                <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                  {task.description}
                </p>
              </div>
            )}

            {/* Категория */}
            <div>
              <h3 className={`text-lg font-bold mb-2 ${headingColor}`}>Категория</h3>
              <span className={`${getStatusClasses(task.status)}`}>
                <CategoryIcon className="w-4 h-4" />
                {task.category === 'trading' && 'Торговля'}
                {task.category === 'development' && 'Разработка'}
                {task.category === 'stream' && 'Стрим'}
                {task.category === 'education' && 'Изучение'}
              </span>
            </div>

            {/* Приоритет */}
            <div>
              <h3 className={`text-lg font-bold mb-2 ${headingColor}`}>Приоритет</h3>
              <span className={`${getPriorityClasses(task.priority)}`}>
                {task.priority === 'urgent' && 'Экстренный'}
                {task.priority === 'high' && 'Высокий'}
                {task.priority === 'medium' && 'Средний'}
                {task.priority === 'low' && 'Низкий'}
              </span>
            </div>

            {/* Ожидаемый результат */}
            {task.expectedResult && (
              <div>
                <h3 className={`text-lg font-bold mb-2 ${headingColor}`}>Ожидаемый результат</h3>
                <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                  {task.expectedResult}
                </p>
              </div>
            )}

            {/* Ссылки */}
            {task.links && task.links.length > 0 && (
              <div>
                <h3 className={`text-lg font-bold mb-2 ${headingColor}`}>Ссылки</h3>
                <div className="space-y-2">
                  {task.links.map((link, index) => (
                    <a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-2 p-3 rounded-lg border ${borderColor} ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'} transition-colors`}
                    >
                      <LinkIcon className="w-5 h-5 text-blue-500" />
                      <span className="text-blue-500 underline break-all">{link.name || link.url}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Дедлайн */}
            {(task.dueDate || task.dueTime) && (
              <div>
                <h3 className={`text-lg font-bold mb-2 ${headingColor}`}>Дедлайн</h3>
                <div className="flex items-center gap-2 text-base">
                  <Calendar className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                  <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                    {formatDate(new Date(task.dueDate), 'dd.MM.yyyy')} {task.dueTime}
                  </span>
                </div>
              </div>
            )}

            {/* Автор задачи */}
            <div>
              <h3 className={`text-lg font-bold mb-2 ${headingColor}`}>Автор</h3>
              <div className="flex items-center gap-2 text-base">
                <User className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                  {task.createdBy ? getUserNicknameSync(task.createdBy) : 'Неизвестно'}
                </span>
              </div>
            </div>

            {/* Статус задачи */}
            <div>
              <h3 className={`text-lg font-bold mb-2 ${headingColor}`}>Статус</h3> 
              <span className={`${getStatusClasses(task.status)}`}>
                <CheckCircle className="w-4 h-4" />
                {task.status === 'in_progress' && 'В работе'}
                {task.status === 'completed' && 'Выполнено'}
                {task.status === 'closed' && 'Закрыто'}
              </span>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
