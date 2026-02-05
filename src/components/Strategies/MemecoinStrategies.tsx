import React, { useState, useEffect } from 'react'
import { useThemeStore } from '@/store/themeStore'
import { useAuthStore } from '@/store/authStore'
import { useAdminStore } from '@/store/adminStore'
import { checkUserAccess } from '@/services/firestoreService'
import {
    Lightbulb,
    Zap,
    BarChart,
    Timer,
    Layers,
    Lock
} from 'lucide-react'
import { AVALateVolumeStrategy } from './AVALateVolumeStrategy'
import { AVAIntradayStrategy } from './AVAIntradayStrategy'
import { AVAFlipStrategy } from './AVAFlipStrategy'
import { AVAFlipFibaStrategy } from './AVAFlipFibaStrategy'
import { AVAFibaModeStrategy } from './AVAFibaModeStrategy'
import { StrategySelector } from './StrategySelector'

type StrategyId = 'late-volume' | 'intraday' | 'flip' | 'flip-fiba' | 'fiba-mode' | null;

export const MemecoinStrategies: React.FC = () => {
    const { theme } = useThemeStore()
    const { user } = useAuthStore()
    const { isAdmin } = useAdminStore()
    const [activeStrategy, setActiveStrategy] = useState<StrategyId>(null)
    const [hasStrategiesAccess, setHasStrategiesAccess] = useState(true)
    const [loading, setLoading] = useState(true)

    const headingColor = theme === 'dark' ? 'text-white' : 'text-gray-900'

    useEffect(() => {
        const checkAccess = async () => {
            if (!user || isAdmin) {
                setLoading(false)
                return
            }

            const stratResult = await checkUserAccess(user.id, 'tools_strategies_view')

            setHasStrategiesAccess(stratResult.hasAccess)
            setLoading(false)
        }

        checkAccess()
    }, [user, isAdmin])

    const strategies = [
        {
            id: 'late-volume',
            name: 'AVA Late Volume',
            icon: <BarChart className="w-4 h-4" />,
            desc: 'Работа с аномальными объемами на поздних стадиях.'
        },
        {
            id: 'intraday',
            name: 'AVA Intraday',
            icon: <Zap className="w-4 h-4" />,
            desc: 'Внутридневная торговля на основе технического анализа.'
        },
        {
            id: 'flip',
            name: 'AVA FLIP-1S',
            icon: <Timer className="w-4 h-4" />,
            desc: 'Скоростная торговля на изменениях цены в 1 секунду.'
        },
        {
            id: 'flip-fiba',
            name: 'AVA FLIP + FIBA',
            icon: <Zap className="w-4 h-4" />,
            desc: 'Интрадей-флип токенов Solana pre-migration.'
        },
        {
            id: 'fiba-mode',
            name: 'AVA - FIBA MODE',
            icon: <Layers className="w-4 h-4" />,
            desc: 'Торговля, основанная на уровнях Фибоначчи для определения точек входа-выхода.'
        },
    ]

    if (loading) {
        return null // Sub-loading handled by parent
    }

    return (
        <div className="space-y-16 pb-20">
            {/* 2. Strategies Block */}
            {hasStrategiesAccess ? (
                <>
                    <StrategySelector
                        strategies={strategies}
                        activeStrategy={activeStrategy}
                        setActiveStrategy={(id) => setActiveStrategy(id as StrategyId)}
                        categoryName="Стратегии"
                        categoryDescription="Проверенные методики отбора и управления позициями"
                        categoryIcon={<Lightbulb className="w-6 h-6 text-blue-500" />}
                    />

                    {activeStrategy && (
                        <div className={`rounded-3xl border p-1 sm:p-2 ${theme === 'dark' ? 'bg-[#0b1015]/50 border-white/5' : 'bg-white border-gray-100'
                            } shadow-xl animate-scale-up`}>
                            <div className={`p-6 sm:p-8 rounded-[2.5rem] ${theme === 'dark' ? 'bg-[#151a21]/50' : 'bg-gray-50/50'
                                }`}>
                                <div className="mb-6 flex items-center justify-between">
                                    <button
                                        onClick={() => setActiveStrategy(null)}
                                        className="text-xs font-bold text-gray-500 hover:text-blue-500 transition-colors flex items-center gap-1"
                                    >
                                        ← К списку стратегий
                                    </button>
                                </div>
                                {activeStrategy === 'late-volume' ? (
                                    <AVALateVolumeStrategy />
                                ) : activeStrategy === 'intraday' ? (
                                    <AVAIntradayStrategy />
                                ) : activeStrategy === 'flip' ? (
                                    <AVAFlipStrategy />
                                ) : activeStrategy === 'flip-fiba' ? (
                                    <AVAFlipFibaStrategy />
                                ) : (
                                    <AVAFibaModeStrategy />
                                )}
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <section className={`p-8 rounded-3xl border text-center space-y-4 ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                    <Lock className="w-12 h-12 text-gray-500 mx-auto" />
                    <h3 className={`text-lg font-bold ${headingColor}`}>Доступ к стратегиям заблокирован</h3>
                    <p className="text-sm text-gray-500">Свяжитесь с администратором для получения доступа.</p>
                </section>
            )}

            {/* 3. Tools Block */}
            <section className="space-y-8">
                {/* ... остальной код ... */}
            </section>
        </div>
    )
}
