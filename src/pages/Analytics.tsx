import { useState } from 'react'
import { useThemeStore } from '@/store/themeStore'
import { useAccessControl } from '@/hooks/useAccessControl'
import {
    Zap,
    Image as ImageIcon,
    Database,
    Wallet2,
    Gift,
    BarChart3
} from 'lucide-react'
import { SphereSelector } from '@/components/Strategies/SphereSelector'

type TabType = 'meme' | 'polymatker' | 'nft' | 'staking' | 'spot' | 'airdrop'

export const Analytics = () => {
    const { theme } = useThemeStore()
    const [activeTab, setActiveTab] = useState<TabType>('meme')

    const headingColor = theme === 'dark' ? 'text-white' : 'text-gray-900'
    const cardBg = theme === 'dark' ? 'bg-gray-800' : 'bg-white'
    const borderColor = theme === 'dark' ? 'border-white/10' : 'border-gray-200'
    const subtleColor = theme === 'dark' ? 'text-gray-400' : 'text-gray-600'

    const pageAccess = useAccessControl('tools_strategies_view')

    const tabs: { id: TabType; label: string; icon: any }[] = [
        { id: 'meme', label: 'Meme', icon: <Zap className="w-4 h-4" /> },
        { id: 'polymatker', label: 'Polymatker', icon: <BarChart3 className="w-4 h-4" /> },
        { id: 'nft', label: 'NFT', icon: <ImageIcon className="w-4 h-4" /> },
        { id: 'staking', label: 'Стейкинг', icon: <Database className="w-4 h-4" /> },
        { id: 'spot', label: 'Спот и фьючи', icon: <Wallet2 className="w-4 h-4" /> },
        { id: 'airdrop', label: 'AirDrop', icon: <Gift className="w-4 h-4" /> },
    ]

    const spheres = tabs.map(t => ({
        id: t.id,
        label: t.label,
        icon: t.icon
    }))

    const renderContent = () => {
        const currentTab = tabs.find(t => t.id === activeTab)
        
        return (
            <div className={`rounded-2xl border ${borderColor} ${cardBg} shadow-sm overflow-hidden`}>
                <div className={`p-6 border-b ${borderColor} bg-gradient-to-r from-blue-500/5 to-purple-500/5`}>
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-lg">
                            {currentTab?.icon}
                        </div>
                        <div>
                            <h2 className={`text-xl font-bold ${headingColor}`}>
                                Аналитика {currentTab?.label}
                            </h2>
                            <p className={`text-sm ${subtleColor}`}>
                                Подробная аналитика по направлению {currentTab?.label.toLowerCase()}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    <div className="text-center py-12">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/10 mb-4">
                            {currentTab?.icon}
                        </div>
                        <h3 className={`text-lg font-bold ${headingColor} mb-2`}>
                            Аналитика {currentTab?.label} — В разработке
                        </h3>
                        <p className={`text-sm ${subtleColor} max-w-md mx-auto`}>
                            Мы готовим детальную аналитику и инструменты для данного направления. 
                            Здесь будут представлены ключевые метрики, тренды и аналитические материалы.
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    if (pageAccess.loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
            </div>
        )
    }

    if (!pageAccess.hasAccess) {
        return (
            <div className="py-20 text-center space-y-4">
                <BarChart3 className="w-16 h-16 text-gray-700 mx-auto opacity-20" />
                <h3 className={`text-xl font-black ${headingColor}`}>Доступ ограничен</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                    {pageAccess.reason || 'У вас нет доступа к разделу Аналитика. Свяжитесь с администрацией.'}
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-white/5">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                        <BarChart3 className="w-8 h-8 text-blue-500" />
                    </div>
                    <div>
                        <h1 className={`text-2xl md:text-3xl font-black tracking-tight ${headingColor}`}>
                            Аналитика
                        </h1>
                        <p className={`text-sm font-medium ${subtleColor} whitespace-nowrap`}>
                            Детальная аналитика по всем направлениям
                        </p>
                    </div>
                </div>

                <div className="w-full sm:w-auto">
                    <SphereSelector
                        spheres={spheres}
                        activeSphere={activeTab}
                        setActiveSphere={(id) => setActiveTab(id as TabType)}
                    />
                </div>
            </div>

            {/* Tab Content */}
            <div className="animate-fade-in">
                {renderContent()}
            </div>
        </div>
    )
}

export default Analytics