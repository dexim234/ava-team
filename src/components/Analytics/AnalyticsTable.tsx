import { useThemeStore } from '@/store/themeStore'
import { useAdminStore } from '@/store/adminStore'
import { useAuthStore } from '@/store/authStore'
import { AnalyticsReview, deleteAnalyticsReview } from '@/services/analyticsService'
import { UserNickname } from '@/components/UserNickname'
import { Edit, Trash2, ExternalLink, Info, clock } from 'lucide-react'
import { formatDate } from '@/utils/dateUtils'
import { SLOT_CATEGORY_META, SlotCategory } from '@/types'

interface AnalyticsTableProps {
    reviews: AnalyticsReview[]
    onEdit: (review: AnalyticsReview) => void
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

        // Expert can edit only within 30 minutes
        const createdAt = new Date(review.createdAt).getTime()
        const now = new Date().getTime()
        return (now - createdAt) < 30 * 60 * 1000
    }

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this review?')) {
            await deleteAnalyticsReview(id)
        }
    }

    if (reviews.length === 0) {
        return (
            <div className={`p-10 text-center rounded-2xl border border-dashed ${theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50'}`}>
                <p className={subTextColor}>No analytical reviews found for this sphere.</p>
            </div>
        )
    }

    return (
        <div className={`rounded-2xl ${theme === 'dark' ? 'bg-[#0b1015]' : 'bg-white'} overflow-hidden border ${theme === 'dark' ? 'border-white/5' : 'border-gray-100 shadow-sm'}`}>
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className={theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'}>
                            <th className={`p-4 text-left text-[10px] font-bold uppercase tracking-wider ${subTextColor} w-32`}>Sphere</th>
                            <th className={`p-4 text-left text-[10px] font-bold uppercase tracking-wider ${subTextColor}`}>Expert Comment</th>
                            <th className={`p-4 text-left text-[10px] font-bold uppercase tracking-wider ${subTextColor}`}>Important Details</th>
                            <th className={`p-4 text-center text-[10px] font-bold uppercase tracking-wider ${subTextColor} w-32`}>Deadline</th>
                            <th className={`p-4 text-center text-[10px] font-bold uppercase tracking-wider ${subTextColor} w-24`}>Links</th>
                            <th className={`p-4 text-left text-[10px] font-bold uppercase tracking-wider ${subTextColor} w-32`}>Expert</th>
                            <th className={`p-4 text-right text-[10px] font-bold uppercase tracking-wider ${subTextColor} w-24`}>Actions</th>
                        </tr>
                    </thead>
                    <tbody className={`divide-y ${theme === 'dark' ? 'divide-white/5' : 'divide-gray-100'}`}>
                        {reviews.map((review) => (
                            <tr key={review.id} className="hover:bg-emerald-500/5 transition-colors group">
                                <td className="p-4 align-top">
                                    <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider border ${theme === 'dark' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-emerald-50 border-emerald-100 text-emerald-600'
                                        }`}>
                                        {SLOT_CATEGORY_META[review.sphere as SlotCategory]?.label || review.sphere}
                                    </span>
                                </td>
                                <td className={`p-4 align-top text-sm font-medium ${headingColor} whitespace-pre-wrap max-w-sm`}>
                                    {review.expertComment}
                                </td>
                                <td className={`p-4 align-top text-sm ${subTextColor} whitespace-pre-wrap max-w-sm`}>
                                    {review.importantDetails}
                                </td>
                                <td className="p-4 align-top text-center text-xs font-bold text-rose-500">
                                    {review.deadline ? formatDate(new Date(review.deadline), 'dd.MM HH:mm') : '-'}
                                </td>
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
                                <td className="p-4 align-top">
                                    <div className="flex items-center gap-2">
                                        <UserNickname userId={review.createdBy} className={`text-sm font-bold ${headingColor}`} />
                                    </div>
                                </td>
                                <td className="p-4 align-top text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {canEdit(review) && (
                                            <button
                                                onClick={() => onEdit(review)}
                                                className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-all"
                                            >
                                                <Edit className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                        {(isAdmin || user?.id === review.createdBy) && (
                                            <button
                                                onClick={() => handleDelete(review.id)}
                                                className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-all"
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
