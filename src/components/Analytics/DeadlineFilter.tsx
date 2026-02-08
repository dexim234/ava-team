import React from 'react'
import { useThemeStore } from '@/store/themeStore'

interface DeadlineFilterProps {
    activeFilter: 'all' | '<24h' | '<48h' | '<72h'
    setActiveFilter: (filter: 'all' | '<24h' | '<48h' | '<72h') => void
}

export const DeadlineFilter: React.FC<DeadlineFilterProps> = ({ activeFilter, setActiveFilter }) => {
    const { theme } = useThemeStore()

    const filters = [
        { label: 'Все', value: 'all' },
        { label: '< 24 ч', value: '<24h' },
        { label: '< 48 ч', value: '<48h' },
        { label: '< 72 ч', value: '<72h' },
    ]

    return (
        <div className={`inline-flex items-center rounded-xl p-1 ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-100'}`}>
            {filters.map((filter) => (
                <button
                    key={filter.value}
                    onClick={() => setActiveFilter(filter.value as any)} // will fix type later
                    className={`px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm font-medium transition-all ${activeFilter === filter.value
                        ? (theme === 'dark' ? 'bg-white/10 text-white' : 'bg-white text-gray-900 shadow')
                        : 'text-gray-500 hover:text-gray-300' // Changed hover color for dark mode
                        }`}
                >
                    {filter.label}
                </button>
            ))}
        </div>
    )
}

