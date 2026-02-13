import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { TaskForm } from '@/components/Tasks/TaskForm'
import { TaskDetails } from '@/components/Tasks/TaskDetails'
import { TaskArchive } from '@/components/Tasks/TaskArchive'
import { getTasks, updateTask, deleteTask, addTask } from '@/services/firestoreService'
import { useThemeStore } from '@/store/themeStore'
import { useAuthStore } from '@/store/authStore'
import { Plus, Archive, Filter, X, Users, Tag, CheckCircle, AlertTriangle } from 'lucide-react'
import { Task, TaskStatus, TaskCategory, TaskPriority, TASK_CATEGORIES, TEAM_MEMBERS } from '@/types'
import { CATEGORY_ICONS } from '@/constants/common'
import { TaskCard } from '@/components/Tasks/TaskCard'
import { useUserNickname } from '@/utils/userUtils'
import { MultiSelect, SelectOption } from '@/components/Call/MultiSelect'
import Avatar from '@/components/Avatar'

export const Tasks = () => {
  const { theme } = useThemeStore()
  const { user } = useAuthStore()
  const [searchParams] = useSearchParams()
  
  const [tasks, setTasks] = useState<Task[]>([])
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isArchiveOpen, setIsArchiveOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Фильтры
  const [filters, setFilters] = useState({
    assignee: '',
    category: '',
    status: '',
    priority: ''
  })
  
  const headingColor = theme === 'dark' ? 'text-white' : 'text-gray-900'
  const subTextColor = theme === 'dark' ? 'text-gray-400' : 'text-gray-500'

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const tasksData = await getTasks()
        setTasks(tasksData)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching tasks:', error)
        setLoading(false)
      }
    }
    fetchTasks()
  }, [])

  // Обработка открытия задачи по ссылке
  useEffect(() => {
    const taskId = searchParams.get('taskId')
    if (taskId && tasks.length > 0) {
      const task = tasks.find(t => t.id === taskId)
      if (task) {
        setSelectedTask(task)
        window.history.replaceState({}, '', '/tasks')
      }
    }
  }, [searchParams, tasks])

  // Применение фильтров
  useEffect(() => {
    let result = tasks.filter(task => !task.archivedAt)
    
    if (filters.assignee) {
      result = result.filter(task => task.assignedTo?.includes(filters.assignee))
    }
    
    if (filters.category) {
      result = result.filter(task => task.category === filters.category)
    }
    
    if (filters.status) {
      result = result.filter(task => task.status === filters.status)
    }
    
    if (filters.priority) {
      result = result.filter(task => task.priority === filters.priority)
    }
    
    setFilteredTasks(result)
  }, [tasks, filters])

  const openModal = () => {
    setEditingTask(null)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingTask(null)
  }

  const openTaskDetails = (task: Task) => {
    setSelectedTask(task)
  }

  const closeTaskDetails = () => {
    setSelectedTask(null)
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setSelectedTask(null)
    setIsModalOpen(true)
  }

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId)
      setTasks(tasks.filter(t => t.id !== taskId))
      setSelectedTask(null)
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  const handleMoveTask = async (taskId: string, newStatus: TaskStatus) => {
    try {
      const updates: Partial<Task> = {
        status: newStatus,
        updatedAt: new Date().toISOString()
      }
      
      // Устанавливаем completedAt или closedAt в зависимости от статуса
      if (newStatus === 'completed') {
        updates.completedAt = new Date().toISOString()
      } else if (newStatus === 'closed') {
        updates.closedAt = new Date().toISOString()
      }
      
      // Если статус меняется с completed/closed на другой, сбрасываем поля
      const task = tasks.find(t => t.id === taskId)
      if (task && (task.status === 'completed' || task.status === 'closed') && newStatus === 'in_progress') {
        updates.completedAt = undefined
        updates.closedAt = undefined
      }
      
      await updateTask(taskId, updates)
      setTasks(tasks.map(t => t.id === taskId ? { ...t, ...updates } : t))
    } catch (error) {
      console.error('Error moving task:', error)
    }
  }

  const handleCopyLink = (taskId: string) => {
    const link = `${window.location.origin}/tasks?taskId=${taskId}`
    navigator.clipboard.writeText(link)
      .then(() => {
        console.log('Ссылка скопирована!', link)
      })
      .catch(err => {
        console.error('Не удалось скопировать ссылку: ', err)
      })
  }

  const stats = {
    total: filteredTasks.length,
    inProgress: filteredTasks.filter(t => t.status === 'in_progress').length,
    completed: filteredTasks.filter(t => t.status === 'completed').length,
    overdue: filteredTasks.filter(t => {
      const now = new Date().getTime()
      const deadline = new Date(`${t.dueDate}T${t.dueTime}`).getTime()
      return t.status !== 'completed' && t.status !== 'closed' && deadline < now
    }).length
  }

  const statCards = [
    {
      label: 'Всего задач',
      icon: CATEGORY_ICONS.all,
      value: stats.total,
      bgClass: 'bg-emerald-500/5',
      borderClass: 'border-emerald-500/20',
      iconBgClass: 'bg-emerald-500/10'
    },
    {
      label: 'В работе',
      icon: <div className="w-4 h-4 rounded-full bg-blue-500" />,
      value: stats.inProgress,
      bgClass: 'bg-blue-500/5',
      borderClass: 'border-blue-500/20',
      iconBgClass: 'bg-blue-500/10'
    },
    {
      label: 'Выполнено',
      icon: <div className="w-4 h-4 rounded-full bg-emerald-500" />,
      value: stats.completed,
      bgClass: 'bg-emerald-500/5',
      borderClass: 'border-emerald-500/20',
      iconBgClass: 'bg-emerald-500/10'
    },
    {
      label: 'Просрочено',
      icon: <div className="w-4 h-4 rounded-full bg-red-500" />,
      value: stats.overdue,
      bgClass: 'bg-red-500/5',
      borderClass: 'border-red-500/20',
      iconBgClass: 'bg-red-500/10'
    }
  ]

  const hasActiveFilters = Object.values(filters).some(value => value !== '')

  const clearFilters = () => {
    setFilters({ assignee: '', category: '', status: '', priority: '' })
  }

  const priorityLabels: Record<TaskPriority, string> = {
    low: 'Низкий',
    medium: 'Средний',
    high: 'Высокий',
    urgent: 'Срочный'
  }

  const statusLabels: Record<TaskStatus, string> = {
    in_progress: 'В работе',
    completed: 'Выполнено',
    closed: 'Закрыто'
  }

  return (
    <div className="flex min-h-screen">
      <div className="w-full space-y-6 p-4 md:p-6">
        {/* Шапка в стиле Analytics */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1">
            <h1 className={`flex items-center gap-2 text-2xl md:text-3xl font-black tracking-tight ${headingColor}`}>
              <span className={theme === 'dark' ? 'text-emerald-400' : 'text-emerald-500'}>
                {CATEGORY_ICONS.all}
              </span>
              Tasks
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={openModal}
              className={`flex items-center justify-center w-10 h-10 rounded-xl font-medium transition-all ${theme === 'dark'
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : 'bg-emerald-500 hover:bg-emerald-600 text-white'
              }`}
              title="Создать задачу"
            >
              <Plus size={20} />
            </button>
            <button
              onClick={() => setIsArchiveOpen(!isArchiveOpen)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                isArchiveOpen
                  ? theme === 'dark'
                    ? 'bg-amber-600 hover:bg-amber-500 text-white'
                    : 'bg-amber-500 hover:bg-amber-600 text-white'
                  : theme === 'dark'
                    ? 'bg-white/10 hover:bg-white/20 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
              title="Показать/скрыть архив"
            >
              <Archive size={18} />
              <span>Архив</span>
            </button>
          </div>
        </div>

        {/* Статистические карточки */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((item, idx) => (
            <div
              key={idx}
              className={`relative overflow-hidden rounded-2xl p-5 border transition-all duration-300 hover:shadow-lg group ${theme === 'dark'
                  ? `${item.bgClass} ${item.borderClass} hover:border-opacity-50`
                  : 'bg-white border-gray-100 hover:border-blue-500/20'
                }`}
            >
              <div className="flex justify-between items-start mb-4">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${subTextColor}`}>
                  {item.label}
                </span>
                <div className={`p-2 rounded-xl transition-colors ${theme === 'dark' ? 'bg-white/5 group-hover:bg-white/10' : 'bg-gray-100 group-hover:bg-gray-200'}`}>
                  {typeof item.icon === 'string' ? (
                    <span className="text-lg">{item.icon}</span>
                  ) : (
                    item.icon
                  )}
                </div>
              </div>
              <div className={`text-3xl font-black ${headingColor}`}>
                {item.value}
              </div>
            </div>
          ))}
        </div>

        {/* Фильтры */}
        <div className={`p-4 rounded-2xl border ${theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter size={18} className={subTextColor} />
              <h3 className={`text-sm font-black uppercase tracking-wider ${subTextColor}`}>Фильтры</h3>
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${theme === 'dark' ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
              >
                <X size={14} />
                Очистить
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Фильтр по исполнителю - MultiSelect как в Analytics */}
            {(() => {
              const assigneeOptions: SelectOption[] = TEAM_MEMBERS.map(member => ({
                value: member.id,
                label: useUserNickname(member.id),
                icon: <Avatar user={member} size="sm" className="w-4 h-4" />
              }))

              return (
                <MultiSelect
                  value={filters.assignee ? [filters.assignee] : []}
                  onChange={(values) => setFilters({ ...filters, assignee: values[0] || '' })}
                  options={assigneeOptions}
                  placeholder="Все исполнители"
                  searchable={true}
                  icon={<Users size={16} />}
                />
              )
            })()}

            {/* Фильтр по категории */}
            {(() => {
              const categoryOptions: SelectOption[] = Object.entries(TASK_CATEGORIES).map(([key, value]) => ({
                value: key,
                label: value.label,
                icon: <span className="text-sm">{value.icon || '📁'}</span>,
                chip: value.color
              }))

              return (
                <MultiSelect
                  value={filters.category ? [filters.category] : []}
                  onChange={(values) => setFilters({ ...filters, category: values[0] as TaskCategory || '' })}
                  options={categoryOptions}
                  placeholder="Все категории"
                  searchable={false}
                  icon={<Tag size={16} />}
                />
              )
            })()}

            {/* Фильтр по статусу */}
            {(() => {
              const statusOptions: SelectOption[] = Object.entries(statusLabels).map(([key, value]) => ({
                value: key,
                label: value,
                icon: key === 'in_progress' ? <div className="w-4 h-4 rounded-full bg-blue-500 animate-pulse" /> :
                      key === 'completed' ? <div className="w-4 h-4 rounded-full bg-emerald-500" /> :
                      key === 'closed' ? <div className="w-4 h-4 rounded-full bg-gray-500" /> : null
              }))

              return (
                <MultiSelect
                  value={filters.status ? [filters.status] : []}
                  onChange={(values) => setFilters({ ...filters, status: values[0] as TaskStatus || '' })}
                  options={statusOptions}
                  placeholder="Все статусы"
                  searchable={false}
                  icon={<CheckCircle size={16} />}
                />
              )
            })()}

            {/* Фильтр по приоритету */}
            {(() => {
              const priorityOptions: SelectOption[] = Object.entries(priorityLabels).map(([key, value]) => ({
                value: key,
                label: value,
                icon: key === 'low' ? <span className="text-gray-400">●</span> :
                      key === 'medium' ? <span className="text-yellow-500">●</span> :
                      key === 'high' ? <span className="text-orange-500">●</span> :
                      <span className="text-red-500">●</span>,
                chip: key
              }))

              return (
                <MultiSelect
                  value={filters.priority ? [filters.priority] : []}
                  onChange={(values) => setFilters({ ...filters, priority: values[0] as TaskPriority || '' })}
                  options={priorityOptions}
                  placeholder="Все приоритеты"
                  searchable={false}
                  icon={<AlertTriangle size={16} />}
                />
              )
            })()}
          </div>
        </div>

        {/* Список задач или архив */}
        {isArchiveOpen ? (
          <TaskArchive
            tasks={tasks.filter(t => t.archivedAt)}
            onRestore={async (taskId) => {
              await updateTask(taskId, { archivedAt: undefined, updatedAt: new Date().toISOString() })
              setTasks(tasks.map(t => t.id === taskId ? { ...t, archivedAt: undefined } : t))
            }}
            onDelete={async (taskId) => {
              await deleteTask(taskId)
              setTasks(tasks.filter(t => t.id !== taskId))
            }}
            onEdit={handleEditTask}
          />
        ) : (
          <>
            {loading ? (
              <div className="text-center py-10">
                <p className={subTextColor}>Загрузка задач...</p>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className={`p-10 text-center rounded-2xl border border-dashed ${theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50'}`}>
                <p className={subTextColor}>{hasActiveFilters ? 'Задачи не найдены по выбранным фильтрам' : 'Задач не найдено'}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5">
                {filteredTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onClick={() => openTaskDetails(task)}
                    onEdit={handleEditTask}
                    onDelete={handleDeleteTask}
                    onCopyLink={handleCopyLink}
                    onMove={handleMoveTask}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* Модальное окно создания/редактирования */}
        {isModalOpen && (
          <TaskForm
            task={editingTask}
            onClose={closeModal}
            onSave={async (taskData) => {
              if (editingTask) {
                await updateTask(editingTask.id, taskData)
                setTasks(tasks.map(t => t.id === editingTask.id ? { ...t, ...taskData } : t))
              } else {
                // Добавляем createdBy если не существует
                const taskWithCreator = {
                  ...taskData,
                  createdBy: taskData.createdBy || user?.id || ''
                }
                const newTaskId = await addTask(taskWithCreator as Omit<Task, 'id'>)
                // Добавляем новую задачу в локальный стейт
                const newTask: Task = {
                  id: newTaskId,
                  ...taskWithCreator,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  archivedAt: undefined
                } as Task
                setTasks([newTask, ...tasks])
              }
              closeModal()
            }}
          />
        )}

        {/* Модальное окно деталей задачи */}
        {selectedTask && (
          <TaskDetails
            task={selectedTask}
            onClose={closeTaskDetails}
            onEdit={handleEditTask}
            onDelete={handleDeleteTask}
            onMove={handleMoveTask}
            onCopyLink={handleCopyLink}
          />
        )}
      </div>
    </div>
  )
}

export default Tasks