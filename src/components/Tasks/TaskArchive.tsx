import { useEffect, useState } from 'react'
import { useAdminStore } from '@/store/adminStore'
import { useThemeStore } from '@/store/themeStore'
import { Task } from '@/types'
import { getTasks, deleteTask, updateTask } from '@/services/firestoreService'
import { Archive, Trash2, RotateCcw, Calendar, Clock } from 'lucide-react'
import { formatDate } from '@/utils/dateUtils'
import { getUserNicknameSync } from '@/utils/userUtils'

interface TaskArchiveProps {
  onClose: () => void
}

export const TaskArchive = ({ onClose }: TaskArchiveProps) => {
  const { isAdmin } = useAdminStore()
  const { theme } = useThemeStore()

  const [archivedTasks, setArchivedTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  const headingColor = theme === 'dark' ? 'text-white' : 'text-gray-900'
  const cardBg = theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-white'
  const borderColor = theme === 'dark' ? 'border-gray-800' : 'border-gray-300'

  const canDelete = isAdmin
  const canRestore = isAdmin

  useEffect(() => {
    loadArchivedTasks()
    // Запускаем проверку на удаление каждые 5 минут
    const interval = setInterval(checkAndDeleteExpiredTasks, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const loadArchivedTasks = async () => {
    setLoading(true)
    try {
      const tasks = await getTasks()
      const archived = tasks.filter(task => {
        // Задача в архиве если:
        // 1. Дедлайн закончился более 3 дней назад и задача не в статусе "Закрыто"
        // 2. Задача имеет статус "Закрыто" более 12 часов
        const now = new Date()
        const deadline = new Date(`${task.dueDate}T${task.dueTime}`)
        const daysSinceDeadline = (now.getTime() - deadline.getTime()) / (1000 * 60 * 60 * 24)
        
        if (task.status !== 'closed' && daysSinceDeadline > 3) {
          return true
        }

        if (task.status === 'closed' && task.closedAt) {
          const hoursSinceClosed = (now.getTime() - new Date(task.closedAt).getTime()) / (1000 * 60 * 60)
          if (hoursSinceClosed > 12) {
            return true
          }
        }

        return false
      })
      setArchivedTasks(archived)
    } catch (error) {
      console.error('Error loading archived tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkAndDeleteExpiredTasks = async () => {
    try {
      const tasks = await getTasks()
      const now = new Date()

      for (const task of tasks) {
        // Проверяем, нужно ли удалить задачу из архива
        if (task.archivedAt) {
          const daysSinceArchive = (now.getTime() - new Date(task.archivedAt).getTime()) / (1000 * 60 * 60 * 24)
          if (daysSinceArchive >= 7) {
            await deleteTask(task.id)
            console.log('Deleted expired archived task:', task.id)
          }
        }

        // Проверяем, нужно ли переместить задачу в архив
        if (!task.archivedAt) {
          const deadline = new Date(`${task.dueDate}T${task.dueTime}`)
          const daysSinceDeadline = (now.getTime() - deadline.getTime()) / (1000 * 60 * 60 * 24)

          if (task.status !== 'closed' && daysSinceDeadline > 3) {
            await updateTask(task.id, {
              archivedAt: now.toISOString(),
              archiveDeleteAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            })
          }

          if (task.status === 'closed' && task.closedAt) {
            const hoursSinceClosed = (now.getTime() - new Date(task.closedAt).getTime()) / (1000 * 60 * 60)
            if (hoursSinceClosed > 12) {
              await updateTask(task.id, {
                archivedAt: now.toISOString(),
                archiveDeleteAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              })
            }
          }
        }
      }

      // Перезагружаем архив
      await loadArchivedTasks()
    } catch (error) {
      console.error('Error deleting expired tasks:', error)
    }
  }

  const handleRestore = async (taskId: string) => {
    try {
      await updateTask(taskId, {
        status: 'in_progress',
        archivedAt: undefined,
        archiveDeleteAt: undefined,
        updatedAt: new Date().toISOString(),
      })
      await loadArchivedTasks()
    } catch (error) {
      console.error('Error restoring task:', error)
    }
  }

  const handleDelete = async (taskId: string) => {
    if (!confirm('Вы уверены, что хотите удалить эту задачу?')) return

    setDeleting(taskId)
    try {
      await deleteTask(taskId)
      await loadArchivedTasks()
    } catch (error) {
      console.error('Error deleting task:', error)
    } finally {
      setDeleting(null)
    }
  }

  const getArchiveReason = (task: Task) => {
    const now = new Date()
    const deadline = new Date(`${task.dueDate}T${task.dueTime}`)
    const daysSinceDeadline = (now.getTime() - deadline.getTime()) / (1000 * 60 * 60 * 24)

    if (task.status === 'closed' && task.closedAt) {
      const hoursSinceClosed = (now.getTime() - new Date(task.closedAt).getTime()) / (1000 * 60 * 60)
      if (hoursSinceClosed > 12) {
        return {
          reason: 'Закрыта более 12 часов назад',
          date: task.closedAt,
        }
      }
    }

    if (daysSinceDeadline > 3) {
      return {
        reason: 'Дедлайн прошел более 3 дней',
        date: task.dueDate,
      }
    }

    return {
      reason: 'В архиве',
      date: task.archivedAt || task.createdAt,
    }
  }

  const getDaysUntilDeletion = (task: Task) => {
    if (!task.archivedAt) return null
    const now = new Date()
    const archiveDate = new Date(task.archivedAt)
    const daysSinceArchive = (now.getTime() - archiveDate.getTime()) / (1000 * 60 * 60 * 24)
    const daysLeft = Math.max(0, 7 - daysSinceArchive)
    return Math.round(daysLeft)
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-start sm:items-center justify-center z-[70] p-4 overflow-y-auto overscroll-contain modal-scroll touch-pan-y">
        <div
          className={`${cardBg} rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-4xl max-h-[calc(100vh-48px)] sm:max-h-[calc(100vh-64px)] overflow-y-auto border-2 touch-pan-y ${
            theme === 'dark'
              ? 'border-[#4E6E49]/30 bg-gradient-to-br from-[#1a1a1a] via-[#1a1a1a] to-[#0A0A0A]'
              : 'border-green-200 bg-gradient-to-br from-white via-green-50/30 to-white'
          } relative`}
        >
          <div className="flex flex-col h-full min-h-0">
            {/* Header */}
            <div className={`sticky top-0 ${cardBg} border-b ${borderColor} p-4 sm:p-6 flex items-center justify-between z-10`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-[#4E6E49]/20' : 'bg-green-50'}`}>
                  <Archive className={`w-5 h-5 ${theme === 'dark' ? 'text-[#4E6E49]' : 'text-[#4E6E49]'}`} />
                </div>
                <h2 className={`text-xl sm:text-2xl font-bold ${headingColor}`}>
                  Архив задач
                </h2>
              </div>
              <button
                onClick={onClose}
                className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <Calendar className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6 flex-1 min-h-0 overflow-y-auto overscroll-contain modal-scroll touch-pan-y pb-10">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="w-8 h-8 border-2 border-[#4E6E49] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : archivedTasks.length === 0 ? (
                <div className="text-center py-20">
                  <Archive className={`w-16 h-16 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-700' : 'text-gray-300'}`} />
                  <p className={`text-lg ${headingColor}`}>Архив пуст</p>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                    Задачи автоматически попадают в архив через определенное время
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {archivedTasks.map(task => {
                    const archiveReason = getArchiveReason(task)
                    const daysUntilDeletion = getDaysUntilDeletion(task)
                    return (
                      <div
                        key={task.id}
                        className={`p-4 rounded-xl border-2 ${borderColor} ${theme === 'dark' ? 'bg-[#0f0f0f]' : 'bg-gray-50'}`}
                      >
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`px-2 py-1 rounded-lg text-xs font-mono ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>
                                #{task.id.slice(0, 6)}
                              </span>
                              <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${
                                task.status === 'closed'
                                  ? theme === 'dark' ? 'bg-gray-500/20 text-gray-400 border-gray-500/30' : 'bg-gray-50 text-gray-700 border-gray-200'
                                  : theme === 'dark' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' : 'bg-rose-50 text-rose-700 border-rose-200'
                              }`}>
                                {task.status === 'closed' ? 'Закрыто' : 'Просрочена'}
                              </span>
                            </div>
                            <h3 className={`text-base sm:text-lg font-bold ${headingColor} break-words`}>
                              {task.title}
                            </h3>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {canRestore && (
                              <button
                                onClick={() => handleRestore(task.id)}
                                className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-blue-500/20 text-blue-400' : 'hover:bg-blue-50 text-blue-600'}`}
                                title="Восстановить"
                              >
                                <RotateCcw className="w-4 h-4" />
                              </button>
                            )}
                            {canDelete && (
                              <button
                                onClick={() => handleDelete(task.id)}
                                disabled={deleting === task.id}
                                className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-red-500/20 text-red-400' : 'hover:bg-red-50 text-red-600'}`}
                                title="Удалить"
                              >
                                {deleting === task.id ? (
                                  <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm mb-3">
                          <div>
                            <div className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} mb-1`}>Причина архивации</div>
                            <div className={`font-medium ${headingColor}`}>{archiveReason.reason}</div>
                          </div>
                          <div>
                            <div className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} mb-1`}>Дата</div>
                            <div className={`font-medium ${headingColor}`}>
                              {formatDate(new Date(archiveReason.date), 'dd MMM yyyy, HH:mm')}
                            </div>
                          </div>
                          <div>
                            <div className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} mb-1`}>Автор</div>
                            <div className={`font-medium ${headingColor}`}>{getUserNicknameSync(task.createdBy)}</div>
                          </div>
                          <div>
                            <div className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} mb-1`}>Дедлайн</div>
                            <div className={`font-medium ${headingColor}`}>
                              {formatDate(new Date(task.dueDate), 'dd MMM yyyy')} {task.dueTime}
                            </div>
                          </div>
                        </div>

                        {daysUntilDeletion !== null && (
                          <div className={`flex items-center gap-2 p-3 rounded-lg ${theme === 'dark' ? 'bg-rose-500/10 border-rose-500/20' : 'bg-rose-50 border-rose-200'} border`}>
                            <Clock className={`w-4 h-4 ${theme === 'dark' ? 'text-rose-400' : 'text-rose-600'}`} />
                            <span className={`text-sm ${theme === 'dark' ? 'text-rose-400' : 'text-rose-600'}`}>
                              Будет удалена через {daysUntilDeletion} {daysUntilDeletion === 1 ? 'день' : daysUntilDeletion < 5 ? 'дня' : 'дней'}
                            </span>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
