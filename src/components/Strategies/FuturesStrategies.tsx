import React, { useState } from 'react'
import {
    Zap,
    TrendingUp,
    RefreshCw,
    ArrowDownUp,
    Sunrise,
    Megaphone,
    Gauge
} from 'lucide-react'
import { AVATrendFollowingStrategy } from './AVATrendFollowingStrategy'
import { AVABreakoutRetestStrategy } from './AVABreakoutRetestStrategy'
import { AVAMeanReversionStrategy } from './AVAMeanReversionStrategy'
import { AVASessionOpenStrategy } from './AVASessionOpenStrategy'
import { AVAEventTradingStrategy } from './AVAEventTradingStrategy'
import { AVAScalpingStrategy } from './AVAScalpingStrategy'
import { AVAIntradayFuturesStrategy } from './AVAIntradayFuturesStrategy'
import { StrategySelector } from './StrategySelector'

export const FuturesStrategies: React.FC = () => {
    const [activeStrategy, setActiveStrategy] = useState<string | null>(null)

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
            id: 'intraday-futures',
            name: 'AVA - Intraday',
            icon: <Zap className="w-4 h-4" />,
            desc: 'Все сделки открываются и закрываются в течение одного торгового дня, чтобы избежать ночных рисков, гэпов и неожиданных новостей.'
        },
    ]

    return (
        <StrategySelector
            strategies={strategies}
            activeStrategy={activeStrategy}
            setActiveStrategy={setActiveStrategy}
            title="Фьючерсные стратегии"
            description="Торговые стратегии, разработанные нами для фьючерсных рынков. Каждый из подходов протестирован и имеет понятную логику."
        >
            {activeStrategy === 'trend-following' && <AVATrendFollowingStrategy />}
            {activeStrategy === 'breakout-retest' && <AVABreakoutRetestStrategy />}
            {activeStrategy === 'mean-reversion' && <AVAMeanReversionStrategy />}
            {activeStrategy === 'session-open' && <AVASessionOpenStrategy />}
            {activeStrategy === 'event-trading' && <AVAEventTradingStrategy />}
            {activeStrategy === 'scalping' && <AVAScalpingStrategy />}
            {activeStrategy === 'intraday-futures' && <AVAIntradayFuturesStrategy />}
        </StrategySelector>
    )
}
