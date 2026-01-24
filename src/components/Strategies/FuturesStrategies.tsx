import React, { useState } from 'react'
import { useThemeStore } from '@/store/themeStore'
import {
    Lightbulb,
    Wrench,
    Calculator,
    BarChart3,
    Brain,
    TrendingUp,
    Zap,
    Terminal,
    Database,
    ExternalLink,
    ArrowLeft,
    Globe,
    Play
} from 'lucide-react'

type ToolCategory = 'exchanges' | 'demo' | 'analytics' | null

interface Tool {
    name: string
    url: string
    fullDesc: string
    icon: React.ReactNode
    color: string
    bgColor: string
    borderColor: string
    tags: string[]
}

export const FuturesStrategies: React.FC = () => {
    const { theme } = useThemeStore()
    const [activeToolCategory, setActiveToolCategory] = useState<ToolCategory>(null)

    const headingColor = theme === 'dark' ? 'text-white' : 'text-gray-900'
    const innerBg = theme === 'dark' ? 'bg-[#151a21]/50' : 'bg-gray-50/50'
    const mutedText = theme === 'dark' ? 'text-gray-400' : 'text-gray-500'

    const tools: Tool[] = [
        // Биржи с фьючерсами
        {
            name: 'Bybit',
            url: 'https://bybit.com',
            fullDesc: 'Ведущая криптобиржа для торговли бессрочными и фьючерсными контрактами. Доступна для российских пользователей через стандартный доступ и P2P-связки (на 2026 возникают сбои). Низкие комиссии, удобный UI/UX, мощный стакан и маржинальная торговля. Есть демо-режим.',
            icon: <Globe className="w-5 h-5" />,
            color: 'text-yellow-400',
            bgColor: 'bg-yellow-500/10',
            borderColor: 'border-yellow-500/20',
            tags: ['Exchange', 'Futures', 'Perpetual']
        },
        {
            name: 'MEXC',
            url: 'https://www.mexc.com',
            fullDesc: 'Биржа с большим числом фьючерсных контрактов и возможностью демо-торговли. Демо-счёт для практики фьючерсов без реальных рисков, низкие комиссии, широкий выбор активов.',
            icon: <Terminal className="w-5 h-5" />,
            color: 'text-green-400',
            bgColor: 'bg-green-500/10',
            borderColor: 'border-green-500/20',
            tags: ['Exchange', 'Futures', 'Demo']
        },
        {
            name: 'BingX',
            url: 'https://www.bingx.com',
            fullDesc: 'Биржа с фьючерсами и деривативными продуктами, мощной аналитикой и копитрейдингом. Интегрированные социальные сигналы, копирование успешных трейдеров, добавление ИИ-метрик в интерфейс.',
            icon: <TrendingUp className="w-5 h-5" />,
            color: 'text-blue-400',
            bgColor: 'bg-blue-500/10',
            borderColor: 'border-blue-500/20',
            tags: ['Exchange', 'Futures', 'Copy Trading']
        },
        // Демо-трейдинг
        {
            name: 'MEXC Demo Futures',
            url: 'https://www.mexc.com',
            fullDesc: 'Возможность торговать бессрочными контрактами в учебном режиме с виртуальными средствами. Отпадает риск потерь при обучении.',
            icon: <Play className="w-5 h-5" />,
            color: 'text-emerald-400',
            bgColor: 'bg-emerald-500/10',
            borderColor: 'border-emerald-500/20',
            tags: ['Demo', 'Training', 'Virtual Funds']
        },
        {
            name: 'CryptoRobotics (Demo)',
            url: 'https://cryptorobotics.ai',
            fullDesc: 'Универсальный терминал с демо-торговлей фьючерсами на нескольких ведущих биржах (Binance Futures, Bybit UTA Futures, Bitget и др.). Бесплатный демо-баланс (~3000 USDT с автоматическим обновлением), тренировка стратегий и управление рисками без депозита.',
            icon: <Calculator className="w-5 h-5" />,
            color: 'text-purple-400',
            bgColor: 'bg-purple-500/10',
            borderColor: 'border-purple-500/20',
            tags: ['Demo', 'Terminal', 'Multi-Exchange']
        },
        // Аналитика и ИИ
        {
            name: 'CryptoRobotics',
            url: 'https://cryptorobotics.ai',
            fullDesc: 'Универсальная платформа с автоматизацией и ИИ-сигналами для фьючерсов. Генерация сигналов на основе ML-алгоритмов, интеграция с реальными биржами и автоматическая торговля 24/7.',
            icon: <Brain className="w-5 h-5" />,
            color: 'text-cyan-400',
            bgColor: 'bg-cyan-500/10',
            borderColor: 'border-cyan-500/20',
            tags: ['AI', 'Automation', 'Signals']
        },
        {
            name: 'TradingView',
            url: 'https://tradingview.com',
            fullDesc: 'Мировой стандарт графиков и технической аналитики с возможностью подключения к фьючерсным рынкам через API. Настраиваемые индикаторы, скрипты, панели для анализа фьючерсных контрактов, построение собственных стратегий.',
            icon: <BarChart3 className="w-5 h-5" />,
            color: 'text-orange-400',
            bgColor: 'bg-orange-500/10',
            borderColor: 'border-orange-500/20',
            tags: ['Charts', 'Analytics', 'Indicators']
        },
        {
            name: 'ForkLog',
            url: 'https://forklog.com',
            fullDesc: 'Аналитическое издание о крипторынке. Новости, исследования и аналитические материалы по криптовалютам и деривативам — полезно для фундаментального понимания трендов.',
            icon: <Database className="w-5 h-5" />,
            color: 'text-indigo-400',
            bgColor: 'bg-indigo-500/10',
            borderColor: 'border-indigo-500/20',
            tags: ['News', 'Analytics', 'Research']
        },
    ]

    const categories = [
        {
            id: 'exchanges' as const,
            title: 'Биржи с фьючерсами',
            description: 'Ведущие платформы для торговли фьючерсными и бессрочными контрактами',
            icon: <Globe className="w-8 h-8 text-yellow-500" />,
            bgColor: 'bg-yellow-500/10',
            borderColor: 'border-yellow-500/20',
            toolTags: ['Exchange']
        },
        {
            id: 'demo' as const,
            title: 'Демо-трейдинг',
            description: 'Учебные режимы и тестовые площадки для практики без риска',
            icon: <Play className="w-8 h-8 text-emerald-500" />,
            bgColor: 'bg-emerald-500/10',
            borderColor: 'border-emerald-500/20',
            toolTags: ['Demo']
        },
        {
            id: 'analytics' as const,
            title: 'Аналитика и ИИ',
            description: 'Инструменты анализа, данные и интеллектуальные помощники',
            icon: <Brain className="w-8 h-8 text-purple-500" />,
            bgColor: 'bg-purple-500/10',
            borderColor: 'border-purple-500/20',
            toolTags: ['AI', 'Charts', 'Analytics', 'News']
        }
    ]

    return (
        <div className="space-y-16 pb-20">
            {/* Intro Block - Futures Specific */}
            <section className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/10 rounded-xl border border-green-500/20">
                        <Zap className="w-6 h-6 text-green-500" />
                    </div>
                    <div>
                        <h3 className={`text-xl font-black ${headingColor}`}>Фьючерсы и Деривативы</h3>
                        <p className={`text-sm ${mutedText}`}>
                            Торговля фьючерсными контрактами, бессрочными свопами и деривативами
                        </p>
                    </div>
                </div>

                <div className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                    <h4 className={`font-bold mb-3 ${headingColor}`}>Что такое фьючерсы на криптобиржах?</h4>
                    <p className={`text-sm leading-relaxed ${mutedText}`}>
                        Фьючерсы — это контракты на покупку или продажу актива по заранее определённой цене в будущем.
                        Бессрочные контракты (perpetual) не имеют даты истечения и позволяют удерживать позицию неограниченное время.
                        Ключевые преимущества: возможность торговли с плечом (leverage), хеджирование позиций и спекуляции на движениях цены без необходимости владеть базовым активом.
                    </p>
                </div>
            </section>

            {/* Tools Block */}
            <section className="space-y-8">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/20">
                        <Wrench className="w-6 h-6 text-amber-500" />
                    </div>
                    <div>
                        <h3 className={`text-xl font-black ${headingColor}`}>Инструменты</h3>
                        <p className={`text-sm ${mutedText}`}>
                            Платформы для торговли, обучения и анализа фьючерсов
                        </p>
                    </div>
                </div>

                <div className="space-y-12">
                    {activeToolCategory === null ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {categories.map((cat, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveToolCategory(cat.id)}
                                    className={`group p-6 rounded-3xl border text-left transition-all duration-500 hover:-translate-y-2 ${theme === 'dark'
                                        ? 'bg-[#151a21]/50 border-white/5 hover:border-blue-500/30 hover:bg-blue-500/5'
                                        : 'bg-white border-gray-100 hover:border-blue-500/20 hover:shadow-xl'
                                        }`}
                                >
                                    <div className={`p-4 rounded-2xl w-fit mb-4 transition-transform duration-500 group-hover:scale-110 ${cat.bgColor} ${cat.borderColor} border`}>
                                        {cat.icon}
                                    </div>
                                    <h4 className={`text-lg font-black mb-2 ${headingColor}`}>{cat.title}</h4>
                                    <p className={`text-xs leading-relaxed ${mutedText}`}>
                                        {cat.description}
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
                                    onClick={() => setActiveToolCategory(null)}
                                    className="text-xs font-bold text-gray-500 hover:text-blue-500 transition-colors flex items-center gap-2"
                                >
                                    <ArrowLeft className="w-4 h-4" /> К категориям
                                </button>
                            </div>

                            {categories
                                .filter(c => c.id === activeToolCategory)
                                .map((category, catIdx) => (
                                    <div key={catIdx} className="space-y-6">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-3 rounded-2xl ${theme === 'dark' ? 'bg-white/5 border border-white/10' : 'bg-gray-100 border border-gray-200'}`}>
                                                {category.icon}
                                            </div>
                                            <div>
                                                <h4 className={`text-xl font-bold ${headingColor}`}>{category.title}</h4>
                                                <p className={`text-sm ${mutedText}`}>{category.description}</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                            {tools
                                                .filter(t => t.tags.some(tag => category.toolTags.includes(tag)))
                                                .map((tool, idx) => (
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

                                                        <div className={`p-2.5 rounded-xl w-fit mb-4 ${tool.bgColor} group-hover:scale-110 transition-transform`}>
                                                            <div className={tool.color}>
                                                                {tool.icon}
                                                            </div>
                                                        </div>

                                                        <h4 className={`font-bold mb-1 ${headingColor} flex items-center gap-2`}>
                                                            {tool.name}
                                                        </h4>
                                                        <p className="text-xs text-gray-500 leading-relaxed">
                                                            {tool.fullDesc}
                                                        </p>

                                                        <div className="mt-3 flex flex-wrap gap-1.5">
                                                            {tool.tags.map((tag, tagIdx) => (
                                                                <span
                                                                    key={tagIdx}
                                                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${theme === 'dark' ? 'bg-white/10 text-gray-300' : 'bg-gray-100 text-gray-600'}`}
                                                                >
                                                                    {tag}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </a>
                                                ))}
                                        </div>
                                    </div>
                                ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    )
}