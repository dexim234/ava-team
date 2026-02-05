import React, { useState } from 'react'
import { useThemeStore } from '@/store/themeStore'
import {
    TrendingUp,
    Wrench,
    Lightbulb,
    RefreshCw,
    ArrowDownUp,
    Sunrise,
    Megaphone,
    Gauge,
    Clock,
    ExternalLink,
    ArrowLeft
} from 'lucide-react'
import { AVATrendFollowingStrategy } from './AVATrendFollowingStrategy'
import { AVABreakoutRetestStrategy } from './AVABreakoutRetestStrategy'
import { AVAMeanReversionStrategy } from './AVAMeanReversionStrategy'
import { AVASessionOpenStrategy } from './AVASessionOpenStrategy'
import { AVAEventTradingStrategy } from './AVAEventTradingStrategy'
import { AVAScalpingStrategy } from './AVAScalpingStrategy'
import { AVAFuturesIntradayStrategy } from './AVAFuturesIntradayStrategy'
import { StrategySelector } from './StrategySelector'

type StrategyId = 'trend-following' | 'breakout-retest' | 'mean-reversion' | 'session-open' | 'event-trading' | 'scalping' | 'intraday' | null;

export const FuturesStrategies: React.FC = () => {
    const { theme } = useThemeStore()
    const [activeCategory, setActiveCategory] = useState<number | null>(null)
    const [activeStrategy, setActiveStrategy] = useState<StrategyId>(null)
    const headingColor = theme === 'dark' ? 'text-white' : 'text-gray-900'
    const innerBg = theme === 'dark' ? 'bg-[#151a21]/50' : 'bg-gray-50/50'

    const strategies = [
        {
            id: 'trend-following',
            name: 'AVA тренд-фолловинг',
            icon: <TrendingUp className="w-4 h-4" />,
            desc: 'Торговля по тренду. Самая базовая логика из тех, что стабильно работают.'
        },
        {
            id: 'breakout-retest',
            name: 'AVA пробой с возвратом',
            icon: <RefreshCw className="w-4 h-4" />,
            desc: 'Работаем не на сам пробой, а на подтверждение того, что рынок действительно выбрал направление.'
        },
        {
            id: 'mean-reversion',
            name: 'AVA - Mean Reversion',
            icon: <ArrowDownUp className="w-4 h-4" />,
            desc: 'Контртрендовая работа. Самая коварная и одновременно самая «денежная», если применять её строго по условиям.'
        },
        {
            id: 'session-open',
            name: 'AVA - Session Open',
            icon: <Sunrise className="w-4 h-4" />,
            desc: 'Торговля первых минут активной фазы рынка, когда в стакан заходят основные объёмы.'
        },
        {
            id: 'event-trading',
            name: 'AVA - Event Trading',
            icon: <Megaphone className="w-4 h-4" />,
            desc: 'Это стратегия для особых случаев. Мы её используем только тогда, когда есть крупный катализатор.'
        },
        {
            id: 'scalping',
            name: 'AVA - Scalping',
            icon: <Gauge className="w-4 h-4" />,
            desc: 'Суть скальпинга — ловить микродвижения на графике 1–5 минут. Мы берём маленькие профиты много раз в течение дня.'
        },
        {
            id: 'intraday',
            name: 'AVA - Intraday',
            icon: <Clock className="w-4 h-4" />,
            desc: 'Все сделки открываются и закрываются в течение одного торгового дня, избегая ночных рисков.'
        },
    ]

    // Добавляем переменные для блока Tools
    const categories = [
        {
            title: 'Торговые платформы',
            description: 'Основные биржи для фьючерсной торговли',
            icon: <TrendingUp className="w-8 h-8 text-blue-500" />,
            bgColor: 'bg-blue-500/10',
            borderColor: 'border-blue-500/20',
            tools: [
                { name: 'Binance Futures', url: 'https://www.binancefutures.com', desc: 'Крупнейшая криптобиржа с широким выбором фьючерсов.', icon: <TrendingUp className="w-5 h-5 text-blue-400" /> },
                { name: 'Bybit', url: 'https://www.bybit.com', desc: 'Профессиональная платформа для торговли деривативами.', icon: <TrendingUp className="w-5 h-5 text-blue-400" /> },
            ]
        },
        {
            title: 'Аналитика',
            description: 'Инструменты для анализа рынка',
            icon: <Wrench className="w-8 h-8 text-purple-500" />,
            bgColor: 'bg-purple-500/10',
            borderColor: 'border-purple-500/20',
            tools: [
                { name: 'TradingView', url: 'https://www.tradingview.com', desc: 'Профессиональный анализ графиков и индикаторы.', icon: <Wrench className="w-5 h-5 text-purple-400" /> },
            ]
        }
    ]

    return (
        <div className="space-y-16 pb-20">
            <StrategySelector
                strategies={strategies}
                activeStrategy={activeStrategy}
                setActiveStrategy={(id) => setActiveStrategy(id as StrategyId)}
                categoryName="Стратегии"
                categoryDescription="Проверенные методики фьючерсной торговли"
                categoryIcon={<Lightbulb className="w-6 h-6 text-blue-500" />}
            />

            {activeStrategy && (
                <div className={`rounded-3xl border p-1 sm:p-2 ${theme === 'dark' ? 'bg-[#0b1015]/50 border-white/5' : 'bg-white border-gray-100'
                    } shadow-xl animate-scale-up`}>
                    <div className={`p-6 sm:p-8 rounded-[2.5rem] ${innerBg}`}>
                        <div className="mb-6 flex items-center justify-between">
                            <button
                                onClick={() => setActiveStrategy(null)}
                                className="text-xs font-bold text-gray-500 hover:text-blue-500 transition-colors flex items-center gap-1"
                            >
                                ← К списку стратегий
                            </button>
                        </div>
                        {activeStrategy === 'trend-following' && <AVATrendFollowingStrategy />}
                        {activeStrategy === 'breakout-retest' && <AVABreakoutRetestStrategy />}
                        {activeStrategy === 'mean-reversion' && <AVAMeanReversionStrategy />}
                        {activeStrategy === 'session-open' && <AVASessionOpenStrategy />}
                        {activeStrategy === 'event-trading' && <AVAEventTradingStrategy />}
                        {activeStrategy === 'scalping' && <AVAScalpingStrategy />}
                        {activeStrategy === 'intraday' && <AVAFuturesIntradayStrategy />}
                    </div>
                </div>
            )}

            {/* Tools Block */}
            <section className="space-y-8">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/20">
                        <Wrench className="w-6 h-6 text-amber-500" />
                    </div>
                    <div>
                        <h3 className={`text-xl font-black ${headingColor}`}>Инструменты</h3>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            Основные сервисы для работы с фьючерсами
                        </p>
                    </div>
                </div>

                <div className="space-y-12">
                    {activeCategory === null ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {categories.map((category, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveCategory(idx)}
                                    className={`group p-6 rounded-3xl border text-left transition-all duration-500 hover:-translate-y-2 ${theme === 'dark'
                                        ? 'bg-[#151a21]/50 border-white/5 hover:border-blue-500/30 hover:bg-blue-500/5'
                                        : 'bg-white border-gray-100 hover:border-blue-500/20 hover:shadow-xl'
                                        }`}
                                >
                                    <div className={`p-4 rounded-2xl w-fit mb-4 transition-transform duration-500 group-hover:scale-110 ${category.bgColor} ${category.borderColor} border`}>
                                        {React.cloneElement(category.icon as React.ReactElement, { className: 'w-8 h-8' })}
                                    </div>
                                    <h4 className={`text-lg font-black mb-2 ${headingColor}`}>{category.title}</h4>
                                    <p className={`text-xs leading-relaxed ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                        {category.description}
                                    </p>
                                    <div className="mt-4 flex items-center gap-2 text-blue-500 font-bold text-[10px] uppercase tracking-wider">
                                        Смотреть инструменты <ExternalLink className="w-3 h-3" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-8 animate-scale-up">
                            <div className="flex items-center justify-between">
                                <button
                                    onClick={() => setActiveCategory(null)}
                                    className="text-xs font-bold text-gray-500 hover:text-blue-500 transition-colors flex items-center gap-1"
                                >
                                    <ArrowLeft className="w-3 h-3" /> Все категории
                                </button>
                            </div>

                            <section className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className={`p-3 ${categories[activeCategory].bgColor} rounded-2xl border ${categories[activeCategory].borderColor}`}>
                                        {React.cloneElement(categories[activeCategory].icon as React.ReactElement, { className: 'w-8 h-8' })}
                                    </div>
                                    <div>
                                        <h3 className={`text-2xl font-black ${headingColor}`}>{categories[activeCategory].title}</h3>
                                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                            {categories[activeCategory].description}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {categories[activeCategory].tools.map((tool, idx) => (
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

                                            <div className={`p-2.5 rounded-xl w-fit mb-4 ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'
                                                } group-hover:scale-110 transition-transform`}>
                                                {tool.icon}
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
                            </section>
                        </div>
                    )}
                </div>
            </section>
        </div>
    )
}
