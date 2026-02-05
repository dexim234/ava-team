import React, { useState, useEffect } from 'react'
import { useThemeStore } from '@/store/themeStore'
import { useAuthStore } from '@/store/authStore'
import { useAdminStore } from '@/store/adminStore'
import { checkUserAccess } from '@/services/firestoreService'
import {
    Wrench,
    Brain,
    Zap,
    BarChart,
    Search,
    Timer,
    Terminal,
    Monitor,
    Bot,
    Bell,
    Database,
    Share2,
    ShieldAlert,
    Users,
    ShieldCheck,
    Activity,
    TrendingUp,
    ExternalLink,
    Lock,
    Calendar,
    ArrowLeft,
    Layers,
} from 'lucide-react'
import { AVALateVolumeStrategy } from './AVALateVolumeStrategy'
import { AVAIntradayStrategy } from './AVAIntradayStrategy'
import { AVAFlipStrategy } from './AVAFlipStrategy'
import { AVAFlipFibaStrategy } from './AVAFlipFibaStrategy'
import { AVAFibaModeStrategy } from './AVAFibaModeStrategy'
import { StrategySelector } from './StrategySelector'

const renderIcon = (iconName: string, className: string) => {
    switch (iconName) {
        case 'TerminalIcon': return <Terminal className={className} />
        case 'DatabaseIcon': return <Database className={className} />
        case 'ShieldCheckIcon': return <ShieldCheck className={className} />
        case 'BrainIcon': return <Brain className={className} />
        case 'Share2Icon': return <Share2 className={className} />
        case 'SearchIcon': return <Search className={className} />
        case 'BarChartIcon': return <BarChart className={className} />
        case 'ZapIcon': return <Zap className={className} />
        case 'MonitorIcon': return <Monitor className={className} />
        case 'BotIcon': return <Bot className={className} />
        case 'BellIcon': return <Bell className={className} />
        case 'ShieldAlertIcon': return <ShieldAlert className={className} />
        case 'ActivityIcon': return <Activity className={className} />
        case 'UsersIcon': return <Users className={className} />
        case 'TrendingUpIcon': return <TrendingUp className={className} />
        case 'CalendarIcon': return <Calendar className={className} />
        default: return null
    }
}

export const MemecoinStrategies: React.FC = () => {
    const { theme } = useThemeStore()
    const { user } = useAuthStore()
    const { isAdmin } = useAdminStore()
    const [activeStrategy, setActiveStrategy] = useState<string | null>(null)
    const [activeToolCategory, setActiveToolCategory] = useState<number | null>(null)
    const [hasStrategiesAccess, setHasStrategiesAccess] = useState(true)
    const [hasToolsAccess, setHasToolsAccess] = useState(true)
    const [loading, setLoading] = useState(true)

    const headingColor = theme === 'dark' ? 'text-white' : 'text-gray-900'

    useEffect(() => {
        const checkAccess = async () => {
            if (!user || isAdmin) {
                setLoading(false)
                return
            }

            const [stratResult, toolsResult] = await Promise.all([
                checkUserAccess(user.id, 'tools_strategies_view'),
                checkUserAccess(user.id, 'tools_items_view')
            ])

            setHasStrategiesAccess(stratResult.hasAccess)
            setHasToolsAccess(toolsResult.hasAccess)
            setLoading(false)
        }

        checkAccess()
    }, [user, isAdmin])

    const strategies = [
        { id: 'late-volume', name: 'AVA Late Volume', icon: <BarChart className="w-4 h-4" />, desc: 'Работа с аномальными объемами на поздних стадиях.' },
        { id: 'intraday', name: 'AVA Intraday', icon: <Zap className="w-4 h-4" />, desc: 'Внутридневная торговля на основе технического анализа.' },
        { id: 'flip', name: 'AVA FLIP-1S', icon: <Timer className="w-4 h-4" />, desc: 'Скоростная торговля на изменениях цены в 1 секунду.' },
        { id: 'flip-fiba', name: 'AVA FLIP + FIBA', icon: <Zap className="w-4 h-4" />, desc: 'Интрадей-флип токенов Solana pre-migration.' },
        { id: 'fiba-mode', name: 'AVA - FIBA MODE', icon: <Layers className="w-4 h-4" />, desc: 'Торговля фибо-уровнями.'},
    ]

    const toolCategories = [
        {
            title: 'Терминалы и Исполнение',
            description: 'Платформы для быстрой торговли и мониторинга',
            icon: 'TerminalIcon',
            items: [
                { name: 'Sniper', url: 'https://www.sniper.xyz', desc: 'Терминал с демо-торговлей для отработки навыков', icon: 'TerminalIcon' },
                { name: 'Axiom', url: 'https://axiom.trade', desc: 'Профессиональный терминал для анализа и выбора монет', icon: 'BarChartIcon' },
                { name: 'GMGN', url: 'https://gmgn.ai', desc: 'Профессиональный терминал для анализа и выбора монет', icon: 'ZapIcon' },
                { name: 'DexScreener', url: 'https://dexscreener.com', desc: 'Мониторинг графиков и поиск новых пар', icon: 'MonitorIcon' },
                { name: 'Alpha One', url: 'https://t.me/alpha_web3_bot', desc: 'ТГ-терминал с сигналами и AI-агентом', icon: 'BotIcon' },
                { name: 'Fasol', url: 'https://t.me/Fasol_robot', desc: 'Торговый бот с гибкими алертами', icon: 'BellIcon' },
            ]
        },
        {
            title: 'Ончейн-аналитика и блокчейны',
            description: 'Блокчейн-эксплореры и данные о транзакциях',
            icon: 'DatabaseIcon',
            items: [
                { name: 'Solscan', url: 'https://solscan.io', desc: 'Эксплорер блокчейна Solana', icon: 'SearchIcon' },
                { name: 'Etherscan', url: 'https://etherscan.io', desc: 'Эксплорер блокчейна Ethereum', icon: 'DatabaseIcon' },
                { name: 'BscScan', url: 'https://bscscan.com', desc: 'Эксплорер блокчейна BSC', icon: 'DatabaseIcon' },
            ]
        },
        {
            title: 'Безопасность и Речерч',
            description: 'Проверка токенов и анализ связей кошельков',
            icon: 'ShieldCheckIcon',
            items: [
                { name: 'Bubblemaps', url: 'https://bubblemaps.io', desc: 'Визуализация связей кошельков', icon: 'Share2Icon' },
                { name: 'Frontrun', url: 'https://chromewebstore.google.com/detail/frontrun/kifcalgkjaphbpbcgokommchjiimejah', desc: 'Анализ кошельков и защита от фронтрана', icon: 'ShieldAlertIcon' },
                { name: 'RugCheck', url: 'https://rugcheck.xyz', desc: 'Проверка токенов на безопасность', icon: 'ShieldCheckIcon' },
                { name: 'SolSniffer', url: 'https://www.solsniffer.com', desc: 'Сниффер новых токенов Solana', icon: 'ActivityIcon' },
            ]
        },
        {
            title: 'Продвинутая Аналитика',
            description: 'Трекинг \"умных денег\" и инфлюенсеров',
            icon: 'BrainIcon',
            items: [
                { name: 'Nansen', url: 'https://www.nansen.ai', desc: 'Smart Money и глубокая аналитика', icon: 'BrainIcon' },
                { name: 'HolderScan', url: 'https://holderscan.com', desc: 'Анализ холдеров и кластеров', icon: 'UsersIcon' },
                { name: 'KolScan', url: 'https://kolscan.io', desc: 'Трекинг KOL-ов и инфлюенсеров', icon: 'TrendingUpIcon' },
            ]
        },
        {
            title: 'Нарративы',
            description: 'Социальная аналитика и мониторинг внимания',
            icon: 'Share2Icon',
            bgColor: 'bg-indigo-500/10',
            borderColor: 'border-indigo-500/20',
            items: []
        }
    ]

    if (loading) {
        return null // Sub-loading handled by parent
    }

    return (
        <div className="space-y-16 pb-20">
            {/* 2. Strategies Block */}
            {hasStrategiesAccess ? (
                <StrategySelector
                    strategies={strategies}
                    activeStrategy={activeStrategy}
                    setActiveStrategy={setActiveStrategy}
                    title="Мемкоин стратегии"
                    description="Оптимизированные стратегии для работы с высокорисковыми и высокодоходными мемкоинами."
                >
                    {activeStrategy === 'late-volume' && <AVALateVolumeStrategy />}
                    {activeStrategy === 'intraday' && <AVAIntradayStrategy />}
                    {activeStrategy === 'flip' && <AVAFlipStrategy />}
                    {activeStrategy === 'flip-fiba' && <AVAFlipFibaStrategy />}
                    {activeStrategy === 'fiba-mode' && <AVAFibaModeStrategy />}
                </StrategySelector>
            ) : (
                <section className={`p-8 rounded-3xl border text-center space-y-4 ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                    <Lock className="w-12 h-12 text-gray-500 mx-auto" />
                    <h3 className={`text-lg font-bold ${headingColor}`}>Доступ к стратегиям заблокирован</h3>
                    <p className="text-sm text-gray-500">Свяжитесь с администратором для получения доступа.</p>
                </section>
            )}

            {/* 3. Tools Block */}
            {hasToolsAccess ? (
                <section className="space-y-8">
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

                    <div className="space-y-12">
                        {activeToolCategory === null ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {toolCategories
                                .filter((_c, i) => i === activeToolCategory).map((category, catIdx) => (
                                    <div key={catIdx} className="space-y-6">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-3 rounded-2xl transition-colors ${theme === 'dark' ? 'bg-white/5 border border-white/10' : 'bg-gray-100 border border-gray-200'}`}>
                                                {renderIcon(category.icon as string, 'w-6 h-6')}
                                            </div>
                                            <div>
                                                <h4 className={`text-xl font-bold ${headingColor}`}>{category.title}</h4>
                                                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{category.description}</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                            {category.items.map((tool, idx) => (
                                                <a
                                                    key={idx}
                                                    href={tool.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={`group relative p-5 rounded-2xl border transition-all duration-300 hover:shadow-lg ${theme === 'dark'
                                                        ? 'bg-[#151a21]/50 border-white/5 hover:border-blue-500/30'
                                                        : 'bg-white border-gray-100 hover:border-blue-500/20'
                                                        }`}
                                                >
                                                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <ExternalLink className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                                                    </div>

                                                    <div className={`p-2.5 rounded-xl w-fit mb-4 ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'} group-hover:scale-110 transition-transform`}>
                                                        {renderIcon(tool.icon as string, 'w-5 h-5')}
                                                    </div>

                                                    <h4 className={`font-bold mb-1 ${headingColor} flex items-center gap-2`}>
                                                        {tool.name}
                                                    </h4>
                                                    <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed">
                                                        {tool.desc}
                                                    </p>
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-8 animate-scale-up">
                                <div className="flex items-center justify-between">
                                    <button
                                        onClick={() => setActiveToolCategory(null)}
                                        className="text-xs font-bold text-gray-500 hover:text-blue-500 transition-colors flex items-center gap-2"
                                    >
                                        <ArrowLeft className="w-4 h-4" /> К категориям
                                    </button>
                                </div>

                                {toolCategories
                                .filter((_c, i) => i === activeToolCategory).map((category, catIdx) => (
                                    <div key={catIdx} className="space-y-6">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-3 rounded-2xl transition-colors ${theme === 'dark' ? 'bg-white/5 border border-white/10' : 'bg-gray-100 border border-gray-200'}`}>
                                                {renderIcon(category.icon as string, 'w-6 h-6')}
                                            </div>
                                            <div>
                                                <h4 className={`text-xl font-bold ${headingColor}`}>{category.title}</h4>
                                                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{category.description}</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                            {category.items.map((tool, idx) => (
                                                <a
                                                    key={idx}
                                                    href={tool.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={`group relative p-5 rounded-2xl border transition-all duration-300 hover:shadow-lg ${theme === 'dark'
                                                        ? 'bg-[#151a21]/50 border-white/5 hover:border-blue-500/30'
                                                        : 'bg-white border-gray-100 hover:border-blue-500/20'
                                                        }`}
                                                >
                                                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <ExternalLink className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                                                    </div>

                                                    <div className={`p-2.5 rounded-xl w-fit mb-4 ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'} group-hover:scale-110 transition-transform`}>
                                                        {renderIcon(tool.icon as string, 'w-5 h-5')}
                                                    </div>

                                                    <h4 className={`font-bold mb-1 ${headingColor} flex items-center gap-2`}>
                                                        {tool.name}
                                                    </h4>
                                                    <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed">
                                                        {tool.desc}
                                                    </p>
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            ) : (
                <section className={`p-8 rounded-3xl border text-center space-y-4 ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                    <Lock className="w-12 h-12 text-gray-500 mx-auto" />
                    <h3 className={`text-lg font-bold ${headingColor}`}>Доступ к инструментам заблокирован</h3>
                    <p className="text-sm text-gray-500">Свяжитесь с администратором для получения доступа.</p>
                </section>
            )}

        </div>
    )
}
