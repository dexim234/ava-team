import { useState, useEffect } from 'react'
import { X, Lock, AlertTriangle, ShieldCheck, Copy, Check, User as UserIcon, Smartphone, Key } from 'lucide-react'
import { User } from '@/types'
import { getAllUsers } from '@/services/firestoreService'

interface ForgotPasswordModalProps {
    onClose: () => void
    theme: 'dark' | 'light'
}

export const ForgotPasswordModal = ({ onClose, theme }: ForgotPasswordModalProps) => {
    const [phone, setPhone] = useState('')
    const [code, setCode] = useState('')
    const [error, setError] = useState('')
    const [recoveredUser, setRecoveredUser] = useState<User | null>(null)
    const [copiedField, setCopiedField] = useState<string | null>(null)
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const allUsers = await getAllUsers()
                setUsers(allUsers)
            } catch (err) {
                console.error('Error fetching users for recovery:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchUsers()
    }, [])

    const handleRecover = (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (loading) return

        const user = users.find(u =>
            u.phone?.replace(/\D/g, '') === phone.replace(/\D/g, '') &&
            u.recoveryCode === code
        )

        if (user) {
            setRecoveredUser(user)
        } else {
            setError('Неверный номер телефона или специальный код')
        }
    }

    const copyToClipboard = (text: string, field: string) => {
        navigator.clipboard.writeText(text)
        setCopiedField(field)
        setTimeout(() => setCopiedField(null), 2000)
    }

    const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900'
    const subTextColor = theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
    const bgColor = theme === 'dark' ? 'bg-[#0b0f17]' : 'bg-white'
    const borderColor = theme === 'dark' ? 'border-white/10' : 'border-gray-200'

    return
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className={`relative w-full max-w-md overflow-hidden rounded-[2.5rem] ${bgColor} shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] border ${borderColor} animate-in fade-in zoom-in duration-500`}>
                {/* Advanced Decorative Background (Blur Blobs) */}
                <div className="absolute -top-24 -left-24 w-64 h-64 bg-[#4C7F6E]/20 rounded-full blur-[80px] pointer-events-none animate-pulse" />
                <div className="absolute top-1/2 -right-32 w-64 h-64 bg-[#4C7F6E]/10 rounded-full blur-[100px] pointer-events-none" />

                <div className="relative p-10">
                    <button
                        onClick={onClose}
                        className={`absolute top-8 right-8 p-2.5 rounded-full transition-all duration-300 ${theme === 'dark' ? 'hover:bg-white/10 text-gray-500 hover:text-white' : 'hover:bg-gray-100 text-gray-400 hover:text-gray-900'}`}
                    >
                        <X className="w-5 h-5" />
                    </button>

                    {!recoveredUser ? (
                        <div className="space-y-8">
                            <div className="text-center space-y-3">
                                <div className="relative inline-flex mb-2">
                                    <div className="absolute inset-0 bg-[#4C7F6E]/20 blur-xl rounded-full" />
                                    <div className="relative p-4 rounded-2xl bg-gradient-to-br from-[#4C7F6E]/10 to-emerald-500/5 text-[#4C7F6E] border border-[#4C7F6E]/20">
                                    <div className="relative p-4 rounded-2xl bg-gradient-to-br from-[#4C7F6E]/10 to-[#4C7F6E]/5 text-[#4C7F6E] border border-[#4C7F6E]/20">
                                        <Lock className="w-7 h-7" />
                                    </div>
                                </div>
                                <h3 className={`text-3xl font-black tracking-tight ${textColor}`}>
                                    Восстановление
                                </h3>
                                <p className={`text-sm font-medium leading-relaxed max-w-[240px] mx-auto ${subTextColor}`}>
                                    Введите ваши данные для получения доступа к аккаунту
                                </p>
                            </div>

                            <form onSubmit={handleRecover} className="space-y-5">
                                <div className="space-y-2.5">
                                    <label className={`text-sm font-bold block mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                        Номер телефона
                                    </label>
                                    <div className="relative group">
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder="79000000000"
                                            className={`w-full px-5 py-4 rounded-2xl border transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[#4C7F6E]/10 ${theme === 'dark'
                                                ? 'bg-white/5 border-white/10 text-white placeholder-gray-600 focus:border-[#4C7F6E]'
                                                : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-[#4C7F6E]'}`}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2.5">
                                    <label className={`text-sm font-bold block mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                        Специальный код
                                    </label>
                                    <div className="relative group">
                                        <input
                                            type="text"
                                            value={code}
                                            onChange={(e) => setCode(e.target.value)}
                                            placeholder="00000000"
                                            className={`w-full px-5 py-4 rounded-2xl border transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[#4C7F6E]/10 ${theme === 'dark'
                                                ? 'bg-white/5 border-white/10 text-white placeholder-gray-600 focus:border-[#4C7F6E]'
                                                : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-[#4C7F6E]'}`}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Warning Card */}
                                <div className="relative group overflow-hidden">
                                    <div className="absolute inset-0 bg-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    <div className="relative p-5 rounded-[1.25rem] bg-amber-500/[0.03] border border-amber-500/10 flex gap-4">
                                        <div className="p-2 rounded-lg bg-amber-500/10 shrink-0 h-fit">
                                            <AlertTriangle className="w-5 h-5 text-amber-500" />
                                        </div>
                                        <p className="text-[11px] font-bold text-amber-600 dark:text-amber-400/80 leading-relaxed normal-case">
                                            Если специальный код забыт, то восстановить доступ невозможно
                                        </p>
                                    </div>
                                </div>

                                {error && (
                                    <div className="p-4 rounded-xl bg-[#4C7F6E] border border-[#4C7F6E]/20 text-white text-xs font-bold text-center animate-shake">
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    className="w-full relative group overflow-hidden py-5 rounded-[1.25rem] bg-[#4C7F6E] text-white font-black transition-all duration-300 shadow-[0_20px_40px_-10px_rgba(76,127,110,0.3)] hover:shadow-[0_25px_50px_-12px_rgba(76,127,110,0.4)] hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-2">
                                        Проверить доступ
                                        <ShieldCheck className="w-5 h-5 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300" />
                                    </span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-[#4C7F6E] to-[#4C7F6E] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div className="space-y-6 text-center animate-in slide-in-from-bottom-8 duration-700">
                            <div className="relative inline-flex mb-2">
                                <div className="absolute inset-0 bg-[#4C7F6E]/30 blur-2xl rounded-full animate-pulse" />
                                <div className="relative p-5 rounded-3xl bg-[#4C7F6E] text-white shadow-xl shadow-[#4C7F6E]/40">
                                    <ShieldCheck className="w-10 h-10" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h3 className={`text-3xl font-black tracking-tight ${textColor}`}>
                                    Доступ восстановлен
                                </h3>
                                <p className={`text-sm font-medium leading-relaxed max-w-[240px] mx-auto ${subTextColor}`}>
                                    Данные подтверждены. Пожалуйста, сохраните ваши учетные данные
                                </p>
                            </div>

                            <div className="space-y-3">
                                {[
                                    { label: 'Логин', value: recoveredUser.login, icon: UserIcon, id: 'login' },
                                    { label: 'Пароль', value: recoveredUser.password, icon: Key, id: 'password' },
                                    { label: 'Спец. код', value: recoveredUser.recoveryCode || '', icon: Lock, id: 'code' },
                                    { label: 'Телефон', value: recoveredUser.phone || '', icon: Smartphone, id: 'phone' }
                                ].map((field) => (
                                    <div
                                        key={field.id}
                                        onClick={() => copyToClipboard(field.value, field.id)}
                                        className={`group relative p-4 rounded-2xl border transition-all duration-300 cursor-pointer ${theme === 'dark'
                                            ? 'bg-white/[0.03] border-white/10 hover:border-[#4C7F6E]/50 hover:bg-white/[0.05]'
                                            : 'bg-gray-50 border-gray-200 hover:border-[#4C7F6E]/30 hover:bg-[#4C7F6E]/10'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className={`p-2 rounded-xl shrink-0 ${theme === 'dark' ? 'bg-white/5 text-[#4C7F6E]' : 'bg-white text-[#4C7F6E] border border-[#4C7F6E]/20'}`}>
                                                    <field.icon className="w-4 h-4" />
                                                </div>
                                                <div className="text-left min-w-0">
                                                    <span className={`text-[10px] font-black uppercase tracking-wider block mb-0.5 ${subTextColor}`}>
                                                        {field.label}
                                                    </span>
                                                    <p className={`text-sm font-bold truncate ${textColor}`}>
                                                        {field.value}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className={`p-2 rounded-lg transition-all duration-300 ${copiedField === field.id ? 'bg-[#4C7F6E] text-white' : 'bg-transparent text-gray-500 group-hover:text-[#4C7F6E]'}`}>
                                                {copiedField === field.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={onClose}
                                className="w-full py-5 rounded-[1.25rem] bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black transition-all duration-300 hover:opacity-90 active:scale-95 shadow-xl shadow-black/10"
                            >
                                Вернуться ко входу
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
