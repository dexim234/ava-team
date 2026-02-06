import { useState } from 'react'
import { useThemeStore } from '@/store/themeStore'
import { useAnalytics } from '@/hooks/useAnalytics'
import { AnalyticsCard } from './AnalyticsCard'
import { ArchiveAnalytics } from './ArchiveAnalytics'
import { 
    BarChart3, 
    Archive, 
    RefreshCw, 
    AlertCircle,
    TrendingUp,
    Clock,
    ArchiveRestore
} from 'lucide-react'

type TabType = 'polymatker' | 'spot'

export const AnalyticsList = ({ sphere }: { sphere: TabType }) => {
    const { theme } = useThemeStore()
    const [showArchive, setShowArchive] = useState(false)
    
    const { 
        analytics, 
        loading, 
        error, 
        archiveAnalytics, 
        deleteAnalytics, 
        refresh, 
        canDelete 
    } = useAnalytics(sphere, false)

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

    const handleArchive = async (id: string) => {
        const success = await archiveAnalytics(id)
        if (success) {
            // Analytics moved to archive
        }
    }

    const handleDelete = async (id: string) => {
        if (confirm('Вы уверены, что хотите удалить эту аналитику?')) {
            const success = await deleteAnalytics(id)
            if (success) {
                // Analytics deleted
            }
        }
    }

    if (showArchive) {
        return (
            <ArchiveAnalytics 
                sphere={sphere}
                onBack={() => setShowArchive(false)}
            />
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${config.color} text-white shadow-lg`}>
                        {config.icon}
                    </div>
                    <div>
                        <h2 className={`text-xl font-bold ${headingColor}`}>
                            {config.label}
                        </h2>
                        <p className={`text-sm ${subtleColor}`}>
                            Активная аналитика и сигналы
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowArchive(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white font-bold rounded-xl transition-all"
                    >
                        <Archive className="w-4 h-4" />
                        Архив
                    </button>
                    <button
                        onClick={refresh}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl transition-all disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Обновить
                    </button>
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
                        <p className={`text-lg font-medium ${headingColor}`}>Загрузка аналитики...</p>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {!loading && analytics.length === 0 && !error && (
                <div className={`text-center py-20 rounded-2xl border ${borderColor} ${cardBg}`}>
                    <div className="flex items-center justify-center w-20 h-20 rounded-full bg-blue-500/10 mx-auto mb-6">
                        {config.icon}
                    </div>
                    <h3 className={`text-xl font-bold ${headingColor} mb-2`}>
                        Аналитика отсутствует
                    </h3>
                    <p className={`${subtleColor} max-w-md mx-auto mb-6`}>
                        В разделе "{config.label}" пока нет активной аналитики. 
                        Создайте первую аналитику, чтобы начать.
                    </p>
                    <div className="flex items-center justify-center gap-2 text-sm text-blue-500">
                        <Clock className="w-4 h-4" />
                        Аналитика активна в течение 24 часов
                    </div>
                </div>
            )}

            {/* Analytics Grid */}
            {analytics.length > 0 && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                    {analytics.map((item) => (
                        <AnalyticsCard
                            key={item.id}
                            analytics={item}
                            onDelete={canDelete(item) ? handleDelete : undefined}
                            onArchive={!item.isExpired ? handleArchive : undefined}
                        />
                    ))}
                </div>
            )}

            {/* Stats Footer */}
            {!loading && analytics.length > 0 && (
                <div className={`flex items-center justify-between p-4 rounded-xl border ${borderColor} ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'}`}>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            <span className={`text-sm ${headingColor}`}>
                                Активных: {analytics.filter(a => !a.isExpired).length}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                            <span className={`text-sm ${headingColor}`}>
                                Истекают: {analytics.filter(a => {
                                    const timeLeft = a.expiresAt.getTime() - Date.now()
                                    return timeLeft > 0 && timeLeft < 24 * 60 * 60 * 1000
                                }).length}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <span className={`text-sm ${headingColor}`}>
                                Истекли: {analytics.filter(a => a.isExpired).length}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowArchive(true)}
                        className="flex items-center gap-2 text-sm text-blue-500 hover:text-blue-600 font-medium"
                    >
                        <ArchiveRestore className="w-4 h-4" />
                        Посмотреть архив
                    </button>
                </div>
            )}
        </div>
    )
}

export default AnalyticsList