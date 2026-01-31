import { useNavigate } from 'react-router-dom'
import { useThemeStore } from '@/store/themeStore'
import { ArrowLeft } from 'lucide-react'
import crocBg from '@/assets/404_bg.jpg'

export const NotFound = () => {
    const { theme } = useThemeStore()
    const navigate = useNavigate()

    return (
        <div className={`min-h-screen w-full flex flex-col relative overflow-hidden font-sans ${theme === 'dark' ? 'bg-[#0a0f18]' : 'bg-slate-50'}`}>
            {/* Header / Top Navigation */}
            <div className="absolute top-0 left-0 w-full p-8 flex justify-between items-center z-10">
                <div className="flex items-center gap-2">
                    <span className={`text-xl font-black tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                        ALPHA <span className="opacity-30">|</span> VAULT
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold tracking-[0.2em] uppercase opacity-50 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                        CROC <span className="opacity-30 px-1">|</span> TEAM
                    </span>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative">
                <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                    {/* Left Side: Content */}
                    <div className="space-y-8 relative z-10 order-2 lg:order-1">
                        <div className="space-y-2">
                            <h1 className="text-8xl sm:text-[12rem] font-black leading-none tracking-tighter text-[#4ade80] drop-shadow-[0_0_25px_rgba(74,222,128,0.3)]">
                                404
                            </h1>
                            <h2 className={`text-4xl sm:text-5xl font-black uppercase tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                                PAGE NOT FOUND
                            </h2>
                            <p className={`text-lg sm:text-xl font-medium opacity-60 max-w-md ${theme === 'dark' ? 'text-gray-300' : 'text-slate-600'}`}>
                                The page you are looking for does not seem to exist.
                            </p>
                        </div>

                        <button
                            onClick={() => navigate('/')}
                            className={`group flex items-center gap-3 px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-sm transition-all duration-300 active:scale-95 ${theme === 'dark'
                                    ? 'bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20'
                                    : 'bg-slate-900 text-white hover:bg-slate-800'
                                } shadow-2xl overflow-hidden relative`}
                        >
                            <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                            GO HOME

                            {/* Animated background glow */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        </button>
                    </div>

                    {/* Right Side: Mascot */}
                    <div className="relative order-1 lg:order-2 flex justify-center lg:justify-end">
                        <div className="relative w-full max-w-[500px] aspect-square group">
                            {/* Decorative background circle */}
                            <div className="absolute inset-0 bg-[#4ade80]/10 rounded-full blur-[100px] animate-pulse" />

                            {/* The Image */}
                            <img
                                src={crocBg}
                                alt="404 Mascot"
                                className="w-full h-full object-contain relative z-10 transition-transform duration-700 hover:scale-110"
                            />

                            {/* Border decoration around the image area to mimic the "cutout" feel */}
                            <div className="absolute inset-0 border-2 border-[#4ade80]/20 rounded-full scale-110 opacity-0 group-hover:opacity-100 transition-all duration-700" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Background Decorations */}
            <div className="absolute inset-0 pointer-events-none opacity-20">
                <div className={`absolute top-0 right-0 w-[500px] h-[500px] bg-[#4ade80]/10 rounded-full blur-[120px] -mr-64 -mt-64`} />
                <div className={`absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#4ade80]/5 rounded-full blur-[120px] -ml-64 -mb-64`} />
            </div>

            {/* Subtle Grid / Scanline Effect */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] select-none"
                style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        </div>
    )
}
