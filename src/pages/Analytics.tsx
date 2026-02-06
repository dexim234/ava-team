import { useState, useEffect } from 'react'
import { AnalyticsTable } from '@/components/Analytics/AnalyticsTable'
import { AnalyticsModal } from '@/components/Analytics/AnalyticsModal'
import { AnalyticsReview, subscribeToAnalyticsReviews } from '@/services/analyticsService'
import { SphereSelector } from '@/components/Strategies/SphereSelector'
import { useThemeStore } from '@/store/themeStore'
import { useAuthStore } from '@/store/authStore'
import { Plus, BarChart3 } from 'lucide-react'
import { SLOT_CATEGORY_META, SlotCategory } from '@/types'

type SphereType = 'all' | 'memecoins' | 'polymarket' | 'nft' | 'staking' | 'spot' | 'futures' | 'airdrop' | 'other'

export const Analytics = () => {
    const { theme } = useThemeStore()
    const { user } = useAuthStore()
    const [activeSphere, setActiveSphere] = useState<SphereType>('all')
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

    const handleSetActiveSphere = (id: string) => {
        setActiveSphere(id as SphereType)
    }

    const sphereOptions = [
        { id: 'all', label: 'Все', icon: <BarChart3 size={20} /> },
        ...Object.keys(SLOT_CATEGORY_META).map(key => ({
            id: key as SphereType,
            label: SLOT_CATEGORY_META[key as SlotCategory].label,
            icon: <BarChart3 size={20} />
        })),
        { id: 'other', label: 'Прочее', icon: <BarChart3 size={20} /> }
    ];

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
                        <SphereSelector
                            spheres={sphereOptions}
                            activeSphere={activeSphere}
                            setActiveSphere={handleSetActiveSphere}
                        />
                        {user && (
                            <button
                                onClick={openModal}
                                className={`flex items-center justify-center p-2 rounded-xl font-medium transition-all ${theme === 'dark'
                                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                    : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                                    }`}
                                title="Add Review"
                            >
                                <Plus size={18} />
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
        </div>
    )
}

export default Analytics
