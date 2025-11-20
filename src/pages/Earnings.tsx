// Earnings page
import { useState, useEffect } from 'react'
import { Layout } from '@/components/Layout'
import { useThemeStore } from '@/store/themeStore'
import { EarningsForm } from '@/components/Earnings/EarningsForm'
import { EarningsTable } from '@/components/Earnings/EarningsTable'
import { EarningsList } from '@/components/Earnings/EarningsList'
import { getEarnings } from '@/services/firestoreService'
import { Earnings as EarningsType } from '@/types'
import { Plus, DollarSign, TrendingUp, Sparkles, Wallet, PiggyBank } from 'lucide-react'
import { getWeekRange, formatDate } from '@/utils/dateUtils'

export const Earnings = () => {
  const { theme } = useThemeStore()
  const [showForm, setShowForm] = useState(false)
  const [editingEarning, setEditingEarning] = useState<EarningsType | null>(null)
  const [earnings, setEarnings] = useState<EarningsType[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    weekTotal: 0,
    weekPool: 0,
    monthTotal: 0,
    monthPool: 0
  })

  const calculateStats = () => {
    const weekRange = getWeekRange()
    const weekStart = formatDate(weekRange.start, 'yyyy-MM-dd')
    const weekEnd = formatDate(weekRange.end, 'yyyy-MM-dd')
    
    const monthStart = formatDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd')
    const monthEnd = formatDate(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0), 'yyyy-MM-dd')

    const weekEarnings = earnings.filter(e => e.date >= weekStart && e.date <= weekEnd)
    const monthEarnings = earnings.filter(e => e.date >= monthStart && e.date <= monthEnd)

    setStats({
      weekTotal: weekEarnings.reduce((sum, e) => sum + e.amount, 0),
      weekPool: weekEarnings.reduce((sum, e) => sum + e.poolAmount, 0),
      monthTotal: monthEarnings.reduce((sum, e) => sum + e.amount, 0),
      monthPool: monthEarnings.reduce((sum, e) => sum + e.poolAmount, 0)
    })
  }

  useEffect(() => {
    loadEarnings()
  }, [])

  useEffect(() => {
    if (earnings.length > 0) {
      calculateStats()
    }
  }, [earnings])

  const loadEarnings = async () => {
    setLoading(true)
    try {
      const allEarnings = await getEarnings()
      setEarnings(allEarnings)
    } catch (error) {
      console.error('Error loading earnings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (earning: EarningsType) => {
    setEditingEarning(earning)
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingEarning(null)
  }

  const handleSave = () => {
    setShowForm(false)
    setEditingEarning(null)
    loadEarnings()
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header with welcome message and stats */}
        <div className={`rounded-2xl p-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg border-2 ${
          theme === 'dark' ? 'border-green-500/30 bg-gradient-to-br from-gray-800 to-gray-800/90' : 'border-green-200 bg-gradient-to-br from-white to-green-50/30'
        }`}>
          <div className="flex items-start gap-4 mb-6">
            <div className={`p-3 rounded-xl ${
              theme === 'dark' ? 'bg-green-500/20' : 'bg-green-100'
            }`}>
              <DollarSign className={`w-8 h-8 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h1 className={`text-3xl font-bold bg-gradient-to-r ${
                  theme === 'dark' 
                    ? 'from-green-400 to-blue-400 text-transparent bg-clip-text' 
                    : 'from-green-600 to-blue-600 text-transparent bg-clip-text'
                }`}>
                  Заработок команды
                </h1>
                <Sparkles className={`w-5 h-5 ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-500'} animate-pulse`} />
              </div>
              <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} text-sm`}>
                Отслеживайте доходы и вклад каждого участника в общий успех
              </p>
            </div>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className={`p-4 rounded-xl border-2 ${
              theme === 'dark' 
                ? 'bg-blue-500/10 border-blue-500/30' 
                : 'bg-blue-50 border-blue-200'
            }`}>
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg ${
                  theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-100'
                }`}>
                  <TrendingUp className={`w-5 h-5 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                </div>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Неделя</p>
              </div>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                {stats.weekTotal.toFixed(2)} ₽
              </p>
            </div>
            <div className={`p-4 rounded-xl border-2 ${
              theme === 'dark' 
                ? 'bg-purple-500/10 border-purple-500/30' 
                : 'bg-purple-50 border-purple-200'
            }`}>
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg ${
                  theme === 'dark' ? 'bg-purple-500/20' : 'bg-purple-100'
                }`}>
                  <PiggyBank className={`w-5 h-5 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} />
                </div>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Пул за неделю</p>
              </div>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`}>
                {stats.weekPool.toFixed(2)} ₽
              </p>
            </div>
            <div className={`p-4 rounded-xl border-2 ${
              theme === 'dark' 
                ? 'bg-green-500/10 border-green-500/30' 
                : 'bg-green-50 border-green-200'
            }`}>
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg ${
                  theme === 'dark' ? 'bg-green-500/20' : 'bg-green-100'
                }`}>
                  <Wallet className={`w-5 h-5 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} />
                </div>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Месяц</p>
              </div>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                {stats.monthTotal.toFixed(2)} ₽
              </p>
            </div>
            <div className={`p-4 rounded-xl border-2 ${
              theme === 'dark' 
                ? 'bg-orange-500/10 border-orange-500/30' 
                : 'bg-orange-50 border-orange-200'
            }`}>
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg ${
                  theme === 'dark' ? 'bg-orange-500/20' : 'bg-orange-100'
                }`}>
                  <PiggyBank className={`w-5 h-5 ${theme === 'dark' ? 'text-orange-400' : 'text-orange-600'}`} />
                </div>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Пул за месяц</p>
              </div>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-orange-400' : 'text-orange-600'}`}>
                {stats.monthPool.toFixed(2)} ₽
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-gray-700/50 dark:border-gray-700">
            <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Управление заработком</h2>
            <button
              onClick={() => {
                setEditingEarning(null)
                setShowForm(true)
              }}
              className="w-full sm:w-auto px-4 py-2.5 text-sm sm:text-base bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl transition-all duration-200 flex items-center justify-center gap-2 font-medium shadow-lg shadow-green-500/30 hover:shadow-green-500/50 hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              Добавить заработок
            </button>
          </div>
        </div>

        {/* Earnings statistics */}
        {loading ? (
          <div className={`rounded-xl p-8 text-center border-2 ${
            theme === 'dark' 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          } shadow-md`}>
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
              <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Загрузка данных...</p>
            </div>
          </div>
        ) : (
          <>
            <EarningsTable earnings={earnings} />
            <EarningsList
              earnings={earnings}
              onEdit={handleEdit}
              onDelete={loadEarnings}
            />
          </>
        )}

        {/* Form */}
        {showForm && (
          <EarningsForm
            onClose={handleCloseForm}
            onSave={handleSave}
            editingEarning={editingEarning}
          />
        )}
      </div>
    </Layout>
  )
}

