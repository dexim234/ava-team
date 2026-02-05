import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, Search, X } from 'lucide-react'
import { useThemeStore } from '@/store/themeStore'

interface StrategyItem {
    id: string | null;
    name: string;
    icon: React.ReactNode;
}

interface StrategyDropdownSelectorProps {
    strategies: StrategyItem[];
    activeStrategy: string | null;
    setActiveStrategy: (id: string | null) => void;
    placeholder?: string;
}

export const StrategyDropdownSelector: React.FC<StrategyDropdownSelectorProps> = ({
    strategies,
    activeStrategy,
    setActiveStrategy,
    placeholder = 'Выберите стратегию...'
}) => {
    const { theme } = useThemeStore();
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedStrategy = strategies.find(s => s.id === activeStrategy);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredStrategies = strategies.filter(s => {
        const name = s.name.toLowerCase();
        const query = search.toLowerCase();
        return name.includes(query);
    });

    return (
        <div className="relative w-full lg:w-72" ref={containerRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl border transition-all ${theme === 'dark'
                        ? 'bg-[#151a21] border-white/5 text-gray-300 hover:border-emerald-500/30'
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-emerald-500'
                    }`}
            >
                <div className="flex items-center gap-2.5 overflow-hidden">
                    {selectedStrategy ? (
                        <>
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${activeStrategy ? 'bg-blue-500/20 text-blue-500' : 'bg-gray-500/10 text-gray-500'} flex-shrink-0`}>
                                {selectedStrategy.icon}
                            </div>
                            <span className="text-sm font-bold truncate">
                                {selectedStrategy.name}
                            </span>
                        </>
                    ) : (
                        <>
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center border border-dashed border-gray-500 flex-shrink-0`}>
                                <Search size={12} className="text-gray-500" />
                            </div>
                            <span className="text-sm font-semibold text-gray-500">{placeholder}</span>
                        </>
                    )}
                </div>
                <ChevronDown size={16} className={`text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className={`absolute z-50 top-full mt-2 w-full min-w-[240px] rounded-2xl border shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 ${theme === 'dark' ? 'bg-[#1a1f26] border-white/10' : 'bg-white border-gray-200'
                    }`}>
                    {/* Search bar */}
                    <div className="p-3 border-b border-white/5">
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Поиск стратегии..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className={`w-full pl-9 pr-8 py-2 rounded-lg text-xs font-medium outline-none transition-all ${theme === 'dark'
                                        ? 'bg-black/20 text-gray-300 focus:bg-black/40'
                                        : 'bg-gray-100 text-gray-700 focus:bg-gray-200'
                                    }`}
                                autoFocus
                            />
                            {search && (
                                <button
                                    onClick={() => setSearch('')}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:text-rose-500"
                                >
                                    <X size={12} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Strategies list */}
                    <div className="max-h-[300px] overflow-y-auto p-1.5 custom-scrollbar">
                        <StrategyItemButton
                            name={"Все стратегии"}
                            icon={<Search size={12} />}
                            isSelected={!activeStrategy}
                            onClick={() => {
                                setActiveStrategy(null);
                                setIsOpen(false);
                            }}
                            theme={theme}
                        />

                        {filteredStrategies.map(strategy => (
                            <StrategyItemButton
                                key={strategy.id}
                                name={strategy.name}
                                icon={strategy.icon}
                                isSelected={activeStrategy === strategy.id}
                                onClick={() => {
                                    setActiveStrategy(strategy.id);
                                    setIsOpen(false);
                                }}
                                theme={theme}
                            />
                        ))}

                        {filteredStrategies.length === 0 && (
                            <div className="p-4 text-center">
                                <p className="text-[10px] text-gray-500">Ничего не найдено :(</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// MemberItem аналогия для стратегий
const StrategyItemButton: React.FC<{
    name: string;
    icon: React.ReactNode;
    isSelected: boolean;
    onClick: () => void;
    theme: string;
}> = ({ name, icon, isSelected, onClick, theme }) => {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-left group ${isSelected
                    ? theme === 'dark' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
                    : theme === 'dark' ? 'hover:bg-white/5 text-gray-300' : 'hover:bg-gray-50 text-gray-700'
                }`}
        >
            <div className="relative">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${isSelected ? 'bg-emerald-500/20 text-emerald-500' : 'bg-gray-500/10 text-gray-500'
                    }`}>
                    {icon}
                </div>
            </div>
            <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold truncate">{name}</span>
            </div>
        </button>
    );
};
