import { useState, useMemo } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useAdminStore } from '@/store/adminStore'
import { useThemeStore } from '@/store/themeStore'
import { addEarnings, updateEarnings } from '@/services/firestoreService'
import { formatDate } from '@/utils/dateUtils'
import { getUserNicknameSync } from '@/utils/userUtils'
import { EARNINGS_CATEGORY_META, Earnings, EarningsCategory, TEAM_MEMBERS } from '@/types'
import { X, Rocket, LineChart, Image, Coins, BarChart3, ShieldCheck, Sparkles, Gift, Wallet, Users, Zap, CheckCircle2, ChevronRight, Calculator, Briefcase } from 'lucide-react'
import { useScrollLock } from '@/hooks/useScrollLock'
import { calculatePoolShare, calculateTotalEarnings } from '@/utils/earningsCalculations'

interface EarningsFormProps {
  onClose: () => void
  onSave: () => void
  editingEarning?: Earnings | null
}

export const EarningsForm = ({ onClose, onSave, editingEarning }: EarningsFormProps) => {
  const { user } = useAuthStore()
  const { isAdmin } = useAdminStore()
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'
  const isEditing = !!editingEarning

  const [date, setDate] = useState(editingEarning?.date || formatDate(new Date(), 'yyyy-MM-dd'))
  const [amount, setAmount] = useState(editingEarning?.amount?.toString() || '')

  // New State
  const [walletType, setWalletType] = useState<'general' | 'personal' | 'pool'>(editingEarning?.walletType || 'general')

  // Migration for old 'memecoins' category
  const initialCategory = useMemo(() => {
    if (editingEarning?.category === ('memecoins' as any)) {
      return editingEarning?.isDeving ? 'memes_dev' : 'memes_trading'
    }
    return editingEarning?.category || 'memes_trading'
  }, [editingEarning])

  const [category, setCategory] = useState<EarningsCategory>(initialCategory)
  const [multipleParticipants, setMultipleParticipants] = useState(editingEarning ? editingEarning.participants.length > 1 : false)
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(editingEarning ? editingEarning.participants.filter(id => id !== editingEarning.userId) : [])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [extraWalletsCount, setExtraWalletsCount] = useState(editingEarning?.extraWalletsCount?.toString() || '')
  const [extraWalletsAmount, setExtraWalletsAmount] = useState(editingEarning?.extraWalletsAmount?.toString() || '')

  useScrollLock()

  const getCategoryIcon = (key: EarningsCategory, className = 'w-4 h-4') => {
    switch (key) {
      case 'memes_trading': return <Rocket className={className} />
      case 'memes_dev': return <Zap className={className} />
      case 'futures': return <LineChart className={className} />
      case 'prop_trading': return <Briefcase className={className} />
      case 'nft': return <Image className={className} />
      case 'spot': return <Coins className={className} />
      case 'polymarket': return <BarChart3 className={className} />
      case 'staking': return <ShieldCheck className={className} />
      case 'airdrop': return <Gift className={className} />
      default: return <Sparkles className={className} />
    }
  }

  const resolveParticipants = () => {
    if (isEditing && editingEarning) {
      return editingEarning.participants?.length ? editingEarning.participants : [editingEarning.userId]
    }
    if (multipleParticipants && selectedParticipants.length) {
      return [user?.id, ...selectedParticipants].filter(Boolean) as string[]
    }
    return user?.id ? [user.id] : []
  }

  // Calculate values
  const numericAmount = parseFloat(amount || '0')
  const numericExtraWalletsCount = parseFloat(extraWalletsCount || '0')
  const numericExtraWalletsAmount = parseFloat(extraWalletsAmount || '0')

  const totalEarnings = calculateTotalEarnings(numericAmount, walletType, numericExtraWalletsCount, numericExtraWalletsAmount)
  const { poolShare, percent } = calculatePoolShare(totalEarnings, category, walletType, category === 'memes_dev')

  const calculatePerParticipant = () => {
    const participants = resolveParticipants()
    if (!participants.length) return 0
    return (totalEarnings - poolShare) / participants.length
  }

  const perParticipant = calculatePerParticipant()
  const canEdit = !isEditing || (isAdmin && editingEarning?.status === 'pending')

  const handleSave = async () => {
    const participants = resolveParticipants()

    if (!amount || participants.length === 0) {
      setError('Пожалуйста, заполните все обязательные поля')
      return
    }

    if (isAdmin && isEditing && editingEarning?.status === 'approved') {
      setError('Нельзя изменять одобренный заработок')
      return
    }

    setLoading(true)
    setError('')

    try {
      const earningsData = {
        date,
        amount: numericAmount,
        extraWalletsCount: numericExtraWalletsCount,
        extraWalletsAmount: numericExtraWalletsAmount,
        category,
        walletType,
        isDeving: category === 'memes_dev',
        participants,
        userId: user?.id || '',
        status: ((isAdmin && isEditing) ? 'approved' : 'pending') as 'pending' | 'approved' | 'rejected',
        perParticipant: perParticipant,
        poolAmount: poolShare
      }

      if (isEditing && editingEarning?.id) {
        await updateEarnings(editingEarning.id, earningsData)
      } else {
        await addEarnings(earningsData)
      }
      onSave()
      onClose()
    } catch (error) {
      console.error('Error saving earnings:', error)
      setError('Ошибка при сохранении. Попробуйте снова.')
    } finally {
      setLoading(false)
    }
  }

  // Categories reordered as requested
  const orderedCategories: EarningsCategory[] = [
    'memes_trading',
    'memes_dev',
    'futures',
    'prop_trading',
    'nft',
    'spot',
    'polymarket',
    'staking',
    'airdrop',
    'other'
  ]

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-xl"
        onClick={onClose}
      />

      <div
        className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] shadow-[0_0_50px_rgba(16,185,129,0.15)] border ${isDark ? 'bg-[#0f1419]/95 border-emerald-500/20' : 'bg-white/95 border-gray-200'} backdrop-blur-3xl overflow-hidden animate-in fade-in zoom-in duration-300`}
      >
        {/* Header Decor */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

        <div className="flex items-center justify-between p-8 pb-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 relative group">
              <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              <Calculator className="w-6 h-6 text-emerald-400 relative z-10" />
            </div>
            <div>
              <h2 className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {isEditing ? 'Редактирование' : 'Новое достижение'}
              </h2>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500/60">AVA EARNINGS SYSTEM V2.5</p>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-3 rounded-2xl transition-all ${isDark ? 'hover:bg-white/5 text-gray-400' : 'hover:bg-gray-100 text-gray-500'} active:scale-95`}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 pt-4 space-y-8">
          {error && (
            <div
              className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-500 animate-in slide-in-from-top duration-300"
            >
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <p className="text-sm font-bold">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              {/* Date Input */}
              <div className="space-y-3">
                <label className={`block text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Дата фиксации</label>
                <div className="relative group">
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    disabled={!canEdit}
                    className={`w-full pl-4 pr-4 py-4 rounded-2xl border font-black text-sm outline-none transition-all ${isDark
                      ? 'bg-white/5 border-white/5 text-white focus:border-emerald-500/50 focus:bg-white/10'
                      : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-emerald-500/50 focus:bg-white Shadow-inner'
                      } disabled:opacity-50`}
                  />
                </div>
              </div>

              {/* Category selector improved for better UI */}
              <div className="space-y-3">
                <label className={`block text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Категория актива</label>
                <div className="grid grid-cols-3 gap-3">
                  {orderedCategories.map((cat) => {
                    const meta = EARNINGS_CATEGORY_META[cat]
                    const isActive = category === cat
                    return (
                      <button
                        key={cat}
                        onClick={() => setCategory(cat)}
                        disabled={!canEdit}
                        className={`group relative flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-300 active:scale-95 overflow-hidden ${isActive
                          ? 'border-emerald-500/50 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.1)]'
                          : isDark ? 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                          } disabled:opacity-50`}
                      >
                        {isActive && (
                          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />
                        )}
                        <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${meta?.gradient || 'from-gray-400 to-gray-600'} flex items-center justify-center text-white shadow-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 mb-2 relative z-10`}>
                          {getCategoryIcon(cat, 'w-5 h-5')}
                        </div>
                        <span className={`text-[9px] font-black uppercase tracking-tighter text-center leading-tight transition-colors relative z-10 ${isActive ? 'text-emerald-400' : isDark ? 'text-gray-400 group-hover:text-gray-300' : 'text-gray-600'}`}>
                          {meta?.shortName || cat}
                        </span>
                        {isActive && (
                          <div className="absolute top-1 right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-[#0f1419] z-20">
                            <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Wallet Type */}
              <div className="space-y-3">
                <label className={`block text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Источник прибыли</label>
                <div className={`flex p-1.5 rounded-2xl ${isDark ? 'bg-black/40 border-white/5' : 'bg-gray-100 border-gray-200'} border gap-1`}>
                  {[
                    { id: 'general', label: 'Общий', icon: <Users className="w-4 h-4" /> },
                    { id: 'personal', label: 'Личный', icon: <Wallet className="w-4 h-4" /> },
                    { id: 'pool', label: 'Пул', icon: <Coins className="w-4 h-4" /> }
                  ].map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setWalletType(type.id as any)}
                      disabled={!canEdit}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-wider transition-all duration-300 ${walletType === type.id
                        ? 'bg-emerald-500 text-white shadow-[0_4px_12px_rgba(16,185,129,0.3)] scale-100'
                        : `text-gray-500 hover:text-gray-300 hover:bg-white/5 scale-100`
                        }`}
                    >
                      {type.icon}
                      <span>{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Amount Inputs */}
              <div className={`p-6 rounded-[2.5rem] ${isDark ? 'bg-emerald-500/5' : 'bg-emerald-50/50'} border border-emerald-500/10 space-y-6 shadow-inner relative overflow-hidden group`}>
                <div className="absolute -right-8 -top-8 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full group-hover:bg-emerald-500/10 transition-colors" />

                <div className="space-y-3 relative z-10">
                  <label className={`block text-[10px] font-black uppercase tracking-widest text-emerald-500/80`}>
                    {walletType === 'general' ? 'ПРИБЫЛЬ С ОСНОВНОГО КОШЕЛЬКА (₽)' : walletType === 'pool' ? 'СУММА В ПУЛ (₽)' : 'ВАШ ЛИЧНЫЙ ЗАРАБОТОК (₽)'}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      disabled={!canEdit}
                      placeholder="0.00"
                      className={`w-full px-0 py-2 bg-transparent font-black text-5xl outline-none placeholder-emerald-500/10 transition-all ${isDark ? 'text-white' : 'text-gray-900'} focus:scale-[1.02] origin-left`}
                    />
                    <div className="absolute right-0 bottom-3 text-xs font-black text-emerald-500/40 tracking-widest">RUB</div>
                  </div>
                </div>

                {walletType === 'general' ? (
                  <div
                    className="space-y-4 pt-4 border-t border-emerald-500/10 relative z-10"
                  >
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Количество копи-кошельков</label>
                      <input
                        type="number"
                        value={extraWalletsCount}
                        onChange={(e) => setExtraWalletsCount(e.target.value)}
                        disabled={!canEdit}
                        placeholder="0"
                        className={`w-full px-4 py-4 rounded-2xl border font-black text-sm transition-all ${isDark ? 'bg-white/5 border-white/5 text-white focus:bg-white/10 focus:border-emerald-500/30' : 'bg-white border-gray-200 text-gray-900 focus:border-emerald-500/30'}`}
                      />
                    </div>
                  </div>
                ) : walletType === 'personal' ? (
                  <div
                    className="space-y-4 pt-4 border-t border-emerald-500/10 relative z-10"
                  >
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Заработок с доп. кошельков (₽)</label>
                      <input
                        type="number"
                        value={extraWalletsAmount}
                        onChange={(e) => setExtraWalletsAmount(e.target.value)}
                        disabled={!canEdit}
                        placeholder="0.00"
                        className={`w-full px-4 py-4 rounded-2xl border font-black text-sm transition-all ${isDark ? 'bg-white/5 border-white/5 text-white focus:bg-white/10 focus:border-emerald-500/30' : 'bg-white border-gray-200 text-gray-900 focus:border-emerald-500/30'}`}
                      />
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Participants Selection */}
              <div className="space-y-4">
                <button
                  onClick={() => setMultipleParticipants(!multipleParticipants)}
                  disabled={!canEdit}
                  className={`w-full flex items-center justify-between p-5 rounded-[2rem] border transition-all duration-300 ${multipleParticipants ? 'border-emerald-500/30 bg-emerald-500/10' : isDark ? 'border-white/5 bg-white/5 hover:bg-white/10' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'} group`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl transition-all duration-300 ${multipleParticipants ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-gray-500/10 text-gray-500 group-hover:scale-110'}`}>
                      <Users className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-black uppercase tracking-tight">Групповой доход</span>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${multipleParticipants ? 'border-emerald-500 bg-emerald-500' : 'border-gray-500/30'}`}>
                    {multipleParticipants && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                  </div>
                </button>

                {multipleParticipants && (
                  <div className="animate-in slide-in-from-top duration-300 overflow-hidden">
                    <div className={`grid grid-cols-2 gap-2 p-3 rounded-3xl border ${isDark ? 'bg-black/20 border-white/5' : 'bg-gray-50 border-gray-200'}`}>
                      {TEAM_MEMBERS.filter(member => member.id !== user?.id).map((member) => {
                        const isSelected = selectedParticipants.includes(member.id);
                        return (
                          <button
                            key={member.id}
                            onClick={() => {
                              if (!canEdit) return
                              setSelectedParticipants(prev =>
                                isSelected ? prev.filter(id => id !== member.id) : [...prev, member.id]
                              )
                            }}
                            className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-300 ${isSelected
                              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                              : isDark ? 'bg-white/5 border-white/5 text-gray-500 hover:bg-white/10 hover:text-gray-300' : 'bg-white border-gray-200 text-gray-600 hover:border-emerald-500/20'
                              }`}
                          >
                            <span className="text-[11px] font-black uppercase tracking-tight truncate mr-2">{getUserNicknameSync(member.id) || member.name}</span>
                            {isSelected ? (
                              <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                            ) : (
                              <div className="w-3.5 h-3.5 rounded-full border border-gray-500/30 flex-shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Results Visualization Panel */}
          <div className={`relative overflow-hidden rounded-[2.5rem] p-8 ${isDark ? 'bg-white/5 border-emerald-500/10' : 'bg-gray-50 border-gray-200'} border shadow-inner`}>
            <div className="absolute top-0 right-0 p-8 opacity-10 blur-xl group-hover:blur-none transition-all duration-1000">
              <Sparkles className="w-32 h-32 text-emerald-500 animate-pulse" />
            </div>

            <div className="relative z-10 flex flex-col md:flex-row gap-10 items-center md:items-stretch">
              <div className="flex-1 space-y-6 w-full">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">ВАЛОВЫЙ ОБЪЕМ (GROSS)</p>
                    <h3 className={`text-4xl font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {totalEarnings.toLocaleString()} <span className="text-emerald-500">₽</span>
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-black text-emerald-400/80 bg-emerald-500/10 px-4 py-1.5 rounded-full uppercase tracking-widest border border-emerald-500/20">Realtime calc</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-500">
                    <span className="flex items-center gap-2">
                      <ShieldCheck className="w-3 h-3" />
                      Вклад в пул ({(percent * 100).toFixed(0)}%)
                    </span>
                    <span className="text-red-400/80">-{poolShare.toLocaleString()} ₽</span>
                  </div>
                  <div className="h-2.5 w-full bg-black/20 rounded-full overflow-hidden p-0.5 border border-white/5">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-400 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-500"
                      style={{ width: `${percent * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className={`hidden md:block w-px ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />

              <div className="flex-1 flex flex-col justify-center space-y-3 w-full group/result">
                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                  <Zap className="w-3 h-3 fill-emerald-500" />
                  Чистый доход на участника
                </p>
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-emerald-500 rounded-2xl shadow-[0_8px_25px_rgba(16,185,129,0.3)] group-hover/result:scale-110 group-hover/result:rotate-3 transition-all duration-300">
                    <Rocket className="w-7 h-7 text-white" />
                  </div>
                  <span className={`text-4xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-gray-900'} group-hover/result:text-emerald-400 transition-colors`}>
                    {perParticipant.toLocaleString()} ₽
                  </span>
                </div>
                <p className="text-[10px] font-bold text-gray-500 italic opacity-60">Распределение прибыли фиксируется после одобрения</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4 pb-8">
            <button
              onClick={handleSave}
              disabled={loading}
              className="group relative flex-[2] h-18 rounded-[2rem] bg-[#4E6E49] hover:bg-[#5a7d55] text-white transition-all overflow-hidden active:scale-95 disabled:grayscale shadow-xl shadow-emerald-500/10"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              <span className={`relative z-10 flex items-center justify-center gap-3 text-lg font-black uppercase tracking-tight ${loading ? 'invisible' : ''}`}>
                {isEditing ? 'Сохранить изменения' : 'Отправить в систему'}
                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                  <ChevronRight className="w-5 h-5 text-white" />
                </div>
              </span>
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                </div>
              )}
            </button>
            <button
              onClick={onClose}
              className={`flex-1 h-18 rounded-[2rem] border font-black uppercase tracking-[0.2em] text-[10px] transition-all active:scale-95 ${isDark ? 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white' : 'bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200'}`}
            >
              Отмена
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
