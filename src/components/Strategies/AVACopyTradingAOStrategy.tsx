import React from 'react'
import { useThemeStore } from '@/store/themeStore'
import { ExternalLink, Users } from 'lucide-react'

export const AVACopyTradingAOStrategy: React.FC = () => {
    const { theme } = useThemeStore();
    const headingColor = theme === 'dark' ? 'text-white' : 'text-gray-900';
    const textColor = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';
    const highlightColor = theme === 'dark' ? 'text-blue-400' : 'text-blue-600';

    return (
        <div className="space-y-8">
            <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 flex-shrink-0">
                    <Users className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                    <h2 className={`text-2xl font-black mb-2 ${headingColor}`}>AVA — Copy Trading AO</h2>
                    <p className={`text-md ${textColor}`}>
                        Стратегия торговли мемкоинами на основе сигналов HUB от Alpha One.
                    </p>
                </div>
            </div>

            <section className="space-y-6">
                <h3 className={`text-xl font-bold ${headingColor}`}>Суть стратегии</h3>
                <p className={textColor}>
                    AVA — Copy Trading AO — это стратегия торговли мемкоинами на основе сигналов HUB от <a href="https://t.me/alpha_web3_bot?start=nbyO0C5R" target="_blank" rel="noopener noreferrer" className={`${highlightColor} flex items-center gap-1`}>Alpha One <ExternalLink className="w-3 h-3" /></a>. Потенциал доходности — от 20% до практически неограниченных иксов, при условии строгого соблюдения регламента и риск-менеджмента.
                </p>
                <p className={textColor}>
                    Ключевая идея стратегии — использовать экспертизу трейдеров, которые работают с мемкоинами 2–3 года и более. Они берут на себя основную нагрузку по:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 text-sm ${textColor}">
                    <li>анализу токенов;</li>
                    <li>поиску и оценке нарратива;</li>
                    <li>первичной проверке проектов на скам.</li>
                </ul>
                <p className={textColor}>
                    Для новичков это возможность разогнать депозит с пониженным риском, но не бездумным копированием.
                </p>
            </section>

            <section className="space-y-6">
                <h3 className={`text-xl font-bold ${headingColor}`}>ВАЖНЫЕ ОГОВОРКИ</h3>
                <ul className="list-disc list-inside space-y-2 ml-4 text-sm ${textColor}">
                    <li>У <a href="https://t.me/alpha_web3_bot?start=nbyO0C5R" target="_blank" rel="noopener noreferrer" className={`${highlightColor} flex items-center gap-1`}>Alpha One <ExternalLink className="w-3 h-3" /></a> есть функция автоповтора сделок («здесь и сейчас»). Мы её не используем.</li>
                    <li>Стратегия требует ручной проверки HUB-сигналов и самостоятельного входа в сделку при выполнении условий.</li>
                    <li>Коллеры <a href="https://t.me/alpha_web3_bot?start=nbyO0C5R" target="_blank" rel="noopener noreferrer" className={`${highlightColor} flex items-center gap-1`}>Alpha One <ExternalLink className="w-3 h-3" /></a> не гарантируют 100% доходности, фиксированных иксов или отсутствия убытков.</li>
                    <li>Самостоятельный ресерч обязателен.</li>
                </ul>
            </section>

            <section className="space-y-6">
                <h3 className={`text-xl font-bold ${headingColor}`}>Технический регламент</h3>
                <ol className="list-decimal list-inside space-y-2 ml-4 text-sm ${textColor}">
                    <li>Появляется сигнал в HUB <a href="https://t.me/alpha_web3_bot?start=nbyO0C5R" target="_blank" rel="noopener noreferrer" className={`${highlightColor} flex items-center gap-1`}>Alpha One <ExternalLink className="w-3 h-3" /></a></li>
                    <li>Моментально открываем:
                        <ul className="list-disc list-inside space-y-1 ml-4">
                            <li>график токена;</li>
                            <li>ленту сделок в <a href="https://gmgn.ai/r/WHA0hJCg" target="_blank" rel="noopener noreferrer" className={`${highlightColor} flex items-center gap-1`}>GMGN <ExternalLink className="w-3 h-3" /></a>.</li>
                        </ul>
                    </li>
                    <li>Быстрая оценка ситуации:
                        <ul className="list-disc list-inside space-y-1 ml-4">
                            <li>после сигнала в токен заходят массово;</li>
                            <li>в этот момент девелопер может сделать рагпул (резкий слив ликвидности).</li>
                        </ul>
                    </li>
                </ol>

                <h4 className={`text-lg font-bold ${headingColor} mt-4`}>Сценарии входа:</h4>
                <h5 className={`font-semibold ${headingColor} mt-2`}>1. График падает</h5>
                <p className={textColor}>
                    Если цена падает не из‑за рагпула, а из‑за фиксаций:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 text-sm ${textColor}">
                    <li>Twitter / X проекта активен;</li>
                    <li>кошельки выглядят реальными;</li>
                    <li>нет аномальных сливов ликвидности.</li>
                </ul>
                <p className={textColor}>
                    Действия:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 text-sm ${textColor}">
                    <li>дожидаемся окончания падения;</li>
                    <li>следим, чтобы объёмы покупок превышали продажи;</li>
                    <li>появляются первые уверенные зелёные свечи;</li>
                    <li>в ленте — покупки от $50–100+;</li>
                    <li>в идеале дев уже полностью зафиксировался.</li>
                </ul>
                <p className={textColor}>
                    После этого:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 text-sm ${textColor}">
                    <li>ищем точку входа (в том числе по Fibonacci);</li>
                    <li>заходим аккуратно, без FOMO.</li>
                </ul>

                <h5 className={`font-semibold ${headingColor} mt-4`}>2. График растёт</h5>
                <p className={textColor}>
                    Если цена растёт сразу после сигнала, то важно убедиться, что рост не создаётся кошельками дева или команды.
                </p>
                <p className={textColor}>
                    Действия:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 text-sm ${textColor}">
                    <li>выжидаем 5–10-15 секунд;</li>
                    <li>смотрим, как заходят другие трейдеры Alpha One;</li>
                    <li>подтверждаем, что объёмы — органические.</li>
                </ul>
                <p className={textColor}>
                    Только после этого рассматриваем вход.
                </p>
            </section>

            <section className="space-y-6">
                <h3 className={`text-xl font-bold ${headingColor}`}>Рекомендации по риск-менеджменту</h3>
                <ul className="list-disc list-inside space-y-2 ml-4 text-sm ${textColor}">
                    <li>Не более 10–20% депозита на торговлю мемкоинами.</li>
                    <li>При росте 30–50%:
                        <ul className="list-disc list-inside space-y-1 ml-4">
                            <li>выводим тело;</li>
                            <li>далее работаем на «бесплатных» токенах.</li>
                        </ul>
                    </li>
                    <li>Не жадничать - лучше зафиксировать +50%, чем взять +10%, видя минуту назад +50%.</li>
                    <li>Не заходим спустя 2-5 минут после сигнала по такой стратегии, если не заметили сразу токен - используем уже для принятия решения о входе элементы других стратегий.</li>
                </ul>
            </section>

            <section className="space-y-6">
                <h3 className={`text-lg font-bold ${headingColor}`}>Итог</h3>
                <p className={textColor}>
                    AVA — Copy Trading AO — это не автотрейдинг и не «кнопка бабла». Это:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 text-sm ${textColor}">
                    <li>быстрые решения;</li>
                    <li>холодная голова;</li>
                    <li>строгий регламент;</li>
                    <li>дисциплина в фиксации прибыли.</li>
                </ul>
                <p className={textColor}>
                    При правильном исполнении стратегия даёт редкую возможность участвовать в ранних движениях мемкоинов с опорой на опыт сильных трейдеров.
                </p>
            </section>
        </div>
    );
};
