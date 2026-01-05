// Signals HUB page redesigned to match reference image
import { useState, useEffect, useMemo, type JSX } from 'react'
import { useThemeStore } from '@/store/themeStore'
import { CallForm } from '@/components/Call/CallForm'
import { getCalls, deleteCall, updateCall } from '@/services/firestoreService'
import type { Call, CallCategory, CallRiskLevel } from '@/types'
import { TEAM_MEMBERS } from '@/types'
import {
  X,
  Edit,
  Trash2,
  Check,
  Search,
  Sparkles,
  Filter,
  Shield,
  Rocket,
  LineChart,
  Image,
  Coins,
  AlertTriangle,
  Activity,
  TrendingUp,
  Gauge,
  ChevronDown,
} from 'lucide-react'
import { useScrollLock } from '@/hooks/useScrollLock'

type StatusFilter = 'all' | 'active' | 'completed' | 'cancelled' | 'reviewed'
type RiskFilter = 'all' | CallRiskLevel

const CATEGORY_META: Record<CallCategory, { label: string; gradient: string; chip: string; icon: JSX.Element }> = {
  memecoins: { label: 'Мемкоины', gradient: 'from-emerald-400 to-teal-500', chip: 'bg-emerald-500/10 text-emerald-600', icon: <Rocket className="w-4 h-4" /> },
  futures: { label: 'Фьючерсы', gradient: 'from-blue-400 to-indigo-500', chip: 'bg-blue-500/10 text-blue-600', icon: <LineChart className="w-4 h-4" /> },
  nft: { label: 'NFT', gradient: 'from-purple-400 to-pink-500', chip: 'bg-purple-500/10 text-purple-600', icon: <Image className="w-4 h-4" /> },
  spot: { label: 'Спот', gradient: 'from-amber-400 to-orange-500', chip: 'bg-amber-500/10 text-amber-600', icon: <Coins className="w-4 h-4" /> },
  polymarket: { label: 'Polymarket', gradient: 'from-rose-400 to-red-500', chip: 'bg-rose-500/10 text-rose-600', icon: <Gauge className="w-4 h-4" /> },
  staking: { label: 'Стейкинг', gradient: 'from-violet-400 to-purple-500', chip: 'bg-violet-500/10 text-violet-600', icon: <Shield className="w-4 h-4" /> },
}

const riskBadges: Record<CallRiskLevel, string> = {
  low: 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20',
  medium: 'bg-blue-500/10 text-blue-600 border border-blue-500/20',
  high: 'bg-amber-500/10 text-amber-600 border border-amber-500/20',
  ultra: 'bg-red-500/10 text-red-600 border border-red-500/20',
}

const riskLabels: Record<CallRiskLevel, string> = {
  low: 'Low Risk',
  medium: 'Medium Risk',
  high: 'High Risk',
  ultra: 'Ultra Risk',
}

export const CallPage = () => {
  const { theme } = useThemeStore()
  const [calls, setCalls] = useState<Call[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteCallId, setDeleteCallId] = useState<string | null>(null)
  const [cancelCallId, setCancelCallId] = useState<string | null>(null)
  const [editingCall, setEditingCall] = useState<Call | null>(null)
  const [formCategory, setFormCategory] = useState<CallCategory>('memecoins')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter] = useState<StatusFilter>('all')
  const [categoryFilter, setCategoryFilter] = useState<'all' | CallCategory>('all')
  const [riskFilter, setRiskFilter] = useState<RiskFilter>('all')
  const [traderFilter, setTraderFilter] = useState<'all' | string>('all')

  useScrollLock(showForm || showDeleteModal || !!cancelCallId)

  useEffect(() => {
    loadCalls()
  }, [])

  const loadCalls = async () => {
    setLoading(true)
    try {
      const fetchedCalls = await getCalls()
      setCalls(fetchedCalls)
    } catch (error) {
      console.error('Error loading calls:', error)
      setCalls([])
    } finally {
      setLoading(false)
    }
  }

  const bgColor = theme === 'dark' ? 'bg-[#0a0a0a]' : 'bg-white'
  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900'
  const subtleColor = theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
  const borderColor = theme === 'dark' ? 'border-gray-800' : 'border-gray-200'

  const handleSuccess = () => {
    setShowForm(false)
    setEditingCall(null)
    loadCalls()
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingCall(null)
  }

  const handleEdit = (call: Call) => {
    setEditingCall(call)
    setFormCategory(call.category)
    setShowForm(true)
  }

  const handleDeleteClick = (callId: string) => {
    setDeleteCallId(callId)
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteCallId) return
    try {
      await deleteCall(deleteCallId)
      setShowDeleteModal(false)
      setDeleteCallId(null)
      loadCalls()
    } catch (error) {
      console.error('Error deleting call:', error)
      alert('Ошибка при удалении сигнала')
    }
  }

  const handleCancelConfirm = async () => {
    if (!cancelCallId) return
    try {
      await updateCall(cancelCallId, { status: 'cancelled' })
      setCancelCallId(null)
      loadCalls()
    } catch (error) {
      console.error('Error cancelling call:', error)
      alert('Ошибка при отмене сигнала')
    }
  }

  const getDetails = (call: Call) => (call.details as any)?.[call.category] || {}

  const getPrimaryTitle = (call: Call) => {
    const d = getDetails(call)
    switch (call.category) {
      case 'memecoins':
        return d.coinName || d.ticker || 'Мемкоин'
      case 'futures':
        return d.pair || 'Фьючерс'
      case 'nft':
        return d.collectionLink || 'NFT коллекция'
      case 'spot':
        return d.coin || 'Спот'
      case 'polymarket':
        return d.event || 'Polymarket событие'
      case 'staking':
        return d.coin || 'Стейкинг'
      default:
        return 'Сигнал'
    }
  }

  const getRiskLevel = (call: Call): CallRiskLevel => call.riskLevel || getDetails(call).riskLevel || getDetails(call).protocolRisk || 'medium'

  const composeSearchString = (call: Call) => {
    const d = getDetails(call)
    const base = [
      call.category,
      call.status,
      call.comment,
      d.coinName,
      d.ticker,
      d.pair,
      d.reason,
      d.targets,
      d.event,
      d.marketplace,
      d.platform,
      d.entryCap,
      d.entryZone,
      d.network,
    ]
    return base.filter(Boolean).join(' ').toLowerCase()
  }

  const filteredCalls = calls.filter((call) => {
    if (statusFilter !== 'all' && call.status !== statusFilter) return false
    if (categoryFilter !== 'all' && call.category !== categoryFilter) return false
    if (riskFilter !== 'all' && getRiskLevel(call) !== riskFilter) return false
    if (traderFilter !== 'all' && call.userId !== traderFilter) return false
    if (searchQuery.trim()) {
      return composeSearchString(call).includes(searchQuery.toLowerCase())
    }
    return true
  })

  const categoryStats = useMemo(() => {
    return calls.reduce<Record<CallCategory, { total: number; active: number }>>((acc, call) => {
      if (!acc[call.category]) acc[call.category] = { total: 0, active: 0 }
      acc[call.category].total += 1
      if (call.status === 'active') acc[call.category].active += 1
      return acc
    }, {
      memecoins: { total: 0, active: 0 },
      futures: { total: 0, active: 0 },
      nft: { total: 0, active: 0 },
      spot: { total: 0, active: 0 },
      polymarket: { total: 0, active: 0 },
      staking: { total: 0, active: 0 },
    })
  }, [calls])

  const totals = useMemo(() => ({
    total: calls.length,
    active: calls.filter((c) => c.status === 'active').length,
    completed: calls.filter((c) => c.status === 'completed').length,
    cancelled: calls.filter((c) => c.status === 'cancelled').length,
  }), [calls])

  return (
    <div className={`min-h-screen ${bgColor} pb-20`}>
      {/* Header */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center gap-3 mb-2">
          <Activity className="w-8 h-8 text-emerald-500" />
          <h1 className={`text-3xl font-bold ${textColor}`}>Торговый Хаб</h1>
        </div>
        <p className={`${subtleColor} text-sm`}>
          Мониторинг лучших сигналов от проверенных трейдеров в реальном времени.
        </p>
      </div>

      {/* Category Cards - Horizontal Scroll */}
      <div className="px-4 sm:px-6 lg:px-8 mb-6">
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {(Object.keys(CATEGORY_META) as CallCategory[]).map((cat) => {
            const meta = CATEGORY_META[cat]
            const stats = categoryStats[cat]
            const isActive = categoryFilter === cat
            return (
              <button
                key={cat}
                onClick={() => setCategoryFilter(isActive ? 'all' : cat)}
                className={`flex-shrink-0 px-4 py-3 rounded-xl border transition-all ${isActive
                  ? 'bg-emerald-500/20 border-emerald-500/50'
                  : theme === 'dark'
                    ? 'bg-gray-900 border-gray-800 hover:border-gray-700'
                    : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {meta.icon}
                  <span className={`text-sm font-semibold ${textColor}`}>{meta.label}</span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-xs font-bold">
                    + {stats?.active || 0} АКТИВ
                  </span>
                </div>
                <p className={`text-xs ${subtleColor}`}>Всего: {stats?.total || 0}</p>
              </button>
            )
          })}
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 sm:px-6 lg:px-8 mb-6">
        <div className={`relative rounded-xl border ${borderColor} ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
          <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${subtleColor}`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по тикеру, событию, сети или причине..."
            className={`w-full pl-12 pr-4 py-3 bg-transparent ${textColor} placeholder:${subtleColor} focus:outline-none`}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 sm:px-6 lg:px-8 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          {/* Category Dropdown */}
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as 'all' | CallCategory)}
              className={`appearance-none px-4 py-2 pr-10 rounded-xl border ${borderColor} ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer`}
            >
              <option value="all">Все сферы</option>
              {(Object.keys(CATEGORY_META) as CallCategory[]).map((cat) => (
                <option key={cat} value={cat}>{CATEGORY_META[cat].label}</option>
              ))}
            </select>
            <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 ${subtleColor} pointer-events-none`} />
          </div>

          {/* Risk Dropdown */}
          <div className="relative">
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value as RiskFilter)}
              className={`appearance-none px-4 py-2 pr-10 rounded-xl border ${borderColor} ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer`}
            >
              <option value="all">Любой риск</option>
              <option value="low">Low Risk</option>
              <option value="medium">Medium Risk</option>
              <option value="high">High Risk</option>
              <option value="ultra">Ultra Risk</option>
            </select>
            <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 ${subtleColor} pointer-events-none`} />
          </div>

          {/* Trader Dropdown */}
          <div className="relative">
            <select
              value={traderFilter}
              onChange={(e) => setTraderFilter(e.target.value)}
              className={`appearance-none px-4 py-2 pr-10 rounded-xl border ${borderColor} ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer`}
            >
              <option value="all">Все трейдеры</option>
              {TEAM_MEMBERS.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 ${subtleColor} pointer-events-none`} />
          </div>

          {/* Filters Button */}
          <button
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${borderColor} ${theme === 'dark' ? 'bg-gray-900 hover:bg-gray-800' : 'bg-white hover:bg-gray-50'
              } transition-colors`}
          >
            <Filter className="w-4 h-4" />
            <span className={`text-sm font-medium ${textColor}`}>Фильтры</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="px-4 sm:px-6 lg:px-8 mb-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Signals */}
          <div className={`p-4 rounded-xl border ${borderColor} ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs uppercase tracking-wider ${subtleColor}`}>Всего сигналов</span>
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
            <p className={`text-3xl font-bold ${textColor}`}>{totals.total}</p>
            <p className="text-xs text-emerald-500 mt-1">+42%</p>
          </div>

          {/* Active */}
          <div className={`p-4 rounded-xl border ${borderColor} ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs uppercase tracking-wider ${subtleColor}`}>Активные</span>
              <Activity className="w-4 h-4 text-emerald-500" />
            </div>
            <p className={`text-3xl font-bold ${textColor}`}>{totals.active}</p>
            <p className="text-xs text-emerald-500 mt-1">{totals.total > 0 ? Math.round((totals.active / totals.total) * 100) : 0}%</p>
          </div>

          {/* Completed */}
          <div className={`p-4 rounded-xl border ${borderColor} ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs uppercase tracking-wider ${subtleColor}`}>Завершенные</span>
              <Check className="w-4 h-4 text-blue-500" />
            </div>
            <p className={`text-3xl font-bold ${textColor}`}>{totals.completed}</p>
            <p className={`text-xs ${subtleColor} mt-1`}>-1%</p>
          </div>

          {/* Cancelled */}
          <div className={`p-4 rounded-xl border ${borderColor} ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs uppercase tracking-wider ${subtleColor}`}>Отмененные</span>
              <X className="w-4 h-4 text-red-500" />
            </div>
            <p className={`text-3xl font-bold ${textColor}`}>{totals.cancelled}</p>
            <p className={`text-xs ${subtleColor} mt-1`}>-1%</p>
          </div>
        </div>
      </div>

      {/* Signals Feed Header */}
      <div className="px-4 sm:px-6 lg:px-8 mb-4">
        <div className="flex items-center justify-between">
          <h2 className={`text-xl font-bold ${textColor}`}>Лента сигналов</h2>
          <p className={`text-sm ${subtleColor}`}>
            Показано {filteredCalls.length} из {totals.active} активных
          </p>
        </div>
      </div>

      {/* Signals List */}
      <div className="px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent mx-auto mb-4"></div>
            <p className={subtleColor}>Загрузка сигналов...</p>
          </div>
        ) : filteredCalls.length === 0 ? (
          <div className="text-center py-12">
            <Sparkles className={`w-16 h-16 mx-auto mb-4 ${subtleColor}`} />
            <p className={`text-xl font-bold ${textColor} mb-2`}>Нет сигналов</p>
            <p className={subtleColor}>Попробуйте изменить фильтры</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredCalls.map((call) => {
              const meta = CATEGORY_META[call.category]
              const details = getDetails(call)
              const risk = getRiskLevel(call)
              const trader = TEAM_MEMBERS.find(t => t.id === call.userId)

              return (
                <div
                  key={call.id}
                  className={`p-4 rounded-xl border ${borderColor} ${theme === 'dark' ? 'bg-gray-900 hover:bg-gray-800' : 'bg-white hover:bg-gray-50'
                    } transition-colors`}
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Left: Icon & Title */}
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`p-2 rounded-lg ${meta.chip}`}>
                        {meta.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={`font-bold ${textColor}`}>{getPrimaryTitle(call)}</h3>
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${riskBadges[risk]}`}>
                            {riskLabels[risk]}
                          </span>
                        </div>
                        <p className={`text-sm ${subtleColor} mb-2`}>{meta.label}</p>

                        {/* Metrics */}
                        <div className="flex flex-wrap gap-4 text-sm">
                          {details.entryPrice && (
                            <div>
                              <span className={subtleColor}>Вход: </span>
                              <span className={textColor}>{details.entryPrice}</span>
                            </div>
                          )}
                          {details.targets && (
                            <div>
                              <span className={subtleColor}>Цель: </span>
                              <span className="text-emerald-500">{details.targets}</span>
                            </div>
                          )}
                          {details.stopLoss && (
                            <div>
                              <span className={subtleColor}>SL: </span>
                              <span className="text-red-500">{details.stopLoss}</span>
                            </div>
                          )}
                          {trader && (
                            <div>
                              <span className={subtleColor}>Трейдер: </span>
                              <span className={textColor}>{trader.name}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(call)}
                        className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(call.id)}
                        className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-start sm:items-center justify-center p-4 overflow-y-auto">
          <div className={`${bgColor} rounded-2xl shadow-2xl border ${borderColor} max-w-3xl w-full max-h-[90vh] overflow-hidden`}>
            <div className="flex flex-col h-full">
              <div className={`p-6 flex items-center justify-between sticky top-0 z-20 ${bgColor} border-b ${borderColor} shadow-sm`}>
                <h2 className={`text-2xl font-bold ${textColor}`}>{editingCall ? 'Редактировать сигнал' : 'Создать сигнал'}</h2>
                <button
                  onClick={handleCancel}
                  className={`p-2 rounded-xl ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
                >
                  <X className={`w-5 h-5 ${subtleColor}`} />
                </button>
              </div>
              <div className="px-6 pb-6 pt-2 overflow-y-auto flex-1 max-h-[75vh]">
                <CallForm
                  callToEdit={editingCall}
                  onSuccess={handleSuccess}
                  onCancel={handleCancel}
                  initialCategory={formCategory}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-start sm:items-center justify-center p-4 overflow-y-auto overscroll-contain">
          <div className={`${bgColor} rounded-2xl shadow-2xl border ${borderColor} max-w-md w-full`}>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-red-500" />
                <div>
                  <h3 className={`text-xl font-bold ${textColor}`}>Удалить сигнал?</h3>
                  <p className={subtleColor}>Это действие нельзя отменить</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => { setShowDeleteModal(false); setDeleteCallId(null) }}
                  className={`flex-1 px-4 py-3 rounded-xl border ${borderColor} ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}
                >
                  Отмена
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="flex-1 px-4 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700"
                >
                  Удалить
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancelCallId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-start sm:items-center justify-center p-4 overflow-y-auto overscroll-contain">
          <div className={`${bgColor} rounded-2xl shadow-2xl border ${borderColor} max-w-md w-full`}>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-500" />
                <div>
                  <h3 className={`text-xl font-bold ${textColor}`}>Отменить сигнал?</h3>
                  <p className={subtleColor}>Статус станет «Отменен», запись останется в списке.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setCancelCallId(null)}
                  className={`flex-1 px-4 py-3 rounded-xl border ${borderColor} ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}
                >
                  Отмена
                </button>
                <button
                  onClick={handleCancelConfirm}
                  className="flex-1 px-4 py-3 rounded-xl bg-amber-500 text-white font-semibold hover:bg-amber-600"
                >
                  Отменить
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
