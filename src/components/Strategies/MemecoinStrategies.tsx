import React, { useState } from 'react'
import { useThemeStore } from '@/store/themeStore'
import {
    Lightbulb,
    BookOpen,
    Wrench,
    Brain,
    Zap,
    Clock,
    Repeat,
    BarChart,
    MessageSquare,
    Search,
    Timer
} from 'lucide-react'
import { AVFLateVolumeStrategy } from './AVFLateVolumeStrategy'
import { AVFIntradayStrategy } from './AVFIntradayStrategy'
import { AVFFlipStrategy } from './AVFFlipStrategy'

type StrategyId = 'late-volume' | 'intraday' | 'flip';

export const MemecoinStrategies: React.FC = () => {
    const { theme } = useThemeStore()
    const [activeStrategy, setActiveStrategy] = useState<StrategyId>('late-volume')

    const headingColor = theme === 'dark' ? 'text-white' : 'text-gray-900'

    const lessons = [
        { title: 'Психология', icon: <Brain className="w-5 h-5 text-purple-400" />, desc: 'Управление эмоциями и FOMO' },
        { title: 'Интрадей-торговля', icon: <Zap className="w-5 h-5 text-amber-400" />, desc: 'Быстрые сделки внутри дня' },
        { title: 'Среднесрок и геймхантинг', icon: <Clock className="w-5 h-5 text-blue-400" />, desc: 'Поиск долгосрочных нарративов' },
        { title: 'Флип', icon: <Repeat className="w-5 h-5 text-emerald-400" />, desc: 'Стратегии быстрого перезахода' },
        { title: 'Фибоначчи', icon: <BarChart className="w-5 h-5 text-rose-400" />, desc: 'Технический анализ уровней' },
        { title: 'Нарративы', icon: <MessageSquare className="w-5 h-5 text-sky-400" />, desc: 'Анализ рыночных трендов' },
        { title: 'Ончейн-анализ', icon: <Search className="w-5 h-5 text-indigo-400" />, desc: 'Отслеживание кошельков и китов' },
    ]

    const strategies = [
        { id: 'late-volume', name: 'AVF Late Volume', icon: <BarChart className="w-4 h-4" /> },
        { id: 'intraday', name: 'AVF Intraday', icon: <Zap className="w-4 h-4" /> },
        { id: 'flip', name: 'AVF FLIP-1S', icon: <Timer className="w-4 h-4" /> },
    ]

    return (
        <div className="space-y-16 pb-20">
            {/* 1. Lessons Block */}
            <section className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/10 rounded-xl border border-purple-500/20">
                        <BookOpen className="w-6 h-6 text-purple-500" />
                    </div>
                    <div>
                        <h3 className={`text-xl font-black ${headingColor}`}>Уроки</h3>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            Образовательная база для работы с мемкоинами
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {lessons.map((lesson, idx) => (
                        <div
                            key={idx}
                            className={`group p-5 rounded-2xl border transition-all duration-300 hover:shadow-lg ${theme === 'dark'
                                ? 'bg-[#151a21]/50 border-white/5 hover:border-purple-500/30'
                                : 'bg-white border-gray-100 hover:border-purple-500/20'
                                }`}
                        >
                            <div className={`p-2.5 rounded-xl w-fit mb-4 ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'} group-hover:scale-110 transition-transform`}>
                                {lesson.icon}
                            </div>
                            <h4 className={`font-bold mb-1 ${headingColor}`}>{lesson.title}</h4>
                            <p className="text-xs text-gray-500 line-clamp-2">{lesson.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* 2. Strategies Block */}
            <section className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
                            <Lightbulb className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                            <h3 className={`text-xl font-black ${headingColor}`}>Стратегии</h3>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                Проверенные методики отбора и управления позициями
                            </p>
                        </div>
                    </div>

                    {/* Strategy Selector */}
                    <div className={`flex p-1 rounded-xl w-fit ${theme === 'dark' ? 'bg-white/5 border border-white/5' : 'bg-gray-100'}`}>
                        {strategies.map(s => (
                            <button
                                key={s.id}
                                onClick={() => setActiveStrategy(s.id as StrategyId)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 ${activeStrategy === s.id
                                    ? 'bg-blue-500 text-white shadow-md'
                                    : 'text-gray-500 hover:text-gray-400'
                                    }`}
                            >
                                {s.icon}
                                {s.name}
                            </button>
                        ))}
                    </div>
                </div>

                <div className={`rounded-3xl border p-1 sm:p-2 ${theme === 'dark' ? 'bg-[#0b1015]/50 border-white/5' : 'bg-white border-gray-100'
                    } shadow-xl`}>
                    <div className={`p-6 sm:p-8 rounded-[2.5rem] ${theme === 'dark' ? 'bg-[#151a21]/50' : 'bg-gray-50/50'
                        }`}>
                        {activeStrategy === 'late-volume' ? (
                            <AVFLateVolumeStrategy />
                        ) : activeStrategy === 'intraday' ? (
                            <AVFIntradayStrategy />
                        ) : (
                            <AVFFlipStrategy />
                        )}
                    </div>
                </div>
            </section>

            {/* 3. Tools Block */}
            <section className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/20">
                        <Wrench className="w-6 h-6 text-amber-500" />
                    </div>
                    <div>
                        <h3 className={`text-xl font-black ${headingColor}`}>Инструменты</h3>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            Вспомогательные сервисы и скрипты
                        </p>
                    </div>
                </div>

                <div className={`rounded-2xl p-12 border border-dashed text-center ${theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50'
                    }`}>
                    <p className={`text-lg font-bold ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                        Инструменты находятся в стадии разработки и появятся позже
                    </p>
                </div>
            </section>
        </div>
    )
}
