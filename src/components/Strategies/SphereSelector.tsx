import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { useThemeStore } from '@/store/themeStore'

interface SphereItem {
    id: string;
    label: string;
    icon: React.ReactNode;
}

interface SphereSelectorProps {
    spheres: SphereItem[];
    activeSphere: string;
    setActiveSphere: (id: string) => void;
}

export const SphereSelector: React.FC<SphereSelectorProps> = ({
    spheres,
    activeSphere,
    setActiveSphere,
}) => {
    const { theme } = useThemeStore();
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedSphere = spheres.find(s => s.id === activeSphere);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (id: string) => {
        setActiveSphere(id);
        setIsOpen(false);
    };

    return (
        <div className="relative w-full lg:w-72" ref={containerRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-2xl border transition-all duration-300 ${theme === 'dark'
                    ? 'bg-[#151a21]/80 border-white/5 text-gray-300 hover:border-blue-500/30'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-blue-500'
                    } shadow-xl backdrop-blur-xl group relative overflow-hidden`}
            >
                <div className="flex items-center gap-2.5 overflow-hidden relative z-10">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${theme === 'dark' ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-500'
                        } flex-shrink-0`}>
                        {selectedSphere?.icon}
                    </div>
                    <div className="text-left min-w-0">
                        <p className="text-[10px] uppercase tracking-widest font-bold text-blue-500/60 leading-none mb-1">Сфера</p>
                        <span className="text-sm font-black tracking-tight truncate block">{selectedSphere?.label}</span>
                    </div>
                </div>
                <ChevronDown size={16} className={`text-blue-500 transition-transform duration-300 relative z-10 ${isOpen ? 'rotate-180' : ''}`} />

                {/* Animated background glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </button>

            {/* Dropdown - Unified for Mobile and Desktop */}
            {isOpen && (
                <div className={`absolute z-50 top-full mt-2 w-full min-w-[240px] rounded-2xl border shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300 ${theme === 'dark' ? 'bg-[#1a1f26] border-white/10' : 'bg-white border-gray-200'
                    }`}>
                    <div className="p-2 space-y-1">
                        {spheres.map((sphere) => (
                            <button
                                key={sphere.id}
                                onClick={() => handleSelect(sphere.id)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${activeSphere === sphere.id
                                    ? theme === 'dark' ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-600'
                                    : theme === 'dark' ? 'hover:bg-white/5 text-gray-400' : 'hover:bg-gray-50 text-gray-600'
                                    }`}
                            >
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${activeSphere === sphere.id
                                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                                    : theme === 'dark' ? 'bg-white/5' : 'bg-gray-100'
                                    }`}>
                                    {sphere.icon}
                                </div>
                                <span className="text-sm font-bold tracking-tight">{sphere.label}</span>
                                {activeSphere === sphere.id && (
                                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
