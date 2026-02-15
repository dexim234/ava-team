import { useState, useEffect } from 'react'
import { AnalyticsModal } from '@/components/Analytics/AnalyticsModal'
import { AnalyticsViewModal } from '@/components/Analytics/AnalyticsViewModal'
import { AnalyticsReview, subscribeToAnalyticsReviews, getAnalyticsReviewById, deleteAnalyticsReview } from '@/services/analyticsService'
import { useThemeStore } from '@/store/themeStore'
import { Plus, Search, Archive } from 'lucide-react'
import { SLOT_CATEGORY_META, SlotCategory, TEAM_MEMBERS } from '@/types'
import { DeadlineFilter } from '@/components/Analytics/DeadlineFilter'
import { AnalyticsCards } from '@/components/Analytics/AnalyticsCards'
import { AnalyticsStatsCards } from '@/components/Analytics/AnalyticsStatsCards'
import { MemberSelector } from '@/components/Management/MemberSelector'
import { CATEGORY_ICONS } from '@/constants/common.tsx'
import { useAuthStore } from '@/store/authStore'
import { useLocation, useNavigate } from 'react-router-dom'
import { getUserNicknameAsync, getUserNicknameSync } from '@/utils/userUtils'

type DeadlineFilterType = 'all' | '<24h' | '<48h' | '<72h'

export const Analytics = () => {
    const { theme } = useThemeStore()
    const { user } = useAuthStore()
    const [activeDeadlineFilter, setActiveDeadlineFilter] = useState<DeadlineFilterType>('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedTraderId, setSelectedTraderId] = useState<string | null>(null)
    const [reviews, setReviews] = useState<AnalyticsReview[]>([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [showArchive, setShowArchive] = useState(false)
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
        const unsubscribe = subscribeToAnalyticsReviews(setReviews);
        return () => unsubscribe();
    }, [user])

    // Load nicknames for all authors when reviews change
    useEffect(() => {
        const authorIds = [...new Set(reviews.map(r => r.createdBy))]
        authorIds.forEach(userId => {
            getUserNicknameAsync(userId)
        })
    }, [reviews])

    const closeAnalyticsModal = () => {
        setIsModalOpen(false)
        setEditingReview(null)
        setIsViewMode(false)
        navigate(location.pathname, { replace: true })
    }

    const sphereOptions = [
        { id: 'all', name: 'Все', icon: CATEGORY_ICONS.all },
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
        const queryTerm = searchQuery.toLowerCase()

        return allReviews.filter(review => {
            // Поиск по номеру карточки
            const reviewNumber = review.number?.toString()
            if (reviewNumber && (`#${reviewNumber}`.includes(queryTerm) || `№${reviewNumber}`.includes(queryTerm) || reviewNumber.includes(queryTerm))) return true

            // Поиск по имени пользователя из TEAM_MEMBERS
            const authorMember = TEAM_MEMBERS.find(member => member.id === review.createdBy)
            if (authorMember && authorMember.name.toLowerCase().includes(queryTerm)) return true

            // Поиск по никнейму пользователя
            const authorNickname = getUserNicknameSync(review.createdBy)
            if (authorNickname && authorNickname.toLowerCase().includes(queryTerm)) return true

            // Поиск по ID автора
            if (review.createdBy.toLowerCase().includes(queryTerm)) return true

            // Поиск по активу
            if (review.asset && review.asset.toLowerCase().includes(queryTerm)) return true

            // Поиск по комментарию эксперта
            if (review.expertComment && review.expertComment.toLowerCase().includes(queryTerm)) return true

            // Поиск по ссылкам
            if (review.links && review.links.some(link => link.toLowerCase().includes(queryTerm))) return true

            // Поиск по сфере
            if (review.sphere && review.sphere.some(s =>
                s.toLowerCase().includes(queryTerm) ||
                (SLOT_CATEGORY_META[s as SlotCategory]?.label || '').toLowerCase().includes(queryTerm)
            )) return true
            
            return false
        })
    }

    const filterReviewsByTrader = (allReviews: AnalyticsReview[]) => {
        if (!selectedTraderId) return allReviews
        return allReviews.filter(review => review.createdBy === selectedTraderId)
    }

    // Проверка, является ли карточка архивной
    const isArchivedReview = (review: AnalyticsReview): boolean => {
        // Если разбор закрыт, проверяем архивацию по дате закрытия
        if (review.closed && review.closedAt) {
            const now = new Date().getTime()
            const closedTime = new Date(review.closedAt).getTime()
            // Архивируем на следующие сутки (24 часа после закрытия)
            const archiveTime = closedTime + 24 * 60 * 60 * 1000
            return now >= archiveTime
        }

        // Если разбор не закрыт, используем обычную логику с дедлайном
        if (!review.deadline) return false
        const now = new Date().getTime()
        const deadlineTime = new Date(review.deadline).getTime()
        return deadlineTime <= now
    }

    // Проверка, истек ли срок хранения в архиве (7 дней)
    const isArchiveExpired = (review: AnalyticsReview): boolean => {
        const now = new Date().getTime()
        const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000

        // Если разбор закрыт, считаем от даты закрытия
        if (review.closed && review.closedAt) {
            const closedTime = new Date(review.closedAt).getTime()
            // +1 сутки до попадания в архив + 7 дней хранения
            const expirationTime = closedTime + 24 * 60 * 60 * 1000 + sevenDaysInMs
            return now >= expirationTime
        }

        // Если разбор не закрыт, считаем от дедлайна
        if (!review.deadline) return false
        const deadlineTime = new Date(review.deadline).getTime()
        return (now - deadlineTime) > sevenDaysInMs
    }

    // Автоматическое удаление архивных карточек, которые хранятся более 7 дней
    useEffect(() => {
        const cleanupExpiredReviews = async () => {
            const expiredReviews = reviews.filter(review =>
                isArchivedReview(review) && isArchiveExpired(review)
            )

            for (const review of expiredReviews) {
                try {
                    await deleteAnalyticsReview(review.id)
                    console.log(`Автоматически удалён архивный обзор: ${review.id}`)
                } catch (error) {
                    console.error(`Ошибка при удалении архивного обзора ${review.id}:`, error)
                }
            }
        }

        cleanupExpiredReviews()
    }, [reviews])

    let filteredReviews = filterReviewsByDeadline(reviews)
    filteredReviews = filterReviewsBySearchQuery(filteredReviews)
    filteredReviews = filterReviewsByTrader(filteredReviews)

    // Разделяем на активные и архивные карточки
    const activeReviews = filteredReviews.filter(review => !isArchivedReview(review))
    const archivedReviews = filteredReviews.filter(review => isArchivedReview(review))


    return (
        <div className="flex min-h-screen">
            <div className="w-full space-y-6 p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                        <h1 className={`flex items-center gap-2 text-2xl md:text-3xl font-black tracking-tight ${headingColor}`}>
                            <span className="text-[#4C7F6E]">
                                {CATEGORY_ICONS.all}
                            </span>
                            LAB
                        </h1>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Селектор трейдеров */}
                        <div className="w-full md:w-48">
                            <MemberSelector
                                selectedUserId={selectedTraderId}
                                onSelect={setSelectedTraderId}
                            />
                        </div>
                        {/* Поиск */}
                        <div className="relative w-48">
                            <input
                                type="text"
                                placeholder="Поиск"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={`w-full pl-9 pr-3 py-2 rounded-xl border outline-none transition-all ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white focus:border-[#4C7F6E]/50' : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-[#4C7F6E]/30'}`}
                            />
                            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                        </div>
                        <button
                            onClick={openModal}
                            className="flex items-center justify-center w-10 h-10 rounded-xl font-medium transition-all bg-[#4C7F6E] hover:bg-[#3d6660] text-white"
                            title="Add Review"
                        >
                            <Plus size={20} />
                        </button>
                    </div>
                </div>

                {/* Фильтр дедлайна слева, кнопка Архив справа */}
                <div className="flex items-center justify-between">
                    <DeadlineFilter activeFilter={activeDeadlineFilter} setActiveFilter={setActiveDeadlineFilter} />
                    <button
                        onClick={() => setShowArchive(!showArchive)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                            showArchive
                                ? theme === 'dark'
                                    ? 'bg-amber-600 hover:bg-amber-500 text-white'
                                    : 'bg-amber-500 hover:bg-amber-600 text-white'
                                : theme === 'dark'
                                    ? 'bg-white/10 hover:bg-white/20 text-gray-300'
                                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }`}
                        title="Показать/скрыть архив"
                    >
                        <Archive size={18} />
                        <span>Архив</span>
                    </button>
                </div>

                <AnalyticsStatsCards reviews={showArchive ? archivedReviews : activeReviews} />

                {showArchive ? (
                    <>
                        <h2 className={`text-xl font-bold ${headingColor} mt-6`}>
                            Архив - LAB
                        </h2>
                        <AnalyticsCards
                            reviews={archivedReviews}
                            isArchive={true}
                            onEdit={(review) => {
                                setEditingReview(review)
                                setIsViewMode(false)
                                setIsModalOpen(true)
                                navigate(`${location.pathname}?reviewId=${review.id}`, { replace: true })
                            }}
                            onView={openViewModalFromCard}
                        />
                    </>
                ) : (
                    <AnalyticsCards
                        reviews={activeReviews}
                        isArchive={false}
                        onEdit={(review) => {
                            setEditingReview(review)
                            setIsViewMode(false)
                            setIsModalOpen(true)
                            navigate(`${location.pathname}?reviewId=${review.id}`, { replace: true })
                        }}
                        onView={openViewModalFromCard}
                    />
                )}

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
                        allReviews={reviews}
                    />
                )}
            </div>
        </div>
    )
}

export default Analytics
