import { useState, useEffect } from 'react'
import { useThemeStore } from '@/store/themeStore'
import { useAuthStore } from '@/store/authStore'
import { useNavigate } from 'react-router-dom'
import { AnalyticsReview, addAnalyticsReview, updateAnalyticsReview, addOrUpdateReviewRating } from '@/services/analyticsService'
import { X, Save, Plus, Trash2, BarChart3, ImageIcon } from 'lucide-react'
import { SlotCategory } from '@/types'
import { format, parseISO, addHours, addDays } from 'date-fns'
import { SelectOption } from '@/components/Call/CustomSelect'
import { MultiSelect } from '@/components/Call/MultiSelect'
import { RatingDisplay } from './RatingDisplay'
import { RatingInput } from './RatingInput'
import { UserNickname } from '@/components/UserNickname'
import Avatar from '@/components/Avatar'

interface AnalyticsModalProps {
    isOpen: boolean
    onClose: () => void
    review: AnalyticsReview | null
    sphereOptions: { id: string | null; name: string; icon: React.ReactNode }[]
    allReviews: AnalyticsReview[]
}

interface LinkInput {
    url: string
    title: string
}

export const AnalyticsModal = ({ isOpen, onClose, review, sphereOptions, allReviews }: AnalyticsModalProps) => {
    const { theme } = useThemeStore()
    const { user } = useAuthStore()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [duplicateReview, setDuplicateReview] = useState<AnalyticsReview | null>(null)
    const [formData, setFormData] = useState<Partial<AnalyticsReview>>({
        sphere: [],
        expertComment: '',
        importantDetails: '',
        strategy: '',
        currentPrice: '',
        deadline: '',
        asset: '',
        links: [],
        ratings: [],
        screenshot: ''
    })
    const [linkInputs, setLinkInputs] = useState<LinkInput[]>([])
    const [deadlineDate, setDeadlineDate] = useState('')
    const [deadlineTime, setDeadlineTime] = useState('')

    // Нормализация названия актива (берём всё до первого дефиса, убираем пробелы)
    const normalizeAsset = (asset: string): string => {
        if (!asset) return ''
        return asset
            .split('-')[0] // Берём всё до первого дефиса
            .toUpperCase()
            .replace(/\s+/g, '') // Убираем пробелы
            .trim()
    }

    // Проверка дубликата актива
    const checkDuplicateAsset = (assetName: string) => {
        if (!assetName || review) {
            setDuplicateReview(null)
            return
        }

        const normalizedInput = normalizeAsset(assetName)
        const now = new Date().getTime()

        const duplicate = allReviews.find(r => {
            if (!r.asset) return false

            const normalizedAsset = normalizeAsset(r.asset)

            // Проверяем совпадение нормализованных названий (игнорируем USDT с обеих сторон)
            if (normalizedAsset !== normalizedInput) return false

            // Проверяем, что разбор актуален (не закрыт и дедлайн не истек)
            if (r.closed) return false

            if (r.deadline) {
                const deadlineTime = new Date(r.deadline).getTime()
                return deadlineTime > now
            }

            return true
        })

        setDuplicateReview(duplicate || null)
    }

    const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => setFormData({ ...formData, screenshot: reader.result as string })
            reader.readAsDataURL(file)
        }
    }

    const handleScreenshotPaste = (e: React.ClipboardEvent) => {
        const file = e.clipboardData.files[0]
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader()
            reader.onloadend = () => setFormData({ ...formData, screenshot: reader.result as string })
            reader.readAsDataURL(file)
        }
    }

    const handleScreenshotDrop = (e: React.DragEvent) => {
        e.preventDefault()
        const file = e.dataTransfer.files[0]
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader()
            reader.onloadend = () => setFormData({ ...formData, screenshot: reader.result as string })
            reader.readAsDataURL(file)
        }
    }

    useEffect(() => {
        if (review) {
            // Копируем только редактируемые поля, исключая системные
            setFormData({
                sphere: Array.isArray(review.sphere) ? review.sphere : (review.sphere ? [review.sphere] : []),
                expertComment: review.expertComment || '',
                importantDetails: review.importantDetails || '',
                strategy: review.strategy || '',
                currentPrice: review.currentPrice || '',
                asset: review.asset || '',
                deadline: review.deadline || '',
                links: review.links || [],
                ratings: review.ratings || [],
                screenshot: review.screenshot || ''
            })
            const parsedLinks = review.links?.map(link => {
                const parts = link.slice(-1) === '-' ? [link.slice(0, -1).trim()] : link.split(' - ');
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
            setDuplicateReview(null)
        } else {
            setFormData({
                sphere: [],
                expertComment: '',
                importantDetails: '',
                strategy: '',
                currentPrice: '',
                asset: '',
                deadline: '',
                links: [],
                ratings: [],
                screenshot: ''
            })
            setLinkInputs([{ url: '', title: '' }])
            const now = new Date()
            setDeadlineDate(format(now, 'yyyy-MM-dd'))
            setDeadlineTime(format(now, 'HH:mm'))
            setDuplicateReview(null)
        }
    }, [review, isOpen])

    // Проверка дубликата при изменении актива
    useEffect(() => {
        if (isOpen && !review) {
            checkDuplicateAsset(formData.asset || '')
        }
    }, [formData.asset, allReviews, isOpen, review])

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

    const handleRateReview = async (ratingValue: number) => {
        if (!user || !review?.id) return
        setLoading(true)
        try {
            await addOrUpdateReviewRating(review.id, user.id, ratingValue)
            // Обновляем review в formData, чтобы отобразить новую оценку
            if (formData.ratings) {
                const existingRatingIndex = formData.ratings.findIndex(r => r.userId === user.id)
                let updatedRatings;
                if (existingRatingIndex !== -1) {
                    updatedRatings = formData.ratings.map((r, index) =>
                        index === existingRatingIndex ? { ...r, value: ratingValue } : r
                    )
                } else {
                    updatedRatings = [...formData.ratings, { userId: user.id, value: ratingValue }]
                }
                setFormData(prev => ({ ...prev, ratings: updatedRatings }))
            } else {
                setFormData(prev => ({ ...prev, ratings: [{ userId: user.id, value: ratingValue }] }))
            }
            console.log('Оценка успешно сохранена!')
        } catch (error) {
            console.error('Ошибка при сохранении оценки:', error)
        } finally {
            setLoading(false)
        }
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

            if (review) {
                // При редактировании обновляем только изменяемые поля
                const updateData = {
                    sphere: formData.sphere,
                    expertComment: formData.expertComment,
                    importantDetails: formData.importantDetails,
                    strategy: formData.strategy,
                    currentPrice: formData.currentPrice,
                    links: formattedLinks,
                    deadline: fullDeadline || undefined,
                    asset: formData.asset,
                    screenshot: formData.screenshot
                }
                await updateAnalyticsReview(review.id, updateData)
            } else {
                // При создании передаем все данные
                const data = {
                    sphere: formData.sphere || [],
                    expertComment: formData.expertComment || '',
                    importantDetails: formData.importantDetails || '',
                    strategy: formData.strategy || '',
                    currentPrice: formData.currentPrice || '',
                    asset: formData.asset || '',
                    links: formattedLinks,
                    deadline: fullDeadline || undefined,
                    screenshot: formData.screenshot,
                    createdBy: user?.id || ''
                }
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
    const subTextColor = theme === 'dark' ? 'text-gray-400' : 'text-gray-500'

    const customSelectOptions: SelectOption[] = sphereOptions.map(sphere => ({
        value: sphere.id || '',
        label: sphere.name,
        icon: sphere.icon,
    }))

    const userRating = formData.ratings?.find(r => r.userId === user?.id)?.value || null;

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300 overflow-y-auto">
            <div className={`${bgColor} w-full max-w-2xl max-h-[calc(100vh-32px)] rounded-3xl overflow-hidden shadow-2xl border mt-4 mb-8 ${theme === 'dark' ? 'border-white/10' : 'border-gray-100'}`}>
                <div className="flex items-center justify-between p-6 border-b border-white/5 sticky top-0 bg-inherit z-10">
                    <h2 className={`text-xl font-black tracking-tight ${textColor}`}>
                        {review ? 'Редактировать обзор' : 'Добавить аналитический обзор'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[calc(100vh-180px)] overflow-y-auto custom-scrollbar">
                    {review && (
                        <div className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/5">
                            <div className="flex items-center gap-3">
                                <Avatar userId={review.createdBy} size="md" />
                                <div>
                                    <UserNickname userId={review.createdBy} className={`text-sm font-bold ${textColor}`} />
                                    <p className={`text-[10px] uppercase font-bold tracking-widest ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Автор обзора</p>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <RatingDisplay ratings={formData.ratings} theme={theme} />
                                <RatingInput
                                    currentRating={userRating}
                                    onRate={handleRateReview}
                                    theme={theme}
                                    disabled={loading || !user || user.id === review.createdBy}
                                />
                            </div>
                        </div>
                    )}

                    {/* Уведомление о дубликате */}
                    {duplicateReview && (
                        <div className="p-4 rounded-xl border" style={{ backgroundColor: '#4C7F6E', borderColor: 'rgba(255,255,255,0.1)' }}>
                            <div className="flex items-start gap-3">
                                <div className="text-2xl">⚠️</div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-white">
                                        Разбор найден в LAB
                                    </p>
                                    <p className="text-xs mt-1 text-white/90">
                                        Актуальный аналитический разбор для актива "{duplicateReview.asset}" уже существует
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            onClose()
                                            navigate(`/lab?reviewId=${duplicateReview.id}`)
                                        }}
                                        className="mt-2 px-3 py-1.5 text-xs font-bold rounded-lg bg-white hover:bg-gray-100 text-gray-900 transition-all"
                                    >
                                        Просмотреть карточку
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[#4C7F6E]">Актив</label>
                            <input
                                type="text"
                                placeholder="Например: BTC, ETH, S&P 500"
                                value={formData.asset}
                                onChange={(e) => setFormData({ ...formData, asset: e.target.value })}
                                className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-[#4C7F6E] outline-none transition-all ${inputBg} ${textColor}`}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[#4C7F6E]">Актуальная цена</label>
                            <input
                                type="text"
                                placeholder="Например: $45,000"
                                value={formData.currentPrice}
                                onChange={(e) => setFormData({ ...formData, currentPrice: e.target.value })}
                                className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-[#4C7F6E] outline-none transition-all ${inputBg} ${textColor}`}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[#4C7F6E]">Сфера</label>
                            <MultiSelect
                                value={formData.sphere as string[]}
                                onChange={(val) => setFormData({ ...formData, sphere: val as SlotCategory[] })}
                                options={customSelectOptions}
                                placeholder="Выберите сферы"
                                searchable={true}
                                icon={<BarChart3 size={16} />}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-[#4C7F6E]">Дата</label>
                                <input
                                    type="date"
                                    value={deadlineDate}
                                    onChange={(e) => setDeadlineDate(e.target.value)}
                                    className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-[#4C7F6E] outline-none transition-all ${inputBg} ${textColor}`}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-[#4C7F6E]">Время</label>
                                <input
                                    type="time"
                                    value={deadlineTime}
                                    onChange={(e) => setDeadlineTime(e.target.value)}
                                    className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-[#4C7F6E] outline-none transition-all ${inputBg} ${textColor}`}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex flex-wrap gap-2">
                            {[
                                { label: '1ч', value: 1, type: 'hour' },
                                { label: '3ч', value: 3, type: 'hour' },
                                { label: '6ч', value: 6, type: 'hour' },
                                { label: '9ч', value: 9, type: 'hour' },
                                { label: '12ч', value: 12, type: 'hour' },
                                { label: '1д', value: 1, type: 'day' },
                                { label: '2д', value: 2, type: 'day' },
                                { label: '3д', value: 3, type: 'day' },
                                { label: '7д', value: 7, type: 'day' },
                                { label: '14д', value: 14, type: 'day' },
                                { label: '30д', value: 30, type: 'day' },
                            ].map((option) => (
                                <button
                                    key={`${option.type}-${option.value}`}
                                    type="button"
                                    onClick={() => {
                                        const now = new Date()
                                        const newDate = option.type === 'hour'
                                            ? addHours(now, option.value)
                                            : addDays(now, option.value)
                                        setDeadlineDate(format(newDate, 'yyyy-MM-dd'))
                                        setDeadlineTime(format(newDate, 'HH:mm'))
                                    }}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${theme === 'dark'
                                            ? 'bg-white/5 border-white/10 hover:bg-white/10 text-gray-300'
                                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-600'
                                        }`}
                                >
                                    +{option.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[#4C7F6E]">Комментарий эксперта</label>
                        <textarea
                            rows={3}
                            placeholder="Введите ваш аналитический обзор..."
                            value={formData.expertComment}
                            onChange={(e) => setFormData({ ...formData, expertComment: e.target.value })}
                            className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-[#4C7F6E] outline-none transition-all resize-none ${inputBg} ${textColor}`}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[#4C7F6E]">Стратегия</label>
                        <textarea
                            rows={2}
                            placeholder="Опишите стратегию трейдинга..."
                            value={formData.strategy}
                            onChange={(e) => setFormData({ ...formData, strategy: e.target.value })}
                            className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-[#4C7F6E] outline-none transition-all resize-none ${inputBg} ${textColor}`}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[#4C7F6E]">Скриншот</label>
                        <div className="space-y-3">
                            {formData.screenshot && (
                                <div className="relative">
                                    <img
                                        src={formData.screenshot}
                                        alt="Screenshot preview"
                                        className="w-full h-40 object-cover rounded-xl border border-white/10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, screenshot: '' })}
                                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-rose-500 text-white hover:bg-rose-600 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                            <div
                                className={`relative flex items-center justify-center gap-2 px-4 py-4 rounded-xl border border-dashed cursor-pointer transition-all ${theme === 'dark' ? 'border-white/20 hover:border-[#4C7F6E]/50 hover:bg-white/5' : 'border-gray-300 hover:border-[#4C7F6E]/50 hover:bg-gray-50'}`}
                                onPaste={handleScreenshotPaste}
                                onDrop={handleScreenshotDrop}
                                onDragOver={(e) => e.preventDefault()}
                            >
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleScreenshotUpload}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <ImageIcon className={`w-5 h-5 ${subTextColor}`} />
                                <div className="text-center">
                                    <span className={`text-sm ${subTextColor}`}>
                                        {formData.screenshot ? 'Заменить файл' : 'Перетащите, вставьте или загрузите'}
                                    </span>
                                    <p className={`text-xs ${subTextColor} mt-1 opacity-60`}>
                                        Поддерживается drag & drop, Ctrl+V, загрузка файла
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[#4C7F6E]">Ссылки</label>
                        {linkInputs.map((linkInput, index) => (
                            <div key={index} className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Ссылка"
                                    value={linkInput.url}
                                    onChange={(e) => handleLinkInputChange(index, 'url', e.target.value)}
                                    className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-[#4C7F6E] outline-none transition-all ${inputBg} ${textColor}`}
                                />
                                <input
                                    type="text"
                                    placeholder="Название"
                                    value={linkInput.title}
                                    onChange={(e) => handleLinkInputChange(index, 'title', e.target.value)}
                                    className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-[#4C7F6E] outline-none transition-all ${inputBg} ${textColor}`}
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
                                className="w-full px-4 py-3 mt-2 rounded-xl border border-dashed border-[#4C7F6E] text-[#4C7F6E] hover:bg-[#4C7F6E]/10 transition-all flex items-center justify-center gap-2"
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
                            className="flex items-center gap-2 px-6 py-3 bg-[#4C7F6E] hover:bg-[#4C7F6E]/90 disabled:opacity-50 text-white rounded-xl font-bold shadow-lg shadow-[#4C7F6E]/20 transition-all active:scale-95"
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
