import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useThemeStore } from '@/store/themeStore'
import { TaskFilters } from '@/components/Tasks/TaskFilters'
import { TaskCard } from '@/components/Tasks/TaskCard'
import { TaskForm } from '@/components/Tasks/TaskForm'
import { TaskDetails } from '@/components/Tasks/TaskDetails'
import { TaskArchive } from '@/components/Tasks/TaskArchive'
import { getTasks, deleteTask, updateTask } from '@/services/firestoreService'
import { Task, TaskCategory, TaskStatus } from '@/types'
import { Plus, Archive, CheckCircle2, Clock } from 'lucide-react'

export const Tasks = () => {
  const { user } = useAuthStore()
  const { theme } = useThemeStore()

  const [tasks, setTasks] = useState<Task[]>([])
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory | 'all'>('all')
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus | 'all'>('all')
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [showArchive, setShowArchive] = useState(false)

  const headingColor = theme === 'dark' ? 'text-white' : 'text-gray-900'
  const cardBg = theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-white'
  const borderColor = theme === 'dark' ? 'border-gray-800' : 'border-gray-300'

  useEffect(() => {
    loadTasks()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [tasks, selectedCategory, selectedStatus, selectedUsers])

  const loadTasks = async () => {
    setLoading(true)
    try {
      const loadedTasks = await getTasks()
      setTasks(loadedTasks)
    } catch (error) {
      console.error('Error loading tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...tasks]

    // Фильтр по категории
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(task => task.category === selectedCategory)
    }

    // Фильтр по статусу
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(task => task.status === selectedStatus)
    }

    // Фильтр по пользователям
    if (selectedUsers.length > 0) {
      filtered = filtered.filter(task =>
        task.assignedTo.some(userId => selectedUsers.includes(userId))
      )
    }

    // Исключаем заархивированные задачи
    const now = new Date()
    filtered = filtered.filter(task => {
      const deadline = new Date(`${task.dueDate}T${task.dueTime}`)
      const daysSinceDeadline = (now.getTime() - deadline.getTime()) / (1000 * 60 * 60 * 24)

      if (task.status !== 'closed' && daysSinceDeadline > 3) {
        return false
      }

      if (task.status === 'closed' && task.closedAt) {
        const hoursSinceClosed = (now.getTime() - new Date(task.closedAt).getTime()) / (1000 * 60 * 60)
        if (hoursSinceClosed > 12) {
          return false
        }
      }

      return true
    })

    setFilteredTasks(filtered)
  }

  const handleAddTask = () => {
    setEditingTask(null)
    setShowForm(true)
  }

  const handleEditTask = (task: Task) => {
    setSelectedTask(null)
    setEditingTask(task)
    setShowForm(true)
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Вы уверены, что хотите удалить эту задачу?')) return

    try {
      await deleteTask(taskId)
      setSelectedTask(null)
      await loadTasks()
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  const handleMoveTask = async (taskId: string, newStatus: TaskStatus) => {
    try {
      const updates: Partial<Task> = { status: newStatus, updatedAt: new Date().toISOString() }

      if (newStatus === 'completed') {
        updates.completedAt = new Date().toISOString()
        updates.completedBy = user?.id
      } else if (newStatus === 'closed') {
        updates.closedAt = new Date().toISOString()
      }

      await updateTask(taskId, updates)
      await loadTasks()

      // Обновляем выбранную задачу, если она открыта
      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask({ ...selectedTask, ...updates } as Task)
      }
    } catch (error) {
      console.error('Error moving task:', error)
    }
  }

  const handleCopyLink = (taskId: string) => {
    const url = `${window.location.origin}/tasks/${taskId}`
    navigator.clipboard.writeText(url)
      .then(() => {
        // Можно добавить уведомление
        console.log('Link copied to clipboard')
      })
      .catch(err => {
        console.error('Failed to copy link:', err)
      })
  }

  const handleOpenDetails = (task: Task) => {
    setSelectedTask(task)
  }

  const handleFormSave = () => {
    setShowForm(false)
    setEditingTask(null)
    loadTasks()
  }

  const getStats = () => {
    const now = new Date()

    return {
      total: filteredTasks.length,
      inProgress: filteredTasks.filter(t => t.status === 'in_progress').length,
      completed: filteredTasks.filter(t => t.status === 'completed').length,
      overdue: filteredTasks.filter(t => {
        const deadline = new Date(`${t.dueDate}T${t.dueTime}`)
        return deadline < now && t.status !== 'completed'
      }).length,
    }
  }

  const stats = getStats()

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className={`sticky top-0 ${cardBg} border-b ${borderColor} z-40`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className={`text-2xl sm:text-3xl font-bold ${headingColor}`}>
              Задачи
            </h1>
            <button
              onClick={() => setShowArchive(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${borderColor} ${theme === 'dark' ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'} transition-colors`}
            >
              <Archive className="w-4 h-4" />
              <span className="hidden sm:inline">Архив</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className={`p-4 rounded-xl border-2 ${borderColor} ${theme === 'dark' ? 'bg-[#0f0f0f]' : 'bg-gray-50'}`}>
            <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mb-1`}>Всего</div>
            <div className={`text-2xl font-bold ${headingColor}`}>{stats.total}</div>
          </div>
          <div className={`p-4 rounded-xl border-2 ${borderColor} ${theme === 'dark' ? 'bg-blue-500/10 border-blue-500/20' : 'bg-blue-50 border-blue-200'}`}>
            <div className={`text-sm text-blue-500 mb-1`}>В работе</div>
            <div className={`text-2xl font-bold text-blue-600`}>{stats.inProgress}</div>
          </div>
          <div className={`p-4 rounded-xl border-2 ${borderColor} ${theme === 'dark' ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-emerald-50 border-emerald-200'}`}>
            <div className={`text-sm text-emerald-500 mb-1`}>Выполнено</div>
            <div className={`text-2xl font-bold text-emerald-600`}>{stats.completed}</div>
          </div>
          <div className={`p-4 rounded-xl border-2 ${borderColor} ${theme === 'dark' ? 'bg-rose-500/10 border-rose-500/20' : 'bg-rose-50 border-rose-200'}`}>
            <div className={`text-sm text-rose-500 mb-1 flex items-center gap-1`}>
              <Clock className="w-3 h-3" />
              Просрочено
            </div>
            <div className={`text-2xl font-bold text-rose-600`}>{stats.overdue}</div>
          </div>
        </div>

        {/* Filters */}
        <TaskFilters
          selectedCategory={selectedCategory}
          selectedStatus={selectedStatus}
          selectedUsers={selectedUsers}
          onCategoryChange={setSelectedCategory}
          onStatusChange={setSelectedStatus}
          onUsersChange={setSelectedUsers}
          onAddTask={handleAddTask}
        />

        {/* Tasks Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#4E6E49] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-20">
            <CheckCircle2 className={`w-16 h-16 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-700' : 'text-gray-300'}`} />
            <p className={`text-lg ${headingColor}`}>Нет задач</p>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} mb-6`}>
              Создайте первую задачу или измените фильтры
            </p>
            <button
              onClick={handleAddTask}
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                theme === 'dark'
                  ? 'bg-gradient-to-r from-[#4E6E49] to-emerald-700 hover:from-[#4E6E49] hover:to-emerald-700 text-white shadow-lg hover:shadow-xl'
                  : 'bg-gradient-to-r from-[#4E6E49] to-emerald-700 hover:from-[#4E6E49] hover:to-emerald-700 text-white shadow-lg hover:shadow-xl'
              }`}
            >
              <Plus className="w-5 h-5" />
              Создать задачу
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
                onMove={handleMoveTask}
                onCopyLink={handleCopyLink}
                onOpenDetails={handleOpenDetails}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showForm && (
        <TaskForm
          onClose={() => {
            setShowForm(false)
            setEditingTask(null)
          }}
          onSave={handleFormSave}
          editingTask={editingTask}
        />
      )}

      {selectedTask && (
        <TaskDetails
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onEdit={handleEditTask}
          onDelete={handleDeleteTask}
          onMove={handleMoveTask}
          onCopyLink={handleCopyLink}
        />
      )}

      {showArchive && (
        <TaskArchive onClose={() => setShowArchive(false)} />
      )}
    </div>
  )
}
