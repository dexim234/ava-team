import React, { useState } from 'react'
import { useThemeStore } from '@/store/themeStore'
import {
    BarChart3,
    Brain,
    Bot,
    ExternalLink,
    Zap,
    TrendingUp,
    LayoutGrid,
    Globe,
    Terminal,
    ArrowLeft,
    Wrench,
    BookOpen
} from 'lucide-react'

export const FuturesStrategies: React.FC = () => {
    const { theme } = useThemeStore()
    const [activeCategory, setActiveCategory] = useState<number | null>(null)
    const headingColor = theme === 'dark' ? 'text-white' : 'text-gray-900'

    // NOTE: Currently no specific strategies provided, only tools. 
    // Keeping the structure ready for future strategies if needed.

    const categories = [
        {
            title: 'Биржи с фьючерсами',
            description: 'Ведущие платформы для торговли деривативами',
            icon: <Globe className="w-6 h-6 text-blue-500" />,
            bgColor: 'bg-blue-500/10',
            borderColor: 'border-blue-500/20',
            tools: [
                {
                    name: 'Bybit',
                    url: 'https://bybit.com',
                    desc: 'Одна из ведущих криптобирж. Низкие комиссии, удобный UI/UX, мощный стакан и маржинальная торговля. Доступна через P2P.',
                    icon: <LayoutGrid className="w-5 h-5 text-yellow-400" />
                },
                {
                    name: 'MEXC',
                    url: 'https://www.mexc.com',
                    desc: 'Биржа с огромным выбором контрактов. Низкие комиссии и отличная ликвидность на редких парах.',
                    icon: <BarChart3 className="w-5 h-5 text-green-400" />
                },
                {
                    name: 'BingX',
                    url: 'https://www.bingx.com',
                    desc: 'Биржа с социальным трейдингом и копитрейдингом. Интегрированные сигналы и ИИ-метрики.',
                    icon: <Zap className="w-5 h-5 text-blue-400" />
                }
            ]
        },
        {
            title: 'Демо-трейдинг и Тесты',
            description: 'Безопасная практика без реальных рисков',
            icon: <Terminal className="w-6 h-6 text-emerald-500" />,
            bgColor: 'bg-emerald-500/10',
            borderColor: 'border-emerald-500/20',
            tools: [
                {
                    name: 'MEXC Demo Futures',
                    url: 'https://www.mexc.com', // Direct link to exchange usually implies demo is inside
                    desc: 'Торговля бессрочными контрактами в учебном режиме с виртуальными средствами.',
                    icon: <Terminal className="w-5 h-5 text-green-500" />
                },
                {
                    name: 'CryptoRobotics (Demo)',
                    url: 'https://cryptorobotics.ai',
                    desc: 'Универсальный терминал с демо-торговлей на Binance, Bybit, Bitget. Бесплатный демо-баланс ~3000 USDT.',
                    icon: <Bot className="w-5 h-5 text-purple-400" />
                }
            ]
        },
        {
            title: 'Аналитика и Данные',
            description: 'Инструменты для анализа рынка и трендов',
            icon: <Brain className="w-6 h-6 text-purple-500" />,
            bgColor: 'bg-purple-500/10',
            borderColor: 'border-purple-500/20',
            tools: [
                {
                    name: 'CryptoRobotics',
                    url: 'https://cryptorobotics.ai',
                    desc: 'Терминал с ИИ-сигналами и ML-алгоритмами. Автоматическая торговля 24/7.',
                    icon: <Bot className="w-5 h-5 text-purple-500" />
                },
                {
                    name: 'TradingView',
                    url: 'https://tradingview.com',
                    desc: 'Мировой стандарт графиков. Подключение к фьючерсам через API, скрипты Pine Script и теханализ.',
                    icon: <TrendingUp className="w-5 h-5 text-blue-500" />
                },
                {
                    name: 'ForkLog',
                    url: 'https://forklog.com', // Changed from wikipedia to actual site
                    desc: 'Аналитическое издание. Новости и исследования для фундаментального понимания трендов.',
                    icon: <BookOpen className="w-5 h-5 text-orange-400" />
                }
            ]
        }
    ]

    return (
        <div className="space-y-16 pb-20">
            {/* Tools Block (Primary Focus) */}
            <section className="space-y-8">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/20">
                        <Wrench className="w-6 h-6 text-amber-500" />
                    </div>
                    <div>
                        <h3 className={`text-xl font-black ${headingColor}`}>Инструменты</h3>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            Биржи, аналитика и терминалы для фьючерсной торговли
                        </p>
                    </div>
                </div>

                <div className="space-y-12">
                    {activeCategory === null ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                                            <p className="text-xs text-gray-500 leading-relaxed">
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
