import React from 'react';
import { useThemeStore } from '@/store/themeStore';
import { ArrowLeft } from 'lucide-react';

interface Strategy {
    id: string | null; // Изменено: id может быть string или null
    name: string;
    icon: React.ReactNode;
    desc: string;
}

interface StrategySelectorProps {
    strategies: Strategy[];
    activeStrategy: string | null;
    setActiveStrategy: (id: string | null) => void;
    children: React.ReactNode;
    title: string;
    description: string;
}

export const StrategySelector: React.FC<StrategySelectorProps> = ({ strategies, activeStrategy, setActiveStrategy, children, title, description }) => {
    const { theme } = useThemeStore();
    const headingColor = theme === 'dark' ? 'text-white' : 'text-gray-900';
    const subTextColor = theme === 'dark' ? 'text-gray-400' : 'text-gray-500';
    const cardBg = theme === 'dark' ? 'bg-[#1a212a]/50' : 'bg-white';
    const cardBorder = theme === 'dark' ? 'border-white/5' : 'border-gray-100';

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
            {!activeStrategy ? (
                <section>
                    <div className="mb-6">
                        <h1 className={`text-2xl sm:text-3xl font-bold ${headingColor}`}>{title}</h1>
                        <p className={`text-sm ${subTextColor}`}>{description}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {strategies.map((strategy) => (
                            <button
                                key={strategy.id}
                                onClick={() => setActiveStrategy(strategy.id)}
                                className={`relative flex flex-col items-start p-6 rounded-3xl border w-full text-left transition-all hover:shadow-lg ${cardBg} ${cardBorder}
                                    ${theme === 'dark' ? 'hover:border-blue-500/50' : 'hover:border-blue-500/20'}
                                `}
                            >
                                <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-blue-500/10' : 'bg-blue-500/5'}`}>
                                    {strategy.icon}
                                </div>
                                <h3 className={`mt-4 text-lg font-bold ${headingColor}`}>{strategy.name}</h3>
                                <p className={`mt-2 text-sm ${subTextColor}`}>{strategy.desc}</p>
                            </button>
                        ))}
                    </div>
                </section>
            ) : (
                <section>
                    <button
                        onClick={() => setActiveStrategy(null)}
                        className={`mb-6 px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 border ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-100 border-gray-200 text-gray-900'}`}
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Назад к списку</span>
                    </button>
                    {children}
                </section>
            )}
        </div>
    );
};