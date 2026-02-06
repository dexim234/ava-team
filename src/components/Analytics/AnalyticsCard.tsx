import { useState } from 'react'
import { useThemeStore } from '@/store/themeStore'
import { useAuthStore } from '@/store/authStore'
import { 
    BarChart3, 
    Wallet2, 
    Image as ImageIcon,
    ExternalLink, 
    Clock, 
    User,
    Calendar,
    Trash2,
    Archive
} from 'lucide-react'

interface AnalyticsData {
    id: string
    sphere: 'polymarket' | 'nft' | 'spot'
    asset?: string
    market?: string
    expertOpinion: string
    importantData: string
    signalLink?: string
    additionalLinks?: { url: string; comment: string }[]
    author: {
        id: string
        name: string
        avatar?: string
    }
    createdAt: Date
    expiresAt: Date
    isExpired?: boolean
}

interface AnalyticsCardProps {
    analytics: AnalyticsData
    onDelete?: (id: string) => void
    onArchive?: (id: string) => void
}

export const AnalyticsCard = ({ analytics, onDelete, onArchive }: AnalyticsCardProps) => {
    const { theme } = useThemeStore()
    const { user } = useAuthStore()
    const [showFull, setShowFull] = useState(false)
    
    const isAdmin = user?.role === 'admin'
    const isAuthor = user?.id === analytics.author.id
    const canDelete = isAdmin || isAuthor

    const headingColor = theme === 'dark' ? 'text-white' : 'text-gray-900'
    const cardBg = theme === 'dark' ? 'bg-gray-800' : 'bg-white'
    const borderColor = theme === 'dark' ? 'border-white/10' : 'border-gray-200'
    const subtleColor = theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
    const accentColor = analytics.isExpired ? 'text-red-500' : 'text-blue-500'

    const sphereConfig = {
        polymarket: { 
            icon: <BarChart3 className="w-5 h-5" />, 
            label: 'Polymarket',
            color: 'from-blue-500 to-purple-500'
        },
        nft: { 
            icon: <ImageIcon className="w-5 h-5" />, 
            label: 'NFT',
            color: 'from-purple-500 to-pink-500'
        },
        spot: { 
            icon: <Wallet2 className="w-5 h-5" />, 
            label: 'Спот/Фьючи',
            color: 'from-green-500 to-blue-500'
        }
    }

    const config = sphereConfig[analytics.sphere]
    const timeLeft = analytics.expiresAt.getTime() - Date.now()
    const isExpiring = timeLeft < 24 * 60 * 60 * 1000 // Less than 24 hours
    const isExpired = timeLeft <= 0

    const formatTimeLeft = () => {
        if (isExpired) return 'Истекла'
        
        const hours = Math.floor(timeLeft / (1000 * 60 * 60))
        const days = Math.floor(hours / 24)
        
        if (days > 0) return `${days}д ${hours % 24}ч`
        if (hours > 0) return `${hours}ч`
        return 'Менее часа'
    }

    const getStatusColor = () => {
        if (isExpired) return 'text-red-500'
        if (isExpiring) return 'text-orange-500'
        return 'text-green-500'
    }

    return (
        <div className={`rounded-2xl border ${borderColor} ${cardBg} shadow-sm overflow-hidden hover:shadow-lg transition-all`}>
            {/* Header */}
            <div className={`p-4 border-b ${borderColor} bg-gradient-to-r from-blue-500/5 to-purple-500/5`}>
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl bg-gradient-to-br ${config.color} text-white shadow-lg`}>
                            {config.icon}
                        </div>
                        <div>
                            <h3 className={`text-lg font-bold ${headingColor}`}>
                                Аналитика {config.label}
                                {analytics.asset && ` - ${analytics.asset}`}
                                {analytics.market && ` - ${analytics.market}`}
                            </h3>
                            <div className="flex items-center gap-3 mt-1">
                                <div className={`flex items-center gap-1 text-sm ${getStatusColor()}`}>
                                    <Clock className="w-3 h-3" />
                                    {formatTimeLeft()}
                                </div>
                                {isExpired && (
                                    <span className="text-xs text-red-500 font-medium">ИСТЕКЛА</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        {!isExpired && onArchive && (
                            <button
                                onClick={() => onArchive(analytics.id)}
                                className={`p-2 rounded-lg transition-colors hover:bg-yellow-500/20 text-yellow-500`}
                                title="Переместить в архив"
                            >
                                <Archive className="w-4 h-4" />
                            </button>
                        )}
                        {canDelete && (
                            <button
                                onClick={() => onDelete?.(analytics.id)}
                                className="p-2 rounded-lg transition-colors hover:bg-red-500/20 text-red-400"
                                title="Удалить"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Author */}
                <div className="flex items-center gap-3 mt-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold">
                        {analytics.author.avatar ? (
                            <img 
                                src={analytics.author.avatar} 
                                className="w-full h-full rounded-full object-cover" 
                                alt={analytics.author.name}
                            />
                        ) : (
                            <User className="w-4 h-4" />
                        )}
                    </div>
                    <div>
                        <p className={`text-sm font-bold ${headingColor}`}>
                            {analytics.author.name}
                        </p>
                        <div className="flex items-center gap-2">
                            <Calendar className={`w-3 h-3 ${subtleColor}`} />
                            <p className={`text-xs ${subtleColor}`}>
                                {analytics.createdAt.toLocaleDateString('ru-RU')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
                {/* Expert Opinion */}
                <div>
                    <h4 className={`text-sm font-bold ${headingColor} mb-2 flex items-center gap-2`}>
                        <BarChart3 className="w-4 h-4 text-blue-500" />
                        Мнение эксперта
                    </h4>
                    <div className={`text-sm ${headingColor} leading-relaxed ${!showFull && 'line-clamp-3'}`}>
                        {analytics.expertOpinion}
                    </div>
                </div>

                {/* Important Data */}
                <div>
                    <h4 className={`text-sm font-bold ${headingColor} mb-2`}>
                        Важные данные
                    </h4>
                    <div className={`text-sm ${headingColor} leading-relaxed ${!showFull && 'line-clamp-3'}`}>
                        {analytics.importantData}
                    </div>
                </div>

                {/* Links */}
                {(analytics.signalLink || analytics.additionalLinks?.length) && (
                    <div>
                        <h4 className={`text-sm font-bold ${headingColor} mb-2`}>
                            Ссылки
                        </h4>
                        <div className="space-y-2">
                            {analytics.signalLink && (
                                <a
                                    href={analytics.signalLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`flex items-center gap-2 text-sm ${accentColor} hover:underline`}
                                >
                                    <ExternalLink className="w-4 h-4" />
                                    Сигнал
                                </a>
                            )}
                            {analytics.additionalLinks?.map((link, index) => (
                                <a
                                    key={index}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`flex items-center gap-2 text-sm ${accentColor} hover:underline`}
                                >
                                    <ExternalLink className="w-4 h-4" />
                                    {link.comment}
                                </a>
                            ))}
                        </div>
                    </div>
                )}

                {/* Show More/Less Button */}
                {(analytics.expertOpinion.length > 150 || analytics.importantData.length > 150) && (
                    <button
                        onClick={() => setShowFull(!showFull)}
                        className={`text-sm font-medium ${accentColor} hover:underline`}
                    >
                        {showFull ? 'Свернуть' : 'Показать полностью'}
                    </button>
                )}
            </div>
        </div>
    )
}

export default AnalyticsCard