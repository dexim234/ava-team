// Call form component for creating trading signals
import { useState } from 'react'
import { useThemeStore } from '@/store/themeStore'
import { useAuthStore } from '@/store/authStore'
import { addCall, updateCall } from '@/services/firestoreService'
import type { Network, Strategy, Call } from '@/types'

interface CallFormProps {
  onSuccess?: () => void
  onCancel?: () => void
  callToEdit?: Call | null
}

export const CallForm = ({ onSuccess, onCancel, callToEdit }: CallFormProps) => {
  const { theme } = useThemeStore()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState<Omit<Call, 'id' | 'userId' | 'createdAt' | 'status'>>({
    network: callToEdit?.network || 'solana',
    ticker: callToEdit?.ticker || '',
    pair: callToEdit?.pair || '',
    entryPoint: callToEdit?.entryPoint || '',
    target: callToEdit?.target || '',
    strategy: callToEdit?.strategy || 'flip',
    risks: callToEdit?.risks || '',
    cancelConditions: callToEdit?.cancelConditions || '',
    comment: callToEdit?.comment || '',
  })

  const networks: { value: Network; label: string; tone: string }[] = [
    { value: 'solana', label: 'Solana', tone: 'bg-purple-500/15 text-purple-200 border-purple-400/40' },
    { value: 'bsc', label: 'BSC', tone: 'bg-amber-500/15 text-amber-200 border-amber-400/40' },
    { value: 'ethereum', label: 'Ethereum', tone: 'bg-blue-500/15 text-blue-200 border-blue-400/40' },
    { value: 'base', label: 'Base', tone: 'bg-indigo-500/15 text-indigo-200 border-indigo-400/40' },
    { value: 'ton', label: 'Ton', tone: 'bg-cyan-500/15 text-cyan-200 border-cyan-400/40' },
    { value: 'tron', label: 'Tron', tone: 'bg-red-500/15 text-red-200 border-red-400/40' },
    { value: 'sui', label: 'SUI', tone: 'bg-emerald-500/15 text-emerald-200 border-emerald-400/40' },
    { value: 'cex', label: 'CEX', tone: 'bg-orange-500/15 text-orange-200 border-orange-400/40' },
  ]
  const strategies: { value: Strategy; label: string; hint: string }[] = [
    { value: 'flip', label: '🔄 Флип', hint: 'Краткосрочно (часы/дни)' },
    { value: 'medium', label: '📊 Среднесрок', hint: 'Дни/недели' },
    { value: 'long', label: '⏰ Долгосрок', hint: 'Недели/месяцы' },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Validation
    if (!formData.ticker.trim()) {
      setError('Укажите тикер токена')
      setLoading(false)
      return
    }
    if (!formData.pair.trim()) {
      setError('Укажите пару токена')
      setLoading(false)
      return
    }
    if (!formData.entryPoint.trim()) {
      setError('Укажите точку входа или диапазон')
      setLoading(false)
      return
    }
    if (!formData.target.trim()) {
      setError('Укажите цель/ориентиры по прибыли')
      setLoading(false)
      return
    }
    if (!formData.risks.trim()) {
      setError('Опишите риски')
      setLoading(false)
      return
    }

    try {
      // Allow admin to edit calls even without user, but creating requires user
      if (callToEdit) {
        // Update existing call - admin can edit any call
        const updates: Partial<Call> = {
          network: formData.network,
          ticker: formData.ticker,
          pair: formData.pair,
          entryPoint: formData.entryPoint,
          target: formData.target,
          strategy: formData.strategy,
          risks: formData.risks,
          cancelConditions: formData.cancelConditions || undefined,
          comment: formData.comment || undefined,
        }
        await updateCall(callToEdit.id, updates)
      } else {
        // Create new call - requires user
        if (!user) {
          setError('Вы не авторизованы. Для создания сигнала необходимо войти как участник.')
          setLoading(false)
          return
        }
        const callData: Omit<Call, 'id'> = {
          ...formData,
          userId: user.id,
          createdAt: new Date().toISOString(),
          status: 'active',
          cancelConditions: formData.cancelConditions || undefined,
          comment: formData.comment || undefined,
        }
        await addCall(callData)
      }
      onSuccess?.()
    } catch (error: any) {
      console.error('Error creating call:', error)
      setError('Ошибка при создании сигнала. Попробуйте позже.')
    } finally {
      setLoading(false)
    }
  }

  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900'
  const borderColor = theme === 'dark' ? 'border-gray-800' : 'border-gray-200'
  const inputBg = theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
  const pillOff = theme === 'dark' ? 'bg-gray-800 border-gray-700 text-gray-200 hover:border-gray-500' : 'bg-white border-gray-200 text-gray-700 hover:border-gray-400'
  const pillOn = 'bg-gradient-to-r from-[#4E6E49] to-emerald-600 text-white shadow-lg shadow-emerald-500/30 border-transparent'

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-red-900/30 border border-red-700 text-red-300' : 'bg-red-50 border border-red-200 text-red-800'}`}>
          {error}
        </div>
      )}

      {/* Network */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className={`block text-sm font-medium ${textColor}`}>Сеть *</label>
          <span className="text-[11px] text-gray-500 dark:text-gray-400">Кликните для выбора</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {networks.map((network) => (
            <button
              key={network.value}
              type="button"
              onClick={() => setFormData({ ...formData, network: network.value })}
              className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-sm font-semibold transition-all ${
                formData.network === network.value ? pillOn : pillOff
              } ${formData.network === network.value ? '' : network.tone}`}
            >
              {network.label}
            </button>
          ))}
        </div>
      </div>

      {/* Ticker */}
      <div>
        <label className={`block text-sm font-medium ${textColor} mb-2`}>
          Тикер токена *
        </label>
        <input
          type="text"
          value={formData.ticker}
          onChange={(e) => setFormData({ ...formData, ticker: e.target.value.toUpperCase() })}
          className={`w-full px-4 py-2 rounded-lg border ${borderColor} ${inputBg} ${textColor} focus:outline-none focus:ring-2 focus:ring-[#4E6E49]`}
          placeholder="тикер токена"
          required
        />
      </div>

      {/* Pair */}
      <div>
        <label className={`block text-sm font-medium ${textColor} mb-2`}>
          Пара токена *
        </label>
        <input
          type="text"
          value={formData.pair}
          onChange={(e) => setFormData({ ...formData, pair: e.target.value })}
          className={`w-full px-4 py-2 rounded-lg border ${borderColor} ${inputBg} ${textColor} focus:outline-none focus:ring-2 focus:ring-[#4E6E49]`}
          placeholder="PEPE/USDT, DOGE/USDT..."
          required
        />
      </div>

      {/* Entry Point */}
      <div>
        <label className={`block text-sm font-medium ${textColor} mb-2`}>
          Точка входа или диапазон капитализации *
        </label>
        <input
          type="text"
          value={formData.entryPoint}
          onChange={(e) => setFormData({ ...formData, entryPoint: e.target.value })}
          className={`w-full px-4 py-2 rounded-lg border ${borderColor} ${inputBg} ${textColor} focus:outline-none focus:ring-2 focus:ring-[#4E6E49]`}
          placeholder="10M или 10M-15M (в миллионах долларов)"
          required
        />
      </div>

      {/* Target */}
      <div>
        <label className={`block text-sm font-medium ${textColor} mb-2`}>
          Цель/ориентиры по капитализации *
        </label>
        <input
          type="text"
          value={formData.target}
          onChange={(e) => setFormData({ ...formData, target: e.target.value })}
          className={`w-full px-4 py-2 rounded-lg border ${borderColor} ${inputBg} ${textColor} focus:outline-none focus:ring-2 focus:ring-[#4E6E49]`}
          placeholder="20M, 30M, 50M (в миллионах долларов)"
          required
        />
      </div>

      {/* Strategy */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className={`block text-sm font-medium ${textColor}`}>Стратегия *</label>
          <span className="text-[11px] text-gray-500 dark:text-gray-400">Кликните для выбора</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {strategies.map((strategy) => (
            <button
              key={strategy.value}
              type="button"
              onClick={() => setFormData({ ...formData, strategy: strategy.value })}
              className={`flex flex-col items-start gap-1 px-3 py-3 rounded-lg border text-sm transition-all ${
                formData.strategy === strategy.value ? pillOn : pillOff
              }`}
            >
              <span className="font-semibold">{strategy.label}</span>
              <span className="text-[11px] opacity-80">{strategy.hint}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Risks */}
      <div>
        <label className={`block text-sm font-medium ${textColor} mb-2`}>
          Риски *
        </label>
        <textarea
          value={formData.risks}
          onChange={(e) => setFormData({ ...formData, risks: e.target.value })}
          className={`w-full px-4 py-2 rounded-lg border ${borderColor} ${inputBg} ${textColor} focus:outline-none focus:ring-2 focus:ring-[#4E6E49] min-h-[100px] resize-y`}
          placeholder="Опишите риски этого сигнала..."
          required
        />
      </div>

      {/* Cancel Conditions */}
      <div>
        <label className={`block text-sm font-medium ${textColor} mb-2`}>
          Условия отмены или пересмотра колла
        </label>
        <textarea
          value={formData.cancelConditions}
          onChange={(e) => setFormData({ ...formData, cancelConditions: e.target.value })}
          className={`w-full px-4 py-2 rounded-lg border ${borderColor} ${inputBg} ${textColor} focus:outline-none focus:ring-2 focus:ring-[#4E6E49] min-h-[80px] resize-y`}
          placeholder="При каких условиях сигнал должен быть отменен или пересмотрен..."
        />
      </div>

      {/* Comment */}
      <div>
        <label className={`block text-sm font-medium ${textColor} mb-2`}>
          Комментарий по ситуации
        </label>
        <textarea
          value={formData.comment}
          onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
          className={`w-full px-4 py-2 rounded-lg border ${borderColor} ${inputBg} ${textColor} focus:outline-none focus:ring-2 focus:ring-[#4E6E49] min-h-[100px] resize-y`}
          placeholder="Дополнительные комментарии по ситуации..."
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
            theme === 'dark'
              ? 'bg-[#4E6E49] hover:bg-[#4E6E49] text-white disabled:bg-gray-700 disabled:text-gray-400'
              : 'bg-[#4E6E49] hover:bg-[#4E6E49] text-white disabled:bg-gray-300 disabled:text-gray-500'
          }`}
        >
          {loading ? 'Создание...' : callToEdit ? 'Обновить сигнал' : 'Создать сигнал'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              theme === 'dark'
                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
            }`}
          >
            Отмена
          </button>
        )}
      </div>
    </form>
  )
}

