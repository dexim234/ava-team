import { useState, useEffect } from 'react'
import { useThemeStore } from '@/store/themeStore'
import { useAccessControl } from '@/hooks/useAccessControl'
import {
    TrendingUp,
    LineChart,
    BarChart3,
    Image as ImageIcon,
    Database,
    Wallet2,
    Zap,
    Gift,
    MoreHorizontal,
    Code,
    Briefcase,
} from 'lucide-react'
import { SphereSelector } from '@/components/Strategies/SphereSelector'
import { MemecoinStrategies } from '@/components/Strategies/MemecoinStrategies'
import { PolymarketStrategies } from '@/components/Strategies/PolymarketStrategies'
import { NftStrategies } from '@/components/Strategies/NftStrategies'
import { FuturesStrategies } from '@/components/Strategies/FuturesStrategies'
import { AirDropStrategies } from '@/components/Strategies/AirDropStrategies'
import { OtherStrategies } from '@/components/Strategies/OtherStrategies'

type TabType = 'memecoins_trading' | 'memecoins_deving' | 'polymarket' | 'futures' | 'prop_trading' | 'spot' | 'nft' | 'staking' | 'airdrop' | 'other'

export const Strategies = () => {
    const { theme } = useThemeStore()
    const [activeTab, setActiveTab] = useState<TabType>('memecoins_trading')

    const headingColor = theme === 'dark' ? 'text-white' : 'text-gray-900'

    const pageAccess = useAccessControl('tools_strategies_view')
    const memecoinsTradingAccess = useAccessControl('tools_kontur_memecoins_trading')
    const memecoinsDevingAccess = useAccessControl('tools_kontur_memecoins_deving')
    const polymarketAccess = useAccessControl('tools_kontur_polymarket')
    const nftAccess = useAccessControl('tools_kontur_nft')
    const stakingAccess = useAccessControl('tools_kontur_staking')
    const spotAccess = useAccessControl('tools_kontur_spot')
    const futuresAccess = useAccessControl('tools_kontur_futures')
    const airdropAccess = useAccessControl('tools_kontur_airdrop')
    const propTradingAccess = useAccessControl('tools_kontur_prop_trading')
    const otherAccess = useAccessControl('tools_kontur_other')

    const tabs: { id: TabType; label: string; icon: any; access: { hasAccess: boolean; loading: boolean } }[] = [
        { id: 'memecoins_trading', label: 'Мемкоины (торговля)', icon: <TrendingUp className="w-4 h-4" />, access: memecoinsTradingAccess },
        { id: 'memecoins_deving', label: 'Мемкоины (девинг)', icon: <Code className="w-4 h-4" />, access: memecoinsDevingAccess },
        { id: 'polymarket', label: 'Polymarket', icon: <BarChart3 className="w-4 h-4" />, access: polymarketAccess },
        { id: 'futures', label: 'Фьючерсы', icon: <Zap className="w-4 h-4" />, access: futuresAccess },
        { id: 'prop_trading', label: 'Проп-трейдинг', icon: <Briefcase className="w-4 h-4" />, access: propTradingAccess },
        { id: 'spot', label: 'Спот', icon: <Wallet2 className="w-4 h-4" />, access: spotAccess },
        { id: 'nft', label: 'NFT', icon: <ImageIcon className="w-4 h-4" />, access: nftAccess },
        { id: 'staking', label: 'Стейкинг', icon: <Database className="w-4 h-4" />, access: stakingAccess },
        { id: 'airdrop', label: 'AirDrop', icon: <Gift className="w-4 h-4" />, access: airdropAccess },
        { id: 'other', label: 'Прочее', icon: <MoreHorizontal className="w-4 h-4" />, access: otherAccess },
    ]

    const visibleTabs = tabs.filter(t => t.access.hasAccess)
    const anyLoading = tabs.some(t => t.access.loading) || pageAccess.loading

    useEffect(() => {
        if (!anyLoading && visibleTabs.length > 0 && !visibleTabs.find(t => t.id === activeTab)) {
            setActiveTab(visibleTabs[0].id)
        }
    }, [anyLoading, visibleTabs, activeTab])

    const spheres = visibleTabs.map(t => ({
        id: t.id,
        label: t.label,
        icon: t.icon
    }))

    if (anyLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
            </div>
        )
    }

    if (!pageAccess.hasAccess || visibleTabs.length === 0) {
        return (
            <div className="py-20 text-center space-y-4">
                <TrendingUp className="w-16 h-16 text-gray-700 mx-auto opacity-20" />
                <h3 className={`text-xl font-black ${headingColor}`}>Доступ ограничен</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                    {pageAccess.reason || 'У вас нет доступа к разделам AVA Контур. Свяжитесь с администрацией.'}
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
                        <TrendingUp className="w-8 h-8 text-blue-500" />
                    </div>
                    <div>
                        <h1 className={`text-2xl md:text-3xl font-black tracking-tight ${headingColor}`}>
                            Contour
                        </h1>
                        <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} whitespace-nowrap`}>
                            Авторские материалы AVA - Team
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
                {activeTab === 'memecoins_trading' ? (
                    <MemecoinStrategies />
                ) : activeTab === 'memecoins_deving' ? (
                    <div className="py-20 text-center space-y-4">
                        <div className="flex justify-center">
                            <Code className="w-16 h-16 text-gray-700 animate-pulse" />
                        </div>
                        <h3 className={`text-xl font-black ${headingColor}`}>
                            {'Мемкоины (девинг)'} — В разработке
                        </h3>
                        <p className="text-gray-500 max-w-md mx-auto px-4">
                            Мы готовим новые контентные модули и стратегии для данного направления. Следите за обновлениями в AVA Контур.
                        </p>
                    </div>
                ) : activeTab === 'polymarket' ? (
                    <PolymarketStrategies />
                ) : activeTab === 'futures' ? (
                    <FuturesStrategies />
                ) : activeTab === 'prop_trading' ? (
                     <div className="py-20 text-center space-y-4">
                        <div className="flex justify-center">
                            <Briefcase className="w-16 h-16 text-gray-700 animate-pulse" />
                        </div>
                        <h3 className={`text-xl font-black ${headingColor}`}>
                            {'Проп-трейдинг'} — В разработке
                        </h3>
                        <p className="text-gray-500 max-w-md mx-auto px-4">
                            Мы готовим новые контентные модули и стратегии для данного направления. Следите за обновлениями в AVA Контур.
                        </p>
                    </div>
                ) : activeTab === 'spot' ? (
                    <div className="py-20 text-center space-y-4">
                        <div className="flex justify-center">
                            <Wallet2 className="w-16 h-16 text-gray-700 animate-pulse" />
                        </div>
                        <h3 className={`text-xl font-black ${headingColor}`}>
                            {'Спот'} — В разработке
                        </h3>
                        <p className="text-gray-500 max-w-md mx-auto px-4">
                            Мы готовим новые контентные модули и стратегии для данного направления. Следите за обновлениями в AVA Контур.
                        </p>
                    </div>
                ) : activeTab === 'nft' ? (
                    <NftStrategies />
                ) : activeTab === 'staking' ? (
                    <div className="py-20 text-center space-y-4">
                        <div className="flex justify-center">
                            <Database className="w-16 h-16 text-gray-700 animate-pulse" />
                        </div>
                        <h3 className={`text-xl font-black ${headingColor}`}>
                            {'Стейкинг'} — В разработке
                        </h3>
                        <p className="text-gray-500 max-w-md mx-auto px-4">
                            Мы готовим новые контентные модули и стратегии для данного направления. Следите за обновлениями в AVA Контур.
                        </p>
                    </div>
                ) : activeTab === 'airdrop' ? (
                    <AirDropStrategies />
                ) : activeTab === 'other' ? (
                    <OtherStrategies />
                ) : (
                    <div className="py-20 text-center space-y-4">
                        <div className="flex justify-center">
                            <LineChart className="w-16 h-16 text-gray-700 animate-pulse" />
                        </div>
                        <h3 className={`text-xl font-black ${headingColor}`}>
                            {tabs.find(t => t.id === activeTab)?.label} — В разработке
                        </h3>
                        <p className="text-gray-500 max-w-md mx-auto px-4">
                            Мы готовим новые контентные модули и стратегии для данного направления. Следите за обновлениями в AVA Контур.
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Strategies
