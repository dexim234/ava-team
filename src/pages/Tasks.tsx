// Tasks page - task manager
import { useState, useEffect } from 'react'
import { useThemeStore } from '@/store/themeStore'
import { useAuthStore } from '@/store/authStore'
import { TaskForm } from '@/components/Tasks/TaskForm'
import { TaskFilters } from '@/components/Tasks/TaskFilters'
import { TaskTable } from '@/components/Tasks/TaskTable'
import { getTasks, deleteTask } from '@/services/firestoreService'
import { Task, TaskCategory, TaskStatus } from '@/types'
import { CheckSquare, LayoutGrid, Plus, Calendar, Zap, Layers, CheckCircle2, Archive, Timer } from 'lucide-react'
import { formatDate } from '@/utils/dateUtils'

export const Tasks = () => {
  const { theme } = useThemeStore()
  const { user } = useAuthStore()

  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory | 'all'>('all')
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus | 'all'>('all')
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])

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
      const filters: any = {}
      if (selectedCategory !== 'all') {
        filters.category = selectedCategory
      }
      if (selectedStatus !== 'all') {
        filters.status = selectedStatus
      }
      if (selectedUsers.length > 0) {
        filters.assignedTo = selectedUsers
      }

      const allTasks = await getTasks(filters)
      setTasks(allTasks)
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

  const stats = {
    totalToday: tasks.filter(t => t.createdAt.startsWith(todayStr)).length,
    totalWeek: tasks.filter(t => new Date(t.createdAt) >= oneWeekAgo).length,
    totalMonth: tasks.filter(t => new Date(t.createdAt) >= oneMonthAgo).length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    completedToday: tasks.filter(t => t.status === 'completed' && t.completedAt?.startsWith(todayStr)).length,
    completedWeek: tasks.filter(t => t.status === 'completed' && t.completedAt && new Date(t.completedAt) >= oneWeekAgo).length,
    closedMonth: tasks.filter(t => t.status === 'closed' && new Date(t.createdAt) >= oneMonthAgo).length // Using createdAt as proxy if closedAt missing
  }

  const upcomingTask = tasks
    .filter(t => t.status !== 'completed' && t.status !== 'closed' && t.dueDate)
    .sort((a, b) => new Date(`${a.dueDate}T${a.dueTime}`).getTime() - new Date(`${b.dueDate}T${b.dueTime}`).getTime())[0]



  return (
    <div className="space-y-8 animate-fade-in pb-12 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
            <CheckSquare className="w-8 h-8 text-emerald-500" />
          </div>
          <div>
            <h1 className={`text-3xl font-black ${headingColor} flex items-center gap-3`}>
              AVF Tasks
            </h1>
            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
              Управление задачами и заданиями команды ApeVault Frontier
            </p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-4">
          {/* User profile removed as requested */}
        </div>
      </div>

      {/* Stats Grid - 8 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Row 1 */}
        <div className={`relative overflow-hidden rounded-xl p-5 border ${theme === 'dark' ? 'bg-[#151a21]/50 border-white/5' : 'bg-white border-gray-100'}`}>
          <div className="flex justify-between items-start mb-4">
            <span className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Всего задач сегодня</span>
            <Calendar className="w-4 h-4 text-blue-500" />
          </div>
          <div className={`text-3xl font-black tracking-tight ${headingColor}`}>{stats.totalToday}</div>
          <div className="text-[10px] mt-2 text-blue-400 flex items-center gap-1">
            <span>↗ Активность ↑</span>
          </div>
        </div>

        <div className={`relative overflow-hidden rounded-xl p-5 border ${theme === 'dark' ? 'bg-[#151a21]/50 border-white/5' : 'bg-white border-gray-100'}`}>
          <div className="flex justify-between items-start mb-4">
            <span className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Всего на неделе</span>
            <LayoutGrid className="w-4 h-4 text-purple-500" />
          </div>
          <div className={`text-3xl font-black tracking-tight ${headingColor}`}>{stats.totalWeek}</div>
        </div>

        <div className={`relative overflow-hidden rounded-xl p-5 border ${theme === 'dark' ? 'bg-[#151a21]/50 border-white/5' : 'bg-white border-gray-100'}`}>
          <div className="flex justify-between items-start mb-4">
            <span className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Всего в месяце</span>
            <Layers className="w-4 h-4 text-indigo-500" />
          </div>
          <div className={`text-3xl font-black tracking-tight ${headingColor}`}>{stats.totalMonth}</div>
        </div>

        <div className={`relative overflow-hidden rounded-xl p-5 border ${theme === 'dark' ? 'bg-[#151a21]/50 border-white/5' : 'bg-white border-gray-100'}`}>
          <div className="flex justify-between items-start mb-4">
            <span className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Задач в работе</span>
            <Zap className="w-4 h-4 text-yellow-500" />
          </div>
          <div className={`text-3xl font-black tracking-tight ${headingColor}`}>{stats.inProgress}</div>
          <div className="text-[10px] mt-2 text-gray-500">Требуют внимания</div>
        </div>

        {/* Row 2 */}
        <div className={`relative overflow-hidden rounded-xl p-5 border ${theme === 'dark' ? 'bg-[#151a21]/50 border-white/5' : 'bg-white border-gray-100'}`}>
          <div className="flex justify-between items-start mb-4">
            <span className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Закрыто сегодня</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className={`text-3xl font-black tracking-tight ${headingColor}`}>{stats.completedToday}</div>
          <div className="mt-2 h-1 w-20 bg-emerald-500 rounded-full" />
        </div>

        <div className={`relative overflow-hidden rounded-xl p-5 border ${theme === 'dark' ? 'bg-[#151a21]/50 border-white/5' : 'bg-white border-gray-100'}`}>
          <div className="flex justify-between items-start mb-4">
            <span className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Закрыто на неделе</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className={`text-3xl font-black tracking-tight ${headingColor}`}>{stats.completedWeek}</div>
        </div>

        <div className={`relative overflow-hidden rounded-xl p-5 border ${theme === 'dark' ? 'bg-[#151a21]/50 border-white/5' : 'bg-white border-gray-100'}`}>
          <div className="flex justify-between items-start mb-4">
            <span className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Закрыто в месяце</span>
            <Archive className="w-4 h-4 text-emerald-600" />
          </div>
          <div className={`text-3xl font-black tracking-tight ${headingColor}`}>{stats.closedMonth}</div>
        </div>

        <div className={`relative overflow-hidden rounded-xl p-5 border ${theme === 'dark' ? 'bg-[#151a21]/50 border-red-500/20' : 'bg-red-50 border-red-200'}`}>
          <div className="flex justify-between items-start mb-4">
            <span className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-red-800'}`}>Ближайший дедлайн</span>
            <Timer className="w-4 h-4 text-red-500" />
          </div>
          <div className={`text-lg font-bold ${headingColor}`}>
            {upcomingTask ? (
              <>
                {upcomingTask.dueDate === todayStr ? 'Сегодня' : formatDate(new Date(upcomingTask.dueDate), 'd MMM')}
                {upcomingTask.dueTime && `, ${upcomingTask.dueTime}`}
              </>
            ) : 'Нет'}
          </div>
          <div className="text-[10px] mt-1 text-red-400 truncate max-w-full">
            {upcomingTask ? upcomingTask.title : 'Все сроки соблюдены'}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <h2 className={`text-2xl font-black ${headingColor}`}>Мои задачи</h2>
          <span className="px-2.5 py-1 rounded-md bg-gray-800/80 text-gray-400 text-xs font-medium border border-white/5 shadow-sm">{stats.inProgress} активных</span>
        </div>

        <div className={`rounded-3xl border p-6 ${theme === 'dark' ? 'bg-[#0f1216] border-white/5' : 'bg-gray-50 border-gray-200'}`}>
          {/* Action Bar */}
          <div className="mb-8">
            <TaskFilters
              selectedCategory={selectedCategory}
              selectedStatus={selectedStatus}
              selectedUsers={selectedUsers}
              onCategoryChange={setSelectedCategory}
              onStatusChange={setSelectedStatus}
              onUsersChange={setSelectedUsers}
            >
              <button
                onClick={() => setShowForm(true)}
                className="whitespace-nowrap flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-900/20 active:scale-95"
              >
                <Plus className="w-5 h-5" />
                <span>Новая задача</span>
              </button>
            </TaskFilters>
          </div>

          {/* Table */}
          {loading ? (
            <div className="py-20 text-center text-gray-500 animate-pulse">Загрузка задач...</div>
          ) : (
            <TaskTable
              tasks={filteredTasks}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </div>
      </div>

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
