import { useState, useEffect } from 'react'
import { AnalyticsModal } from '@/components/Analytics/AnalyticsModal'
import { AnalyticsReview, subscribeToAnalyticsReviews } from '@/services/analyticsService'
import { StrategyTabSelector } from '@/components/Strategies/StrategyTabSelector'
import { useThemeStore } from '@/store/themeStore'
import { useAuthStore } from '@/store/authStore'
import { Plus, BarChart3 } from 'lucide-react'
import { SLOT_CATEGORY_META, SlotCategory } from '@/types'
import { DeadlineFilter } from '@/components/Analytics/DeadlineFilter'
import { AnalyticsCards } from '@/components/Analytics/AnalyticsCards' // Будет создан

type SphereType = 'all' | 'memecoins' | 'polymarket' | 'nft' | 'staking' | 'spot' | 'futures' | 'airdrop' | 'other'
type DeadlineFilterType = 'all' | '<24h' | '<48h' | '<72h'

export const Analytics = () => {
    const { theme } = useThemeStore()
    const { user } = useAuthStore()
    const [activeSphere, setActiveSphere] = useState<SphereType>('all')
    const [activeDeadlineFilter, setActiveDeadlineFilter] = useState<DeadlineFilterType>('all')
    const [reviews, setReviews] = useState<AnalyticsReview[]>([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingReview, setEditingReview] = useState<AnalyticsReview | null>(null)

    const headingColor = theme === 'dark' ? 'text-white' : 'text-gray-900'

    const openModal = () => {
        setEditingReview(null)
        setIsModalOpen(true)
    }

    useEffect(() => {
        console.log('Current user:', user) // Diagnostic log
        const unsubscribe = subscribeToAnalyticsReviews(setReviews, activeSphere)
        return () => unsubscribe()
    }, [activeSphere, user])

    const handleSetActiveSphere = (id: string | null) => {
        setActiveSphere(id as SphereType)
    }

    const sphereOptions = [
        { id: 'all', name: 'Все', icon: <BarChart3 size={20} /> },
        ...Object.keys(SLOT_CATEGORY_META).map(key => ({
            id: key as SphereType,
            name: SLOT_CATEGORY_META[key as SlotCategory].label,
            icon: <BarChart3 size={20} />
        })),
        { id: 'other', name: 'Крипто-рынок', icon: <BarChart3 size={20} /> }
    ];

    const filterReviewsByDeadline = (allReviews: AnalyticsReview[]) => {
        const now = new Date().getTime()
        return allReviews.filter(review => {
            if (!review.deadline || activeDeadlineFilter === 'all') return true

            const deadlineTime = new Date(review.deadline).getTime()
            const diffHours = (deadlineTime - now) / (1000 * 60 * 60)

            if (activeDeadlineFilter === '<24h') return diffHours < 24 && diffHours > 0
            if (activeDeadlineFilter === '<48h') return diffHours < 48 && diffHours > 0
            if (activeDeadlineFilter === '<72h') return diffHours < 72 && diffHours > 0
            
            return true
        })
    }

    const filteredReviews = filterReviewsByDeadline(reviews)

    return (
        <div className="flex min-h-screen">
            <div className="w-full space-y-6 p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                        <h1 className={`flex items-center gap-2 text-2xl md:text-3xl font-black tracking-tight ${headingColor}`}>
                            <BarChart3 size={28} className="text-emerald-500" />
                            Analytics
                        </h1>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <StrategyTabSelector
                            strategies={sphereOptions}
                            activeStrategy={activeSphere}
                            setActiveStrategy={handleSetActiveSphere}
                        />
                        {user && (
                            <button
                                onClick={openModal}
                                className={`flex items-center justify-center w-10 h-10 rounded-xl font-medium transition-all ${theme === 'dark'
                                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                    : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                                    }`}
                                title="Add Review"
                            >
                                <Plus size={20} />
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
                    <DeadlineFilter activeFilter={activeDeadlineFilter} setActiveFilter={setActiveDeadlineFilter} />
                </div>

                <AnalyticsCards
                    reviews={filteredReviews}
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
        </div>
    )
}

export default Analytics
