import { useThemeStore } from '@/store/themeStore'
import { useAdminStore } from '@/store/adminStore'
import { useAuthStore } from '@/store/authStore'
import { AnalyticsReview, deleteAnalyticsReview } from '@/services/analyticsService'
import { UserNickname } from '@/components/UserNickname'
import { Edit, Trash2, ExternalLink } from 'lucide-react'
import { formatDate } from '@/utils/dateUtils'
import { SLOT_CATEGORY_META, SlotCategory } from '@/types'
import Avatar from '@/components/Avatar'
import { CountdownTimer, getDeadlineColor } from '@/components/Analytics/AnalyticsTable'
import { useState } from 'react'

interface AnalyticsCardsProps {
    reviews: AnalyticsReview[]
    onEdit: (review: AnalyticsReview) => void
}

export const AnalyticsCards = ({ reviews, onEdit }: AnalyticsCardsProps) => {
    const { theme } = useThemeStore()
    const { isAdmin } = useAdminStore()
    const { user } = useAuthStore()

    const cardBg = theme === 'dark' ? 'bg-[#0f141a]' : 'bg-white'
    const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900'
    const subTextColor = theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
    const borderColor = theme === 'dark' ? 'border-white/10' : 'border-gray-200'

    const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({}) 

    const toggleExpanded = (id: string) => {
        setExpandedCards(prev => ({
            ...prev,
            [id]: !prev[id]
        }))
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

    if (reviews.length === 0) {
        return (
            <div className={`p-10 text-center rounded-2xl border border-dashed ${theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50'}`}>
                <p className={subTextColor}>Аналитических обзоров в этой сфере не найдено.</p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reviews.map((review) => (
                <div key={review.id} className={`${cardBg} rounded-2xl p-5 border ${borderColor} shadow-lg transition-all hover:shadow-xl`}>
                    <div className="flex items-center justify-between mb-4">
                        <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider border ${theme === 'dark' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-emerald-50 border-emerald-100 text-emerald-600'}`}>
                            {SLOT_CATEGORY_META[review.sphere as SlotCategory]?.label || review.sphere}
                        </span>
                        <div className="flex items-center gap-2">
                            {canEdit(review) && (
                                <button
                                    onClick={() => onEdit(review)}
                                    className="p-1.5 rounded-lg text-gray-400 hover:bg-white/10 transition-all"
                                    title="Редактировать"
                                >
                                    <Edit className="w-4 h-4" />
                                </button>
                            )}
                            {(isAdmin || user?.id === review.createdBy) && (
                                <button
                                    onClick={() => handleDelete(review.id)}
                                    className="p-1.5 rounded-lg text-gray-400 hover:bg-white/10 transition-all"
                                    title="Удалить"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    {expandedCards[review.id] && (
                        <>
                            <p className={`text-lg font-bold mb-2 ${textColor} whitespace-pre-wrap`}>{review.expertComment}</p>
                            <p className={`text-sm mb-4 ${subTextColor} whitespace-pre-wrap`}>{review.importantDetails}</p>
                        </>
                    )}

                    <div className="flex items-center justify-between border-t border-b py-3 mb-4">
                        <div className="flex items-center gap-2">
                            <Avatar userId={review.createdBy} size="sm" />
                            <UserNickname userId={review.createdBy} className={`text-sm font-bold ${textColor}`} />
                        </div>
                        {review.deadline && (
                            <div className={`text-sm font-bold ${getDeadlineColor(review.deadline)}`}>
                                {formatDate(new Date(review.deadline), 'dd.MM.yyyy HH:mm')} {/* Формат для карточек */}
                                <span className="ml-2"><CountdownTimer deadline={review.deadline} /></span>
                            </div>
                        )}
                    </div>

                    {review.links && review.links.length > 0 && expandedCards[review.id] && (
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
                                        className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-all flex items-center gap-1"
                                    >
                                        <ExternalLink className="w-3 h-3" /> {title}
                                    </a>
                                )
                            })}
                        </div>
                    )}
                     <button
                        onClick={() => toggleExpanded(review.id)}
                        className={`mt-4 w-full text-center py-2 rounded-lg transition-colors ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'}`}
                    >
                        {expandedCards[review.id] ? 'Скрыть детали' : 'Показать детали'}
                    </button>
                </div>
            ))}
        </div>
    )
}
