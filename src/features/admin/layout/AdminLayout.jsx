import React, { useState, useEffect } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import {
    MapPin, Users, BarChart3, ArrowLeft, LogOut,
    LayoutDashboard, CreditCard, Bot, ChevronRight,
    Menu, X, Bell, Search, Sun, Moon, PanelsTopLeft,
    ChevronLeft, Settings, HelpCircle, Activity, Shield, ShieldCheck
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useAuthStore } from '../../auth/hooks/useAuthStore'
import { useTheme } from '@/hooks/useTheme'

export default function AdminLayout() {
    const location = useLocation()
    const navigate = useNavigate()
    const logout = useAuthStore(state => state.logout)
    const user = useAuthStore(state => state.user)
    const { theme, toggleTheme } = useTheme()

    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [showNotifications, setShowNotifications] = useState(false)

    useEffect(() => {
        setIsSidebarOpen(false)
    }, [location.pathname])

    const navItems = [
        { icon: LayoutDashboard, label: 'Overview',       path: '/admin' },
        { icon: MapPin,          label: 'Locations',      path: '/admin/locations' },
        { icon: Users,           label: 'Users',          path: '/admin/users' },
        { icon: CreditCard,      label: 'Subscriptions',  path: '/admin/subscriptions' },
        { icon: Bot,             label: 'AI Agents',      path: '/admin/ai' },
        { icon: ShieldCheck,     label: 'Moderation',     path: '/admin/moderation' },
        { icon: BarChart3,       label: 'Analytics',      path: '/admin/stats' },
        { icon: Settings,        label: 'Settings',       path: '/admin/settings' },
    ]

    const notifications = [
        { id: 1, text: '3 new locations pending review', time: '2m ago', unread: true },
        { id: 2, text: 'New user registered: john@example.com', time: '15m ago', unread: true },
        { id: 3, text: 'AI Guide processed 150 requests', time: '1h ago', unread: false },
    ]

    // Breadcrumbs Logic
    const segments = location.pathname.split('/').filter(Boolean)
    const breadcrumbs = segments.map((segment, index) => {
        const path = `/${segments.slice(0, index + 1).join('/')}`
        const item = navItems.find(n => n.path === path)
        return {
            label: item ? item.label : segment.charAt(0).toUpperCase() + segment.slice(1),
            path
        }
    })

    const handleLogout = () => {
        logout()
        navigate('/')
    }

    const userInitials = user?.name
        ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : 'AD'

    const SidebarContent = ({ collapsed = false }) => (
        <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800/50 transition-all duration-300 relative">
            <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />

            {/* Logo Section */}
            <div className={cn("p-6 flex items-center gap-4 transition-all relative z-10", collapsed ? "justify-center" : "px-8")}>
                <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-500/30 active:scale-95 transition-transform cursor-pointer">
                    <Bot size={22} className="fill-white/20" />
                </div>
                {!collapsed && (
                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                        <h1 className="text-lg font-black text-slate-900 dark:text-white leading-none tracking-tighter">GastroOS</h1>
                        <p className="text-[9px] font-black text-indigo-500 mt-1.5 uppercase tracking-[0.2em] leading-none">Admin Panel</p>
                    </motion.div>
                )}
            </div>

            {/* Nav */}
            <nav className={cn("flex-1 px-4 py-10 space-y-2 overflow-y-auto relative z-10", collapsed && "px-3")}>
                {navItems.map(item => {
                    const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path))
                    return (
                        <Link key={item.path} to={item.path}>
                            <div className={cn(
                                "flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative",
                                isActive
                                    ? "bg-indigo-600 text-white shadow-2xl shadow-indigo-500/30"
                                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"
                            )}>
                                <item.icon size={18} className={cn("shrink-0 transition-transform duration-300 group-hover:scale-110", isActive ? "text-white" : "text-slate-400 group-hover:text-indigo-500")} />
                                {!collapsed && <span className="text-[13px] font-black tracking-tight">{item.label}</span>}
                                {isActive && !collapsed && (
                                    <motion.div layoutId="activeNavTab" className="absolute left-0 w-1 h-6 bg-white rounded-r-full" />
                                )}
                            </div>
                        </Link>
                    )
                })}
            </nav>

            {/* Footer Actions */}
            <div className="p-6 bg-slate-50/30 dark:bg-slate-900/30 border-t border-slate-100 dark:border-slate-800/50 space-y-3 relative z-10">
                <Link to="/dashboard" className={cn("w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all border border-transparent hover:border-indigo-100/30 font-black text-[10px] uppercase tracking-widest", collapsed && "justify-center px-0")}>
                    <ArrowLeft size={18} />
                    {!collapsed && <span>Back to App</span>}
                </Link>
                <button onClick={toggleTheme} className={cn("w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700 font-black text-[10px] uppercase tracking-widest", collapsed && "justify-center px-0")}>
                    {theme === 'dark' ? <Sun size={18} className="text-yellow-500" /> : <Moon size={18} className="text-indigo-600" />}
                    {!collapsed && <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
                </button>
                <button onClick={handleLogout} className={cn("w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-rose-500/80 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all font-black text-[10px] uppercase tracking-widest", collapsed && "justify-center px-0")}>
                    <LogOut size={18} />
                    {!collapsed && <span>Sign Out</span>}
                </button>
            </div>
        </div>
    )

    return (
        <div className="flex h-screen bg-[#FDFDFD] dark:bg-slate-950 overflow-hidden font-sans text-slate-900 dark:text-slate-200">
            {/* Desktop Sidebar — explicit h-screen so SidebarContent h-full resolves */}
            <motion.aside animate={{ width: isCollapsed ? 100 : 280 }} transition={{ type: 'spring', damping: 30, stiffness: 250 }} className="hidden lg:flex flex-col h-screen relative z-30 flex-shrink-0">
                <SidebarContent collapsed={isCollapsed} />
                <button onClick={() => setIsCollapsed(!isCollapsed)} className="absolute -right-3.5 top-12 w-7 h-7 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-full flex items-center justify-center text-slate-400 hover:text-indigo-600 shadow-sm transition-all z-40">
                    {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                </button>
            </motion.aside>

            {/* Mobile Sidebar */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[60] lg:hidden" />
                        <motion.aside initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed left-0 top-0 bottom-0 w-72 bg-white dark:bg-slate-900 z-[70] lg:hidden shadow-2xl">
                            <SidebarContent />
                            <button onClick={() => setIsSidebarOpen(false)} className="absolute top-6 right-6 p-2 text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-xl"><X size={18} /></button>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content Area — explicit h-screen + overflow-hidden makes height chain reliable */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden relative min-w-0">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

                {/* Top Header — flex-none, NOT sticky (scroll is on <main>, header is always visible) */}
                <header className="flex-none h-20 bg-white/50 dark:bg-slate-950/50 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between px-6 lg:px-10 z-20 transition-all relative">
                    <div className="flex items-center gap-6">
                        <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2.5 text-slate-500 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm" aria-label="Open menu">
                            <Menu size={20} />
                        </button>

                        {/* Breadcrumbs */}
                        <nav className="hidden md:flex items-center gap-2">
                            <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-400">
                                <Shield size={14} />
                            </div>
                            {breadcrumbs.map((crumb, i) => (
                                <React.Fragment key={crumb.path}>
                                    <ChevronRight size={12} className="text-slate-300" />
                                    <Link to={crumb.path} className={cn("text-xs font-semibold uppercase tracking-wider transition-colors", i === breadcrumbs.length - 1 ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 hover:text-slate-600")}>
                                        {crumb.label}
                                    </Link>
                                </React.Fragment>
                            ))}
                        </nav>
                    </div>

                    <div className="flex items-center gap-3 lg:gap-6">
                        {/* Search */}
                        <div className="hidden md:flex items-center gap-2 px-4 h-11 bg-slate-100/50 dark:bg-slate-900/50 rounded-xl border border-transparent focus-within:border-indigo-500/30 transition-all group w-48 xl:w-64">
                            <Search size={16} className="text-slate-400 group-hover:text-indigo-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search admin… ⌘K"
                                aria-label="Admin search"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && e.target.value.trim()) {
                                        navigate(`/admin/locations?q=${encodeURIComponent(e.target.value.trim())}`)
                                    }
                                }}
                                className="bg-transparent border-none outline-none text-sm font-medium text-slate-900 dark:text-white w-full placeholder:text-slate-400"
                            />
                        </div>

                        {/* Action Tools */}
                        <div className="flex items-center gap-2 border-l border-slate-200/50 dark:border-slate-800/50 pl-3 lg:pl-6 relative">
                            <button
                                aria-label="Notifications"
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="p-2.5 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl transition-all relative"
                            >
                                <Bell size={20} />
                                {notifications.some(n => n.unread) && (
                                    <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-slate-950" />
                                )}
                            </button>

                            {/* Notification dropdown */}
                            <AnimatePresence>
                                {showNotifications && (
                                    <>
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="fixed inset-0 z-[90]"
                                            onClick={() => setShowNotifications(false)}
                                        />
                                        <motion.div
                                            initial={{ opacity: 0, y: -8, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -8, scale: 0.95 }}
                                            className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden z-[100]"
                                        >
                                            <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                                                <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Notifications</p>
                                            </div>
                                            <div className="divide-y divide-slate-50 dark:divide-slate-800">
                                                {notifications.map(n => (
                                                    <div key={n.id} className={cn("px-4 py-3 flex gap-3 items-start hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors", n.unread && "bg-indigo-50/50 dark:bg-indigo-500/5")}>
                                                        {n.unread && <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />}
                                                        {!n.unread && <div className="w-2 h-2 rounded-full bg-transparent mt-1.5 shrink-0" />}
                                                        <div className="min-w-0">
                                                            <p className="text-sm text-slate-700 dark:text-slate-300 font-medium leading-snug">{n.text}</p>
                                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{n.time}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="p-3 border-t border-slate-100 dark:border-slate-800">
                                                <button className="w-full text-center text-xs font-bold text-indigo-500 hover:text-indigo-600 uppercase tracking-widest py-1">
                                                    Mark all as read
                                                </button>
                                            </div>
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>

                            <button
                                aria-label="Settings"
                                onClick={() => navigate('/admin/settings')}
                                className="p-2.5 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl transition-all"
                            >
                                <Settings size={20} />
                            </button>
                        </div>

                        <div className="flex items-center gap-4 pl-3 lg:pl-6 border-l border-slate-200/50 dark:border-slate-800/50">
                            <div className="hidden xl:flex flex-col items-end min-w-0">
                                <p className="text-sm font-bold text-slate-900 dark:text-white leading-none truncate w-28 text-right">
                                    {user?.name || 'Admin'}
                                </p>
                                <div className="flex items-center gap-1.5 mt-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Online</span>
                                </div>
                            </div>
                            <div className="w-10 h-10 lg:w-11 lg:h-11 rounded-xl bg-slate-900 dark:bg-white flex items-center justify-center text-white dark:text-slate-900 font-bold text-sm shadow-xl active:scale-95 transition-transform cursor-pointer border-2 border-slate-50 dark:border-slate-800 overflow-hidden">
                                {userInitials}
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-6 lg:p-10 bg-[#FDFDFD] dark:bg-slate-950">
                    <div className="max-w-[1600px] mx-auto min-h-full">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    )
}
