import React from 'react'
import { motion } from 'framer-motion'
import {
    Users, MapPin, CreditCard, TrendingUp, TrendingDown,
    ArrowUpRight, ArrowDownRight, Calendar, Filter, Download,
    Search, MousePointer2, Clock, Globe
} from 'lucide-react'
import { cn } from '@/lib/utils'

const AdminStatsPage = () => {
    // Explicit color maps — Tailwind can't scan dynamic template literals like `bg-${color}-500`
    const colorMap = {
        indigo:  { glow: 'bg-indigo-500',  icon: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' },
        purple:  { glow: 'bg-purple-500',  icon: 'bg-purple-500/10 text-purple-600 dark:text-purple-400' },
        emerald: { glow: 'bg-emerald-500', icon: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
        orange:  { glow: 'bg-orange-500',  icon: 'bg-orange-500/10 text-orange-600 dark:text-orange-400' },
    }

    const mainStats = [
        { label: 'Юзеры', value: '12,842', change: '+12%', isPositive: true, icon: Users, color: 'indigo' },
        { label: 'Объекты', value: '3,456', change: '+5%', isPositive: true, icon: MapPin, color: 'purple' },
        { label: 'Выручка', value: '$45.2k', change: '-2%', isPositive: false, icon: CreditCard, color: 'emerald' },
        { label: 'Конверсия', value: '18.4%', change: '+1%', isPositive: true, icon: TrendingUp, color: 'orange' },
    ]

    const visitsByCity = [
        { city: 'Краков', visits: 4500, color: 'bg-indigo-500' },
        { city: 'Варшава', visits: 3800, color: 'bg-blue-500' },
        { city: 'Берлин', visits: 2900, color: 'bg-purple-500' },
        { city: 'Прага', visits: 2100, color: 'bg-violet-500' },
    ]

    return (
        <div className="space-y-6 lg:space-y-8 pb-10 font-sans">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-5">
                <div>
                    <h1 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white leading-tight">Аналитика</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium mt-0.5 text-xs lg:text-sm truncate">Общая статистика производительности.</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm grow sm:grow-0">
                        <Calendar size={16} className="text-slate-400" />
                        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest leading-none">30 Дней</span>
                    </div>
                    <button className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all">
                        <Download size={16} />
                        Экспорт
                    </button>
                </div>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
                {mainStats.map((stat, i) => (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={i}
                        className="bg-white dark:bg-slate-900 p-4 lg:p-6 rounded-[20px] lg:rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-indigo-500/10 transition-colors"
                    >
                        <div className={cn(
                            "absolute -top-4 -right-4 w-20 lg:w-32 h-20 lg:h-32 rounded-full blur-[40px] lg:blur-[60px] opacity-10 group-hover:opacity-20 transition-opacity",
                            colorMap[stat.color]?.glow
                        )} />

                        <div className="flex justify-between items-start mb-4 lg:mb-6 relative z-10">
                            <div className={cn(
                                "p-2.5 lg:p-3 rounded-xl lg:rounded-[18px] shadow-inner",
                                colorMap[stat.color]?.icon
                            )}>
                                <stat.icon size={20} className="lg:w-6 lg:h-6" />
                            </div>
                            <div className={cn(
                                "flex items-center gap-1.5 px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider",
                                stat.isPositive ? 'bg-green-50 dark:bg-green-500/10 text-green-600' : 'bg-red-50 dark:bg-red-500/10 text-red-600'
                            )}>
                                {stat.isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                {stat.change}
                            </div>
                        </div>

                        <div className="relative z-10">
                            <p className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-0.5 lg:mb-1">{stat.label}</p>
                            <h3 className="text-lg lg:text-2xl font-bold text-slate-900 dark:text-white leading-tight truncate">{stat.value}</h3>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
                {/* Popular Cities Chart */}
                <div className="xl:col-span-2 bg-white dark:bg-slate-900 p-5 lg:p-10 rounded-[32px] lg:rounded-[48px] border border-slate-100 dark:border-slate-800 shadow-sm">
                    <div className="flex justify-between items-center mb-8 lg:mb-10 pl-1">
                        <h2 className="text-lg lg:text-xl font-bold text-slate-900 dark:text-white">Популярность по городам</h2>
                        <button className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-300 hover:text-indigo-600 transition-all shadow-inner">
                            <Filter size={18} />
                        </button>
                    </div>

                    <div className="space-y-8">
                        {visitsByCity.map((item, i) => (
                            <div key={i} className="space-y-3">
                                <div className="flex justify-between items-center text-[10px] lg:text-xs font-bold uppercase tracking-wider">
                                    <span className="text-slate-500 dark:text-slate-400">{item.city}</span>
                                    <span className="text-slate-900 dark:text-white">{item.visits.toLocaleString()}</span>
                                </div>
                                <div className="h-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-full overflow-hidden shadow-inner border border-slate-200/5 dark:border-slate-700/50">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(item.visits / 5000) * 100}%` }}
                                        transition={{ duration: 1, delay: 0.3 + i * 0.1 }}
                                        className={cn("h-full rounded-full shadow-lg", item.color)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Growths / AI efficiency */}
                <div className="bg-slate-950 dark:bg-black p-6 lg:p-10 rounded-[32px] lg:rounded-[48px] text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 lg:w-64 h-48 lg:h-64 bg-indigo-500/10 blur-[60px] lg:blur-[100px] -mr-16 -mt-16" />

                    <h2 className="text-lg lg:text-xl font-bold mb-8 relative z-10 leading-tight pl-1">AI Impact</h2>
                    <div className="space-y-4 lg:space-y-6 relative z-10">
                        <div className="p-5 lg:p-6 rounded-[24px] lg:rounded-[32px] bg-white/5 border border-white/5 backdrop-blur-xl group hover:border-white/10 transition-all">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform"><MousePointer2 size={20} /></div>
                                <div>
                                    <p className="text-[9px] lg:text-[10px] font-bold uppercase text-slate-500 tracking-widest mb-0.5">CTR AI REC</p>
                                    <p className="text-xl lg:text-2xl font-bold italic">24.8%</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-green-400 uppercase tracking-widest">
                                <ArrowUpRight size={12} />
                                <span>+4.2%</span>
                            </div>
                        </div>

                        <div className="p-5 lg:p-6 rounded-[24px] lg:rounded-[32px] bg-white/5 border border-white/5 backdrop-blur-xl group hover:border-white/10 transition-all">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform"><Clock size={20} /></div>
                                <div>
                                    <p className="text-[9px] lg:text-[10px] font-bold uppercase text-slate-500 tracking-widest mb-0.5">Retention</p>
                                    <p className="text-xl lg:text-2xl font-bold italic">68.2%</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-green-400 uppercase tracking-widest leading-none">
                                <ArrowUpRight size={12} />
                                <span>Healthy</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Conversions Table */}
            <div className="bg-white dark:bg-slate-900 rounded-[32px] lg:rounded-[48px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col flex-1 min-h-[300px]">
                <div className="p-6 lg:p-10 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-slate-50/20 dark:bg-slate-800/20">
                    <h2 className="text-lg lg:text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Последние подписки</h2>
                </div>
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-800/30">
                                <th className="px-6 lg:px-10 py-4 lg:py-5 text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-[0.2em]">User</th>
                                <th className="px-6 lg:px-10 py-4 lg:py-5 text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-[0.2em]">План</th>
                                <th className="px-6 lg:px-10 py-4 lg:py-5 text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-[0.2em]">Дата</th>
                                <th className="px-6 lg:px-10 py-4 lg:py-5 text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-[0.2em]">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800 font-medium">
                            {[
                                { name: 'Алексей Иванов', plan: 'Premium', date: '2 м. назад', amount: '$120.00', status: 'Success' },
                                { name: 'Мария Петрова', plan: 'Basic', date: '45 м. назад', amount: '$12.00', status: 'Success' },
                            ].map((tx, i) => (
                                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all border-none">
                                    <td className="px-6 lg:px-10 py-4 lg:py-5 text-[13px] lg:text-sm font-bold text-slate-900 dark:text-white truncate">{tx.name}</td>
                                    <td className="px-6 lg:px-10 py-4 lg:py-5 text-[10px] lg:text-[11px] font-bold text-slate-400 uppercase tracking-widest">{tx.plan}</td>
                                    <td className="px-6 lg:px-10 py-4 lg:py-5 text-[10px] lg:text-[11px] font-bold text-slate-400 uppercase tracking-widest">{tx.date}</td>
                                    <td className="px-6 lg:px-10 py-4 lg:py-5">
                                        <div className={cn(
                                            "inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[9px] font-bold border uppercase tracking-wider leading-none",
                                            tx.status === 'Success' ? 'bg-green-50 dark:bg-green-500/5 text-green-600 border-green-100/50' : 'bg-red-50 text-red-500 border-red-100'
                                        )}>
                                            <div className={cn("w-1.5 h-1.5 rounded-full", tx.status === 'Success' ? 'bg-green-500' : 'bg-red-500')} />
                                            {tx.status === 'Success' ? 'PASSED' : 'ERROR'}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}


export default AdminStatsPage
