import React from 'react'
import { useThemeStore } from '@/store/themeStore'
import { Lightbulb } from 'lucide-react'
import { AVFLateVolumeStrategy } from './AVFLateVolumeStrategy'

export const MemecoinStrategies: React.FC = () => {
    const { theme } = useThemeStore()

    const headingColor = theme === 'dark' ? 'text-white' : 'text-gray-900'

    return (
        <div className="space-y-10">
            {/* Intro Section */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className={`text-2xl font-black ${headingColor}`}>Мемкоины</h2>
                    <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        Работа с высокорисковыми активами на базе системного подхода
                    </p>
                </div>
            </div>

            {/* Strategies Block */}
            <div className="space-y-6">
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

                <div className={`rounded-3xl border p-1 sm:p-2 ${theme === 'dark' ? 'bg-[#0b1015]/50 border-white/5' : 'bg-white border-gray-100'
                    } shadow-xl`}>
                    <div className={`p-6 sm:p-8 rounded-[2.5rem] ${theme === 'dark' ? 'bg-[#151a21]/50' : 'bg-gray-50/50'
                        }`}>
                        <AVFLateVolumeStrategy />
                    </div>
                </div>
            </div>
        </div>
    )
}
