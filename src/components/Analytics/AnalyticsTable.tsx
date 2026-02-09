import { useThemeStore } from '@/store/themeStore'
import { useAdminStore } from '@/store/adminStore'
import { useAuthStore } from '@/store/authStore'
import { AnalyticsReview, deleteAnalyticsReview } from '@/services/analyticsService'
import { UserNickname } from '@/components/UserNickname'
import { Edit, Trash2, ExternalLink } from 'lucide-react'
import { formatDate } from '@/utils/dateUtils'
import { SLOT_CATEGORY_META, SlotCategory } from '@/types'
import { useEffect, useState } from 'react'
import Avatar from '@/components/Avatar'

interface AnalyticsTableProps {
    reviews: AnalyticsReview[]
    onEdit: (review: AnalyticsReview) => void
}

export const CountdownTimer = ({ deadline }: { deadline: string }) => {
    const calculateTimeLeft = () => {
        const difference = +new Date(deadline) - +new Date()
        let timeLeft = {
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0
        }

        if (difference > 0) {
            timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60)
            }
        }
        return timeLeft
    }

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft())

    useEffect(() => {
        const timer = setTimeout(() => {
            setTimeLeft(calculateTimeLeft())
        }, 1000)

        return () => clearTimeout(timer)
    })

    const { days, hours, minutes, seconds } = timeLeft

    return (
        <span>
            {days > 0 && `${days}д `}
            {hours.toString().padStart(2, '0')}:
            {minutes.toString().padStart(2, '0')}:
            {seconds.toString().padStart(2, '0')}
        </span>
    )
}

export const getDeadlineColor = (deadline: string) => {
    const difference = +new Date(deadline) - +new Date()
    const hours = difference / (1000 * 60 * 60)

    if (hours < 24) return 'text-red-500' // less than 24 hours
    if (hours < 48) return 'text-yellow-500' // less than 48 hours
    if (hours < 72) return 'text-emerald-500' // less than 72 hours
    return 'text-gray-500' // more than 72 hours
}

export const AnalyticsTable = ({ reviews, onEdit }: AnalyticsTableProps) => {
    const { theme } = useThemeStore()
    const { isAdmin } = useAdminStore()
    const { user } = useAuthStore()

    const headingColor = theme === 'dark' ? 'text-white' : 'text-gray-900'
    const subTextColor = theme === 'dark' ? 'text-gray-400' : 'text-gray-500'

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
        <div className={`rounded-2xl ${theme === 'dark' ? 'bg-[#0b1015]' : 'bg-white'} overflow-hidden border ${theme === 'dark' ? 'border-white/5' : 'border-gray-100 shadow-sm'}`}>
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className={theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'}>
                            <th className={`p-4 text-center text-[10px] font-bold uppercase tracking-wider ${subTextColor} w-32`}>Сфера</th>
                            <th className={`p-4 text-center text-[10px] font-bold uppercase tracking-wider ${subTextColor}`}>Комментарий эксперта</th>
                            <th className={`p-4 text-center text-[10px] font-bold uppercase tracking-wider ${subTextColor}`}>Важные детали</th>
                            <th className={`p-4 text-center text-[10px] font-bold uppercase tracking-wider ${subTextColor} w-32`}>Дата</th>
                            <th className={`p-4 text-center text-[10px] font-bold uppercase tracking-wider ${subTextColor} w-32`}>Время</th>
                            <th className={`p-4 text-center text-[10px] font-bold uppercase tracking-wider ${subTextColor} w-24`}>Ссылки</th>
                            <th className={`p-4 text-center text-[10px] font-bold uppercase tracking-wider ${subTextColor} w-32`}>Эксперт</th>
                            <th className={`p-4 text-center text-[10px] font-bold uppercase tracking-wider ${subTextColor} w-24`}>Действия</th>
                        </tr>
                    </thead>
                    <tbody className={`divide-y ${theme === 'dark' ? 'divide-white/5' : 'divide-gray-100'}`}>
                        {reviews.map((review) => (
                            <tr key={review.id} className="hover:bg-emerald-500/5 transition-colors group">
                                <td className="p-4 align-top text-center">
                                    {review.sphere.map((s, index) => (
                                        <span key={index} className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider border ${theme === 'dark' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-emerald-50 border-emerald-100 text-emerald-600'} ${index > 0 ? 'ml-1' : ''}`}>
                                            {SLOT_CATEGORY_META[s as SlotCategory]?.label || s}
                                        </span>
                                    ))}
                                </td>
                                <td className={`p-4 align-top text-center text-sm font-medium ${headingColor} whitespace-pre-wrap max-w-sm`}>
                                    {review.expertComment}
                                </td>
                                <td className={`p-4 align-top text-center text-sm ${subTextColor} whitespace-pre-wrap max-w-sm`}>
                                    {review.importantDetails}
                                </td>
                                <td className={`p-4 align-top text-center text-xs font-bold ${review.deadline ? getDeadlineColor(review.deadline) : 'text-gray-500'}`}>
                                    {review.deadline ? formatDate(new Date(review.deadline), 'dd.MM.yyyy') : '-'}
                                </td>
                                <td className={`p-4 align-top text-center text-xs font-bold ${review.deadline ? getDeadlineColor(review.deadline) : 'text-gray-500'}`}>
                                    {review.deadline && <CountdownTimer deadline={review.deadline} />}                                </td>
                                <td className="p-4 align-top text-center">
                                    {review.links && review.links.length > 0 && (
                                        <div className="flex justify-center gap-1">
                                            {review.links.map((link, idx) => (
                                                <a
                                                    key={idx}
                                                    href={link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-all"
                                                    title={link}
                                                >
                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                </td>
                                <td className="p-4 align-top text-center">
                                    <div className="flex items-center gap-2 justify-center">
                                        <Avatar userId={review.createdBy} size="sm" />
                                        <UserNickname userId={review.createdBy} className={`text-sm font-bold ${headingColor}`} />
                                    </div>
                                </td>
                                <td className="p-4 align-top text-center">
                                    <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {canEdit(review) && (
                                            <button
                                                onClick={() => onEdit(review)}
                                                className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-all"
                                                title="Редактировать"
                                            >
                                                <Edit className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                        {(isAdmin || user?.id === review.createdBy) && (
                                            <button
                                                onClick={() => handleDelete(review.id)}
                                                className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-all"
                                                title="Удалить"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}