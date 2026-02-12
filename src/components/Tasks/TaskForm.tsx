import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useThemeStore } from '@/store/themeStore'
import { addTask, updateTask } from '@/services/firestoreService'
import {
  Task,
  TaskCategory,
  TaskPriority,
  TEAM_MEMBERS,
  TASK_CATEGORIES,
} from '@/types'
import { X, FileText, Tag, Sparkles, Target, Calendar, Clock, Users, Plus, Trash, Link as LinkIcon } from 'lucide-react'
import { CATEGORY_ICONS } from './categoryIcons'
import { formatDate } from '@/utils/dateUtils'
import { getUserNicknameSync } from '@/utils/userUtils'
import { useScrollLock } from '@/hooks/useScrollLock'

interface TaskFormProps {
  onClose: () => void
  onSave: () => void
  editingTask?: Task | null
}

export const TaskForm = ({ onClose, onSave, editingTask }: TaskFormProps) => {
  const { user } = useAuthStore()
  const { theme } = useThemeStore()
  const isEditing = !!editingTask

  const headingColor = theme === 'dark' ? 'text-white' : 'text-gray-900'
  const cardBg = theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-white'
  const inputBg = theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'
  const borderColor = theme === 'dark' ? 'border-gray-800' : 'border-gray-300'

  const [title, setTitle] = useState(editingTask?.title || '')
  const [description, setDescription] = useState(editingTask?.description || '')
  const [category, setCategory] = useState<TaskCategory>(editingTask?.category || 'trading')
  const [priority, setPriority] = useState<TaskPriority>(editingTask?.priority || 'planned_slot')
  const [expectedResult, setExpectedResult] = useState(editingTask?.expectedResult || '')
  const [dueDate, setDueDate] = useState(editingTask?.dueDate || formatDate(new Date(), 'yyyy-MM-dd'))
  const [dueTime, setDueTime] = useState(editingTask?.dueTime || '12:00')
  const [assignedTo, setAssignedTo] = useState<string>(editingTask?.assignedTo?.[0] || user?.id || '')
  const [links, setLinks] = useState<{ name: string; url: string }[]>(editingTask?.links || [])

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useScrollLock()

  const priorityOptions: { value: TaskPriority; label: string; tone: string }[] = [
    { value: 'urgent', label: 'Нужно прямо сейчас', tone: theme === 'dark' ? 'bg-rose-600/20 border-rose-500/50 text-rose-100' : 'bg-rose-50 border-rose-200 text-rose-700' },
    { value: 'fast_start', label: 'Быстрый старт', tone: theme === 'dark' ? 'bg-red-500/15 border-red-500/40 text-red-100' : 'bg-red-50 border-red-200 text-red-700' },
    { value: 'planned_slot', label: 'Плановый слот', tone: theme === 'dark' ? 'bg-amber-500/15 border-amber-500/40 text-amber-100' : 'bg-amber-50 border-amber-200 text-amber-700' },
    { value: 'background', label: 'Фон', tone: theme === 'dark' ? 'bg-gray-500/15 border-gray-500/40 text-gray-100' : 'bg-gray-50 border-gray-200 text-gray-700' },
  ]

  const handleAddLink = () => {
    if (links.length >= 10) return
    setLinks([...links, { name: '', url: '' }])
  }

  const handleUpdateLink = (index: number, field: 'name' | 'url', value: string) => {
    const newLinks = [...links]
    newLinks[index][field] = value
    setLinks(newLinks)
  }

  const handleRemoveLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index))
  }

  const validate = () => {
    if (!title.trim()) return 'Введите название задачи'
    if (!dueDate || !dueTime) return 'Укажите дедлайн (дата и время)'
    if (!assignedTo) return 'Выберите исполнителя'
    return ''
  }

  const handleSave = async () => {
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }
    if (!user) {
      setError('Пользователь не найден')
      return
    }

    setError('')
    setLoading(true)
    const now = new Date().toISOString()

    try {
      const baseTask: Partial<Task> = {
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        priority,
        assignedTo: [assignedTo],
        dueDate,
        dueTime,
        expectedResult: expectedResult.trim() || undefined,
        links,
        updatedAt: now,
      }

      if (isEditing && editingTask) {
        await updateTask(editingTask.id, baseTask)
      } else {
        const newTask: Omit<Task, 'id'> = {
          ...(baseTask as Omit<Task, 'id'>),
          status: 'in_progress',
          createdBy: user.id,
          createdAt: now,
        }
        await addTask(newTask)
      }

      onSave()
    } catch (error) {
      console.error('Error saving task:', error)
      setError('Ошибка при сохранении задачи')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start sm:items-center justify-center z-[70] p-4 overflow-y-auto overscroll-contain modal-scroll touch-pan-y text-sm">
      <div
        className={`${cardBg} rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-2xl max-h-[calc(100vh-48px)] sm:max-h-[calc(100vh-64px)] overflow-y-auto border-2 touch-pan-y ${theme === 'dark'
            ? 'border-[#4E6E49]/30 bg-gradient-to-br from-[#1a1a1a] via-[#1a1a1a] to-[#0A0A0A]'
            : 'border-green-200 bg-gradient-to-br from-white via-green-50/30 to-white'
          } relative`}
      >
        <div className="flex flex-col h-full min-h-0">
          <div className={`sticky top-0 ${cardBg} border-b ${borderColor} p-4 sm:p-5 flex items-center justify-between z-10`}>
            <h2 className={`text-xl font-bold ${headingColor} flex items-center gap-2`}>
              <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
              {isEditing ? 'Редактировать задачу' : 'Новая задача'}
            </h2>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 sm:p-6 space-y-5 flex-1 min-h-0 overflow-y-auto overscroll-contain modal-scroll touch-pan-y pb-10">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-red-500">
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}

            {/* Название */}
            <div className="space-y-1.5">
              <label className={`block font-semibold ${headingColor}`}>Название задачи *</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-lg border ${borderColor} ${inputBg} ${headingColor} focus:outline-none focus:ring-2 focus:ring-[#4E6E49]/50 transition-all`}
                placeholder="Что нужно сделать?"
              />
            </div>

            {/* Описание */}
            <div className="space-y-1.5">
              <label className={`block font-semibold ${headingColor}`}>Описание задачи</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className={`w-full px-4 py-2.5 rounded-lg border ${borderColor} ${inputBg} ${headingColor} focus:outline-none focus:ring-2 focus:ring-[#4E6E49]/50 transition-all resize-none`}
                placeholder="Подробности задачи..."
              />
            </div>

            {/* Категория */}
            <div className="space-y-2">
              <label className={`block font-semibold ${headingColor} flex items-center gap-2`}>
                <Tag className="w-4 h-4" />
                Категория
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {Object.entries(TASK_CATEGORIES).map(([key, { label }]) => {
                  const Icon = CATEGORY_ICONS[key as TaskCategory]
                  const isActive = category === key
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setCategory(key as TaskCategory)}
                      className={`p-2.5 rounded-lg border-2 text-xs font-bold transition-all flex flex-col items-center gap-1.5 ${isActive
                          ? 'border-[#4E6E49] bg-[#4E6E49]/15 text-[#4E6E49]'
                          : `${borderColor} ${inputBg} ${theme === 'dark' ? 'text-gray-400 hover:border-[#4E6E49]/40' : 'text-gray-600 hover:border-[#4E6E49]/40'}`
                        }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Приоритет */}
            <div className="space-y-2">
              <label className={`block font-semibold ${headingColor} flex items-center gap-2`}>
                <Sparkles className="w-4 h-4" />
                Приоритет
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {priorityOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setPriority(option.value)}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${option.tone} ${priority === option.value
                        ? 'ring-2 ring-[#4E6E49] ring-offset-2 dark:ring-offset-[#1a1a1a] border-transparent'
                        : 'border-transparent'
                      }`}
                  >
                    <span className="font-bold text-sm">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Ожидаемый результат */}
            <div className="space-y-1.5">
              <label className={`block font-semibold ${headingColor} flex items-center gap-2`}>
                <Target className="w-4 h-4" />
                Ожидаемый результат
              </label>
              <textarea
                value={expectedResult}
                onChange={(e) => setExpectedResult(e.target.value)}
                rows={2}
                className={`w-full px-4 py-2.5 rounded-lg border ${borderColor} ${inputBg} ${headingColor} focus:outline-none focus:ring-2 focus:ring-[#4E6E49]/50 transition-all resize-none`}
                placeholder="Что будет считаться успехом?"
              />
            </div>

            {/* Ссылки */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className={`block font-semibold ${headingColor} flex items-center gap-2`}>
                  <LinkIcon className="w-4 h-4" />
                  Ссылки (до 10)
                </label>
                {links.length < 10 && (
                  <button
                    type="button"
                    onClick={handleAddLink}
                    className={`text-xs font-bold text-[#4E6E49] hover:underline flex items-center gap-1`}
                  >
                    <Plus className="w-3 h-3" /> Добавить
                  </button>
                )}
              </div>
              <div className="space-y-2">
                {links.map((link, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      value={link.name}
                      onChange={(e) => handleUpdateLink(index, 'name', e.target.value)}
                      placeholder="Имя ссылки"
                      className={`flex-1 min-w-0 px-3 py-2 rounded-lg border ${borderColor} ${inputBg} ${headingColor} focus:outline-none focus:ring-1 focus:ring-[#4E6E49]`}
                    />
                    <input
                      value={link.url}
                      onChange={(e) => handleUpdateLink(index, 'url', e.target.value)}
                      placeholder="URL"
                      className={`flex-[2] min-w-0 px-3 py-2 rounded-lg border ${borderColor} ${inputBg} ${headingColor} focus:outline-none focus:ring-1 focus:ring-[#4E6E49]`}
                    />
                    <button
                      onClick={() => handleRemoveLink(index)}
                      className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Исполнитель */}
            <div className="space-y-1.5">
              <label className={`block font-semibold ${headingColor} flex items-center gap-2`}>
                <Users className="w-4 h-4" />
                Исполнитель *
              </label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-lg border ${borderColor} ${inputBg} ${headingColor} focus:outline-none focus:ring-2 focus:ring-[#4E6E49]/50 transition-all`}
              >
                <option value="">Выберите исполнителя</option>
                {TEAM_MEMBERS.map((member) => (
                  <option key={member.id} value={member.id}>
                    {getUserNicknameSync(member.id)}
                  </option>
                ))}
              </select>
            </div>

            {/* Дедлайн */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className={`block font-semibold ${headingColor} flex items-center gap-2`}>
                  <Calendar className="w-4 h-4" />
                  Дата дедлайна *
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  min={formatDate(new Date(), 'yyyy-MM-dd')}
                  className={`w-full px-4 py-2.5 rounded-lg border ${borderColor} ${inputBg} ${headingColor} focus:outline-none focus:ring-2 focus:ring-[#4E6E49]/50 transition-all`}
                />
              </div>
              <div className="space-y-1.5">
                <label className={`block font-semibold ${headingColor} flex items-center gap-2`}>
                  <Clock className="w-4 h-4" />
                  Время дедлайна *
                </label>
                <input
                  type="time"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-lg border ${borderColor} ${inputBg} ${headingColor} focus:outline-none focus:ring-2 focus:ring-[#4E6E49]/50 transition-all`}
                />
              </div>
            </div>

            {/* Кнопки */}
            <div className={`flex flex-col sm:flex-row gap-3 pt-4 border-t ${borderColor}`}>
              <button
                onClick={handleSave}
                disabled={loading}
                className={`flex-1 px-6 py-3 rounded-xl font-bold transition-all relative overflow-hidden ${loading
                    ? 'bg-gray-400 cursor-not-allowed text-white'
                    : 'bg-[#4E6E49] hover:bg-[#3d5639] text-white shadow-lg active:scale-95'
                  }`}
              >
                <span className={loading ? 'invisible' : ''}>
                  {isEditing ? 'Сохранить изменения' : 'Создать задачу'}
                </span>
                {loading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  </div>
                )}
              </button>
              <button
                onClick={onClose}
                className={`px-6 py-3 rounded-xl font-bold transition-all ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
