import React, { useState, useRef, useEffect } from 'react'
import { Search, ChevronDown, BarChart3, X } from 'lucide-react'
import { useThemeStore } from '@/store/themeStore'

interface SphereItem {
    id: string | null;
    name: string;
    icon: React.ReactNode;
}

interface SphereSelectorProps {
    spheres: SphereItem[];
    activeSphere: string | null;
    setActiveSphere: (id: string | null) => void;
}

export const SphereSelector: React.FC<SphereSelectorProps> = ({
    spheres,
    activeSphere,
    setActiveSphere,
}) => {
    const { theme } = useThemeStore()
    const [isOpen, setIsOpen] = useState(false)
    const [search, setSearch] = useState('')
    const containerRef = useRef<HTMLDivElement>(null)

    const selectedSphere = spheres.find(s => s.id === activeSphere)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const filteredSpheres = spheres.filter(s => {
        const name = s.name.toLowerCase()
        const query = search.toLowerCase()
        return name.includes(query)
    })

    const renderIcon = (icon: React.ReactNode) => {
        if (React.isValidElement(icon)) {
            return icon
        }
        return <BarChart3 size={20} />
    }

    return (
        <div className="relative w-full lg:w-72" ref={containerRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-2xl border transition-all duration-300 ${theme === 'dark'
                    ? 'bg-[#151a21]/80 border-white/5 text-gray-300 hover:border-emerald-500/30'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-emerald-500'
                    } shadow-xl backdrop-blur-xl group relative overflow-hidden`}
            >
                <div className="flex items-center gap-2.5 overflow-hidden relative z-10">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${theme === 'dark' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-50 text-emerald-500'
                        } flex-shrink-0`}>
                        {renderIcon(selectedSphere?.icon)}
                    </div>
                    <div className="text-left min-w-0">
                        <p className="text-[10px] uppercase tracking-widest font-bold text-emerald-500/60 leading-none mb-1">Сфера</p>
                        <span className="text-sm font-black tracking-tight truncate block">{selectedSphere?.name || 'Все сферы'}</span>
                    </div>
                </div>
                <ChevronDown size={16} className={`text-emerald-500 transition-transform duration-300 relative z-10 ${isOpen ? 'rotate-180' : ''}`} />

                {/* Animated background glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </button>

            {isOpen && (
                <div className={`absolute z-50 w-full mt-2 rounded-2xl shadow-2xl border transition-all duration-300 ${theme === 'dark'
                    ? 'bg-[#151a21]/95 border-white/5 backdrop-blur-xl'
                    : 'bg-white border-gray-200'
                    }`}>
                    {/* Search input */}
                    <div className={`p-3 border-b ${theme === 'dark' ? 'border-white/5' : 'border-gray-100'}`}>
                        <div className={`relative ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Поиск сферы..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className={`w-full pl-9 pr-3 py-2 rounded-xl text-sm border ${theme === 'dark'
                                    ? 'bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-emerald-500/50'
                                    : 'bg-gray-50 border-gray-200 text-gray-700 placeholder-gray-400 focus:border-emerald-500'
                                    } focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all`}
                            />
                            {search && (
                                <button
                                    onClick={() => setSearch('')}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-gray-500/20 transition-colors"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Sphere list */}
                    <div className="max-h-64 overflow-y-auto py-2">
                        {filteredSpheres.length === 0 ? (
                            <div className={`px-4 py-8 text-center text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                                Сферы не найдены
                            </div>
                        ) : (
                            filteredSpheres.map((sphere) => (
                                <button
                                    key={sphere.id}
                                    onClick={() => {
                                        setActiveSphere(sphere.id)
                                        setIsOpen(false)
                                    }}
                                    className={`w-full flex items-center gap-3 px-4 py-2.5 transition-all duration-200 ${activeSphere === sphere.id
                                        ? theme === 'dark'
                                            ? 'bg-emerald-500/10 text-emerald-400'
                                            : 'bg-emerald-50 text-emerald-600'
                                        : theme === 'dark'
                                            ? 'text-gray-300 hover:bg-white/5'
                                            : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${activeSphere === sphere.id
                                        ? theme === 'dark'
                                            ? 'bg-emerald-500/20'
                                            : 'bg-emerald-100'
                                        : theme === 'dark'
                                            ? 'bg-white/5'
                                            : 'bg-gray-100'
                                        }`}>
                                        {renderIcon(sphere.icon)}
                                    </div>
                                    <span className="text-sm font-medium">{sphere.name}</span>
                                    {activeSphere === sphere.id && (
                                        <div className="ml-auto w-2 h-2 rounded-full bg-emerald-500" />
                                    )}
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
