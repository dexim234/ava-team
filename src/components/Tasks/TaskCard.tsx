// Task card component
import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useAdminStore } from '@/store/adminStore'
import { useThemeStore } from '@/store/themeStore'
import { updateTask } from '@/services/firestoreService'
import { Task, TEAM_MEMBERS, TASK_CATEGORIES, TASK_STATUSES } from '@/types'
import {
  Edit,
  Trash2,
  X,
  Copy,
  ArrowRightLeft,
  CheckCircle2,
  Clock,
  ExternalLink,
} from 'lucide-react'
import { formatDate } from '@/utils/dateUtils'
import { getUserNicknameSync } from '@/utils/userUtils'
import { CATEGORY_ICONS } from './categoryIcons'

interface TaskCardProps {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (taskId: string) => void
  onUpdate: () => void
}

export const TaskCard = ({ task, onEdit, onDelete, onUpdate }: TaskCardProps) => {
  const { user } = useAuthStore()
  const { isAdmin } = useAdminStore()
  const { theme } = useThemeStore()

  const [isLarge, setIsLarge] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showMoveMenu, setShowMoveMenu] = useState(false)

  const headingColor = theme === 'dark' ? 'text-white' : 'text-gray-900'
  const cardBg = theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-white'
  const borderColor = theme === 'dark' ? 'border-gray-800' : 'border-gray-300'
  const mutedText = theme === 'dark' ? 'text-gray-400' : 'text-gray-500'

  const categoryInfo = TASK_CATEGORIES[task.category]
  const CategoryIcon = CATEGORY_ICONS[task.category]
  const assigneeId = task.assignedTo?.[0]
  const assignee = TEAM_MEMBERS.find(m => m.id === assigneeId)

  const canEdit = isAdmin || user?.id === task.createdBy
  const canDelete = isAdmin || user?.id === task.createdBy

  const handleStatusChange = async (newStatus: 'in_progress' | 'completed' | 'closed') => {
    setLoading(true)
    try {
      await updateTask(task.id, {
        status: newStatus,
        updatedAt: new Date().toISOString(),
        ...(newStatus === 'completed' ? { completedAt: new Date().toISOString(), completedBy: user?.id } : {}),
        ...(newStatus === 'closed' ? { closedAt: new Date().toISOString() } : {})
      })
      onUpdate()
      setShowMoveMenu(false)
    } catch (error) {
      console.error('Error updating status:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyTaskLink = (e: React.MouseEvent) => {
    e.stopPropagation()
    const url = `${window.location.origin}/tasks?id=${task.id}`
    navigator.clipboard.writeText(url)
    // Could add a toast here
  }

  const priorityMeta: Record<string, { label: string; color: string }> = {
    urgent: { label: 'Экстренный', color: 'text-rose-500 bg-rose-500/10 border-rose-500/20' },
    fast_start: { label: 'Быстрый старт', color: 'text-red-500 bg-red-500/10 border-red-500/20' },
    planned_slot: { label: 'Плановый слот', color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
    background: { label: 'Фон', color: 'text-gray-500 bg-gray-500/10 border-gray-500/20' },
  }

  const pMeta = priorityMeta[task.priority] || priorityMeta.planned_slot

  if (!isLarge) {
    return (
      <div
        onClick={() => setIsLarge(true)}
        className={`${cardBg} rounded-xl border-2 ${borderColor} p-4 shadow-sm hover:shadow-md transition-all cursor-pointer relative group`}
      >
        {/* Top: ID and Actions */}
        <div className="flex items-center justify-between mb-4">
          <div className="px-2 py-0.5 rounded bg-[#4E6E49] text-white text-[10px] font-bold uppercase tracking-wider">
            ID: {task.id.slice(0, 6)}
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={copyTaskLink}
              className={`p-1.5 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} ${mutedText}`}
              title="Копировать ссылку"
            >
              <Copy className="w-4 h-4" />
            </button>
            {canEdit && (
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(task); }}
                className={`p-1.5 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} ${mutedText}`}
                title="Редактировать"
              >
                <Edit className="w-4 h-4" />
              </button>
            )}
            {canDelete && (
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
                className={`p-1.5 rounded-lg ${theme === 'dark' ? 'hover:bg-rose-500/10 text-rose-500' : 'hover:bg-rose-50 text-rose-500'}`}
                title="Удалить"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setShowMoveMenu(!showMoveMenu); }}
                className={`p-1.5 rounded-lg ${theme === 'dark' ? 'hover:bg-blue-500/10 text-blue-400' : 'hover:bg-blue-50 text-blue-600'}`}
                title="Переместить"
              >
                <ArrowRightLeft className="w-4 h-4" />
              </button>
              {showMoveMenu && (
                <div
                  className={`absolute right-0 mt-1 w-32 rounded-lg border shadow-xl z-20 ${cardBg} ${borderColor} py-1`}
                  onClick={e => e.stopPropagation()}
                >
                  {(['in_progress', 'completed', 'closed'] as const).map(s => (
                    <button
                      key={s}
                      onClick={() => handleStatusChange(s)}
                      disabled={loading}
                      className={`w-full text-left px-3 py-1.5 text-xs font-semibold hover:bg-[#4E6E49]/10 transition-colors ${task.status === s ? 'text-[#4E6E49]' : mutedText
                        }`}
                    >
                      {TASK_STATUSES[s].label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Middle: Priority and Category */}
        <div className="flex items-center gap-2 mb-3">
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${pMeta.color}`}>
            {pMeta.label}
          </span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${theme === 'dark' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-blue-50 border-blue-100 text-blue-600'
            } flex items-center gap-1`}>
            <CategoryIcon className="w-3 h-3" />
            {categoryInfo.label}
          </span>
        </div>

        {/* Title */}
        <h4 className={`text-sm font-bold ${headingColor} mb-3 line-clamp-1`}>
          {task.title}
        </h4>

        {/* Bottom: Assignee and Deadline */}
        <div className="flex flex-col gap-2 pt-3 border-t border-dashed border-gray-500/20">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
              {assignee?.avatar ? (
                <img src={assignee.avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-[#4E6E49] flex items-center justify-center text-[10px] text-white font-bold">
                  {assignee?.name?.charAt(0)}
                </div>
              )}
            </div>
            <span className={`text-xs font-medium ${mutedText}`}>
              {getUserNicknameSync(assigneeId)}
            </span>
          </div>
          <div className={`flex items-center gap-1.5 text-[11px] font-bold ${theme === 'dark' ? 'text-amber-400/80' : 'text-amber-600'}`}>
            <Clock className="w-3.5 h-3.5" />
            {formatDate(new Date(task.dueDate), 'dd.MM')} в {task.dueTime}
          </div>
        </div>
      </div>
    )
  }

  // LARGE CARD VIEW
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[80] p-4 overflow-y-auto">
      <div
        className={`${cardBg} rounded-2xl border-2 ${borderColor} w-full max-w-lg shadow-2xl relative overflow-hidden`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-5 border-b ${borderColor} flex items-center justify-between bg-gradient-to-r from-[#4E6E49]/10 to-transparent`}>
          <div className="flex flex-col gap-1">
            <div className="px-2 py-0.5 rounded bg-[#4E6E49] text-white text-[10px] font-bold w-fit">
              ID: {task.id}
            </div>
            <h3 className={`text-xl font-bold ${headingColor}`}>{task.title}</h3>
          </div>
          <button
            onClick={() => setIsLarge(false)}
            className={`p-2 rounded-xl border-2 transition-all ${borderColor} ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {/* Status Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className={`text-[10px] font-bold uppercase tracking-wider ${mutedText}`}>Статус</span>
              <div className={`px-3 py-2 rounded-xl border-2 font-bold text-xs flex items-center gap-2 ${task.status === 'in_progress' ? 'border-blue-500/20 text-blue-500' :
                task.status === 'completed' ? 'border-emerald-500/20 text-emerald-500' : 'border-gray-500/20 text-gray-500'
                }`}>
                <div className={`w-2 h-2 rounded-full ${task.status === 'in_progress' ? 'bg-blue-500 animate-pulse' :
                  task.status === 'completed' ? 'bg-emerald-500' : 'bg-gray-500'
                  }`} />
                {TASK_STATUSES[task.status].label}
              </div>
            </div>
            <div className="space-y-1">
              <span className={`text-[10px] font-bold uppercase tracking-wider ${mutedText}`}>Приоритет</span>
              <div className={`px-3 py-2 rounded-xl border-2 font-bold text-xs ${pMeta.color}`}>
                {pMeta.label}
              </div>
            </div>
          </div>

          {/* Description */}
          {task.description && (
            <div className="space-y-1">
              <span className={`text-[10px] font-bold uppercase tracking-wider ${mutedText}`}>Описание</span>
              <div className={`p-4 rounded-xl border-2 ${borderColor} text-sm leading-relaxed ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {task.description}
              </div>
            </div>
          )}

          {/* Expected Result */}
          {task.expectedResult && (
            <div className="space-y-1">
              <span className={`text-[10px] font-bold uppercase tracking-wider ${mutedText} flex items-center gap-1`}>
                <CheckCircle2 className="w-3 h-3" /> Ожидаемый результат
              </span>
              <div className={`p-4 rounded-xl border-2 border-[#4E6E49]/20 bg-[#4E6E49]/5 text-sm font-medium ${theme === 'dark' ? 'text-[#4E6E49]' : 'text-emerald-700'}`}>
                {task.expectedResult}
              </div>
            </div>
          )}

          {/* Links */}
          {task.links && task.links.length > 0 && (
            <div className="space-y-2">
              <span className={`text-[10px] font-bold uppercase tracking-wider ${mutedText}`}>Ссылки</span>
              <div className="grid grid-cols-1 gap-2">
                {task.links.map((link, i) => (
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all hover:scale-[1.02] active:scale-95 ${borderColor} ${theme === 'dark' ? 'hover:border-[#4E6E49]/50' : 'hover:border-[#4E6E49]'}`}
                  >
                    <span className="text-sm font-bold truncate max-w-[80%]">{link.name || link.url}</span>
                    <ExternalLink className="w-4 h-4 text-[#4E6E49]" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Info Grid */}
          <div className={`p-4 rounded-2xl border-2 ${borderColor} grid grid-cols-2 gap-y-4`}>
            <div className="space-y-1">
              <span className={`text-[10px] font-bold uppercase tracking-wider ${mutedText}`}>Исполнитель</span>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#4E6E49] flex items-center justify-center text-[10px] text-white font-bold">
                  {assignee?.name?.charAt(0)}
                </div>
                <span className="text-sm font-bold">{getUserNicknameSync(assigneeId)}</span>
              </div>
            </div>
            <div className="space-y-1">
              <span className={`text-[10px] font-bold uppercase tracking-wider ${mutedText}`}>Категория</span>
              <div className="flex items-center gap-1.5 text-sm font-bold">
                <CategoryIcon className="w-4 h-4 text-blue-500" />
                {categoryInfo.label}
              </div>
            </div>
            <div className="space-y-1 col-span-2 pt-2 border-t border-dashed border-gray-500/20">
              <span className={`text-[10px] font-bold uppercase tracking-wider ${mutedText}`}>Дедлайн</span>
              <div className="flex items-center gap-2 text-sm font-bold text-amber-500">
                <Clock className="w-4 h-4" />
                {formatDate(new Date(task.dueDate), 'dd MMMM yyyy')} в {task.dueTime}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className={`p-5 border-t ${borderColor} flex gap-3`}>
          <button
            onClick={() => setIsLarge(false)}
            className={`flex-1 px-4 py-3 rounded-xl font-bold transition-all ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'}`}
          >
            Закрыть
          </button>
          {canEdit && (
            <button
              onClick={() => { setIsLarge(false); onEdit(task); }}
              className="px-6 py-3 rounded-xl font-bold bg-[#4E6E49] text-white hover:bg-[#3d5639] transition-all"
            >
              Редактировать
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

