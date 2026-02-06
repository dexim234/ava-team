import { useState } from 'react'
import { useThemeStore } from '@/store/themeStore'
import { useAccessControl } from '@/hooks/useAccessControl'
import {
    BarChart3,
    Plus,
    Wallet2
} from 'lucide-react'
import { SphereSelector } from '@/components/Strategies/SphereSelector'
import { CreateAnalyticsModal } from '@/components/Analytics/CreateAnalyticsModal'
import { AnalyticsList } from '@/components/Analytics/AnalyticsList'
import { analyticsService } from '@/services/analyticsService'

type TabType = 'polymatker' | 'spot'

export const Analytics = () => {
    const { theme } = useThemeStore()
    const [activeTab, setActiveTab] = useState<TabType>('polymatker')
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

    // Service for analytics management


    const headingColor = theme === 'dark' ? 'text-white' : 'text-gray-900'
    const subtleColor = theme === 'dark' ? 'text-gray-400' : 'text-gray-600'

    const pageAccess = useAccessControl('tools_strategies_view')

    const tabs: { id: TabType; label: string; icon: any }[] = [
        { id: 'polymatker', label: 'Polymarket', icon: <BarChart3 className="w-4 h-4" /> },
        { id: 'spot', label: 'Спот и Фьючерсы', icon: <Wallet2 className="w-4 h-4" /> },
    ]

    const spheres = tabs.map(t => ({
        id: t.id,
        label: t.label,
        icon: t.icon
    }))

    const handleCreateAnalytics = async (data: any) => {
        try {
            const id = await analyticsService.createAnalytics(data)
            if (id) {
                console.log('Analytics created successfully:', id)
                // Analytics will be automatically refreshed through the AnalyticsList component
            }
        } catch (error) {
            console.error('Failed to create analytics:', error)
            throw error
        }
    }

    const renderContent = () => {
        return <AnalyticsList sphere={activeTab} />
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

                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        Создать аналитику
                    </button>
                    <div className="w-full sm:w-auto">
                        <SphereSelector
                            spheres={spheres}
                            activeSphere={activeTab}
                            setActiveSphere={(id) => setActiveTab(id as TabType)}
                        />
                    </div>
                </div>
            </div>

            {/* Tab Content */}
            <div className="animate-fade-in">
                {renderContent()}
            </div>

            {/* Create Analytics Modal */}
            <CreateAnalyticsModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleCreateAnalytics}
            />
        </div>
    )
}

export default Analytics