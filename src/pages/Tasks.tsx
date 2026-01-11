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

      {/* Stats Grid - 8 Cards - Colored Gradients */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Row 1 */}
        <div className={`relative overflow-hidden rounded-xl p-5 border shadow-lg bg-gradient-to-br from-emerald-600 to-emerald-800 border-white/10 group hover:scale-[1.02] transition-all`}>
          <div className="flex justify-between items-start mb-4">
            <span className={`text-xs font-bold uppercase tracking-wider text-white/80`}>Всего задач сегодня</span>
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div className={`text-4xl font-black tracking-tight text-white`}>{stats.totalToday}</div>
          <div className="text-[10px] mt-2 text-white/80 flex items-center gap-1 font-medium bg-white/20 w-fit px-2 py-0.5 rounded-full backdrop-blur-sm">
            <span>↗ Активность ↑</span>
          </div>
        </div>

        <div className={`relative overflow-hidden rounded-xl p-5 border shadow-lg bg-gradient-to-br from-blue-600 to-blue-800 border-white/10 group hover:scale-[1.02] transition-all`}>
          <div className="flex justify-between items-start mb-4">
            <span className={`text-xs font-bold uppercase tracking-wider text-white/80`}>Всего на неделе</span>
            <LayoutGrid className="w-5 h-5 text-white" />
          </div>
          <div className={`text-4xl font-black tracking-tight text-white`}>{stats.totalWeek}</div>
          <div className="text-[10px] mt-2 text-white/60 font-medium">Общий объем</div>
        </div>

        <div className={`relative overflow-hidden rounded-xl p-5 border shadow-lg bg-gradient-to-br from-indigo-600 to-indigo-800 border-white/10 group hover:scale-[1.02] transition-all`}>
          <div className="flex justify-between items-start mb-4">
            <span className={`text-xs font-bold uppercase tracking-wider text-white/80`}>Всего в месяце</span>
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div className={`text-4xl font-black tracking-tight text-white`}>{stats.totalMonth}</div>
          <div className="text-[10px] mt-2 text-white/60 font-medium">Накопительный итог</div>
        </div>

        <div className={`relative overflow-hidden rounded-xl p-5 border shadow-lg bg-gradient-to-br from-amber-600 to-amber-800 border-white/10 group hover:scale-[1.02] transition-all`}>
          <div className="flex justify-between items-start mb-4">
            <span className={`text-xs font-bold uppercase tracking-wider text-white/80`}>Задач в работе</span>
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div className={`text-4xl font-black tracking-tight text-white`}>{stats.inProgress}</div>
          <div className="text-[10px] mt-2 text-white/80 font-medium bg-white/20 w-fit px-2 py-0.5 rounded-full backdrop-blur-sm">Требуют внимания</div>
        </div>

        {/* Row 2 */}
        <div className={`relative overflow-hidden rounded-xl p-5 border shadow-lg bg-gradient-to-br from-teal-600 to-teal-800 border-white/10 group hover:scale-[1.02] transition-all`}>
          <div className="flex justify-between items-start mb-4">
            <span className={`text-xs font-bold uppercase tracking-wider text-white/80`}>Закрыто сегодня</span>
            <CheckCircle2 className="w-5 h-5 text-white" />
          </div>
          <div className={`text-4xl font-black tracking-tight text-white`}>{stats.completedToday}</div>
          <div className="mt-2 h-1 w-full bg-black/20 rounded-full overflow-hidden">
            <div className="h-full bg-white/50 w-2/3" />
          </div>
        </div>

        <div className={`relative overflow-hidden rounded-xl p-5 border shadow-lg bg-gradient-to-br from-cyan-600 to-cyan-800 border-white/10 group hover:scale-[1.02] transition-all`}>
          <div className="flex justify-between items-start mb-4">
            <span className={`text-xs font-bold uppercase tracking-wider text-white/80`}>Закрыто на неделе</span>
            <CheckCircle2 className="w-5 h-5 text-white" />
          </div>
          <div className={`text-4xl font-black tracking-tight text-white`}>{stats.completedWeek}</div>
          <div className="mt-2 h-1 w-full bg-black/20 rounded-full overflow-hidden">
            <div className="h-full bg-white/50 w-1/2" />
          </div>
        </div>

        <div className={`relative overflow-hidden rounded-xl p-5 border shadow-lg bg-gradient-to-br from-sky-600 to-sky-800 border-white/10 group hover:scale-[1.02] transition-all`}>
          <div className="flex justify-between items-start mb-4">
            <span className={`text-xs font-bold uppercase tracking-wider text-white/80`}>Закрыто в месяце</span>
            <Archive className="w-5 h-5 text-white" />
          </div>
          <div className={`text-4xl font-black tracking-tight text-white`}>{stats.closedMonth}</div>
          <div className="mt-2 h-1 w-full bg-black/20 rounded-full overflow-hidden">
            <div className="h-full bg-white/50 w-3/4" />
          </div>
        </div>

        <div className={`relative overflow-hidden rounded-xl p-5 border shadow-lg bg-gradient-to-br from-red-600 to-red-800 border-white/10 group hover:scale-[1.02] transition-all`}>
          <div className="flex justify-between items-start mb-4">
            <span className={`text-xs font-bold uppercase tracking-wider text-white/80`}>Ближайший дедлайн</span>
            <Timer className="w-5 h-5 text-white" />
          </div>
          <div className={`text-xl font-bold text-white truncate`}>
            {upcomingTask ? (
              <>
                {upcomingTask.dueDate === todayStr ? 'Сегодня' : formatDate(new Date(upcomingTask.dueDate), 'd MMM')}
                {upcomingTask.dueTime && `, ${upcomingTask.dueTime}`}
              </>
            ) : 'Нет'}
          </div>
          <div className="text-[10px] mt-1 text-white/80 truncate max-w-full font-medium">
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
