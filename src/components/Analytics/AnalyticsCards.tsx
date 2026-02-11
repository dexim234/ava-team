import { useState } from 'react'
import { useThemeStore } from '@/store/themeStore'
import { useAdminStore } from '@/store/adminStore'
import { useAuthStore } from '@/store/authStore'
import { AnalyticsReview, deleteAnalyticsReview } from '@/services/analyticsService'
import { UserNickname } from '@/components/UserNickname'
import { Edit, Trash2, Share, Camera, X } from 'lucide-react'
import { formatDate } from '@/utils/dateUtils'
import { SLOT_CATEGORY_META, SlotCategory } from '@/types'
import Avatar from '@/components/Avatar'
import { CountdownTimer, getDeadlineColor } from '@/components/Analytics/AnalyticsTable'
import { RatingDisplay } from './RatingDisplay'

interface AnalyticsCardsProps {
    reviews: AnalyticsReview[]
    onEdit: (review: AnalyticsReview) => void
    onView: (id: string) => void
}

export const AnalyticsCards = ({ reviews, onEdit, onView }: AnalyticsCardsProps) => {
    const { theme } = useThemeStore()
    const { isAdmin } = useAdminStore()
    const { user } = useAuthStore()
    const [screenshotModal, setScreenshotModal] = useState<{ url: string; asset: string } | null>(null)

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
        // Админ может редактировать всё
        if (isAdmin) return true
        // Автор может редактировать свои обзоры без ограничений по времени
        if (user?.id === review.createdBy) return true
        return false
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
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {reviews.map((review) => {
                    return (
                        <div
                            key={review.id}
                            onClick={() => onView(review.id)}
                            className={`${cardBg} rounded-2xl p-5 pt-12 border ${borderColor} shadow-lg transition-all hover:shadow-xl cursor-pointer relative`}
                        >
                            <div className="absolute top-4 left-5 right-5 flex items-center justify-between bg-transparent z-10">
                                {review.number && (
                                    <span className={`text-xs font-black px-2 py-1 rounded-lg ${theme === 'dark' ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
                                        #{review.number}
                                    </span>
                                )}
                                <div className="flex items-center gap-2">
                                    {review.screenshot && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                setScreenshotModal({ url: review.screenshot!, asset: review.asset || 'Без названия' })
                                            }}
                                            className="p-1.5 rounded-lg text-gray-400 hover:bg-white/10 transition-all"
                                            title="Просмотреть скриншот"
                                        >
                                            <Camera className="w-4 h-4" />
                                        </button>
                                    )}
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
                            </div>

                            <div className="flex flex-col gap-3 mb-4">
                                <span className={`text-[10px] px-2 py-1 rounded-lg font-bold uppercase tracking-wider border ${theme === 'dark' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-emerald-50 border-emerald-100 text-emerald-600'}`}>
                                    {review.sphere.map((s, _) => SLOT_CATEGORY_META[s as SlotCategory]?.label || s).join(', ')}
                                </span>
                            </div>

                            {review.asset && (
                                <div className="mb-3 flex items-center justify-between">
                                    <span className={`text-lg font-black tracking-tight ${textColor}`}>
                                        {review.asset}
                                    </span>
                                    {review.currentPrice && (
                                        <span className={`text-sm font-bold px-2 py-1 rounded-lg ${theme === 'dark' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-600'}`}>
                                            ${review.currentPrice}
                                        </span>
                                    )}
                                </div>
                            )}

                            <div className="mb-4">
                                <RatingDisplay ratings={review.ratings} theme={theme} />
                            </div>

                            <div className="flex items-center justify-between border-t border-b py-3 mb-4">
                                <div className="flex items-center gap-2">
                                    <Avatar userId={review.createdBy} size="sm" />
                                    <UserNickname userId={review.createdBy} className={`text-sm font-bold ${textColor}`} />
                                </div>
                                {review.deadline && (
                                    <div className={`text-right ${getDeadlineColor(review.deadline)}`}>
                                        <div className="text-xs font-bold">
                                            {formatDate(new Date(review.deadline), 'dd.MM.yyyy HH:mm')}
                                        </div>
                                        <div className="text-[10px] font-medium">
                                            <CountdownTimer deadline={review.deadline} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Screenshot Modal */}
            {screenshotModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={() => setScreenshotModal(null)}
                >
                    <div
                        className={`relative max-w-4xl w-full rounded-3xl overflow-hidden ${cardBg} shadow-2xl animate-in zoom-in-95 duration-300`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className={`p-4 border-b ${theme === 'dark' ? 'border-white/10' : 'border-gray-100'} flex items-center justify-between`}>
                            <span className={`font-bold ${textColor}`}>{screenshotModal.asset}</span>
                            <button
                                onClick={() => setScreenshotModal(null)}
                                className={`p-2 rounded-lg hover:bg-white/10 ${subTextColor}`}
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-4">
                            <img
                                src={screenshotModal.url}
                                alt="Screenshot"
                                className="w-full h-auto rounded-xl"
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
