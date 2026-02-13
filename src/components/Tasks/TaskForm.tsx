import { useState, useEffect } from 'react'
import { useThemeStore } from '@/store/themeStore'
import { useAuthStore } from '@/store/authStore'
import { Task, TaskStatus, TaskPriority, TaskCategory, TASK_CATEGORIES, TaskLink } from '@/types'
import { X, Save, Plus, Trash2, Calendar, Clock, Target, User, Link2 } from 'lucide-react'
import { format, addHours, addDays } from 'date-fns'
import Avatar from '@/components/Avatar'
import { UserNickname } from '@/components/UserNickname'

interface TaskFormProps {
  task: Task | null
  onClose: () => void
  onSave: (task: Partial<Task>) => Promise<void>
}

interface LinkInput {
  id: string
  url: string
  name: string
}

export const TaskForm = ({ task, onClose, onSave }: TaskFormProps) => {
  const { theme } = useThemeStore()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<Partial<Task>>({
    title: '',
    description: '',
    category: 'trading',
    priority: 'medium',
    status: 'in_progress',
    assignedTo: [],
    dueDate: '',
    dueTime: '',
    expectedResult: '',
    links: []
  })
  const [linkInputs, setLinkInputs] = useState<LinkInput[]>([])

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        category: task.category || 'trading',
        priority: task.priority || 'medium',
        status: task.status || 'in_progress',
        assignedTo: task.assignedTo || [],
        dueDate: task.dueDate || '',
        dueTime: task.dueTime || '',
        expectedResult: task.expectedResult || '',
        links: task.links || []
      })

      const parsedLinks = task.links?.map(link => ({
        id: link.id || crypto.randomUUID(),
        url: link.url || '',
        name: link.name || ''
      })) || []
      setLinkInputs(parsedLinks.length > 0 ? parsedLinks : [{ id: crypto.randomUUID(), url: '', name: '' }])

      if (task.dueDate && task.dueTime) {
        setFormData(prev => ({
          ...prev,
          dueDate: task.dueDate,
          dueTime: task.dueTime
        }))
      } else {
        const now = new Date()
        setFormData(prev => ({
          ...prev,
          dueDate: format(now, 'yyyy-MM-dd'),
          dueTime: format(now, 'HH:mm')
        }))
      }
    } else {
      setFormData({
        title: '',
        description: '',
        category: 'trading',
        priority: 'medium',
        status: 'in_progress',
        assignedTo: [],
        dueDate: format(new Date(), 'yyyy-MM-dd'),
        dueTime: format(new Date(), 'HH:mm'),
        expectedResult: '',
        links: []
      })
      setLinkInputs([{ id: crypto.randomUUID(), url: '', name: '' }])
    }
  }, [task])

  if (!task && !user) return null

  const handleAddLinkInput = () => {
    if (linkInputs.length < 10) {
      setLinkInputs([...linkInputs, { id: crypto.randomUUID(), url: '', name: '' }])
    }
  }

  const handleRemoveLinkInput = (index: number) => {
    const newLinkInputs = linkInputs.filter((_, i) => i !== index)
    setLinkInputs(newLinkInputs)
  }

  const handleLinkInputChange = (index: number, field: keyof LinkInput, value: string) => {
    const newLinkInputs = [...linkInputs]
    newLinkInputs[index] = { ...newLinkInputs[index], [field]: value }
    setLinkInputs(newLinkInputs)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const formattedLinks: TaskLink[] = linkInputs
        .filter(link => !(link.url.trim() === '' && link.name.trim() === ''))
        .map(link => ({ id: link.id, url: link.url.trim(), name: link.name.trim() }))

      const data = {
        ...formData,
        links: formattedLinks,
        updatedAt: new Date().toISOString()
      } as Partial<Task>

      if (!task) {
        data.createdBy = user?.id || ''
        data.createdAt = new Date().toISOString()
      }

      await onSave(data)
    } catch (error) {
      console.error('Error saving task:', error)
    } finally {
      setLoading(false)
    }
  }

  const bgColor = theme === 'dark' ? 'bg-[#0f141a]' : 'bg-white'
  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900'
  const inputBg = theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
  const subTextColor = theme === 'dark' ? 'text-gray-400' : 'text-gray-500'

  const categoryOptions = Object.entries(TASK_CATEGORIES).map(([key, value]) => ({
    value: key,
    label: value.label,
    icon: key === 'trading' ? '📈' : key === 'development' ? '💻' : key === 'stream' ? '🎥' : '📚'
  }))

  const priorityOptions = [
    { value: 'low', label: 'Низкий', color: 'text-gray-500' },
    { value: 'medium', label: 'Средний', color: 'text-yellow-500' },
    { value: 'high', label: 'Высокий', color: 'text-orange-500' },
    { value: 'urgent', label: 'Срочный', color: 'text-red-500' }
  ]

  const statusOptions = [
    { value: 'in_progress', label: 'В работе', color: 'bg-blue-500' },
    { value: 'completed', label: 'Выполнено', color: 'bg-emerald-500' },
    { value: 'closed', label: 'Закрыто', color: 'bg-gray-500' }
  ]

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className={`${bgColor} w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border ${theme === 'dark' ? 'border-white/10' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h2 className={`text-xl font-black tracking-tight ${textColor}`}>
            {task ? 'Редактировать задачу' : 'Создать задачу'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {task && (
            <div className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/5">
              <div className="flex items-center gap-3">
                <Avatar userId={task.createdBy} size="md" />
                <div>
                  <UserNickname userId={task.createdBy} className={`text-sm font-bold ${textColor}`} />
                  <p className={`text-[10px] uppercase font-bold tracking-widest ${subTextColor}`}>Автор задачи</p>
                </div>
              </div>
              {task.assignedTo && task.assignedTo.length > 0 && (
                <div className="flex items-center gap-2">
                  <Avatar userId={task.assignedTo[0]} size="sm" />
                  <UserNickname userId={task.assignedTo[0]} className={`text-sm ${subTextColor}`} />
                </div>
              )}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Название задачи</label>
            <input
              type="text"
              placeholder="Введите название задачи"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-emerald-500 outline-none transition-all ${inputBg} ${textColor}`}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Категория</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as TaskCategory })}
                className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-emerald-500 outline-none transition-all ${inputBg} ${textColor}`}
              >
                {categoryOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.icon} {opt.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Приоритет</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
                className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-emerald-500 outline-none transition-all ${inputBg} ${textColor}`}
              >
                {priorityOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Статус</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskStatus })}
                className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-emerald-500 outline-none transition-all ${inputBg} ${textColor}`}
              >
                {statusOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-emerald-500 flex items-center gap-2">
                <Calendar size={14} /> Дедлайн
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-emerald-500 outline-none transition-all ${inputBg} ${textColor}`}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-emerald-500 flex items-center gap-2">
                <Clock size={14} /> Время
              </label>
              <input
                type="time"
                value={formData.dueTime}
                onChange={(e) => setFormData({ ...formData, dueTime: e.target.value })}
                className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-emerald-500 outline-none transition-all ${inputBg} ${textColor}`}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {[
                { label: '1ч', value: 1, type: 'hour' },
                { label: '3ч', value: 3, type: 'hour' },
                { label: '6ч', value: 6, type: 'hour' },
                { label: '12ч', value: 12, type: 'hour' },
                { label: '1д', value: 1, type: 'day' },
                { label: '2д', value: 2, type: 'day' },
                { label: '3д', value: 3, type: 'day' },
                { label: '7д', value: 7, type: 'day' },
              ].map((option) => (
                <button
                  key={`${option.type}-${option.value}`}
                  type="button"
                  onClick={() => {
                    const now = new Date()
                    const newDate = option.type === 'hour'
                      ? addHours(now, option.value)
                      : addDays(now, option.value)
                    setFormData({
                      ...formData,
                      dueDate: format(newDate, 'yyyy-MM-dd'),
                      dueTime: format(newDate, 'HH:mm')
                    })
                  }}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${theme === 'dark'
                    ? 'bg-white/5 border-white/10 hover:bg-white/10 text-gray-300'
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  +{option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-emerald-500 flex items-center gap-2">
              <User size={14} /> Исполнитель
            </label>
            <select
              value={formData.assignedTo?.[0] || ''}
              onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value ? [e.target.value] : [] })}
              className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-emerald-500 outline-none transition-all ${inputBg} ${textColor}`}
            >
              <option value="">Не назначен</option>
              {[
                { id: 'admin', name: 'Администратор' },
                { id: 'trader1', name: 'Трейдер 1' },
                { id: 'trader2', name: 'Трейдер 2' },
                { id: 'analyst1', name: 'Аналитик 1' },
                { id: 'dev1', name: 'Разработчик 1' }
              ].map(member => (
                <option key={member.id} value={member.id}>{member.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Описание</label>
            <textarea
              rows={3}
              placeholder="Опишите задачу подробнее..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-emerald-500 outline-none transition-all resize-none ${inputBg} ${textColor}`}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-emerald-500 flex items-center gap-2">
              <Target size={14} /> Ожидаемый результат
            </label>
            <textarea
              rows={2}
              placeholder="Какой результат ожидается?"
              value={formData.expectedResult}
              onChange={(e) => setFormData({ ...formData, expectedResult: e.target.value })}
              className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-emerald-500 outline-none transition-all resize-none ${inputBg} ${textColor}`}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-emerald-500 flex items-center gap-2">
              <Link2 size={14} /> Ссылки
            </label>
            {linkInputs.map((linkInput, index) => (
              <div key={linkInput.id} className="flex gap-2">
                <input
                  type="text"
                  placeholder="URL"
                  value={linkInput.url}
                  onChange={(e) => handleLinkInputChange(index, 'url', e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-emerald-500 outline-none transition-all ${inputBg} ${textColor}`}
                />
                <input
                  type="text"
                  placeholder="Название"
                  value={linkInput.name}
                  onChange={(e) => handleLinkInputChange(index, 'name', e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-emerald-500 outline-none transition-all ${inputBg} ${textColor}`}
                />
                {linkInputs.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveLinkInput(index)}
                    className="p-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
            {linkInputs.length < 10 && (
              <button
                type="button"
                onClick={handleAddLinkInput}
                className="w-full px-4 py-3 mt-2 rounded-xl border border-dashed border-emerald-500 text-emerald-500 hover:bg-emerald-500/10 transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" /> Добавить ссылку
              </button>
            )}
          </div>

          <div className="pt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className={`px-6 py-3 rounded-xl font-bold transition-all ${theme === 'dark' ? 'bg-white/5 text-gray-400 hover:bg-white/10' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
            >
              {loading ? <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <Save className="w-4 h-4" />}
              {task ? 'Обновить задачу' : 'Создать задачу'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
