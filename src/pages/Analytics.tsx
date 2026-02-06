import { useState, useEffect } from 'react'
import { useThemeStore } from '@/store/themeStore'
import { useAdminStore } from '@/store/adminStore'
import { useAuthStore } from '@/store/authStore'
import { useAccessControl } from '@/hooks/useAccessControl'
import {
    BarChart3,
    Rocket,
    Image as ImageIcon,
    Database,
    Wallet2,
    Zap,
    Gift,
    MoreHorizontal,
    Plus,
    Filter
} from 'lucide-react'
import { SphereSelector } from '@/components/Strategies/SphereSelector'
import { AnalyticsTable } from '@/components/Analytics/AnalyticsTable'
import { AnalyticsModal } from '@/components/Analytics/AnalyticsModal'
import { AnalyticsReview, subscribeToAnalyticsReviews } from '@/services/analyticsService'

type SphereType = 'all' | 'memecoins' | 'polymarket' | 'nft' | 'staking' | 'spot' | 'futures' | 'airdrop' | 'other'

export const Analytics = () => {
    const { theme } = useThemeStore()
    const { isAdmin } = useAdminStore()
    const { user } = useAuthStore()
    const [activeSphere, setActiveSphere] = useState<SphereType>('all')
    const [reviews, setReviews] = useState<AnalyticsReview[]>([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingReview, setEditingReview] = useState<AnalyticsReview | null>(null)

    const headingColor = theme === 'dark' ? 'text-white' : 'text-gray-900'
    const pageAccess = useAccessControl('tools_strategies_view')

    const spheres: { id: SphereType; label: string; icon: any }[] = [
        { id: 'all', label: 'Все', icon: <Filter className="w-4 h-4" /> },
        { id: 'memecoins', label: 'Мемкоины', icon: <Rocket className="w-4 h-4" /> },
        { id: 'polymarket', label: 'Polymarket', icon: <BarChart3 className="w-4 h-4" /> },
        { id: 'nft', label: 'NFT', icon: <ImageIcon className="w-4 h-4" /> },
        { id: 'staking', label: 'Стейкинг', icon: <Database className="w-4 h-4" /> },
        { id: 'spot', label: 'Спот', icon: <Wallet2 className="w-4 h-4" /> },
        { id: 'futures', label: 'Фьючерсы', icon: <Zap className="w-4 h-4" /> },
        { id: 'airdrop', label: 'AirDrop', icon: <Gift className="w-4 h-4" /> },
        { id: 'other', label: 'Прочее', icon: <MoreHorizontal className="w-4 h-4" /> },
    ]

    useEffect(() => {
        const unsubscribe = subscribeToAnalyticsReviews(setReviews, activeSphere)
        return () => unsubscribe()
    }, [activeSphere])

    if (pageAccess.loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-emerald-500 border-t-transparent"></div>
            </div>
        )
    }

    if (!pageAccess.hasAccess) {
        return (
            <div className="py-20 text-center space-y-4">
                <BarChart3 className="w-16 h-16 text-gray-700 mx-auto opacity-20" />
                <h3 className={`text-xl font-black ${headingColor}`}>Доступ ограничен</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                    {pageAccess.reason || 'У вас нет доступа к разделу Аналитика. Свяжитесь с администрацией.'}
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-white/5">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                        <BarChart3 className="w-8 h-8 text-emerald-500" />
                    </div>
                    <div>
                        <h1 className={`text-2xl md:text-3xl font-black tracking-tight ${headingColor}`}>
                            Analytics
                        </h1>
                        <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} whitespace-nowrap`}>
                            Expert analytical reviews and market insights
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="flex-1 sm:flex-none">
                        <SphereSelector
                            spheres={spheres}
                            activeSphere={activeSphere}
                            setActiveSphere={(id) => setActiveSphere(id as SphereType)}
                        />
                    </div>
                    {(isAdmin || user?.role === 'expert') && (
                        <button
                            onClick={() => {
                                setEditingReview(null)
                                setIsModalOpen(true)
                            }}
                            className="p-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>

            <AnalyticsTable
                reviews={reviews}
                onEdit={(review) => {
                    setEditingReview(review)
                    setIsModalOpen(true)
                }}
            />

            <AnalyticsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                review={editingReview}
            />
        </div>
    )
}

export default Analytics
