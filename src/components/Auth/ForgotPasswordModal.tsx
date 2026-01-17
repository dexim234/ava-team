import { useState } from 'react'
import { X, Lock, Key, AlertTriangle, ShieldCheck } from 'lucide-react'
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
            <div className={`relative w-full max-w-md overflow-hidden rounded-[2rem] ${bgColor} shadow-2xl border ${borderColor} animate-in fade-in zoom-in duration-300`}>
                {/* Decorative Background */}
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-emerald-500/20 via-emerald-400/10 to-transparent pointer-events-none" />

                <div className="relative p-8">
                    <button
                        onClick={onClose}
                        className={`absolute top-6 right-6 p-2 rounded-full transition-all ${theme === 'dark' ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                    >
                        <X className="w-5 h-5" />
                    </button>

                    {!recoveredPassword ? (
                        <div className="space-y-6">
                            <div className="text-center space-y-2">
                                <div className="inline-flex p-3 rounded-2xl bg-emerald-500/10 text-emerald-500 mb-2">
                                    <Lock className="w-6 h-6" />
                                </div>
                                <h3 className={`text-2xl font-black tracking-tight ${textColor}`}>
                                    Восстановление
                                </h3>
                                <p className={`text-sm font-medium ${subTextColor}`}>
                                    Введите данные для получения доступа
                                </p>
                            </div>

                            <form onSubmit={handleRecover} className="space-y-4">
                                <div className="space-y-2">
                                    <label className={`text-xs font-black uppercase tracking-widest ${subTextColor}`}>
                                        Логин
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                            <Lock className="w-4 h-4" />
                                        </div>
                                        <input
                                            type="text"
                                            value={login}
                                            onChange={(e) => setLogin(e.target.value)}
                                            placeholder="example@apevault.io"
                                            className={`w-full pl-11 pr-4 py-3.5 rounded-2xl border transition-all focus:outline-none focus:ring-4 focus:ring-emerald-500/10 ${theme === 'dark'
                                                ? 'bg-white/5 border-white/10 text-white placeholder-gray-600 focus:border-emerald-500'
                                                : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-500'}`}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className={`text-xs font-black uppercase tracking-widest ${subTextColor}`}>
                                        Специальный код
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                            <Key className="w-4 h-4" />
                                        </div>
                                        <input
                                            type="text"
                                            value={code}
                                            onChange={(e) => setCode(e.target.value)}
                                            placeholder="00000000"
                                            className={`w-full pl-11 pr-4 py-3.5 rounded-2xl border transition-all focus:outline-none focus:ring-4 focus:ring-emerald-500/10 ${theme === 'dark'
                                                ? 'bg-white/5 border-white/10 text-white placeholder-gray-600 focus:border-emerald-500'
                                                : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-500'}`}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Warning Card */}
                                <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex gap-3">
                                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                                    <p className="text-[11px] font-bold text-amber-600 dark:text-amber-400 leading-relaxed uppercase tracking-tighter">
                                        Внимание: если вы забыли специальный код, восстановить его невозможно, доступ к аккаунту утерян навсегда.
                                    </p>
                                </div>

                                {error && (
                                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold text-center">
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    className="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                                >
                                    Проверить код
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div className="space-y-6 text-center animate-in slide-in-from-bottom-4 duration-500">
                            <div className="inline-flex p-3 rounded-2xl bg-emerald-500 text-white mb-2 shadow-lg shadow-emerald-500/30">
                                <ShieldCheck className="w-8 h-8" />
                            </div>
                            <div className="space-y-2">
                                <h3 className={`text-2xl font-black tracking-tight ${textColor}`}>
                                    Код подтвержден
                                </h3>
                                <p className={`text-sm font-medium ${subTextColor}`}>
                                    Пожалуйста, запишите ваш пароль в надежное место
                                </p>
                            </div>

                            <div className={`p-6 rounded-3xl border-2 border-dashed ${theme === 'dark' ? 'bg-white/5 border-emerald-500/30' : 'bg-emerald-50 border-emerald-500/20'}`}>
                                <p className={`text-xs font-black uppercase tracking-widest text-emerald-500 mb-2`}>
                                    Ваш текущий пароль
                                </p>
                                <p className={`text-2xl font-black tracking-tighter ${textColor} break-all`}>
                                    {recoveredPassword}
                                </p>
                            </div>

                            <button
                                onClick={onClose}
                                className="w-full py-4 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black transition-all hover:opacity-90 active:scale-95"
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
