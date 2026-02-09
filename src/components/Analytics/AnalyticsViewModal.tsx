import { useState } from 'react'
import { useThemeStore } from '@/store/themeStore'
import { useAuthStore } from '@/store/authStore'
import { AnalyticsReview, addOrUpdateReviewRating } from '@/services/analyticsService'
import { X, ExternalLink } from 'lucide-react'
import { SlotCategory } from '@/types'
import { format, parseISO } from 'date-fns'
import { SLOT_CATEGORY_META } from '@/types'
import { RatingDisplay } from './RatingDisplay'
import { RatingInput } from './RatingInput'
import { UserNickname } from '@/components/UserNickname'
import Avatar from '@/components/Avatar'
import { formatDate } from '@/utils/dateUtils'

interface AnalyticsViewModalProps {
    isOpen: boolean
    onClose: () => void
    review: AnalyticsReview | null
}

export const AnalyticsViewModal = ({ isOpen, onClose, review }: AnalyticsViewModalProps) => {
    const { theme } = useThemeStore()
    const { user } = useAuthStore()
    const [loading, setLoading] = useState(false)

    if (!isOpen || !review) return null

    const handleRateReview = async (ratingValue: number) => {
        if (!user || !review?.id) return
        setLoading(true)
        try {
            await addOrUpdateReviewRating(review.id, user.id, ratingValue)
            console.log('Оценка успешно сохранена!')
        } catch (error) {
            console.error('Ошибка при сохранении оценки:', error)
        } finally {
            setLoading(false)
        }
    }

    const bgColor = theme === 'dark' ? 'bg-[#0f141a]' : 'bg-white'
    const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900'
    const subTextColor = theme === 'dark' ? 'text-gray-400' : 'text-gray-500'

    const userRating = review.ratings?.find(r => r.userId === user?.id)?.value || null

    const parsedLinks = review.links?.map(link => {
        const parts = link.slice(-1) === '-' ? [link.slice(0, -1).trim()] : link.split(' - ')
        return { url: parts[0] || '', title: parts[1] || '' }
    }) || []

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className={`${bgColor} w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border ${theme === 'dark' ? 'border-white/10' : 'border-gray-100'}`}>
                <div className="flex items-center justify-between p-6 border-b border-white/5">
                    <h2 className={`text-xl font-black tracking-tight ${textColor}`}>
                        Аналитический обзор
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    {/* Автор и рейтинг */}
                    <div className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/5">
                        <div className="flex items-center gap-3">
                            <Avatar userId={review.createdBy} size="md" />
                            <div>
                                <UserNickname userId={review.createdBy} className={`text-sm font-bold ${textColor}`} />
                                <p className={`text-[10px] uppercase font-bold tracking-widest ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Автор обзора</p>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                            <RatingDisplay ratings={review.ratings} theme={theme} />
                            {user && user.id !== review.createdBy && (
                                <RatingInput
                                    currentRating={userRating}
                                    onRate={handleRateReview}
                                    theme={theme}
                                    disabled={loading}
                                />
                            )}
                        </div>
                    </div>

                    {/* Сфера */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Сфера</label>
                        <div className="flex flex-wrap gap-2">
                            {review.sphere.map((s, idx) => (
                                <span
                                    key={idx}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                                        theme === 'dark'
                                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                            : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                    }`}
                                >
                                    {SLOT_CATEGORY_META[s as SlotCategory]?.label || s}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Дедлайн */}
                    {review.deadline && (
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Дедлайн</label>
                            <div className={`px-4 py-3 rounded-xl border border-white/10 bg-white/5 ${textColor}`}>
                                {formatDate(new Date(review.deadline), 'dd.MM.yyyy HH:mm')}
                            </div>
                        </div>
                    )}

                    {/* Комментарий эксперта */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Комментарий эксперта</label>
                        <div className={`px-4 py-3 rounded-xl border border-white/10 bg-white/5 ${textColor} whitespace-pre-wrap`}>
                            {review.expertComment}
                        </div>
                    </div>

                    {/* Важные детали */}
                    {review.importantDetails && (
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Важные детали</label>
                            <div className={`px-4 py-3 rounded-xl border border-white/10 bg-white/5 ${textColor} whitespace-pre-wrap`}>
                                {review.importantDetails}
                            </div>
                        </div>
                    )}

                    {/* Ссылки */}
                    {parsedLinks.length > 0 && (
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Ссылки</label>
                            <div className="space-y-2">
                                {parsedLinks.map((link, index) => (
                                    link.url && (
                                        <a
                                            key={index}
                                            href={link.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`flex items-center gap-2 px-4 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all ${textColor}`}
                                        >
                                            <ExternalLink className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium truncate">{link.title || 'Ссылка'}</div>
                                                <div className={`text-xs ${subTextColor} truncate`}>{link.url}</div>
                                            </div>
                                        </a>
                                    )
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Дата создания */}
                    <div className="pt-2">
                        <p className={`text-[10px] uppercase font-bold tracking-widest ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                            Создано: {format(parseISO(review.createdAt), 'dd.MM.yyyy HH:mm')}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
