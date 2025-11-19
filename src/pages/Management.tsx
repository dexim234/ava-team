// Management page - main component for managing slots, days off, sick leave, and vacation
import { useState } from 'react'
import { Layout } from '@/components/Layout'
import { useThemeStore } from '@/store/themeStore'
import { ManagementTable } from '@/components/Management/ManagementTable'
import { ManagementWeekView } from '@/components/Management/ManagementWeekView'
import { SlotForm } from '@/components/Management/SlotForm'
import { DayStatusForm } from '@/components/Management/DayStatusForm'
import { AdminModeButton } from '@/components/Management/AdminModeButton'
import { Calendar, Table2, Plus, Trash2 } from 'lucide-react'
import { TEAM_MEMBERS } from '@/types'
import { DeleteSlotsForm } from '@/components/Management/DeleteSlotsForm'

type ViewMode = 'table' | 'week'

export const Management = () => {
  const { theme } = useThemeStore()
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const [showSlotForm, setShowSlotForm] = useState(false)
  const [showDeleteSlotsForm, setShowDeleteSlotsForm] = useState(false)
  const [showStatusForm, setShowStatusForm] = useState(false)
  const [statusType, setStatusType] = useState<'dayoff' | 'sick' | 'vacation' | null>(null)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [editingSlot, setEditingSlot] = useState<any>(null)
  const [editingStatus, setEditingStatus] = useState<any>(null)

  const handleAddSlot = () => {
    setEditingSlot(null)
    setShowSlotForm(true)
  }

  const handleEditSlot = (slot: any) => {
    setEditingSlot(slot)
    setShowSlotForm(true)
  }

  const handleAddStatus = (type: 'dayoff' | 'sick' | 'vacation') => {
    setStatusType(type)
    setEditingStatus(null)
    setShowStatusForm(true)
  }

  const handleEditStatus = (status: any) => {
    setEditingStatus(status)
    setStatusType(status.type)
    setShowStatusForm(true)
  }

  const handleDeleteSlots = () => {
    setShowDeleteSlotsForm(true)
  }

  const handleFormClose = () => {
    setShowSlotForm(false)
    setShowDeleteSlotsForm(false)
    setShowStatusForm(false)
    setStatusType(null)
    setEditingSlot(null)
    setEditingStatus(null)
    // Force reload after a short delay
    setTimeout(() => {
      window.location.reload()
    }, 500)
  }

  const cardBg = theme === 'dark' ? 'bg-gray-800' : 'bg-white'
  const headingColor = theme === 'dark' ? 'text-white' : 'text-gray-900'
  const labelColor = theme === 'dark' ? 'text-gray-300' : 'text-gray-700'

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header with controls */}
        <div className={`rounded-lg p-6 ${cardBg} shadow-md`}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h2 className={`text-2xl font-bold ${headingColor}`}>Management</h2>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              {/* View mode toggle */}
              <div className={`flex rounded-lg p-1 w-full sm:w-auto ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                <button
                  onClick={() => setViewMode('table')}
                  className={`flex-1 sm:flex-none px-3 py-2 text-sm sm:text-base rounded-md transition-colors flex items-center justify-center gap-2 ${
                    viewMode === 'table'
                      ? 'bg-green-500 text-white'
                      : theme === 'dark'
                      ? 'text-gray-300 hover:bg-gray-600'
                      : 'text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <Table2 className="w-4 h-4" />
                  Таблица
                </button>
                <button
                  onClick={() => setViewMode('week')}
                  className={`flex-1 sm:flex-none px-3 py-2 text-sm sm:text-base rounded-md transition-colors flex items-center justify-center gap-2 ${
                    viewMode === 'week'
                      ? 'bg-green-500 text-white'
                      : theme === 'dark'
                      ? 'text-gray-300 hover:bg-gray-600'
                      : 'text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  Неделя
                </button>
              </div>

              {/* Add buttons */}
              <button
                onClick={handleAddSlot}
                className="flex-1 sm:flex-none px-3 py-2 text-sm sm:text-base bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Добавить слот
              </button>

              <button
                onClick={handleDeleteSlots}
                className="flex-1 sm:flex-none px-3 py-2 text-sm sm:text-base bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Удалить слоты
              </button>

              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={() => handleAddStatus('dayoff')}
                  className="flex-1 sm:flex-none px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors text-sm"
                >
                  Выходной
                </button>
                <button
                  onClick={() => handleAddStatus('sick')}
                  className="flex-1 sm:flex-none px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors text-sm"
                >
                  Больничный
                </button>
                <button
                  onClick={() => handleAddStatus('vacation')}
                  className="flex-1 sm:flex-none px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors text-sm"
                >
                  Отпуск
                </button>
              </div>
            </div>
          </div>

          {/* Participant filter */}
          <div className="mt-4">
            <label className={`block text-sm font-medium mb-2 ${labelColor}`}>
              Фильтр по участникам:
            </label>
            <select
              value={selectedUserId || ''}
              onChange={(e) => setSelectedUserId(e.target.value || null)}
              className={`w-full md:w-72 px-4 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-green-500`}
            >
              <option value="">Все участники</option>
              {TEAM_MEMBERS.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Admin mode button */}
        <AdminModeButton />

        {/* Content view */}
        {viewMode === 'table' ? (
          <ManagementTable
            selectedUserId={selectedUserId}
            onEditSlot={handleEditSlot}
            onEditStatus={handleEditStatus}
          />
        ) : (
          <ManagementWeekView
            selectedUserId={selectedUserId}
            onEditSlot={handleEditSlot}
            onEditStatus={handleEditStatus}
          />
        )}

        {/* Forms */}
        {showSlotForm && (
          <SlotForm
            slot={editingSlot}
            onClose={handleFormClose}
            onSave={handleFormClose}
          />
        )}

        {showDeleteSlotsForm && (
          <DeleteSlotsForm
            onClose={handleFormClose}
            onSave={handleFormClose}
          />
        )}

        {showStatusForm && statusType && (
          <DayStatusForm
            type={statusType}
            status={editingStatus}
            onClose={handleFormClose}
            onSave={handleFormClose}
          />
        )}
      </div>
    </Layout>
  )
}

