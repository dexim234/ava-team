import React, { useState } from 'react'
import { useThemeStore } from '@/store/themeStore'
import {
    BarChart3,
    Search,
    LayoutList,
    TrendingUp,
    ChevronDown,
    ChevronUp,
    Twitter,
    Send,
    Target,
    Calculator,
    Clock,
    Zap,
    XCircle,
    HelpCircle,
    ArrowRightLeft
} from 'lucide-react'

interface StrategyStepProps {
    number: number
    title: string
    children: React.ReactNode
    icon: React.ReactNode
    isOpen: boolean
    onToggle: () => void
}

const StrategyStep: React.FC<StrategyStepProps> = ({ number, title, children, icon, isOpen, onToggle }) => {
    const { theme } = useThemeStore()

    return (
        <div className={`overflow-hidden rounded-2xl border transition-all duration-300 ${theme === 'dark'
            ? 'bg-[#1a212a]/50 border-white/5 shadow-inner'
            : 'bg-white border-gray-100 shadow-sm'
            }`}>
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between p-5 text-left transition-colors hover:bg-white/5"
            >
                <div className="flex items-center gap-4">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-xl font-black text-lg ${theme === 'dark' ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-50 text-orange-600'
                        }`}>
                        {number}
                    </div>
                    <div className="flex items-center gap-3">
                        <div className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                            {icon}
                        </div>
                        <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {title}
                        </h3>
                    </div>
                </div>
                {isOpen ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
            </button>

            {isOpen && (
                <div className={`p-6 pt-0 border-t ${theme === 'dark' ? 'border-white/5' : 'border-gray-50'}`}>
                    <div className={`mt-4 space-y-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        {children}
                    </div>
                </div>
            )}
        </div>
    )
}

export const AVFIntradayStrategy: React.FC = () => {
    const { theme } = useThemeStore()
    const [openStep, setOpenStep] = useState<number | null>(1)

    const toggleStep = (step: number) => {
        setOpenStep(openStep === step ? null : step)
    }

    const headingColor = theme === 'dark' ? 'text-white' : 'text-gray-900'

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Strategy Intro */}
            <div className={`relative overflow-hidden rounded-3xl p-8 border ${theme === 'dark'
                ? 'bg-gradient-to-br from-[#1a212a] to-[#0f1216] border-orange-500/20 shadow-2xl'
                : 'bg-gradient-to-br from-white to-orange-50/30 border-orange-500/10 shadow-xl'
                }`}>
                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 blur-3xl rounded-full -mr-20 -mt-20 pointer-events-none"></div>

                <div className="relative flex flex-col md:flex-row gap-8 items-start">
                    <div className={`p-4 rounded-2xl ${theme === 'dark' ? 'bg-orange-500/10' : 'bg-orange-500/5'}`}>
                        <Zap className={`w-12 h-12 ${theme === 'dark' ? 'text-orange-400' : 'text-orange-500'}`} />
                    </div>
                    <div className="flex-1 space-y-4">
                        <h2 className={`text-2xl md:text-3xl font-black ${headingColor}`}>AVF Intraday</h2>
                        <p className={`text-lg leading-relaxed ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                            AVF Intraday — это системная стратегия внутридневной торговли в Solana-сегменте, ориентированная на поиск и отработку свежих токенов с горизонтом удержания позиции от 1 часа до 1 торгового дня.
                        </p>
                        <div className={`flex flex-wrap gap-4 pt-2`}>
                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${theme === 'dark' ? 'bg-white/5 text-gray-400 border border-white/10' : 'bg-gray-100 text-gray-600 border border-gray-200'
                                }`}>
                                <Clock className="w-3.5 h-3.5" />
                                1H - 24H
                            </div>
                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${theme === 'dark' ? 'bg-white/5 text-gray-400 border border-white/10' : 'bg-gray-100 text-gray-600 border border-gray-200'
                                }`}>
                                <Search className="w-3.5 h-3.5" />
                                SOLANA MIGRATED
                            </div>
                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${theme === 'dark' ? 'bg-white/10 text-orange-400 border border-orange-500/20' : 'bg-orange-50 text-orange-600 border border-orange-200'
                                }`}>
                                <TrendingUp className="w-3.5 h-3.5" />
                                DCA / RETRACE
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Steps */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                        <LayoutList className={`w-6 h-6 ${theme === 'dark' ? 'text-orange-400' : 'text-orange-500'}`} />
                        <h3 className={`text-xl font-black ${headingColor}`}>Алгоритм работы</h3>
                    </div>

                    <StrategyStep
                        number={1}
                        title="Поиск свежих токенов"
                        icon={<Search className="w-5 h-5" />}
                        isOpen={openStep === 1}
                        onToggle={() => toggleStep(1)}
                    >
                        <ul className="space-y-2 text-sm list-disc list-inside pl-2">
                            <li>Открываем <strong>GMGN</strong> или <strong>Axiom</strong></li>
                            <li>Вкладка <strong>Migrated</strong> (переход в свободную торговлю)</li>
                            <li>Фильтруем по интересующим Launchpad’ам</li>
                            <li>Возраст токена: <strong>1 – 60 минут</strong></li>
                            <li className="text-orange-400">Токены старше 1 часа теряют потенциал</li>
                        </ul>
                    </StrategyStep>

                    <StrategyStep
                        number={2}
                        title="Скрининг базовых метрик"
                        icon={<Target className="w-5 h-5" />}
                        isOpen={openStep === 2}
                        onToggle={() => toggleStep(2)}
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Market Cap</p>
                                <p className={`text-lg font-black ${headingColor}`}>50k - 100k USD</p>
                                <p className="text-[10px] text-orange-400 font-medium">{'>'}100k — риск перегретости</p>
                            </div>
                            <div className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Объёмы</p>
                                <p className={`text-lg font-black ${headingColor}`}>Активные</p>
                                <p className="text-[10px] text-emerald-500 font-medium">Рост в 2-4 раза за период</p>
                            </div>
                            <div className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Холдеры</p>
                                <p className={`text-lg font-black ${headingColor}`}>+300 / 40м</p>
                                <p className="text-[10px] text-emerald-500 font-medium">Устойчивая динамика</p>
                            </div>
                        </div>
                    </StrategyStep>

                    <StrategyStep
                        number={3}
                        title="Проверка нарратива и социального фона"
                        icon={<Twitter className="w-5 h-5" />}
                        isOpen={openStep === 3}
                        onToggle={() => toggleStep(3)}
                    >
                        <div className="space-y-4">
                            <div className="flex gap-4">
                                <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'}`}>
                                    <Twitter className="w-5 h-5 text-sky-400" />
                                </div>
                                <div>
                                    <h4 className="font-bold">Анализ Twitter / X</h4>
                                    <p className="text-xs text-gray-500">Свежие посты, комментарии, репосты, поддержка коллеров.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'}`}>
                                    <Send className="w-5 h-5 text-blue-400" />
                                </div>
                                <div>
                                    <h4 className="font-bold">Telegram-группа</h4>
                                    <p className="text-xs text-gray-500">Активность админ-состава и отсутствие бот-активности.</p>
                                </div>
                            </div>
                        </div>
                    </StrategyStep>

                    <StrategyStep
                        number={4}
                        title="Техническая оценка графика"
                        icon={<BarChart3 className="w-5 h-5" />}
                        isOpen={openStep === 4}
                        onToggle={() => toggleStep(4)}
                    >
                        <ul className="space-y-2 text-sm list-disc list-inside pl-2">
                            <li>Органичное движение (отсутствие "одной ракеты")</li>
                            <li>Сравнение объёмов на <strong>1m TF</strong> за последние 15 минут</li>
                            <li className="text-rose-400 font-bold">КРИТИЧНО: Не входим, если объёмы падают (напр. с 5k до 500)</li>
                        </ul>
                    </StrategyStep>

                    <StrategyStep
                        number={5}
                        title="Уровни Фибоначчи + Структура"
                        icon={<Calculator className="w-5 h-5" />}
                        isOpen={openStep === 5}
                        onToggle={() => toggleStep(5)}
                    >
                        <div className="space-y-4">
                            <p className="text-sm italic">Вход осуществляется только на откате. Вход в растущий график ЗАПРЕЩЁН.</p>
                            <div className="flex flex-wrap gap-2">
                                {['0.5', '0.618', '0.786'].map(level => (
                                    <div key={level} className={`px-4 py-2 rounded-lg border font-black text-sm ${theme === 'dark' ? 'bg-white/5 border-white/10 text-orange-400' : 'bg-orange-50 border-orange-200 text-orange-600'}`}>
                                        {level}
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-gray-500">Приоритет: совпадение уровня с локальной поддержкой или проторговкой.</p>
                        </div>
                    </StrategyStep>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Comparison */}
                    <div className={`rounded-2xl p-6 border ${theme === 'dark' ? 'bg-[#151a21]/80 border-white/5' : 'bg-white border-gray-100'
                        } shadow-lg space-y-4`}>
                        <div className="flex items-center gap-3">
                            <ArrowRightLeft className={`w-6 h-6 text-orange-500`} />
                            <h3 className={`text-lg font-black ${headingColor}`}>Сравнение стилей</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-orange-500 uppercase tracking-widest">VS ФИЛ</p>
                                <p className="text-[11px] text-gray-500">Фил — слепой вход. Intraday даёт время на анализ данных.</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-orange-500 uppercase tracking-widest">VS СКАЛЬПИНГ</p>
                                <p className="text-[11px] text-gray-500">Скальпинг — это секунды. Intraday — часы, меньше стресса.</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-orange-500 uppercase tracking-widest">VS ГЕМХАНТИНГ</p>
                                <p className="text-[11px] text-gray-500">Гем — ожидание сутками. Intraday — вход/выход в течение дня.</p>
                            </div>
                        </div>
                    </div>

                    {/* Red Flags Table-like section made simple */}
                    <div className={`rounded-2xl p-6 border ${theme === 'dark' ? 'bg-rose-500/5 border-rose-500/20' : 'bg-rose-50 border-rose-500/20'
                        } shadow-lg space-y-4`}>
                        <div className="flex items-center gap-3">
                            <XCircle className={`w-6 h-6 text-rose-500`} />
                            <h3 className={`text-lg font-black ${headingColor}`}>Красные флаги</h3>
                        </div>

                        <div className="space-y-3">
                            {[
                                { label: 'График', val: 'Ракета на старте / Пробой уровней вниз' },
                                { label: 'Объём', val: 'Резкое падение в 10+ раз' },
                                { label: 'Соцсети', val: 'Молчание или бот-активность' },
                                { label: 'Холдеры', val: 'Top-1 > 2% или бандлы > 30 SOL' },
                                { label: 'PNL', val: 'Большинство холдеров в х5+' },
                            ].map((item, id) => (
                                <div key={id} className="space-y-1 pb-2 border-b border-rose-500/10 last:border-0">
                                    <p className="text-[10px] font-black text-rose-500/70 uppercase">{item.label}</p>
                                    <p className="text-xs font-medium text-gray-500 leading-tight">{item.val}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Rule */}
            <div className={`rounded-2xl p-6 border-l-8 ${theme === 'dark' ? 'bg-[#0b1015] border-orange-500/50' : 'bg-gray-50 border-orange-500/30'
                }`}>
                <div className="flex gap-4 items-start">
                    <HelpCircle className="w-8 h-8 text-orange-500 shrink-0" />
                    <div className="space-y-2">
                        <h4 className={`text-lg font-black ${headingColor}`}>Зачем нужна AVF Intraday?</h4>
                        <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            Эта стратегия — не про FOMO и не про угадывание раннеров. Это рабочая ежедневная рутина, где результат достигается за счёт анализа, а не спешки. Intraday позволяет работать с токенами, у которых уже есть график, данные и активность, при этом чётко понимая риск до нажатия кнопки BUY.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
