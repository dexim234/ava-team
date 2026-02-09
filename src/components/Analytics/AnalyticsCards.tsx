import { useThemeStore } from '@/store/themeStore'
import { useAdminStore } from '@/store/adminStore'
import { useAuthStore } from '@/store/authStore'
import { AnalyticsReview, deleteAnalyticsReview, addOrUpdateReviewRating } from '@/services/analyticsService' // Добавляем addOrUpdateReviewRating
import { UserNickname } from '@/components/UserNickname'
import { Edit, Trash2, ExternalLink, Share } from 'lucide-react'
import { formatDate } from '@/utils/dateUtils'
import { SLOT_CATEGORY_META, SlotCategory } from '@/types'
import Avatar from '@/components/Avatar'
import { CountdownTimer, getDeadlineColor } from '@/components/Analytics/AnalyticsTable'
import { useState } from 'react'
import { RatingDisplay } from './RatingDisplay'
import { RatingInput } from './RatingInput' // Импортируем RatingInput

interface AnalyticsCardsProps {
    reviews: AnalyticsReview[]
    onEdit: (review: AnalyticsReview) => void
    onView: (id: string) => void // Новая проп-функция для открытия модалки просмотра
}

export const AnalyticsCards = ({ reviews, onEdit, onView }: AnalyticsCardsProps) => {
    const { theme } = useThemeStore()
    const { isAdmin } = useAdminStore()
    const { user } = useAuthStore()
    const [loadingRatings, setLoadingRatings] = useState<Record<string, boolean>>({}) // Состояние для загрузки оценки

    const cardBg = theme === 'dark' ? 'bg-[#0f141a]' : 'bg-white'
    const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900'
    const subTextColor = theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
    const borderColor = theme === 'dark' ? 'border-white/10' : 'border-gray-200'

    const handleCopyLink = (reviewId: string) => {
        const link = `${window.location.origin}/analytics?reviewId=${reviewId}`
        navigator.clipboard.writeText(link)
            .then(() => {
                console.log('Ссылка скопирована!', link)
            })
            .catch(err => {
                console.error('Не удалось скопировать ссылку: ', err)
            })
    }

    const canEdit = (review: AnalyticsReview) => {
        if (isAdmin) return true
        if (user?.id !== review.createdBy) return false

        const createdAt = new Date(review.createdAt).getTime()
        const now = new Date().getTime()
        return (now - createdAt) < 30 * 60 * 1000
    }

    const handleDelete = async (id: string) => {
        if (confirm('Вы уверены, что хотите удалить этот обзор?')) {
            await deleteAnalyticsReview(id)
        }
    }

    const handleRateReview = async (reviewId: string, ratingValue: number) => {
        if (!user || !reviewId) return
        setLoadingRatings(prev => ({ ...prev, [reviewId]: true }))
        try {
            await addOrUpdateReviewRating(reviewId, user.id, ratingValue)
            console.log('Оценка успешно сохранена!')
            // Здесь не нужно обновлять состояние reviews, так как это делается через subscribeToAnalyticsReviews в Analytics.tsx
        } catch (error) {
            console.error('Ошибка при сохранении оценки:', error)
        } finally {
            setLoadingRatings(prev => ({ ...prev, [reviewId]: false }))
        }
    }

    if (reviews.length === 0) {
        return (
            <div className={`p-10 text-center rounded-2xl border border-dashed ${theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50'}`}>
                <p className={subTextColor}>Аналитических обзоров в этой сфере не найдено.</p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reviews.map((review) => {
                const userRating = review.ratings?.find(r => r.userId === user?.id)?.value || null
                return (
                    <div
                        key={review.id}
                        onClick={() => onView(review.id)}
                        className={`${cardBg} rounded-2xl p-5 border ${borderColor} shadow-lg transition-all hover:shadow-xl cursor-pointer relative`}
                    >
                        <div className="absolute top-4 right-4 flex items-center gap-2 bg-transparent z-10">
                            <button
                                onClick={(e) => { e.stopPropagation(); handleCopyLink(review.id) }}
                                className="p-1.5 rounded-lg text-gray-400 hover:bg-white/10 transition-all"
                                title="Копировать ссылку"
                            >
                                <Share className="w-4 h-4" />
                            </button>
                            {canEdit(review) && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onEdit(review) }}
                                    className="p-1.5 rounded-lg text-gray-400 hover:bg-white/10 transition-all"
                                    title="Редактировать"
                                >
                                    <Edit className="w-4 h-4" />
                                </button>
                            )}
                            {(isAdmin || user?.id === review.createdBy) && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleDelete(review.id) }}
                                    className="p-1.5 rounded-lg text-gray-400 hover:bg-white/10 transition-all"
                                    title="Удалить"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        <div className="flex items-center justify-between mb-4">
                            <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider border ${theme === 'dark' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-emerald-50 border-emerald-100 text-emerald-600'}`}>
                                {review.sphere.map((s, _) => SLOT_CATEGORY_META[s as SlotCategory]?.label || s).join(', ')}
                            </span>
                        </div>

                        <p className={`text-lg font-bold mb-2 ${textColor} whitespace-pre-wrap`}>{review.expertComment}</p>
                        {review.importantDetails && <p className={`text-sm mb-4 ${subTextColor} whitespace-pre-wrap`}>{review.importantDetails}</p>}

                        <div className="mb-4 flex items-center justify-between">
                            <RatingDisplay ratings={review.ratings} theme={theme} />
                            {user && user.id !== review.createdBy && (
                                <RatingInput
                                    currentRating={userRating}
                                    onRate={(ratingValue) => handleRateReview(review.id, ratingValue)}
                                    theme={theme}
                                    disabled={loadingRatings[review.id] || false}
                                />
                            )}
                        </div>

                        <div className="flex items-center justify-between border-t border-b py-3 mb-4">
                            <div className="flex items-center gap-2">
                                <Avatar userId={review.createdBy} size="sm" />
                                <UserNickname userId={review.createdBy} className={`text-sm font-bold ${textColor}`} />
                            </div>
                            {review.deadline && (
                                <div className={`text-sm font-bold ${getDeadlineColor(review.deadline)}`}>
                                    {formatDate(new Date(review.deadline), 'dd.MM.yyyy HH:mm')}
                                    <span className="ml-2"><CountdownTimer deadline={review.deadline} /></span>
                                </div>
                            )}
                        </div>

                        {review.links && review.links.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {review.links.map((link, idx) => {
                                    const parts = link.split(' - ')
                                    const url = parts[0]
                                    const title = parts[1] || 'Ссылка'
                                    return (
                                        <a
                                            key={idx}
                                            href={url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                            className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-all flex items-center gap-1"
                                        >
                                            <ExternalLink className="w-3 h-3" /> {title}
                                        </a>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )
}
