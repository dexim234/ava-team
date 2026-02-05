import React from 'react';
import { useThemeStore } from '@/store/themeStore';
import { Bot, Zap, TrendingUp, RefreshCw, BarChart, X, Check } from 'lucide-react';

export const AVAIntradayFuturesStrategy: React.FC = () => {
    const { theme } = useThemeStore();
    const headingColor = theme === 'dark' ? 'text-white' : 'text-gray-900';
    const subTextColor = theme === 'dark' ? 'text-gray-400' : 'text-gray-500';
    const highlightColor = theme === 'dark' ? 'text-blue-400' : 'text-blue-600';
    const cardBg = theme === 'dark' ? 'bg-[#151a21]/50' : 'bg-white';
    const cardBorder = theme === 'dark' ? 'border-white/5' : 'border-gray-100';

    return (
        <div className="space-y-8 p-1 sm:p-2">
            <h2 className={`text-3xl font-black ${headingColor}`}>AVA - Intraday (Futures)</h2>
            <p className={`text-base leading-relaxed ${subTextColor}`}>
                Интрадей — это стиль торговли, при котором все сделки открываются и закрываются в течение одного торгового дня. Позиции не переносятся на следующий день, чтобы избежать ночных рисков, гэпов и неожиданных новостей.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={`p-6 rounded-[2.5rem] ${cardBg} ${cardBorder} border`}>
                    <h3 className={`text-xl font-bold mb-4 ${headingColor}`}>Подходит тем, кто:</h3>
                    <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                            <Check className={`w-5 h-5 flex-shrink-0 ${highlightColor}`} />
                            <p className={subTextColor}>хочет активно участвовать в рынке,</p>
                        </li>
                        <li className="flex items-start gap-2">
                            <Check className={`w-5 h-5 flex-shrink-0 ${highlightColor}`} />
                            <p className={subTextColor}>готов следить за графиком в течение сессии,</p>
                        </li>
                        <li className="flex items-start gap-2">
                            <Check className={`w-5 h-5 flex-shrink-0 ${highlightColor}`} />
                            <p className={subTextColor}>предпочитает контролируемый риск и понятную логику сделок.</p>
                        </li>
                    </ul>
                </div>
                <div className={`p-6 rounded-[2.5rem] ${cardBg} ${cardBorder} border`}>
                    <h3 className={`text-xl font-bold mb-4 ${headingColor}`}>В чём идея стратегии:</h3>
                    <p className={`mb-4 ${subTextColor}`}>
                        В течение дня рынок формирует: импульсы, откаты, диапазоны, уровни, вокруг которых концентрируется ликвидность.
                    </p>
                    <p className={subTextColor}>
                        Наша задача — не угадывать будущее, а:
                        <ul className="list-disc list-inside mt-2 space-y-1">
                            <li>дождаться формирования понятной рыночной ситуации;</li>
                            <li>войти в сделку с ограниченным риском;</li>
                            <li>выйти по заранее определённому плану.</li>
                        </ul>
                    </p>
                </div>
            </div>

            <h3 className={`text-2xl font-black mt-8 mb-4 ${headingColor}`}>Основные принципы</h3>
            <div className={`p-6 rounded-[2.5rem] ${cardBg} ${cardBorder} border`}>
                <ul className="space-y-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-2 gap-x-6">
                    <li className="flex items-start gap-2"><Check className={`w-5 h-5 flex-shrink-0 ${highlightColor}`} /><p className={subTextColor}>торговля только в активные часы сессии;</p></li>
                    <li className="flex items-start gap-2"><Check className={`w-5 h-5 flex-shrink-0 ${highlightColor}`} /><p className={subTextColor}>ограниченное количество сделок;</p></li>
                    <li className="flex items-start gap-2"><Check className={`w-5 h-5 flex-shrink-0 ${highlightColor}`} /><p className={subTextColor}>заранее известный риск в каждой сделке;</p></li>
                    <li className="flex items-start gap-2"><Check className={`w-5 h-5 flex-shrink-0 ${highlightColor}`} /><p className={subTextColor}>отсутствие эмоциональных решений;</p></li>
                    <li className="flex items-start gap-2"><Check className={`w-5 h-5 flex-shrink-0 ${highlightColor}`} /><p className={subTextColor}>строгая дисциплина выхода из рынка.</p></li>
                </ul>
                <p className={`mt-4 ${subTextColor}`}>
                    Интрадей — это не постоянное «сидение в позиции», а выборочные, осознанные входы.
                </p>
            </div>

            <h3 className={`text-2xl font-black mt-8 mb-4 ${headingColor}`}>Какие инструменты подходят</h3>
            <div className={`p-6 rounded-[2.5rem] ${cardBg} ${cardBorder} border`}>
                <p className={`mb-4 ${subTextColor}`}>
                    Стратегия применяется только к ликвидным рынкам. Подходящие инструменты:
                </p>
                <ul className="list-disc list-inside space-y-1 mb-4">
                    <li className={subTextColor}>фьючерсы на индексы: ES, NQ, YM;</li>
                    <li className={subTextColor}>фьючерсы на сырьё: CL;</li>
                    <li className={subTextColor}>крипто-фьючерсы: BTC, ETH, SOL.</li>
                </ul>
                <h4 className={`text-lg font-bold mb-2 ${headingColor}`}>Почему важна ликвидность</h4>
                <ul className="list-disc list-inside space-y-1">
                    <li className={subTextColor}>Ликвидный рынок: имеет узкий спред; быстро исполняет ордера; позволяет выходить из сделки без сильного проскальзывания.</li>
                    <li className={subTextColor}>Мы не используем малоликвидные активы, так как они: дают ложные сигналы; увеличивают риск случайных стопов; искажают результат стратегии.</li>
                </ul>
            </div>

            <h3 className={`text-2xl font-black mt-8 mb-4 ${headingColor}`}>Таймфреймы и подготовка</h3>
            <div className={`p-6 rounded-[2.5rem] ${cardBg} ${cardBorder} border`}>
                <p className={`mb-4 ${subTextColor}`}>Перед началом торгов:</p>
                <ul className="list-disc list-inside space-y-1 mb-4">
                    <li className={subTextColor}>15 минут — общий контекст дня;</li>
                    <li className={subTextColor}>5 минут — рабочий таймфрейм;</li>
                    <li className={subTextColor}>1 минута — уточнение точки входа (по необходимости).</li>
                </ul>
                <p className={`mb-4 ${subTextColor}`}>Перед открытием сессии отмечаются:</p>
                <ul className="list-disc list-inside space-y-1">
                    <li className={subTextColor}>максимум и минимум предыдущего дня;</li>
                    <li className={subTextColor}>ключевые уровни внутри диапазона;</li>
                    <li className={subTextColor}>области, где цена уже проявляла активность.</li>
                </ul>
            </div>

            <h3 className={`text-2xl font-black mt-8 mb-4 ${headingColor}`}>Где мы входим в сделку</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={`p-6 rounded-[2.5rem] ${cardBg} ${cardBorder} border`}>
                    <h4 className={`text-xl font-bold mb-2 ${headingColor}`}>Сетап 1: Откат внутри тренда</h4>
                    <p className={`mb-2 ${subTextColor}`}>Используется, когда рынок движется в одном направлении.</p>
                    <h5 className={`font-bold mb-1 ${headingColor}`}>Условия:</h5>
                    <ul className="list-disc list-inside space-y-1 mb-2">
                        <li className={subTextColor}>есть выраженный импульс вверх или вниз;</li>
                        <li className={subTextColor}>цена корректируется без сильного давления;</li>
                        <li className={subTextColor}>откат останавливается у значимого уровня.</li>
                    </ul>
                    <h5 className={`font-bold mb-1 ${headingColor}`}>Логика входа:</h5>
                    <p className={subTextColor}>Мы входим по направлению основного движения, когда рынок показывает готовность продолжить тренд.</p>
                </div>
                <div className={`p-6 rounded-[2.5rem] ${cardBg} ${cardBorder} border`}>
                    <h4 className={`text-xl font-bold mb-2 ${headingColor}`}>Сетап 2: Ложный пробой диапазона</h4>
                    <p className={`mb-2 ${subTextColor}`}>Используется во флэте или на границах дневного диапазона.</p>
                    <h5 className={`font-bold mb-1 ${headingColor}`}>Условия:</h5>
                    <ul className="list-disc list-inside space-y-1 mb-2">
                        <li className={subTextColor}>цена пробивает максимум или минимум дня;</li>
                        <li className={subTextColor}>не появляется продолжения движения;</li>
                        <li className={subTextColor}>цена возвращается обратно в диапазон.</li>
                    </ul>
                    <h5 className={`font-bold mb-1 ${headingColor}`}>Логика входа:</h5>
                    <p className={subTextColor}>Мы работаем против пробоя, когда рынок показывает, что движение было ложным.</p>
                </div>
            </div>

            <h3 className={`text-2xl font-black mt-8 mb-4 ${headingColor}`}>Куда ставим стоп-лосс</h3>
            <div className={`p-6 rounded-[2.5rem] ${cardBg} ${cardBorder} border`}>
                <p className={`mb-4 ${subTextColor}`}>Стоп-лосс — обязательная часть каждой сделки. Он ставится:</p>
                <ul className="list-disc list-inside space-y-1 mb-4">
                    <li className={subTextColor}>за ближайший локальный экстремум;</li>
                    <li className={subTextColor}>за уровень, при пробое которого сценарий становится неверным.</li>
                </ul>
                <h5 className={`font-bold mb-1 ${headingColor}`}>Если стоп сработал:</h5>
                <ul className="list-disc list-inside space-y-1">
                    <li className={subTextColor}>сделка считается завершённой;</li>
                    <li className={subTextColor}>повторный вход возможен только при новом сетапе.</li>
                </ul>
                <p className={`text-yellow-600 dark:text-yellow-400 mt-4 font-bold`}>Усреднение убыточных позиций запрещено.</p>
            </div>

            <h3 className={`text-2xl font-black mt-8 mb-4 ${headingColor}`}>Где мы выходим из сделки</h3>
            <div className={`p-6 rounded-[2.5rem] ${cardBg} ${cardBorder} border`}>
                <ul className="list-disc list-inside space-y-1 mb-4">
                    <li className={subTextColor}>фиксация части позиции на ближайшем уровне;</li>
                    <li className={subTextColor}>полный выход при достижении цели;</li>
                    <li className={subTextColor}>сопровождение сделки, если рынок развивается в нашу сторону.</li>
                </ul>
                <p className={subTextColor}>Мы не держим позицию «на авось» — выход всегда запланирован заранее.</p>
            </div>

            <h3 className={`text-2xl font-black mt-8 mb-4 ${headingColor}`}>Пример сделки</h3>
            <div className={`p-6 rounded-[2.5rem] ${cardBg} ${cardBorder} border`}>
                <ul className="list-disc list-inside space-y-1">
                    <li className={subTextColor}>Допустим, SOL, график 5 минут.</li>
                    <li className={subTextColor}>Цена формирует импульс вверх.</li>
                    <li className={subTextColor}>Происходит откат к уровню, где ранее был максимум.</li>
                    <li className={subTextColor}>После подтверждения на 1-минутном графике открывается лонг.</li>
                    <li className={subTextColor}>Стоп размещается за минимум отката.</li>
                    <li className={subTextColor}>Цель — обновление локального максимума.</li>
                </ul>
            </div>

            <h3 className={`text-2xl font-black mt-8 mb-4 ${headingColor}`}>Типичные ошибки новичков</h3>
            <div className={`p-6 rounded-[2.5rem] bg-red-500/10 border border-red-500/20`}>
                <ul className="list-disc list-inside space-y-1 text-red-500 dark:text-red-400 font-bold">
                    <li>торговля без чёткого плана;</li>
                    <li>вход «потому что цена пошла»;</li>
                    <li>перенос позиции на следующий день;</li>
                    <li>увеличение объёма после убытков;</li>
                    <li>игнорирование стоп-лосса.</li>
                </ul>
            </div>

            <div className="mt-12 text-center">
                <button
                    onClick={() => window.history.back()}
                    className={`px-6 py-3 rounded-xl ${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white font-bold transition-colors`}
                >
                    ← Назад к стратегиям
                </button>
            </div>
        </div>
    );
};
