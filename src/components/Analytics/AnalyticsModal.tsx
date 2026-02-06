import { useState, useEffect } from 'react'
import { useThemeStore } from '@/store/themeStore'
import { useAuthStore } from '@/store/authStore'
import { AnalyticsReview, addAnalyticsReview, updateAnalyticsReview } from '@/services/analyticsService'
import { X, Save, AlertCircle } from 'lucide-react'
import { SlotCategory, SLOT_CATEGORY_META } from '@/types'

interface AnalyticsModalProps {
    isOpen: boolean
    onClose: () => void
    review: AnalyticsReview | null
}

export const AnalyticsModal = ({ isOpen, onClose, review }: AnalyticsModalProps) => {
    const { theme } = useThemeStore()
    const { user } = useAuthStore()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState<Partial<AnalyticsReview>>({
        sphere: 'memecoins',
        expertComment: '',
        importantDetails: '',
        deadline: '',
        links: []
    })
    const [linksText, setLinksText] = useState('')

    useEffect(() => {
        if (review) {
            setFormData(review)
            setLinksText(review.links?.join('\n') || '')
        } else {
            setFormData({
                sphere: 'memecoins',
                expertComment: '',
                importantDetails: '',
                deadline: '',
                links: []
            })
            setLinksText('')
        }
    }, [review, isOpen])

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const links = linksText.split('\n').map(l => l.trim()).filter(l => l !== '')
            const data = { ...formData, links, createdBy: user?.id || '' } as Omit<AnalyticsReview, 'id' | 'createdAt' | 'updatedAt'>

            if (review) {
                await updateAnalyticsReview(review.id, data)
            } else {
                await addAnalyticsReview(data)
            }
            onClose()
        } catch (error) {
            console.error('Error saving review:', error)
        } finally {
            setLoading(false)
        }
    }

    const bgColor = theme === 'dark' ? 'bg-[#0f141a]' : 'bg-white'
    const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900'
    const inputBg = theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className={`${bgColor} w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border ${theme === 'dark' ? 'border-white/10' : 'border-gray-100'}`}>
                <div className="flex items-center justify-between p-6 border-b border-white/5">
                    <h2 className={`text-xl font-black tracking-tight ${textColor}`}>
                        {review ? 'Edit Review' : 'Add Analytical Review'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Sphere</label>
                            <select
                                required
                                value={formData.sphere}
                                onChange={(e) => setFormData({ ...formData, sphere: e.target.value })}
                                className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-emerald-500 outline-none transition-all ${inputBg} ${textColor}`}
                            >
                                {Object.keys(SLOT_CATEGORY_META).map((key) => (
                                    <option key={key} value={key}>{SLOT_CATEGORY_META[key as SlotCategory].label}</option>
                                ))}
                                <option value="other">Прочее</option>
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Deadline</label>
                            <input
                                type="datetime-local"
                                value={formData.deadline}
                                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-emerald-500 outline-none transition-all ${inputBg} ${textColor}`}
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Expert Comment</label>
                        <textarea
                            required
                            rows={3}
                            placeholder="Enter your analytical review..."
                            value={formData.expertComment}
                            onChange={(e) => setFormData({ ...formData, expertComment: e.target.value })}
                            className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-emerald-500 outline-none transition-all resize-none ${inputBg} ${textColor}`}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Important Details</label>
                        <textarea
                            rows={2}
                            placeholder="Additional information, risks, etc."
                            value={formData.importantDetails}
                            onChange={(e) => setFormData({ ...formData, importantDetails: e.target.value })}
                            className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-emerald-500 outline-none transition-all resize-none ${inputBg} ${textColor}`}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Links (one per line)</label>
                        <textarea
                            rows={2}
                            placeholder="https://..."
                            value={linksText}
                            onChange={(e) => setLinksText(e.target.value)}
                            className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-emerald-500 outline-none transition-all resize-none ${inputBg} ${textColor}`}
                        />
                    </div>

                    <div className="pt-4 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className={`px-6 py-3 rounded-xl font-bold transition-all ${theme === 'dark' ? 'bg-white/5 text-gray-400 hover:bg-white/10' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                        >
                            {loading ? <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <Save className="w-4 h-4" />}
                            {review ? 'Update Review' : 'Save Review'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
