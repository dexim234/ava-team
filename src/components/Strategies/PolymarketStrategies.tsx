import React, { useState } from 'react'
import { useThemeStore } from '@/store/themeStore'
import {
    Lightbulb,
    Target,
    Calculator
} from 'lucide-react'
import { AVFValueBettingStrategy } from './AVFValueBettingStrategy'
import { AVFArbitrageStrategy } from './AVFArbitrageStrategy'

type StrategyId = 'value-betting' | 'arbitrage';

export const PolymarketStrategies: React.FC = () => {
    const { theme } = useThemeStore()
    const [activeStrategy, setActiveStrategy] = useState<StrategyId>('value-betting')

    const headingColor = theme === 'dark' ? 'text-white' : 'text-gray-900'

    const strategies = [
        { id: 'value-betting', name: 'AVF Value Betting', icon: <Target className="w-4 h-4" /> },
        { id: 'arbitrage', name: 'AVF Арбитраж', icon: <Calculator className="w-4 h-4" /> },
    ]

    return (
        <div className="space-y-16 pb-20">
            {/* Strategies Block */}
            <section className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-rose-500/10 rounded-xl border border-rose-500/20">
                            <Lightbulb className="w-6 h-6 text-rose-500" />
                        </div>
                        <div>
                            <h3 className={`text-xl font-black ${headingColor}`}>Стратегии</h3>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                Проверенные методики работы с прогнозными рынками
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
                                    ? 'bg-rose-500 text-white shadow-md'
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
                        {activeStrategy === 'value-betting' ? (
                            <AVFValueBettingStrategy />
                        ) : (
                            <AVFArbitrageStrategy />
                        )}
                    </div>
                </div>
            </section>
        </div>
    )
}
