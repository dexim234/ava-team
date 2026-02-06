import { useState } from 'react'
import { useThemeStore } from '@/store/themeStore'
import { useAuthStore } from '@/store/authStore'
import { 
    X, 
    Plus, 
    Trash2, 
    BarChart3, 
    Wallet2, 
    Image as ImageIcon,
    Link as LinkIcon,
    User,
    Calendar,
    Clock
} from 'lucide-react'

interface AdditionalLink {
    url: string
    comment: string
}

interface CreateAnalyticsData {
    sphere: 'polymarket' | 'nft' | 'spot'
    asset?: string // For spot/futures
    market?: string // For polymarket
    expertOpinion: string
    importantData: string
    signalLink?: string
    additionalLinks: AdditionalLink[]
}

interface CreateAnalyticsModalProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: (data: CreateAnalyticsData) => void
}

export const CreateAnalyticsModal = ({ isOpen, onClose, onSubmit }: CreateAnalyticsModalProps) => {
    const { theme } = useThemeStore()
    const { user } = useAuthStore()
    const [isSubmitting, setIsSubmitting] = useState(false)
    
    const [formData, setFormData] = useState<CreateAnalyticsData>({
        sphere: 'polymarket',
        asset: '',
        market: '',
        expertOpinion: '',
        importantData: '',
        signalLink: '',
        additionalLinks: []
    })

    const [newLink, setNewLink] = useState({ url: '', comment: '' })

    const headingColor = theme === 'dark' ? 'text-white' : 'text-gray-900'
    const cardBg = theme === 'dark' ? 'bg-gray-800' : 'bg-white'
    const borderColor = theme === 'dark' ? 'border-white/10' : 'border-gray-200'
    const subtleColor = theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
    const inputBg = theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'

    const sphereOptions = [
        { value: 'polymarket', label: 'Polymarket', icon: <BarChart3 className="w-4 h-4" /> },
        { value: 'nft', label: 'NFT', icon: <ImageIcon className="w-4 h-4" /> },
        { value: 'spot', label: 'Спот/Фьючи', icon: <Wallet2 className="w-4 h-4" /> },
    ]

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            await onSubmit(formData)
            onClose()
            // Reset form
            setFormData({
                sphere: 'polymarket',
                asset: '',
                market: '',
                expertOpinion: '',
                importantData: '',
                signalLink: '',
                additionalLinks: []
            })
            setNewLink({ url: '', comment: '' })
        } catch (error) {
            console.error('Error creating analytics:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const addAdditionalLink = () => {
        if (newLink.url.trim() && newLink.comment.trim()) {
            setFormData(prev => ({
                ...prev,
                additionalLinks: [...prev.additionalLinks, { ...newLink }]
            }))
            setNewLink({ url: '', comment: '' })
        }
    }

    const removeAdditionalLink = (index: number) => {
        setFormData(prev => ({
            ...prev,
            additionalLinks: prev.additionalLinks.filter((_, i) => i !== index)
        }))
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            
            <div className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl ${cardBg} shadow-2xl border ${borderColor}`}>
                {/* Header */}
                <div className={`sticky top-0 z-10 flex items-center justify-between p-6 border-b ${borderColor} ${cardBg}`}>
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                            <BarChart3 className="w-6 h-6" />
                        </div>
                        <h2 className={`text-xl font-bold ${headingColor}`}>
                            Создать аналитику
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className={`p-2 rounded-lg transition-all hover:${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                    >
                        <X className={`w-5 h-5 ${subtleColor}`} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Sphere Selection */}
                    <div>
                        <label className={`block text-sm font-medium mb-3 ${headingColor}`}>
                            Сфера анализа *
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {sphereOptions.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, sphere: option.value as any }))}
                                    className={`flex items-center gap-2 p-3 rounded-lg text-sm font-medium transition-all ${
                                        formData.sphere === option.value
                                            ? 'bg-blue-500 text-white shadow-lg'
                                            : theme === 'dark'
                                            ? 'bg-white/10 text-gray-300 hover:bg-white/20'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    {option.icon}
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Conditional Fields */}
                    {formData.sphere === 'spot' && (
                        <div>
                            <label className={`block text-sm font-medium mb-2 ${headingColor}`}>
                                Актив *
                            </label>
                            <input
                                type="text"
                                value={formData.asset}
                                onChange={(e) => setFormData(prev => ({ ...prev, asset: e.target.value }))}
                                placeholder="BTC, ETH, SOL, etc."
                                className={`w-full px-4 py-3 rounded-xl border ${borderColor} ${inputBg} ${headingColor} placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                required
                            />
                        </div>
                    )}

                    {formData.sphere === 'polymarket' && (
                        <div>
                            <label className={`block text-sm font-medium mb-2 ${headingColor}`}>
                                Рынок *
                            </label>
                            <input
                                type="text"
                                value={formData.market}
                                onChange={(e) => setFormData(prev => ({ ...prev, market: e.target.value }))}
                                placeholder="Политические события, спорт, криптовалюты, etc."
                                className={`w-full px-4 py-3 rounded-xl border ${borderColor} ${inputBg} ${headingColor} placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                required
                            />
                        </div>
                    )}

                    {/* Expert Opinion */}
                    <div>
                        <label className={`block text-sm font-medium mb-2 ${headingColor}`}>
                            Мнение эксперта *
                        </label>
                        <textarea
                            value={formData.expertOpinion}
                            onChange={(e) => setFormData(prev => ({ ...prev, expertOpinion: e.target.value }))}
                            placeholder="Подробное аналитическое мнение по ситуации..."
                            rows={4}
                            className={`w-full px-4 py-3 rounded-xl border ${borderColor} ${inputBg} ${headingColor} placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none`}
                            required
                        />
                    </div>

                    {/* Important Data */}
                    <div>
                        <label className={`block text-sm font-medium mb-2 ${headingColor}`}>
                            Важные данные *
                        </label>
                        <textarea
                            value={formData.importantData}
                            onChange={(e) => setFormData(prev => ({ ...prev, importantData: e.target.value }))}
                            placeholder="Ключевые метрики, уровни поддержки/сопротивления, важные новости..."
                            rows={3}
                            className={`w-full px-4 py-3 rounded-xl border ${borderColor} ${inputBg} ${headingColor} placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none`}
                            required
                        />
                    </div>

                    {/* Signal Link */}
                    <div>
                        <label className={`block text-sm font-medium mb-2 ${headingColor}`}>
                            Ссылка на сигнал
                        </label>
                        <input
                            type="url"
                            value={formData.signalLink}
                            onChange={(e) => setFormData(prev => ({ ...prev, signalLink: e.target.value }))}
                            placeholder="https://..."
                            className={`w-full px-4 py-3 rounded-xl border ${borderColor} ${inputBg} ${headingColor} placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        />
                    </div>

                    {/* Additional Links */}
                    <div>
                        <label className={`block text-sm font-medium mb-3 ${headingColor}`}>
                            Дополнительные ссылки
                        </label>
                        
                        {/* Existing Links */}
                        {formData.additionalLinks.length > 0 && (
                            <div className="space-y-2 mb-4">
                                {formData.additionalLinks.map((link, index) => (
                                    <div key={index} className={`flex items-center gap-3 p-3 rounded-lg border ${borderColor}`}>
                                        <LinkIcon className={`w-4 h-4 ${subtleColor}`} />
                                        <div className="flex-1">
                                            <a 
                                                href={link.url} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="text-sm font-medium text-blue-500 hover:underline"
                                            >
                                                {link.url}
                                            </a>
                                            <p className={`text-xs ${subtleColor}`}>{link.comment}</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeAdditionalLink(index)}
                                            className={`p-1 rounded transition-colors hover:bg-red-500/20 text-red-400`}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Add New Link */}
                        <div className="space-y-3">
                            <input
                                type="url"
                                value={newLink.url}
                                onChange={(e) => setNewLink(prev => ({ ...prev, url: e.target.value }))}
                                placeholder="https://..."
                                className={`w-full px-4 py-2 rounded-lg border ${borderColor} ${inputBg} ${headingColor} placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm`}
                            />
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newLink.comment}
                                    onChange={(e) => setNewLink(prev => ({ ...prev, comment: e.target.value }))}
                                    placeholder="Комментарий к ссылке"
                                    className={`flex-1 px-4 py-2 rounded-lg border ${borderColor} ${inputBg} ${headingColor} placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm`}
                                />
                                <button
                                    type="button"
                                    onClick={addAdditionalLink}
                                    disabled={!newLink.url.trim() || !newLink.comment.trim()}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Author Info */}
                    <div className={`p-4 rounded-lg border ${borderColor} ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'}`}>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                                {user?.avatar ? (
                                    <img src={user.avatar} className="w-full h-full rounded-full object-cover" />
                                ) : (
                                    <User className="w-5 h-5" />
                                )}
                            </div>
                            <div>
                                <p className={`text-sm font-bold ${headingColor}`}>
                                    {user?.name || 'Аналитик'}
                                </p>
                                <div className="flex items-center gap-2">
                                    <Calendar className={`w-3 h-3 ${subtleColor}`} />
                                    <p className={`text-xs ${subtleColor}`}>
                                        {new Date().toLocaleDateString('ru-RU')}
                                    </p>
                                    <Clock className={`w-3 h-3 ml-2 ${subtleColor}`} />
                                    <p className={`text-xs ${subtleColor}`}>
                                        {new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
                        <button
                            type="button"
                            onClick={onClose}
                            className={`px-6 py-3 rounded-xl font-bold transition-all ${
                                theme === 'dark' 
                                    ? 'hover:bg-white/10 text-gray-400' 
                                    : 'hover:bg-gray-100 text-gray-600'
                            }`}
                        >
                            Отмена
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-black shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Создание...
                                </>
                            ) : (
                                <>
                                    <Plus className="w-4 h-4" />
                                    Создать аналитику
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default CreateAnalyticsModal