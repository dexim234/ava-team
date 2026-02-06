import { useState } from 'react'
import { useThemeStore } from '@/store/themeStore'
import { useAnalytics } from '@/hooks/useAnalytics'
import { AnalyticsCard } from './AnalyticsCard'
import { 
    ArrowLeft,
    Archive,
    Calendar,
    Clock,
    AlertCircle,
    RefreshCw,
    BarChart3,
    TrendingUp
} from 'lucide-react'

type TabType = 'polymatker' | 'spot'

interface ArchiveAnalyticsProps {
    sphere: TabType
    onBack: () => void
}

export const ArchiveAnalytics = ({ sphere, onBack }: ArchiveAnalyticsProps) => {
    const { theme } = useThemeStore()
    const [showExpiredOnly, setShowExpiredOnly] = useState(false)
    
    const { 
        analytics, 
        loading, 
        error, 
        deleteAnalytics, 
        refresh, 
        canDelete 
    } = useAnalytics(sphere, true)

    const headingColor = theme === 'dark' ? 'text-white' : 'text-gray-900'
    const cardBg = theme === 'dark' ? 'bg-gray-800' : 'bg-white'
    const borderColor = theme === 'dark' ? 'border-white/10' : 'border-gray-200'
    const subtleColor = theme === 'dark' ? 'text-gray-400' : 'text-gray-600'

    const sphereConfig = {
        polymatker: { 
            label: 'Polymarket',
            icon: <BarChart3 className="w-5 h-5" />,
            color: 'from-blue-500 to-purple-500'
        },
        spot: { 
            label: 'Спот и Фьючерсы',
            icon: <TrendingUp className="w-5 h-5" />,
            color: 'from-green-500 to-blue-500'
        }
    }

    const config = sphereConfig[sphere]

    const handleDelete = async (id: string) => {
        if (confirm('Вы уверены, что хотите окончательно удалить эту аналитику из архива?')) {
            const success = await deleteAnalytics(id)
            if (success) {
                // Analytics deleted from archive
            }
        }
    }

    // Filter analytics based on toggle
    const filteredAnalytics = showExpiredOnly 
        ? analytics.filter(a => a.isExpired)
        : analytics

    const expiredCount = analytics.filter(a => a.isExpired).length
    const archivedCount = analytics.filter(a => !a.isExpired).length

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${
                            theme === 'dark' 
                                ? 'hover:bg-white/10 text-gray-400' 
                                : 'hover:bg-gray-100 text-gray-600'
                        }`}
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Назад
                    </button>
                    <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${config.color} text-white shadow-lg`}>
                            <Archive className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className={`text-xl font-bold ${headingColor}`}>
                                Архив аналитики
                            </h2>
                            <p className={`text-sm ${subtleColor}`}>
                                {config.label} • Архивированная аналитика
                            </p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={refresh}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl transition-all disabled:opacity-50"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Обновить
                </button>
            </div>

            {/* Stats and Filter */}
            <div className={`flex items-center justify-between p-4 rounded-xl border ${borderColor} ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <Archive className={`w-4 h-4 ${subtleColor}`} />
                        <span className={`text-sm ${headingColor}`}>
                            Всего в архиве: {analytics.length}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-orange-500" />
                        <span className={`text-sm ${headingColor}`}>
                            Истекших: {expiredCount}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-green-500" />
                        <span className={`text-sm ${headingColor}`}>
                            Активных: {archivedCount}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={showExpiredOnly}
                            onChange={(e) => setShowExpiredOnly(e.target.checked)}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className={`text-sm ${headingColor}`}>
                            Только истекшие
                        </span>
                    </label>
                </div>
            </div>

            {/* Error State */}
            {error && (
                <div className={`flex items-center gap-3 p-4 rounded-xl border border-red-500/20 bg-red-500/10`}>
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <p className="text-red-500 font-medium">{error}</p>
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="flex items-center justify-center py-20">
                    <div className="flex items-center gap-3">
                        <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                        <p className={`text-lg font-medium ${headingColor}`}>Загрузка архива...</p>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {!loading && analytics.length === 0 && !error && (
                <div className={`text-center py-20 rounded-2xl border ${borderColor} ${cardBg}`}>
                    <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gray-500/10 mx-auto mb-6">
                        <Archive className="w-10 h-10 text-gray-500" />
                    </div>
                    <h3 className={`text-xl font-bold ${headingColor} mb-2`}>
                        Архив пуст
                    </h3>
                    <p className={`${subtleColor} max-w-md mx-auto`}>
                        В архиве "{config.label}" пока нет аналитики. 
                        Архивированная аналитика будет отображаться здесь.
                    </p>
                </div>
            )}

            {/* Empty Filtered State */}
            {!loading && analytics.length > 0 && filteredAnalytics.length === 0 && (
                <div className={`text-center py-20 rounded-2xl border ${borderColor} ${cardBg}`}>
                    <div className="flex items-center justify-center w-20 h-20 rounded-full bg-blue-500/10 mx-auto mb-6">
                        <Clock className="w-10 h-10 text-blue-500" />
                    </div>
                    <h3 className={`text-xl font-bold ${headingColor} mb-2`}>
                        {showExpiredOnly ? 'Нет истекшей аналитики' : 'Нет активной аналитики в архиве'}
                    </h3>
                    <p className={`${subtleColor} max-w-md mx-auto mb-6`}>
                        {showExpiredOnly 
                            ? 'В архиве нет аналитики с истекшим временем действия.'
                            : 'В архиве нет активной аналитики. Показываются только истекшие записи.'
                        }
                    </p>
                    <button
                        onClick={() => setShowExpiredOnly(!showExpiredOnly)}
                        className="text-blue-500 hover:text-blue-600 font-medium"
                    >
                        {showExpiredOnly ? 'Показать все' : 'Показать только истекшие'}
                    </button>
                </div>
            )}

            {/* Analytics Grid */}
            {filteredAnalytics.length > 0 && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                    {filteredAnalytics.map((item) => (
                        <AnalyticsCard
                            key={item.id}
                            analytics={item}
                            onDelete={canDelete(item) ? handleDelete : undefined}
                        />
                    ))}
                </div>
            )}

            {/* Archive Info */}
            {analytics.length > 0 && (
                <div className={`flex items-center justify-between p-4 rounded-xl border ${borderColor} ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'}`}>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        Архивированная аналитика автоматически удаляется через 7 дней
                    </div>
                    <div className="text-sm text-gray-500">
                        Показано: {filteredAnalytics.length} из {analytics.length}
                    </div>
                </div>
            )}
        </div>
    )
}

export default ArchiveAnalytics