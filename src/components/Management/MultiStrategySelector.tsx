import React from 'react'
import { TriggerStrategy } from '@/types'

interface MultiStrategySelectorProps {
    value: TriggerStrategy[]
    onChange: (strategies: TriggerStrategy[]) => void
    theme: string
}

export const MultiStrategySelector: React.FC<MultiStrategySelectorProps> = ({ value, onChange, theme }) => {
    const strategies: { value: TriggerStrategy; label: string }[] = [
        { value: 'Фиба', label: 'Фиба' },
        { value: 'Market Entry', label: 'Market Entry' }
    ]

    const toggleStrategy = (strategy: TriggerStrategy) => {
        if (value.includes(strategy)) {
            onChange(value.filter(s => s !== strategy))
        } else {
            onChange([...value, strategy])
        }
    }

    return (
        <div className="space-y-1">
            <label className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Стратегии</label>
            <div className="flex flex-wrap gap-2">
                {strategies.map(s => {
                    const isActive = value.includes(s.value)
                    return (
                        <button
                            key={s.value}
                            type="button"
                            onClick={() => toggleStrategy(s.value)}
                            className={`flex-1 min-w-[100px] px-3 py-2 rounded-xl text-xs font-semibold border-2 transition-all duration-300 ${isActive
                                ? 'bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-500/20 scale-[1.02]'
                                : theme === 'dark'
                                    ? 'bg-black/20 border-white/10 text-gray-400 hover:border-white/20 hover:bg-black/40'
                                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                                } active:scale-95`}
                        >
                            {s.label}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
