import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Users, MapPin, Eye, MessageSquare,
    Zap, Clock, Bot, Plus, Download,
    Settings, Shield, Activity, Sparkles,
    ListFilter, ChevronDown, ChevronUp, BarChart3,
    ArrowRight, Upload
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import LocationHierarchyExplorer from '../components/LocationHierarchyExplorer'
import { useLocationsStore } from '@/features/public/hooks/useLocationsStore'

const StatCard = ({ title, value, icon: Icon, color, delay }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: delay * 0.05 }}
        className="relative bg-slate-50/50 dark:bg-white/[0.03] p-2 lg:p-6 rounded-[28px] border border-transparent hover:border-slate-100 dark:hover:border-white/5 transition-all duration-300"
    >
        <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0">
                <h3 className="text-[9px] lg:text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-widest mb-1">{title}</h3>
                <p className="text-sm lg:text-2xl font-bold text-slate-900 dark:text-white leading-none tracking-tight truncate">{value}</p>
            </div>
            <div className={cn("w-10 h-10 lg:w-12 lg:h-12 rounded-2xl flex items-center justify-center bg-white dark:bg-white/5 shadow-sm shrink-0", color.replace('bg-', 'text-'))}>
                <Icon size={20} className="lg:w-6 lg:h-6" />
            </div>
        </div>
    </motion.div>
)

const QuickAction = ({ icon: Icon, label, color, description }) => (
    <button className="flex items-center gap-2 lg:gap-4 p-2 lg:p-5 bg-slate-50/50 dark:bg-white/[0.03] hover:bg-white dark:hover:bg-white/[0.05] rounded-[24px] border border-transparent hover:border-slate-100 dark:hover:border-white/5 transition-all group text-left w-full shadow-sm">
        <div className={cn("w-10 h-10 lg:w-12 lg:h-12 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0", color)}>
            <Icon size={18} className="lg:w-5 lg:h-5" />
        </div>
        <div className="min-w-0">
            <p className="text-sm lg:text-base font-bold text-slate-900 dark:text-white leading-none truncate">{label}</p>
            <p className="text-[10px] lg:text-xs text-slate-400 mt-1.5 font-bold uppercase tracking-wide truncate opacity-60 leading-none">{description}</p>
        </div>
        <ArrowRight size={14} className="ml-auto text-slate-300 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
    </button>
)

const AdminDashboardPage = () => {
    const navigate = useNavigate()
    const [isStatsCollapsed, setIsStatsCollapsed] = useState(false)
    const locations = useLocationsStore(s => s.locations)

    const stats = [
        { title: 'Locations', value: locations.length > 0 ? locations.length.toLocaleString() : '—', icon: MapPin, color: 'bg-orange-500' },
        { title: 'Users', value: '1,284', icon: Users, color: 'bg-blue-500' },
        { title: 'Subscriptions', value: '890', icon: MessageSquare, color: 'bg-emerald-500' },
        { title: 'Page Views', value: '45.2k', icon: Eye, color: 'bg-purple-500' },
    ]

    return (
        <div className="space-y-8 pb-20">
            {/* Header Section matches AdminLocationsPage */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
                <div>
                    <h1 className="text-xl lg:text-3xl font-bold text-slate-900 dark:text-white leading-none tracking-tight">Панель управления</h1>
                    <div className="flex items-center gap-2 mt-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <p className="text-slate-500 dark:text-slate-400 font-medium text-xs lg:text-sm">Все системы работают в штатном режиме.</p>
                    </div>
                </div>

                <div className="flex gap-2 w-full sm:w-auto p-1.5 bg-slate-100/50 dark:bg-slate-900/50 rounded-2xl border border-slate-200/20 dark:border-slate-800/50">
                    <button
                        onClick={() => navigate('/admin/locations?import=true')}
                        className="flex-1 sm:px-6 py-2.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        <Upload size={14} /> Импорт
                    </button>
                    <button
                        onClick={() => navigate('/admin/locations?export=true')}
                        className="flex-1 sm:px-6 py-2.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        <Download size={14} /> Экспорт
                    </button>
                    <button
                        onClick={() => navigate('/admin/locations?create=true')}
                        className="flex-1 sm:px-8 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        <Plus size={14} /> Создать
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                {/* Statistics Box - Left Column */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/50 rounded-[32px] overflow-hidden shadow-sm">
                        <div className="p-3 lg:p-5 flex items-center justify-between border-b border-slate-50 dark:border-slate-800/50">
                            <div className="flex items-center gap-3 pl-2">
                                <BarChart3 size={18} className="text-indigo-500" />
                                <h2 className="text-[10px] lg:text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest">Аналитика</h2>
                            </div>
                            <button
                                onClick={() => setIsStatsCollapsed(!isStatsCollapsed)}
                                className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all text-slate-400"
                            >
                                {isStatsCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                            </button>
                        </div>

                        <AnimatePresence initial={false}>
                            {!isStatsCollapsed && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="p-3 lg:p-5 grid grid-cols-2 gap-3">
                                        {stats.map((stat, i) => (
                                            <StatCard key={i} {...stat} delay={i} />
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Compact AI Insight */}
                    <div className="bg-slate-900 rounded-[32px] p-3 lg:p-6 text-white relative overflow-hidden shadow-xl">
                        <div className="absolute -right-2 -bottom-2 opacity-10">
                            <Bot size={120} />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-4">
                                <Sparkles size={16} className="text-indigo-400" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">GastroAI</span>
                            </div>
                            <h4 className="text-base font-bold leading-tight mb-5">Weekend brunch venues up 24% in popularity</h4>
                            <button
                                onClick={() => navigate('/admin/stats')}
                                className="flex items-center gap-2 text-[10px] font-bold text-white/60 hover:text-white transition-colors group uppercase tracking-widest"
                            >
                                View report <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Area: Commands & Activity */}
                <div className="lg:col-span-2 space-y-6">
                    <LocationHierarchyExplorer />

                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/50 rounded-[32px] p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <Clock size={20} className="text-slate-400" />
                                <h2 className="text-[10px] lg:text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest">Последние действия</h2>
                            </div>
                            <button onClick={() => navigate('/admin/users')} className="text-[10px] font-bold text-indigo-500 hover:text-indigo-600 transition-colors uppercase tracking-widest">Все</button>
                        </div>
                        <div className="space-y-3">
                            {[
                                { user: 'Dmitri S.', action: 'added photo to Pasta Bar', time: '2M AGO', initial: 'D' },
                                { user: 'Anna K.', action: 'activated Premium subscription', time: '12M AGO', initial: 'A' },
                                { user: 'System', action: 'database sync completed', time: '1H AGO', initial: 'S' },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-2 lg:p-4 bg-slate-50/50 dark:bg-slate-800/30 rounded-[20px] border border-transparent hover:border-slate-100 dark:hover:border-slate-700 transition-all">
                                    <div className="flex items-center gap-5 min-w-0">
                                        <div className="w-12 h-12 rounded-[18px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/50 flex items-center justify-center font-bold text-xs text-slate-400">
                                            {item.initial}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[13px] font-bold text-slate-900 dark:text-white leading-none mb-1.5">{item.user}</p>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide truncate opacity-60 leading-none">{item.action}</p>
                                        </div>
                                    </div>
                                    <span className="text-[9px] font-bold text-slate-300 whitespace-nowrap ml-4 uppercase tracking-widest">{item.time}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AdminDashboardPage
