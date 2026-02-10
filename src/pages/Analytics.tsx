import { useState, useEffect } from 'react'
import { AnalyticsModal } from '@/components/Analytics/AnalyticsModal'
import { AnalyticsViewModal } from '@/components/Analytics/AnalyticsViewModal'
import { AnalyticsReview, subscribeToAnalyticsReviews, getAnalyticsReviewById } from '@/services/analyticsService'
import { useThemeStore } from '@/store/themeStore'
import { Plus, BarChart3, Search } from 'lucide-react'
import { SLOT_CATEGORY_META, SlotCategory } from '@/types'
import { DeadlineFilter } from '@/components/Analytics/DeadlineFilter'
import { AnalyticsCards } from '@/components/Analytics/AnalyticsCards'
import { AnalyticsStatsCards } from '@/components/Analytics/AnalyticsStatsCards'
import { CATEGORY_ICONS } from '@/constants/common.tsx'
import { MultiSelect } from '@/components/Call/MultiSelect'
import { useAuthStore } from '@/store/authStore'
import { useLocation, useNavigate } from 'react-router-dom'

type SphereType = 'all' | SlotCategory
type DeadlineFilterType = 'all' | '<24h' | '<48h' | '<72h'

export const Analytics = () => {
    const { theme } = useThemeStore()
    const { user } = useAuthStore()
    const [activeSphere, setActiveSphere] = useState<SphereType[]>(['all'])
    const [activeDeadlineFilter, setActiveDeadlineFilter] = useState<DeadlineFilterType>('all')
    const [searchQuery, setSearchQuery] = useState('') // Новое состояние для поискового запроса
    const [reviews, setReviews] = useState<AnalyticsReview[]>([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isViewMode, setIsViewMode] = useState(false)
    const [editingReview, setEditingReview] = useState<AnalyticsReview | null>(null)
    const location = useLocation()
    const navigate = useNavigate()

    const headingColor = theme === 'dark' ? 'text-white' : 'text-gray-900'

    const openModal = () => {
        setEditingReview(null)
        setIsViewMode(false)
        setIsModalOpen(true)
        navigate(location.pathname, { replace: true })
    }

    const openViewModalFromCard = async (reviewId: string) => {
        const reviewData = await getAnalyticsReviewById(reviewId)
        if (reviewData) {
            setEditingReview(reviewData)
            setIsViewMode(true)
            setIsModalOpen(true)
            navigate(`${location.pathname}?reviewId=${reviewId}`, { replace: true })
        } else {
            console.error('Обзор не найден:', reviewId)
        }
    }

    const handleEditFromView = (review: AnalyticsReview) => {
        setEditingReview(review)
        setIsViewMode(false)
        setIsModalOpen(true)
        navigate(`${location.pathname}?reviewId=${review.id}`, { replace: true })
    }

    const handleRatingSuccess = async (reviewId: string) => {
        const updatedReview = await getAnalyticsReviewById(reviewId)
        if (updatedReview) {
            setEditingReview(updatedReview)
        }
    }

    useEffect(() => {
        const params = new URLSearchParams(location.search)
        const reviewId = params.get('reviewId')

        const fetchAndOpenReview = async (id: string) => {
            const reviewData = await getAnalyticsReviewById(id)
            if (reviewData) {
                setEditingReview(reviewData)
                setIsViewMode(true)
                setIsModalOpen(true)
            }
        }

        if (reviewId && !isModalOpen) {
            fetchAndOpenReview(reviewId)
        } else if (!reviewId && isModalOpen && editingReview) {
            setIsModalOpen(false)
            setEditingReview(null)
            setIsViewMode(false)
        }
    }, [location.search, isModalOpen, editingReview])

    useEffect(() => {
        if (!user?.id) return
        const unsubscribe = subscribeToAnalyticsReviews(setReviews, activeSphere);
        return () => unsubscribe();
    }, [user, activeSphere])

    const handleSetActiveSphere = (ids: string[]) => {
        setActiveSphere(ids as SphereType[])
        navigate(location.pathname, { replace: true })
    }

    const closeAnalyticsModal = () => {
        setIsModalOpen(false)
        setEditingReview(null)
        setIsViewMode(false)
        navigate(location.pathname, { replace: true })
    }

    const sphereOptions = [
        { id: 'all', name: 'Все', icon: CATEGORY_ICONS.all },
        { id: 'other', name: 'Крипто-рынок', icon: CATEGORY_ICONS.other },
        ...Object.keys(SLOT_CATEGORY_META).map(key => ({
            id: key as SlotCategory,
            name: SLOT_CATEGORY_META[key as SlotCategory].label,
            icon: CATEGORY_ICONS[key] || CATEGORY_ICONS.all
        }))
    ].sort((a, b) => {
        const order = [
            'Крипто-рынок',
            'Мемкоины',
            'Polymarket',
            'NFT',
            'Стейкинг',
            'Спот',
            'Фьючерсы',
            'AirDrop',
        ]
        if (a.id === 'all') return -1
        if (b.id === 'all') return 1
        
        const aIndex = order.indexOf(a.name)
        const bIndex = order.indexOf(b.name)
        
        if (aIndex === -1 && bIndex === -1) return 0
        if (aIndex === -1) return 1
        if (bIndex === -1) return -1
        
        return aIndex - bIndex
    })

    const filterReviewsByDeadline = (allReviews: AnalyticsReview[]) => {
        const now = new Date().getTime()
        return allReviews.filter(review => {
            if (!review.deadline || activeDeadlineFilter === 'all') return true

            const deadlineTime = new Date(review.deadline).getTime()
            const diff = deadlineTime - now // Разница в миллисекундах

            const diffHours = diff / (1000 * 60 * 60)

            if (activeDeadlineFilter === '<24h') {
                return diffHours < 24 // Меньше 24 часов
            } else if (activeDeadlineFilter === '<48h') {
                return diffHours >= 24 && diffHours < 48 // От 24 до 48 часов
            } else if (activeDeadlineFilter === '<72h') {
                return diffHours >= 48 && diffHours < 72 // От 48 до 72 часов
            }

            return true
        })
    }

    const filterReviewsBySearchQuery = (allReviews: AnalyticsReview[]) => {
        if (!searchQuery) return allReviews
        const query = searchQuery.toLowerCase()

        return allReviews.filter(review => {
            // Поиск по номеру
            if (review.number && review.number.toString().includes(query)) return true
            // Поиск по активу
            if (review.asset && review.asset.toLowerCase().includes(query)) return true
            // Поиск по комментарию эксперта
            if (review.expertComment && review.expertComment.toLowerCase().includes(query)) return true
            // Поиск по ссылкам
            if (review.links && review.links.some(link => link.toLowerCase().includes(query))) return true
            // Поиск по сферам
            if (review.sphere && review.sphere.some(s => SLOT_CATEGORY_META[s as SlotCategory]?.label.toLowerCase().includes(query))) return true
            
            return false
        })
    }

    let filteredReviews = filterReviewsByDeadline(reviews)
    filteredReviews = filterReviewsBySearchQuery(filteredReviews)


    return (
        <div className="flex min-h-screen">
            <div className="w-full space-y-6 p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                        <h1 className={`flex items-center gap-2 text-2xl md:text-3xl font-black tracking-tight ${headingColor}`}>
                            <span className={theme === 'dark' ? 'text-emerald-400' : 'text-emerald-500'}>
                                {CATEGORY_ICONS.all}
                            </span>
                            Analytics
                        </h1>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Поиск */}
                        <div className="relative w-48">
                            <input
                                type="text"
                                placeholder="Поиск по разборам..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={`w-full pl-9 pr-3 py-2 rounded-xl border outline-none transition-all ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white focus:border-emerald-500/50' : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-emerald-500/30'}`}
                            />
                            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                        </div>

                        <div className="w-[180px]">
                            <MultiSelect
                                value={activeSphere as string[]}
                                onChange={(val) => handleSetActiveSphere(val)}
                                options={sphereOptions.map(sphere => ({ value: sphere.id || '', label: sphere.name, icon: sphere.icon }))}
                                placeholder="Все сферы"
                                searchable={true}
                                icon={<BarChart3 size={16} />}
                            />
                        </div>
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
                    </div>
                </div>

                <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
                    <DeadlineFilter activeFilter={activeDeadlineFilter} setActiveFilter={setActiveDeadlineFilter} />
                </div>

                <AnalyticsStatsCards reviews={filteredReviews} />

                <AnalyticsCards
                    reviews={filteredReviews}
                    onEdit={(review) => {
                        setEditingReview(review)
                        setIsViewMode(false)
                        setIsModalOpen(true)
                        navigate(`${location.pathname}?reviewId=${review.id}`, { replace: true })
                    }}
                    onView={openViewModalFromCard}
                />

                {isViewMode ? (
                    <AnalyticsViewModal
                        isOpen={isModalOpen}
                        onClose={closeAnalyticsModal}
                        review={editingReview}
                        onEditFromView={handleEditFromView}
                        onRatingSuccess={handleRatingSuccess}
                    />
                ) : (
                    <AnalyticsModal
                        isOpen={isModalOpen}
                        onClose={closeAnalyticsModal}
                        review={editingReview}
                        sphereOptions={sphereOptions}
                    />
                )}
            </div>
        </div>
    )
}

export default Analytics
