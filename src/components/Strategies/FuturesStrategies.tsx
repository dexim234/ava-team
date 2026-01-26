import { useState } from "react";

import {
  BarChart3,
  Brain,
  Bot,
  Zap,
  LayoutGrid,
  Globe,
  Terminal,
  ArrowLeft,
  Wrench,
  BookOpen,
} from "lucide-react";

const tabs = [
  {
    id: "overview",
    label: "Обзор",
    icon: <LayoutGrid size={18} />,
    content: (
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Обзор фьючерсных стратегий</h3>
        <p>
          Фьючерсные стратегии включают в себя использование деривативных
          контрактов для спекуляций на будущих ценах активов или хеджирования
          от рисков.
        </p>
        <p>Ключевые особенности:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Использование кредитного плеча для увеличения прибвыли.</li>
          <li>Возможность получения прибыли как от роста, так и от падения рынка.</li>
          <li>Разнообразие стратегий, от простых до сложных.</li>
        </ul>
      </div>
    ),
  },
  {
    id: "leverage",
    label: "Кредитное плечо",
    icon: <BarChart3 size={18} />,
    content: (
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Кредитное плечо</h3>
        <p>
          Кредитное плечо позволяет трейдерам управлять большими позициями,
          используя относительно небольшой объем капитала. Это может значительно
          увеличить потенциальную прибыль, но также и потенциальные убытки.
        </p>
        <p>
          Важно понимать риски, связанные с кредитным плечом, и использовать
          его с осторожностью. Рекомендуется начинать с низкого кредитного
          плеча и постепенно увеличивать его по мере накопления опыта.
        </p>
      </div>
    ),
  },
  {
    id: "long-short",
    label: "Лонг/Шорт",
    icon: <Globe size={18} />,
    content: (
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Лонг и Шорт позиции</h3>
        <p>
          В то время как спотовая торговля позволяет получать прибыль только от
          роста цен, фьючерсы позволяют получать прибыль как от роста (лонг),
          так и от падения (шорт) цен активов.
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>
            <span className="font-semibold">Лонг:</span> Покупка фьючерсного
            контракта с ожиданием роста цены актива.
          </li>
          <li>
            <span className="font-semibold">Шорт:</span> Продажа фьючерсного
            контракта с ожиданием падения цены актива.
          </li>
        </ul>
      </div>
    ),
  },
  {
    id: "hedging",
    label: "Хеджирование",
    icon: <Wrench size={18} />,
    content: (
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Хеджирование с использованием фьючерсов</h3>
        <p>
          Фьючерсы могут использоваться для хеджирования — снижения ценовых
          рисков. Например, если у вас есть актив, и вы опасаетесь падения его
          цены, вы можете открыть шорт-позицию по фьючерсу на этот актив.
        </p>
        <p>
          Это может помочь компенсировать убытки от изменения цены базового
          актива. Хеджирование является важным инструментом для управления
          рисками в нестабильных рыночных условиях.
        </p>
      </div>
    ),
  },
  {
    id: "algorithmic-trading",
    label: "Алгоритмическая торговля",
    icon: <Bot size={18} />,
    content: (
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Алгоритмическая торговля</h3>
        <p>
          Автоматизируйте свои стратегии, используя
          алгоритмическую торговлю. Создавайте ботов, которые будут
          круглосуточно следить за рынком и исполнять сделки по заранее заданным
          правилам.
        </p>
        <p>
          Это позволяет исключить эмоциональный фактор из торговли и
          обеспечивает высокую скорость исполнения, что особенно важно на
          быстро меняющихся фьючерсных рынках.
        </p>
      </div>
    ),
  },
  {
    id: "risk-management",
    label: "Управление рисками",
    icon: <Brain size={18} />,
    content: (
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Управление рисками</h3>
        <p>
          Управление рисками является критически важным аспектом фьючерсной
          торговли. Наш сервис предлагает инструменты для установки стоп-лоссов,
          тейк-профитов и других параметров для защиты вашего капитала.
        </p>
        <p>
          Разработайте четкий план управления рисками и строго придерживайтесь
          его, чтобы минимизировать потенциальные убытки и сохранить свой
          торговый капитал.
        </p>
      </div>
    ),
  },
  {
    id: "api-integration",
    label: "API Интеграция",
    icon: <Terminal size={18} />,
    content: (
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">API Интеграция</h3>
        <p>
          Подключите свои торговые аккаунты через API для бесшовной
          интеграции и автоматизации. Это позволяет вам торговать напрямую с
          вашей биржи, используя наши продвинутые стратегии и алгоритмы.
        </p>
        <p>
          Наша платформа обеспечивает безопасное и надежное соединение, давая
          вам полный контроль над вашими сделками.
        </p>
      </div>
    ),
  },
  {
    id: "quick-start",
    label: "Быстрый старт",
    icon: <Zap size={18} />,
    content: (
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Быстрый старт с фьючерсами</h3>
        <p>
          Начните торговать фьючерсами всего за несколько шагов. Наш интуитивно
          понятный интерфейс и пошаговые руководства помогут вам быстро
          освоиться с платформой.
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>Зарегистрируйтесь и подключите свой аккаунт.</li>
          <li>Выберите стратегию или создайте свою.</li>
          <li>Начните торговлю и отслеживайте свои результаты.</li>
        </ul>
      </div>
    ),
  },
  {
    id: "resources",
    label: "Ресурсы",
    icon: <BookOpen size={18} />,
    content: (
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Дополнительные ресурсы</h3>
        <p>
          Изучите наши обучающие материалы, видеоуроки и аналитические статьи,
          чтобы улучшить свои навыки фьючерсной торговли. Мы постоянно
          обновляем нашу базу знаний.
        </p>
        <p>
          Присоединяйтесь к нашему сообществу, чтобы обмениваться опытом с
          другими трейдерами и получать поддержку от экспертов.
        </p>
      </div>
    ),
  },
];

const FuturesStrategies = () => {
  const [activeTab, setActiveTab] = useState(tabs[0].id);

  return (
    <div className="flex flex-col lg:flex-row h-full">
      <div className="lg:w-1/4 p-4 border-r dark:border-gray-700 overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <ArrowLeft size={24} /> Фьючерсные стратегии
        </h2>
        <nav className="space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`w-full justify-start gap-3 inline-flex items-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 ${
                activeTab === tab.id ? "bg-secondary text-secondary-foreground hover:bg-secondary/80" : "hover:bg-accent hover:text-accent-foreground"
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="flex-1 p-6 overflow-y-auto">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`tab-content ${
              activeTab === tab.id ? "block" : "hidden"
            }`}
          >
            {tab.content}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FuturesStrategies;