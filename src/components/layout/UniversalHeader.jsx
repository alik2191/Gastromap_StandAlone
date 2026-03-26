import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Moon, Sun, ShieldCheck, Download, PlusCircle, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'
import { useAuthStore } from '@/features/auth/hooks/useAuthStore'
import { usePWA } from '@/hooks/usePWA'

export function UniversalHeader() {
    const { theme, toggleTheme } = useTheme()
    const navigate = useNavigate()
    const { user: authUser } = useAuthStore()
    const { isInstallable, installPWA } = usePWA()
    const location = useLocation()
    const user = authUser || { name: 'Alex Johnson', email: 'alex@gastromap.com' }
    const isAdmin = authUser?.role === 'admin'
    const isDark = theme === 'dark'

    const [isScrolled, setIsScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const glassStyle = isDark
        ? "bg-black/20 border-white/5 text-white hover:bg-white/10"
        : "bg-white/20 border-white/20 text-gray-900 hover:bg-gray-100/50"

    const textStyle = isDark ? "text-white" : "text-gray-900"

    const isAIGuide = location.pathname === '/ai-guide'

    const headerBgClass = isScrolled || isAIGuide
        ? (isDark
            ? 'bg-gradient-to-b from-black/90 via-black/80 to-transparent backdrop-blur-xl'
            : 'bg-gradient-to-b from-white/90 via-white/80 to-transparent backdrop-blur-xl')
        : 'bg-transparent'

    return (
        <header className="fixed top-0 left-0 right-0 z-[100] transition-none">
            {/* Background Layer with Smooth Mask */}
            <div
                className={`absolute inset-0 w-full h-full transition-all duration-700 pointer-events-none ${headerBgClass}`}
                style={{
                    maskImage: 'linear-gradient(to bottom, black 0%, black 60%, transparent 100%)',
                    WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 60%, transparent 100%)'
                }}
            />

            <div className="max-w-[1400px] mx-auto relative min-h-[40px] px-[2.5vw] md:px-[20px] py-4">
                <AnimatePresence mode="wait">
                    {!isAIGuide ? (
                        <motion.div
                            key="standard-header"
                            initial={{ y: -10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -10, opacity: 0 }}
                            className="flex justify-between items-center w-full h-10"
                        >
                            {/* Logo Capsule */}
                            <Link to="/dashboard" className={`flex items-center gap-2 hover:scale-105 transition-all backdrop-blur-md px-3 py-1.5 rounded-full border shadow-sm ${isDark ? 'bg-white/10 border-white/10' : 'bg-white/40 border-white/40'}`}>
                                <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-inner">G</div>
                                <span className={`font-bold text-xs md:text-sm tracking-tight ${textStyle}`}>GastroMap</span>
                            </Link>

                            {/* Actions */}
                            <div className="flex items-center gap-2 md:gap-3">
                                {isInstallable && (
                                    <button
                                        onClick={installPWA}
                                        aria-label="Download GastroMap app"
                                        className={`flex items-center gap-2 px-3 py-2 rounded-full backdrop-blur-md transition-all border group bg-blue-600 border-blue-500/50 text-white shadow-[0_4px_15px_rgba(37,99,235,0.3)] hover:scale-105 active:scale-95`}
                                    >
                                        <Download size={16} className="group-hover:bounce" />
                                        <span className="text-[10px] font-black uppercase tracking-tighter hidden sm:inline">Download</span>
                                    </button>
                                )}
                                {isAdmin && (
                                    <Link to="/admin" className={`p-2 rounded-full backdrop-blur-md transition-all border ${glassStyle}`}>
                                        <ShieldCheck size={18} className="text-blue-500" />
                                    </Link>
                                )}
                                <button onClick={toggleTheme} aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'} className={`p-2 rounded-full backdrop-blur-md transition-all border ${glassStyle}`}>
                                    {isDark ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-gray-600" />}
                                </button>
                                <Link to="/dashboard/add-place" className="flex items-center gap-2 px-3 py-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs md:text-sm shadow-md shadow-indigo-500/30 transition-all hover:scale-105 active:scale-95 border border-indigo-500/50">
                                    <PlusCircle size={16} />
                                    <span className="hidden sm:inline">Add Place</span>
                                </Link>
                                <Link to="/profile" aria-label={`Profile for ${user.name}`} className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs md:text-sm shadow-md border-2 border-white/20 hover:scale-110 transition-transform">
                                    {user.name.charAt(0)}
                                </Link>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="ai-header"
                            initial={{ y: -10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -10, opacity: 0 }}
                            className="w-full flex flex-col items-center pt-1 pb-2"
                        >
                            {/* Level 1: Branding - Compact */}
                            <div className="flex items-center gap-2 mb-0.5">
                                <Sparkles size={18} className="text-blue-500" />
                                <h1 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                                    Gastro Guide
                                </h1>
                            </div>

                            {/* Level 2: Navigation - Compact Height */}
                            <div className="flex justify-between items-center w-full px-4 h-10 relative overflow-visible">
                                {/* Dashboard Hint (Left) */}
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => navigate('/dashboard')}
                                    aria-label="Back to dashboard"
                                    className="relative flex items-center gap-2 pr-8 group pointer-events-auto h-full"
                                >
                                    {/* Natural Glow - No clipping */}
                                    <div className={`absolute -left-10 inset-y-0 w-32 bg-gradient-to-r ${isDark ? 'from-blue-600/30' : 'from-blue-500/20'} to-transparent blur-xl pointer-events-none`} />
                                    <div className="relative z-10 flex flex-col items-start">
                                        <ChevronLeft className="w-5 h-5 text-blue-500 animate-pulse" />
                                        <span className="text-[7px] font-black uppercase tracking-tighter text-blue-500/60 leading-none">Back</span>
                                    </div>
                                </motion.button>

                                {/* Saved Hint (Right) */}
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => navigate('/saved')}
                                    aria-label="Go to saved locations"
                                    className="relative flex items-center gap-2 pl-8 group pointer-events-auto text-right h-full"
                                >
                                    {/* Natural Glow - No clipping */}
                                    <div className={`absolute -right-10 inset-y-0 w-32 bg-gradient-to-l ${isDark ? 'from-indigo-600/30' : 'from-indigo-500/20'} to-transparent blur-xl pointer-events-none`} />
                                    <div className="relative z-10 flex flex-col items-end">
                                        <ChevronRight className="w-5 h-5 text-indigo-500 animate-pulse" />
                                        <span className="text-[7px] font-black uppercase tracking-tighter text-indigo-500/60 leading-none">Saved</span>
                                    </div>
                                </motion.button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </header>
    )
}
