import { useState, useEffect } from 'react'
import { useThemeStore } from '@/store/themeStore'
import { useAuthStore } from '@/store/authStore'
import { TaskForm } from '@/components/Tasks/TaskForm'
import { TaskFilters } from '@/components/Tasks/TaskFilters'
import { TaskCard } from '@/components/Tasks/TaskCard'
import { getTasks, deleteTask, updateTask } from '@/services/firestoreService'
import { Task, TaskCategory, TaskStatus } from '@/types'
import {
  CheckSquare,
  LayoutGrid,
  Calendar,
  Zap,
  Timer,
  Package,
} from 'lucide-react'
import { formatDate } from '@/utils/dateUtils'
import { useAccessControl } from '@/hooks/useAccessControl'
import { Lock } from 'lucide-react'

export const Tasks = () => {
  const { theme } = useThemeStore()
  const { user } = useAuthStore()

  const [activeTab, setActiveTab] = useState<'tasks' | 'archive'>('tasks')
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory | 'all'>('all')
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus | 'all'>('all')
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])

  const pageAccess = useAccessControl('ava_tasks')
  const addTaskAccess = useAccessControl('tasks_add')

  const headingColor = theme === 'dark' ? 'text-white' : 'text-gray-900'

  useEffect(() => {
    loadTasks()
  }, [user])

  useEffect(() => {
    loadTasks()
  }, [selectedCategory, selectedStatus, selectedUsers])

  const loadTasks = async () => {
    setLoading(true)
    try {
      const allTasks = await getTasks({})

      // Auto-archiving logic
      const now = new Date()
      const updatedTasks = [...allTasks]
      let needsRefresh = false

      for (const t of updatedTasks) {
        if (t.status === 'archived') {
          // Check for auto-deletion (7 days)
          if (t.updatedAt) {
            const archivedDate = new Date(t.updatedAt)
            const diffDays = (now.getTime() - archivedDate.getTime()) / (1000 * 3600 * 24)
            if (diffDays > 7) {
              await deleteTask(t.id)
              needsRefresh = true
            }
          }
          continue
        }

        const dueDate = new Date(`${t.dueDate}T${t.dueTime}`)
        const diffHours = (now.getTime() - dueDate.getTime()) / (1000 * 3600)
        const diffDays = diffHours / 24

        let shouldArchive = false
        // 1. Deadlines older than 3 days (if not Closed)
        if (t.status !== 'closed' && diffDays > 3) {
          shouldArchive = true
        }
        // 2. Closed older than 12 hours
        if (t.status === 'closed' && t.closedAt) {
          const closedDate = new Date(t.closedAt)
          const closedDiffHours = (now.getTime() - closedDate.getTime()) / (1000 * 3600)
          if (closedDiffHours > 12) {
            shouldArchive = true
          }
        }

        if (shouldArchive) {
          await updateTask(t.id, {
            status: 'archived',
            updatedAt: now.toISOString()
          })
          needsRefresh = true
        }
      }

      if (needsRefresh) {
        const refreshedTasks = await getTasks({})
        setTasks(refreshedTasks)
      } else {
        setTasks(allTasks)
      }
    } catch (error) {
      console.error('Error loading tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (task: Task) => {
    setEditingTask(task)
    setShowForm(true)
  }

  const handleDelete = async (taskId: string) => {
    if (!confirm('Вы уверены, что хотите удалить эту задачу?')) return

    try {
      await deleteTask(taskId)
      loadTasks()
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingTask(null)
  }

  const handleSave = () => {
    setShowForm(false)
    setEditingTask(null)
    loadTasks()
  }

  const filteredTasks = tasks.filter(task => {
    // Tab filtering
    if (activeTab === 'tasks' && task.status === 'archived') return false
    if (activeTab === 'archive' && task.status !== 'archived') return false

    // Other filters
    if (selectedCategory !== 'all' && task.category !== selectedCategory) return false
    if (selectedStatus !== 'all' && task.status !== selectedStatus) return false
    if (selectedUsers.length > 0 && !selectedUsers.some((userId) => task.assignedTo.includes(userId))) return false
    return true
  })

  // Stats derivation
  const now = new Date()
  const todayStr = formatDate(now, 'yyyy-MM-dd')
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const activeTasks = tasks.filter(t => t.status !== 'archived')

  const stats = {
    totalToday: activeTasks.filter(t => t.createdAt.startsWith(todayStr)).length,
    totalWeek: activeTasks.filter(t => new Date(t.createdAt) >= oneWeekAgo).length,
    totalMonth: activeTasks.filter(t => new Date(t.createdAt) >= oneMonthAgo).length,
    inProgress: activeTasks.filter(t => t.status === 'in_progress').length,
    completedToday: activeTasks.filter(t => t.status === 'completed' && t.completedAt?.startsWith(todayStr)).length,
    completedWeek: activeTasks.filter(t => t.status === 'completed' && t.completedAt && new Date(t.completedAt) >= oneWeekAgo).length,
    closedMonth: activeTasks.filter(t => t.status === 'closed' && new Date(t.createdAt) >= oneMonthAgo).length
  }

  const upcomingTask = activeTasks
    .filter(t => t.status === 'in_progress' && t.dueDate)
    .sort((a, b) => new Date(`${a.dueDate}T${a.dueTime}`).getTime() - new Date(`${b.dueDate}T${b.dueTime}`).getTime())[0]

  if (pageAccess.loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#4E6E49] border-t-transparent"></div>
      </div>
    )
  }

  if (!pageAccess.hasAccess) {
    return (
      <div className="py-20 text-center space-y-4">
        <Lock className="w-16 h-16 text-gray-700 mx-auto opacity-20" />
        <h3 className={`text-xl font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Доступ к Tasks ограничен</h3>
        <p className="text-gray-500 max-w-md mx-auto">{pageAccess.reason || 'У вас нет доступа к управлению задачами.'}</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-[#4E6E49]/10 border border-[#4E6E49]/20">
            <CheckSquare className="w-8 h-8 text-[#4E6E49]" />
          </div>
          <div>
            <h1 className={`text-3xl font-black ${headingColor} flex items-center gap-3`}>
              Tasks
            </h1>
            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
              Управление задачами и заданиями команды AVA - Team
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-gray-500/20">
        <button
          onClick={() => setActiveTab('tasks')}
          className={`px-6 py-3 text-sm font-bold transition-all relative ${activeTab === 'tasks' ? 'text-[#4E6E49]' : 'text-gray-500 hover:text-gray-400'
            }`}
        >
          Задачи
          {activeTab === 'tasks' && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#4E6E49] rounded-t-full shadow-[0_0_10px_#4E6E49]" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('archive')}
          className={`px-6 py-3 text-sm font-bold transition-all relative flex items-center gap-2 ${activeTab === 'archive' ? 'text-amber-500' : 'text-gray-500 hover:text-gray-400'
            }`}
        >
          <Package className="w-4 h-4" />
          Архив
          {activeTab === 'archive' && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500 rounded-t-full shadow-[0_0_10px_#fbbf24]" />
          )}
        </button>
      </div>

      {activeTab === 'tasks' && (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className={`rounded-2xl p-5 border ${theme === 'dark' ? 'bg-[#4E6E49]/5 border-[#4E6E49]/20' : 'bg-white border-gray-100'}`}>
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Всего сегодня</span>
                <Calendar className="w-5 h-5 text-[#4E6E49]" />
              </div>
              <div className={`text-2xl font-black ${headingColor}`}>{stats.totalToday}</div>
            </div>

            <div className={`rounded-2xl p-5 border ${theme === 'dark' ? 'bg-blue-500/5 border-blue-500/20' : 'bg-white border-gray-100'}`}>
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">За неделю</span>
                <LayoutGrid className="w-5 h-5 text-blue-400" />
              </div>
              <div className={`text-2xl font-black ${headingColor}`}>{stats.totalWeek}</div>
            </div>

            <div className={`rounded-2xl p-5 border ${theme === 'dark' ? 'bg-amber-500/5 border-amber-500/20' : 'bg-white border-gray-100'}`}>
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">В работе</span>
                <Zap className="w-5 h-5 text-amber-400" />
              </div>
              <div className={`text-2xl font-black ${headingColor}`}>{stats.inProgress}</div>
            </div>

            <div className={`rounded-2xl p-5 border ${theme === 'dark' ? 'bg-rose-500/5 border-rose-500/20' : 'bg-white border-gray-100'}`}>
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Дедлайн</span>
                <Timer className="w-5 h-5 text-rose-400" />
              </div>
              <div className={`text-sm font-bold truncate ${headingColor}`}>
                {upcomingTask ? `${upcomingTask.title} (${upcomingTask.dueDate})` : 'Нет'}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <TaskFilters
              selectedCategory={selectedCategory}
              selectedStatus={selectedStatus}
              selectedUsers={selectedUsers}
              onCategoryChange={setSelectedCategory}
              onStatusChange={setSelectedStatus}
              onUsersChange={setSelectedUsers}
              onAddTask={addTaskAccess.hasAccess ? () => setShowForm(true) : undefined}
            />

            {loading ? (
              <div className="py-20 text-center text-gray-500 animate-pulse">Загрузка задач...</div>
            ) : filteredTasks.length === 0 ? (
              <div className="py-20 text-center text-gray-500">Задачи не найдены</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onUpdate={loadTasks}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'archive' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className={`text-xl font-bold ${headingColor} flex items-center gap-2`}>
              <Package className="w-5 h-5 text-amber-500" />
              Архив - Tasks
            </h2>
            <span className="text-xs text-gray-500 font-medium bg-gray-500/10 px-2 py-1 rounded">
              Удаление через 7 дней
            </span>
          </div>

          {loading ? (
            <div className="py-20 text-center text-gray-500 animate-pulse">Загрузка архива...</div>
          ) : filteredTasks.length === 0 ? (
            <div className="py-20 text-center text-gray-500">Архив пуст</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onUpdate={loadTasks}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {showForm && (
        <TaskForm
          onClose={handleCloseForm}
          onSave={handleSave}
          editingTask={editingTask}
        />
      )}
    </div>
  )
}
