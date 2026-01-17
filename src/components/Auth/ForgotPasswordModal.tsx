import { useState } from 'react'
import { X, Lock, AlertTriangle, ShieldCheck } from 'lucide-react'
import { TEAM_MEMBERS } from '@/types'

interface ForgotPasswordModalProps {
    onClose: () => void
    theme: 'dark' | 'light'
}

export const ForgotPasswordModal = ({ onClose, theme }: ForgotPasswordModalProps) => {
    const [login, setLogin] = useState('')
    const [code, setCode] = useState('')
    const [error, setError] = useState('')
    const [recoveredPassword, setRecoveredPassword] = useState<string | null>(null)

    const handleRecover = (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        const user = TEAM_MEMBERS.find(u =>
            u.login.toLowerCase() === login.toLowerCase() &&
            u.recoveryCode === code
        )

        if (user) {
            setRecoveredPassword(user.password)
        } else {
            setError('Неверный логин или специальный код')
        }
    }

    const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900'
    const subTextColor = theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
    const bgColor = theme === 'dark' ? 'bg-[#0b0f17]' : 'bg-white'
    const borderColor = theme === 'dark' ? 'border-white/10' : 'border-gray-200'

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className={`relative w-full max-w-md overflow-hidden rounded-[2.5rem] ${bgColor} shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] border ${borderColor} animate-in fade-in zoom-in duration-500`}>
                {/* Advanced Decorative Background (Blur Blobs) */}
                <div className="absolute -top-24 -left-24 w-64 h-64 bg-emerald-500/20 rounded-full blur-[80px] pointer-events-none animate-pulse" />
                <div className="absolute top-1/2 -right-32 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

                <div className="relative p-10">
                    <button
                        onClick={onClose}
                        className={`absolute top-8 right-8 p-2.5 rounded-full transition-all duration-300 ${theme === 'dark' ? 'hover:bg-white/10 text-gray-500 hover:text-white' : 'hover:bg-gray-100 text-gray-400 hover:text-gray-900'}`}
                    >
                        <X className="w-5 h-5" />
                    </button>

                    {!recoveredPassword ? (
                        <div className="space-y-8">
                            <div className="text-center space-y-3">
                                <div className="relative inline-flex mb-2">
                                    <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full" />
                                    <div className="relative p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/5 text-emerald-500 border border-emerald-500/20">
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
                                    <label className={`text-[10px] font-black tracking-[0.05em] ml-1 ${subTextColor}`}>
                                        Логин / Email
                                    </label>
                                    <div className="relative group">
                                        <input
                                            type="text"
                                            value={login}
                                            onChange={(e) => setLogin(e.target.value)}
                                            placeholder="example@apevault.io"
                                            className={`w-full px-5 py-4.5 rounded-[1.25rem] border transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 ${theme === 'dark'
                                                ? 'bg-white/5 border-white/10 text-white placeholder-gray-600 focus:border-emerald-500/50'
                                                : 'bg-gray-50/50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-500/50'}`}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2.5">
                                    <label className={`text-[10px] font-black tracking-[0.05em] ml-1 ${subTextColor}`}>
                                        Специальный код
                                    </label>
                                    <div className="relative group">
                                        <input
                                            type="text"
                                            value={code}
                                            onChange={(e) => setCode(e.target.value)}
                                            placeholder="00000000"
                                            className={`w-full px-5 py-4.5 rounded-[1.25rem] border transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 ${theme === 'dark'
                                                ? 'bg-white/5 border-white/10 text-white placeholder-gray-600 focus:border-emerald-500/50'
                                                : 'bg-gray-50/50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-500/50'}`}
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
                                            Внимание: если вы забыли специальный код, восстановить его невозможно, доступ к аккаунту утерян навсегда.
                                        </p>
                                    </div>
                                </div>

                                {error && (
                                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold text-center animate-shake">
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    className="w-full relative group overflow-hidden py-5 rounded-[1.25rem] bg-emerald-500 text-white font-black transition-all duration-300 shadow-[0_20px_40px_-10px_rgba(16,185,129,0.3)] hover:shadow-[0_25px_50px_-12px_rgba(16,185,129,0.4)] hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-2">
                                        Проверить доступ
                                        <ShieldCheck className="w-5 h-5 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300" />
                                    </span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div className="space-y-8 text-center animate-in slide-in-from-bottom-8 duration-700">
                            <div className="relative inline-flex mb-2">
                                <div className="absolute inset-0 bg-emerald-500/30 blur-2xl rounded-full animate-pulse" />
                                <div className="relative p-5 rounded-3xl bg-emerald-500 text-white shadow-xl shadow-emerald-500/40">
                                    <ShieldCheck className="w-10 h-10" />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h3 className={`text-3xl font-black tracking-tight ${textColor}`}>
                                    Успешная проверка
                                </h3>
                                <p className={`text-sm font-medium leading-relaxed max-w-[240px] mx-auto ${subTextColor}`}>
                                    Код подтвержден. Пожалуйста, сохраните ваш новый пароль
                                </p>
                            </div>

                            <div className={`group relative p-8 rounded-[2rem] border-2 border-dashed transition-all duration-500 ${theme === 'dark' ? 'bg-white/[0.02] border-emerald-500/30 hover:border-emerald-500/50' : 'bg-emerald-50/30 border-emerald-500/20 hover:border-emerald-500/40'}`}>
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-emerald-500 text-[10px] font-black tracking-widest text-white">
                                    Ваш пароль
                                </div>
                                <p className={`text-3xl font-black tracking-tighter ${textColor} break-all selection:bg-emerald-500/30`}>
                                    {recoveredPassword}
                                </p>
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
