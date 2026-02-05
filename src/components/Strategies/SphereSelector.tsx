import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, X, LayoutGrid } from 'lucide-react'
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
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
        setIsMobileMenuOpen(false);
    };

    return (
        <div className="relative" ref={containerRef}>
            {/* Desktop Selector */}
            <div className="hidden sm:block">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all duration-300 ${theme === 'dark'
                            ? 'bg-white/5 border-white/10 text-gray-300 hover:border-blue-500/30'
                            : 'bg-white border-gray-200 text-gray-700 hover:border-blue-500'
                        } shadow-lg backdrop-blur-xl group relative overflow-hidden`}
                >
                    <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${theme === 'dark' ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-500'
                            }`}>
                            {selectedSphere?.icon}
                        </div>
                        <div className="text-left">
                            <p className="text-[10px] uppercase tracking-widest font-bold text-blue-500/60 leading-none mb-1">Сфера</p>
                            <span className="text-sm font-black tracking-tight">{selectedSphere?.label}</span>
                        </div>
                    </div>
                    <ChevronDown size={16} className={`text-blue-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />

                    {/* Animated background glow */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </button>

                {/* Desktop Dropdown */}
                {isOpen && (
                    <div className={`absolute z-50 top-full right-0 mt-2 w-64 rounded-2xl border shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300 ${theme === 'dark' ? 'bg-[#1a1f26] border-white/10' : 'bg-white border-gray-200'
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
                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${activeSphere === sphere.id
                                            ? 'bg-blue-500 text-white'
                                            : theme === 'dark' ? 'bg-white/5' : 'bg-gray-100'
                                        }`}>
                                        {sphere.icon}
                                    </div>
                                    <span className="text-sm font-bold">{sphere.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Mobile Selector Button */}
            <div className="sm:hidden">
                <button
                    onClick={() => setIsMobileMenuOpen(true)}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all active:scale-[0.98] ${theme === 'dark'
                            ? 'bg-white/5 border-white/10 text-white active:bg-white/10'
                            : 'bg-white border-gray-200 text-gray-900 active:bg-gray-50'
                        } shadow-xl backdrop-blur-xl relative overflow-hidden group`}
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                            {selectedSphere?.icon}
                        </div>
                        <div className="text-left">
                            <p className="text-[10px] uppercase tracking-widest font-bold text-blue-500/60 leading-none mb-1">Выбранная Сфера</p>
                            <span className="font-black text-lg">{selectedSphere?.label}</span>
                        </div>
                    </div>
                    <div className={`p-2 rounded-xl ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'}`}>
                        <LayoutGrid className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </button>

                {/* Mobile Drawer Overlay */}
                {isMobileMenuOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setIsMobileMenuOpen(false)}
                        />
                        <div className={`w-full max-w-md relative z-10 p-6 rounded-[2.5rem] border ${theme === 'dark' ? 'bg-[#0b1015] border-white/10' : 'bg-white border-gray-100'
                            } shadow-2xl animate-in fade-in zoom-in-95 duration-300`}>
                            <div className="flex items-center justify-between mb-8">
                                <h3 className={`text-xl font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Выберите сферу</h3>
                                <button
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`p-2 rounded-full ${theme === 'dark' ? 'bg-white/5 text-gray-400' : 'bg-gray-100 text-gray-500'}`}
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 gap-3 max-h-[70vh] overflow-y-auto pr-2">
                                {spheres.map((sphere) => (
                                    <button
                                        key={sphere.id}
                                        onClick={() => handleSelect(sphere.id)}
                                        className={`flex items-center gap-4 p-4 rounded-[1.5rem] transition-all relative overflow-hidden ${activeSphere === sphere.id
                                                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25 scale-[1.02]'
                                                : theme === 'dark' ? 'bg-white/5 text-gray-400 hover:bg-white/10' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                            }`}
                                    >
                                        <div className={`p-2.5 rounded-xl ${activeSphere === sphere.id ? 'bg-white/20' : theme === 'dark' ? 'bg-white/5' : 'bg-white'
                                            }`}>
                                            {sphere.icon}
                                        </div>
                                        <span className="font-bold text-base">{sphere.label}</span>
                                        {activeSphere === sphere.id && (
                                            <div className="ml-auto w-2 h-2 rounded-full bg-white animate-pulse" />
                                        )}
                                    </button>
                                ))}
                            </div>
                            <div className="h-8" />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
