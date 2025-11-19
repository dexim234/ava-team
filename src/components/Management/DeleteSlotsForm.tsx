// Form for bulk deleting work slots
import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useThemeStore } from '@/store/themeStore'
import { useAdminStore } from '@/store/adminStore'
import { getWorkSlots, deleteWorkSlot } from '@/services/firestoreService'
import { formatDate } from '@/utils/dateUtils'
import { X, Trash2 } from 'lucide-react'
import { TEAM_MEMBERS } from '@/types'

interface DeleteSlotsFormProps {
  onClose: () => void
  onSave: () => void
}

export const DeleteSlotsForm = ({ onClose, onSave }: DeleteSlotsFormProps) => {
  const { user } = useAuthStore()
  const { theme } = useThemeStore()
  const { isAdmin } = useAdminStore()
  const headingColor = theme === 'dark' ? 'text-white' : 'text-gray-900'
  const [selectedUserId, setSelectedUserId] = useState(user?.id || '')
  const [deleteByWeekDay, setDeleteByWeekDay] = useState(false)
  const [deleteByDates, setDeleteByDates] = useState(false)
  const [selectedWeekDay, setSelectedWeekDay] = useState<number | null>(null)
  const [selectedDates, setSelectedDates] = useState<string[]>([])
  const [currentDate, setCurrentDate] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

  const handleWeekDayToggle = (checked: boolean) => {
    if (checked) {
      if (deleteByDates) {
        setError('Снимите галочку с другой функции, чтобы активировать эту')
        return
      }
      setDeleteByWeekDay(true)
      setError('')
    } else {
      setDeleteByWeekDay(false)
      setSelectedWeekDay(null)
    }
  }

  const handleDatesToggle = (checked: boolean) => {
    if (checked) {
      if (deleteByWeekDay) {
        setError('Снимите галочку с другой функции, чтобы активировать эту')
        return
      }
      setDeleteByDates(true)
      setError('')
    } else {
      setDeleteByDates(false)
      setSelectedDates([])
      setCurrentDate('')
    }
  }

  const addDate = () => {
    if (!currentDate) {
      setError('Выберите дату')
      return
    }
    if (selectedDates.includes(currentDate)) {
      setError('Эта дата уже добавлена')
      return
    }
    setSelectedDates([...selectedDates, currentDate].sort())
    setCurrentDate('')
    setError('')
  }

  const removeDate = (date: string) => {
    setSelectedDates(selectedDates.filter((d) => d !== date))
  }

  const handleDelete = async () => {
    if (!user) {
      setError('Пользователь не найден')
      return
    }

    const targetUserId = isAdmin ? selectedUserId : user.id
    if (!targetUserId) {
      setError('Выберите участника')
      return
    }

    if (!deleteByWeekDay && !deleteByDates) {
      setError('Выберите способ удаления слотов')
      return
    }

    if (deleteByWeekDay && selectedWeekDay === null) {
      setError('Выберите день недели')
      return
    }

    if (deleteByDates && selectedDates.length === 0) {
      setError('Добавьте хотя бы одну дату')
      return
    }

    setError('')
    setLoading(true)

    try {
      // Get all slots for the user
      const allSlots = await getWorkSlots(targetUserId)
      let slotsToDelete: string[] = []

      if (deleteByWeekDay) {
        // Filter slots by day of week
        slotsToDelete = allSlots
          .filter((slot) => {
            const dateObj = new Date(slot.date + 'T00:00:00')
            const dayOfWeek = dateObj.getDay() === 0 ? 6 : dateObj.getDay() - 1
            return dayOfWeek === selectedWeekDay
          })
          .map((slot) => slot.id)
      } else if (deleteByDates) {
        // Filter slots by selected dates
        slotsToDelete = allSlots
          .filter((slot) => selectedDates.includes(slot.date))
          .map((slot) => slot.id)
      }

      if (slotsToDelete.length === 0) {
        setError('Слоты для удаления не найдены')
        setLoading(false)
        return
      }

      // Confirm deletion
      const confirmMessage = deleteByWeekDay
        ? `Удалить все слоты участника на ${weekDays[selectedWeekDay!]}? (${slotsToDelete.length} слотов)`
        : `Удалить слоты на выбранные даты? (${slotsToDelete.length} слотов)`

      if (!confirm(confirmMessage)) {
        setLoading(false)
        return
      }

      // Delete all slots
      await Promise.all(slotsToDelete.map((id) => deleteWorkSlot(id)))

      onSave()
    } catch (err: any) {
      console.error('Error deleting slots:', err)
      const errorMessage = err.message || err.code || 'Ошибка при удалении слотов'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start sm:items-center justify-center z-50 p-4 sm:py-0 overflow-y-auto">
      <div className={`w-full max-w-2xl rounded-lg shadow-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} max-h-[90vh] overflow-y-auto`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-xl font-bold ${headingColor}`}>
              Удаление слотов
            </h3>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            {/* User selection for admin */}
            {isAdmin && (
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Участник
                </label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-red-500`}
                >
                  {TEAM_MEMBERS.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Delete by week day option */}
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={deleteByWeekDay}
                onChange={(e) => handleWeekDayToggle(e.target.checked)}
                className="w-4 h-4"
              />
              <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Удалить по дню недели
              </span>
            </label>

            {deleteByWeekDay && (
              <div className="ml-6">
                <p className={`text-sm mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Выберите день недели:
                </p>
                <div className="flex gap-2 flex-wrap">
                  {weekDays.map((day, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedWeekDay(index)}
                      className={`px-3 py-1 rounded-lg transition-colors ${
                        selectedWeekDay === index
                          ? 'bg-red-500 text-white'
                          : theme === 'dark'
                          ? 'bg-gray-700 text-gray-300'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Delete by dates option */}
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={deleteByDates}
                onChange={(e) => handleDatesToggle(e.target.checked)}
                className="w-4 h-4"
              />
              <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Удалить по датам
              </span>
            </label>

            {deleteByDates && (
              <div className="ml-6 space-y-3">
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={currentDate}
                    onChange={(e) => setCurrentDate(e.target.value)}
                    className={`flex-1 px-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-red-500`}
                  />
                  <button
                    onClick={addDate}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                  >
                    Добавить
                  </button>
                </div>

                {/* Selected dates */}
                {selectedDates.length > 0 && (
                  <div className="space-y-2">
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Выбранные даты ({selectedDates.length}):
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedDates.map((date) => (
                        <div
                          key={date}
                          className={`flex items-center gap-2 px-3 py-1 rounded-lg ${
                            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                          }`}
                        >
                          <span className={headingColor}>{formatDate(date, 'dd.MM.yyyy')}</span>
                          <button
                            onClick={() => removeDate(date)}
                            className="p-1 text-red-500 hover:bg-red-500 hover:text-white rounded transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-500 text-white rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={loading || (!deleteByWeekDay && !deleteByDates)}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                {loading ? 'Удаление...' : 'Удалить слоты'}
              </button>
              <button
                onClick={onClose}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
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

