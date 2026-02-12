import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useThemeStore } from '@/store/themeStore'
import { addTask, updateTask } from '@/services/firestoreService'
import {
  Task,
  TaskCategory,
  TaskPriority,
  TaskLink,
} from '@/types'
import { X, FileText, Tag, Sparkles, Target, Calendar, Clock, Plus, MessageCircle, Link as LinkIcon } from 'lucide-react'
import { CATEGORY_ICONS } from './categoryIcons'
import { formatDate } from '@/utils/dateUtils'
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
  const [priority, setPriority] = useState<TaskPriority>(editingTask?.priority || 'medium')
  const [expectedResult, setExpectedResult] = useState(editingTask?.expectedResult || '')
  const [dueDate, setDueDate] = useState(editingTask?.dueDate || formatDate(new Date(), 'yyyy-MM-dd'))
  const [dueTime, setDueTime] = useState(editingTask?.dueTime || '12:00')
  const [links, setLinks] = useState<TaskLink[]>(editingTask?.links || [])

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useScrollLock()

  const priorityOptions: { value: TaskPriority; label: string; tone: string }[] = [
    { value: 'urgent', label: 'Экстренный', tone: theme === 'dark' ? 'bg-rose-600/20 border-rose-500/50 text-rose-100' : 'bg-rose-50 border-rose-200 text-rose-700' },
    { value: 'high', label: 'Высокий', tone: theme === 'dark' ? 'bg-red-500/15 border-red-500/40 text-red-100' : 'bg-red-50 border-red-200 text-red-700' },
    { value: 'medium', label: 'Средний', tone: theme === 'dark' ? 'bg-amber-500/15 border-amber-500/40 text-amber-100' : 'bg-amber-50 border-amber-200 text-amber-700' },
    { value: 'low', label: 'Низкий', tone: theme === 'dark' ? 'bg-gray-500/15 border-gray-500/40 text-gray-100' : 'bg-gray-50 border-gray-200 text-gray-700' },
  ]

  const handleAddLink = () => {
    if (links.length < 10) {
      setLinks([...links, { name: '', url: '' }])
    }
  }

  const handleUpdateLink = (index: number, field: 'name' | 'url', value: string) => {
    const newLinks = [...links]
    newLinks[index] = { ...newLinks[index], [field]: value }
    setLinks(newLinks)
  }

  const handleRemoveLink = (index: number) => {
    const newLinks = links.filter((_, i) => i !== index)
    setLinks(newLinks)
  }

  const validate = () => {
    if (!title.trim()) return 'Введите название задачи'
    if (!dueDate || !dueTime) return 'Укажите дедлайн (дата и время)'
    if (links.some(link => link.name.trim() === '' || link.url.trim() === '')) return 'Все поля ссылок должны быть заполнены'
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
        expectedResult: expectedResult.trim() || undefined,
        links: links.filter(link => link.name.trim() !== '' && link.url.trim() !== ''),
        dueDate,
        dueTime,
        assignedTo: [],
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

  useEffect(() => {
    setError('')
  }, [links])

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
            <div className={`sticky top-0 ${cardBg} border-b ${borderColor} p-4 sm:p-6 flex items-center justify-between z-10`}>
              <h2 className={`text-xl sm:text-2xl font-bold ${headingColor} flex items-center gap-2`}>
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

            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 flex-1 min-h-0 overflow-y-auto overscroll-contain modal-scroll touch-pan-y pb-10">
              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-red-500">
                  <MessageCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${headingColor}`}>Название задачи *</label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-lg border ${borderColor} ${inputBg} ${headingColor} focus:outline-none focus:ring-2 focus:ring-[#4E6E49]/50`}
                    placeholder="Введите название задачи"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${headingColor}`}>Описание задачи</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className={`w-full px-4 py-2.5 rounded-lg border ${borderColor} ${inputBg} ${headingColor} focus:outline-none focus:ring-2 focus:ring-[#4E6E49]/50`}
                    placeholder="Краткое описание задачи"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${headingColor} flex items-center gap-2`}>
                    <Tag className="w-4 h-4" />
                    Категория *
                  </label>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    {[
                      { value: 'trading', label: 'Торговля' },
                      { value: 'development', label: 'Разработка' },
                      { value: 'stream', label: 'Стрим' },
                      { value: 'education', label: 'Изучение' },
                    ].map((option) => {
                      const Icon = CATEGORY_ICONS[option.value as TaskCategory]
                      const isActive = category === option.value
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setCategory(option.value as TaskCategory)}
                          className={`p-3 rounded-lg border-2 text-sm font-semibold transition-all text-center ${isActive ? theme === 'dark' ? 'border-[#4E6E49] bg-[#4E6E49]/15 text-[#4E6E49]' : 'border-[#4E6E49] bg-green-50 text-[#4E6E49]' : theme === 'dark' ? 'border-gray-800 bg-gray-900 text-gray-200 hover:border-[#4E6E49]/40' : 'border-gray-200 bg-white text-gray-800 hover:border-[#4E6E49]/40'} flex items-center justify-center gap-2`}
                        >
                          <Icon className="w-4 h-4" />
                          <span>{option.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Priority */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${headingColor} flex items-center gap-2`}>
                    <Sparkles className="w-4 h-4" />
                    Приоритет *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {priorityOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setPriority(option.value)}
                        className={`p-3 rounded-lg border-2 text-left transition-all ${option.tone} ${priority === option.value ? 'ring-2 ring-offset-2 ring-[#4E6E49] dark:ring-offset-[#1a1a1a]' : ''}`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-sm">{option.label}</span>
                          {priority === option.value && <span className="text-xs font-semibold">выбрано</span>}
                        </div>
                        <p className="text-xs mt-1 opacity-80">{option.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Expected Result */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${headingColor} flex items-center gap-2`}>
                    <Target className="w-4 h-4" />
                    Ожидаемый результат
                  </label>
                  <textarea
                    value={expectedResult}
                    onChange={(e) => setExpectedResult(e.target.value)}
                    rows={3}
                    className={`w-full px-4 py-2.5 rounded-lg border ${borderColor} ${inputBg} ${headingColor} focus:outline-none focus:ring-2 focus:ring-[#4E6E49]/50`}
                    placeholder="Опишите ожидаемый итог"
                  />
                </div>

                {/* Links */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className={`block text-sm font-medium ${headingColor} flex items-center gap-2`}>
                      <LinkIcon className="w-4 h-4" />
                      Ссылки {links.length > 0 && `(${links.length}/10)`}
                    </label>
                    {links.length < 10 && (
                      <button
                        type="button"
                        onClick={handleAddLink}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}
                      >
                        <Plus className="w-4 h-4 inline" /> Добавить ссылку
                      </button>
                    )}
                  </div>
                  <div className="space-y-4">
                    {links.map((link, index) => (
                      <div key={index} className="flex flex-col sm:flex-row gap-2 relative bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex-1">
                          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Название</label>
                          <input
                            value={link.name}
                            onChange={(e) => handleUpdateLink(index, 'name', e.target.value)}
                            className={`w-full px-3 py-2 rounded-lg border ${borderColor} ${inputBg} ${headingColor} text-sm focus:outline-none focus:ring-2 focus:ring-[#4E6E49]/50`}
                            placeholder="Например: Документация API"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">URL</label>
                          <input
                            value={link.url}
                            onChange={(e) => handleUpdateLink(index, 'url', e.target.value)}
                            className={`w-full px-3 py-2 rounded-lg border ${borderColor} ${inputBg} ${headingColor} text-sm focus:outline-none focus:ring-2 focus:ring-[#4E6E49]/50`}
                            placeholder="Например: https://example.com/api-docs"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveLink(index)}
                          className="absolute top-1 right-1 p-1 rounded-full text-red-500 hover:bg-red-500/10 transition-colors"
                          aria-label="Удалить ссылку"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Due Date & Time */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className={`block text-sm font-medium ${headingColor} flex items-center gap-2`}>
                      <Calendar className="w-4 h-4" />
                      Дата дедлайна *
                    </label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      min={formatDate(new Date(), 'yyyy-MM-dd')}
                      className={`w-full px-4 py-2.5 rounded-lg border ${borderColor} ${inputBg} ${headingColor} focus:outline-none focus:ring-2 focus:ring-[#4E6E49]/50`}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className={`block text-sm font-medium ${headingColor} flex items-center gap-2`}>
                      <Clock className="w-4 h-4" />
                      Время дедлайна *
                    </label>
                    <input
                      type="time"
                      value={dueTime}
                      onChange={(e) => setDueTime(e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-lg border ${borderColor} ${inputBg} ${headingColor} focus:outline-none focus:ring-2 focus:ring-[#4E6E49]/50`}
                    />
                  </div>
                </div>
              </div>

              <div className={`flex flex-col sm:flex-row gap-3 pt-4 border-t ${borderColor}`}>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all relative overflow-hidden ${
                    loading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-[#4E6E49] to-emerald-700 hover:from-[#4E6E49] hover:to-emerald-700 text-white shadow-lg hover:shadow-xl'
                  }`}
                >
                  <span className={`relative z-10 flex items-center justify-center gap-2 ${loading ? 'invisible' : ''}`}>
                    {isEditing ? 'Сохранить' : 'Создать задачу'}
                  </span>
                  {loading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex items-center gap-2 text-white">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Сохранение...</span>
                      </div>
                    </div>
                  )}
                </button>
                <button
                  onClick={onClose}
                  className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                    theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
