import { useState, useEffect } from 'react'
import { useThemeStore } from '@/store/themeStore'
import { useAuthStore } from '@/store/authStore'
import { AnalyticsReview, addAnalyticsReview, updateAnalyticsReview } from '@/services/analyticsService'
import { X, Save, Plus, Trash2 } from 'lucide-react'
import { SlotCategory, SLOT_CATEGORY_META } from '@/types'
import { format, parseISO } from 'date-fns'

interface AnalyticsModalProps {
    isOpen: boolean
    onClose: () => void
    review: AnalyticsReview | null
}

interface LinkInput {
    url: string
    title: string
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
    const [linkInputs, setLinkInputs] = useState<LinkInput[]>([])
    const [deadlineDate, setDeadlineDate] = useState('')
    const [deadlineTime, setDeadlineTime] = useState('')

    useEffect(() => {
        if (review) {
            setFormData(review)
            const parsedLinks = review.links?.map(link => {
                const parts = link.split(' - ')
                return { url: parts[0] || '', title: parts[1] || '' }
            }) || []
            setLinkInputs(parsedLinks.length > 0 ? parsedLinks : [{ url: '', title: '' }])

            if (review.deadline) {
                const date = parseISO(review.deadline)
                setDeadlineDate(format(date, 'yyyy-MM-dd'))
                setDeadlineTime(format(date, 'HH:mm'))
            } else {
                setDeadlineDate('')
                setDeadlineTime('')
            }
        } else {
            setFormData({
                sphere: 'memecoins',
                expertComment: '',
                importantDetails: '',
                deadline: '',
                links: []
            })
            setLinkInputs([{ url: '', title: '' }])
            const now = new Date()
            setDeadlineDate(format(now, 'yyyy-MM-dd'))
            setDeadlineTime(format(now, 'HH:mm'))
        }
    }, [review, isOpen])

    if (!isOpen) return null

    const handleAddLinkInput = () => {
        if (linkInputs.length < 10) {
            setLinkInputs([...linkInputs, { url: '', title: '' }])
        }
    }

    const handleRemoveLinkInput = (index: number) => {
        const newLinkInputs = linkInputs.filter((_, i) => i !== index)
        setLinkInputs(newLinkInputs)
    }

    const handleLinkInputChange = (index: number, field: keyof LinkInput, value: string) => {
        const newLinkInputs = [...linkInputs]
        newLinkInputs[index] = { ...newLinkInputs[index], [field]: value }
        setLinkInputs(newLinkInputs)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const formattedLinks = linkInputs
                .filter(link => !(link.url.trim() === '' && link.title.trim() === ''))
                .map(link => `${link.url.trim()} - ${link.title.trim()}`)

            let fullDeadline = ''
            if (deadlineDate && deadlineTime) {
                fullDeadline = `${deadlineDate}T${deadlineTime}:00`
            }

            const data = { ...formData, links: formattedLinks, deadline: fullDeadline, createdBy: user?.id || '' } as Omit<AnalyticsReview, 'id' | 'createdAt' | 'updatedAt'>

            if (review) {
                await updateAnalyticsReview(review.id, data)
            } else {
                await addAnalyticsReview(data)
            }
            onClose()
        } catch (error) {
            console.error('Ошибка при сохранении обзора:', error)
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
                        {review ? 'Редактировать обзор' : 'Добавить аналитический обзор'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Сфера</label>
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

                        {/* Separate Date and Time fields for Deadline */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Дата</label>
                                <input
                                    type="date"
                                    value={deadlineDate}
                                    onChange={(e) => setDeadlineDate(e.target.value)}
                                    className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-emerald-500 outline-none transition-all ${inputBg} ${textColor}`}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Время</label>
                                <input
                                    type="time"
                                    value={deadlineTime}
                                    onChange={(e) => setDeadlineTime(e.target.value)}
                                    className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-emerald-500 outline-none transition-all ${inputBg} ${textColor}`}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Комментарий эксперта</label>
                        <textarea
                            required
                            rows={3}
                            placeholder="Введите ваш аналитический обзор..."
                            value={formData.expertComment}
                            onChange={(e) => setFormData({ ...formData, expertComment: e.target.value })}
                            className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-emerald-500 outline-none transition-all resize-none ${inputBg} ${textColor}`}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Важные детали</label>
                        <textarea
                            rows={2}
                            placeholder="Дополнительная информация, риски и т.д."
                            value={formData.importantDetails}
                            onChange={(e) => setFormData({ ...formData, importantDetails: e.target.value })}
                            className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-emerald-500 outline-none transition-all resize-none ${inputBg} ${textColor}`}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Ссылки</label>
                        {linkInputs.map((linkInput, index) => (
                            <div key={index} className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Ссылка"
                                    value={linkInput.url}
                                    onChange={(e) => handleLinkInputChange(index, 'url', e.target.value)}
                                    className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-emerald-500 outline-none transition-all ${inputBg} ${textColor}`}
                                />
                                <input
                                    type="text"
                                    placeholder="Название"
                                    value={linkInput.title}
                                    onChange={(e) => handleLinkInputChange(index, 'title', e.target.value)}
                                    className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-emerald-500 outline-none transition-all ${inputBg} ${textColor}`}
                                />
                                {linkInputs.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveLinkInput(index)}
                                        className="p-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        ))}
                        {linkInputs.length < 10 && (
                            <button
                                type="button"
                                onClick={handleAddLinkInput}
                                className="w-full px-4 py-3 mt-2 rounded-xl border border-dashed border-emerald-500 text-emerald-500 hover:bg-emerald-500/10 transition-all flex items-center justify-center gap-2"
                            >
                                <Plus className="w-5 h-5" /> Добавить ссылку
                            </button>
                        )}
                    </div>

                    <div className="pt-4 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className={`px-6 py-3 rounded-xl font-bold transition-all ${theme === 'dark' ? 'bg-white/5 text-gray-400 hover:bg-white/10' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                            Отмена
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                        >
                            {loading ? <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <Save className="w-4 h-4" />}
                            {review ? 'Обновить обзор' : 'Сохранить обзор'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
