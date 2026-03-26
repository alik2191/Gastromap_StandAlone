import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useAuthStore } from '../../auth/hooks/useAuthStore'
import { useLocationsStore } from '@/features/public/hooks/useLocationsStore'
import { useFavoritesStore } from '@/features/dashboard/hooks/useFavoritesStore'
import { useNavigate, Link } from 'react-router-dom'
import AuroraBackground from '@/components/ui/aurora-background'
import { MapPin, Star, Heart, Clock, ChevronRight, Moon, Sun, Search as SearchIcon, SlidersHorizontal, ShieldCheck } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'
import MapTab from '../components/MapTab'
import FilterModal from '../components/FilterModal'
import { PageTransition } from '@/components/ui/PageTransition'
import { translate } from '@/utils/translation'
import { DashboardCardSkeleton } from '@/components/ui/Skeleton'
import { useDebounce } from '@/hooks/useDebounce'
import { useTranslation } from 'react-i18next'

// --- MOBILE COMPONENTS ---
// Proper seamless marquee: two copies of the text side-by-side, animate x from 0 to -50%
const MarqueeTitle = ({ title, theme }) => {
    if (!title) return null
    return (
        <div className="overflow-hidden whitespace-nowrap relative">
            <motion.div
                animate={{ x: ['0%', '-50%'] }}
                transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                className={`inline-flex text-base font-black leading-tight ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}
            >
                <span className="pr-12">{title}</span>
                <span className="pr-12">{title}</span>
            </motion.div>
        </div>
    )
}

const LocationCardMobile = ({ loc, type = 'recommended' }) => {
    const { theme } = useTheme()
    const isDark = theme === 'dark'
    const { isFavorite, toggleFavorite } = useFavoritesStore()
    const saved = isFavorite(loc?.id)

    if (!loc) return null

    return (
        <div className={`flex-shrink-0 w-[220px] rounded-[28px] overflow-hidden transition-all active:scale-95 group shadow-xl ${isDark ? 'bg-[#1a1c24] border border-white/5' : 'bg-white'}`}>
            {/* Image Area */}
            <div className="relative h-[180px] overflow-hidden">
                <img
                    src={loc.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop'}
                    alt={loc.title || 'Location'}
                    crossOrigin="anonymous"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />

                {/* Rating Badge */}
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2 py-1 rounded-2xl flex items-center gap-1 shadow-md">
                    <Star size={12} className="text-blue-600 fill-blue-600" />
                    <span className="text-[11px] font-black text-gray-900">{loc.rating || '4.5'}</span>
                </div>

                {type === 'trending' && (
                    <div className="absolute top-3 left-3 bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shadow-lg border border-white/20">
                        Top Choice
                    </div>
                )}
            </div>

            {/* Content Area */}
            <div className="p-4 relative flex justify-between items-end">
                <div className="flex-1 overflow-hidden">
                    <h4 className={`text-sm font-black leading-tight truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {loc.title || 'Unknown Place'}
                    </h4>
                    <p className="text-[11px] font-medium text-gray-400 mt-1 line-clamp-1">
                        {loc.subtitle || 'Authentic flavors and vibes'}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                        {/* Best Time Indicator - Subtle Emoji */}
                        {loc.best_time && loc.best_time.length > 0 && (
                            <div className="flex items-center gap-1 mr-1">
                                <span className="text-[10px]" title="Best time to visit">
                                    {loc.best_time.includes('morning') && '🌅'}
                                    {loc.best_time.includes('day') && '☀️'}
                                    {loc.best_time.includes('evening') && '🌙'}
                                    {loc.best_time.includes('late_night') && '✨'}
                                </span>
                            </div>
                        )}

                        {/* Special Labels - Subtle small chips */}
                        {loc.special_labels?.slice(0, 2).map(label => (
                            <span key={label} className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${isDark ? 'bg-white/5 text-white/40' : 'bg-gray-100 text-gray-400'}`}>
                                {translate(label)}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Heart Button */}
                <button
                    className="flex-shrink-0 p-1 mb-0.5 active:scale-90 transition-transform"
                    onClick={(e) => { e.stopPropagation(); toggleFavorite(loc.id) }}
                    aria-label={saved ? 'Remove from saved' : 'Save place'}
                >
                    <Heart size={20} className={saved ? 'text-red-500 fill-red-500' : 'text-gray-300 stroke-[2.2]'} />
                </button>
            </div>
        </div>
    )
}


// --- MAIN PAGE ---
const DashboardPage = () => {
    const { t } = useTranslation()
    const { user: authUser } = useAuthStore()
    const user = authUser || { name: 'Alex Johnson', email: 'alex@gastromap.com' }
    const { locations } = useLocationsStore()
    const navigate = useNavigate()
    const { theme } = useTheme()
    const isDark = theme === 'dark'
    // Use the real loading state from the store (set by initialize() when fetching from Supabase)
    const isLoading = useLocationsStore(s => s.isLoading)

    const [isFilterOpen, setIsFilterOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const debouncedSearch = useDebounce(searchQuery, 300)

    // Apply search to store when debounced value changes
    useEffect(() => {
        const { setSearchQuery: storeSetSearch } = useLocationsStore.getState()
        storeSetSearch(debouncedSearch)
    }, [debouncedSearch])

    const countries = [
        { name: 'Poland',      slug: 'poland',      image: 'https://images.unsplash.com/photo-1519197924294-4ba991a11128?q=80&w=2069&auto=format&fit=crop', newCount: 9 },
        { name: 'France',      slug: 'france',      image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=2073&auto=format&fit=crop', newCount: 3 },
        { name: 'Spain',       slug: 'spain',       image: 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?q=80&w=2070&auto=format&fit=crop', newCount: 5 },
        { name: 'Italy',       slug: 'italy',       image: 'https://images.unsplash.com/photo-1529543544282-ea669407fca3?q=80&w=2048&auto=format&fit=crop', newCount: 7 },
        { name: 'Germany',     slug: 'germany',     image: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?q=80&w=2070&auto=format&fit=crop', newCount: 4 },
        { name: 'Portugal',    slug: 'portugal',    image: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?q=80&w=2070&auto=format&fit=crop', newCount: 2 },
        { name: 'Netherlands', slug: 'netherlands', image: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?q=80&w=2070&auto=format&fit=crop', newCount: 3 },
        { name: 'Czechia',     slug: 'czechia',     image: 'https://images.unsplash.com/photo-1541849546-216549ae216d?q=80&w=2070&auto=format&fit=crop', newCount: 6 },
    ]

    // Top-rated places
    const recommended = useMemo(
        () => [...locations].sort((a, b) => b.rating - a.rating).slice(0, 5),
        [locations]
    )

    // "Trending" — most recently added, different from recommended top-5
    const trending = useMemo(() => {
        const topIds = new Set(recommended.map(l => l.id))
        return [...locations]
            .filter(l => !topIds.has(l.id))
            .slice(-5)
            .reverse()
    }, [locations, recommended])

    const textStyle = theme === 'light' ? "text-gray-900" : "text-white"

    return (
        <PageTransition className="w-full max-w-7xl mx-auto flex flex-col relative z-0">
            <div data-testid="dashboard-page" className="contents">
            <FilterModal isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} theme={theme} />

            {/* MOBILE VIEW (Horizontal Sliders) */}
            <div className="md:hidden space-y-8 px-[2.5vw] pt-24 pb-12">

                {/* Search Bar Section */}
                <div className="space-y-4 mb-4">
                    <h2 className={`text-xl font-black tracking-tight leading-tight ${textStyle}`}>
                        {t('dashboard.tagline')}
                    </h2>
                    <div className="flex gap-2">
                        <div className={`flex-1 relative flex items-center h-12 px-4 rounded-2xl transition-all border ${isDark ? 'bg-white/5 border-white/10 shadow-none' : 'bg-white border-gray-100 shadow-xl shadow-blue-500/5'}`}>
                            <SearchIcon size={18} className="text-blue-500 mr-3" />
                            <input
                                type="text"
                                placeholder={t('dashboard.search_placeholder')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={`bg-transparent flex-1 outline-none text-sm font-semibold placeholder:text-gray-400 ${isDark ? 'text-white' : 'text-gray-900'}`}
                            />
                        </div>
                        <button
                            onClick={() => setIsFilterOpen(true)}
                            aria-label="Open filters"
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all active:scale-95 border ${isDark ? 'bg-blue-600/10 border-blue-500/20 text-blue-500' : 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 border-transparent'}`}
                        >
                            <SlidersHorizontal size={18} />
                        </button>
                    </div>
                </div>

                {/* 1. Explore by Country */}
                <div className="space-y-4">
                    <div className="flex justify-between items-end">
                        <div className="">
                            <h3 className={`text-lg font-black ${textStyle}`}>{t('dashboard.explore_countries')}</h3>
                            <p className="text-[11px] text-gray-500 font-medium">{t('dashboard.culinary_traditions')}</p>
                        </div>
                        <button onClick={() => navigate('/explore')} className="text-[10px] font-bold text-gray-400 bg-white/5 px-3 py-1.5 rounded-full border border-white/5 active:scale-90 transition-transform">
                            {t('dashboard.view_all')}
                        </button>
                    </div>

                    <div className="flex gap-[12px] overflow-x-auto pb-4 -mx-[2.5vw] px-[2.5vw] scrollbar-hide snap-x snap-mandatory transition-all">
                        {countries.map((country) => (
                            <button key={country.slug} onClick={() => navigate(`/explore/${country.slug}`)} aria-label={`Explore ${country.name}`} className="relative flex-shrink-0 w-[240px] h-[160px] rounded-[24px] overflow-hidden shadow-2xl snap-center group text-left">
                                <img src={country.image} crossOrigin="anonymous" alt={country.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                                <div className="absolute top-3 right-3 bg-blue-600 text-white text-[9px] font-black uppercase px-3 py-1 rounded-full shadow-lg">
                                    {country.newCount} New
                                </div>
                                <div className="absolute bottom-4 left-5">
                                    <h4 className="text-xl font-black text-white leading-none">{country.name}</h4>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* 2. Recommended for you */}
                <div className="space-y-4">
                    <div className="flex justify-between items-end">
                        <div className="">
                            <h3 className={`text-lg font-black ${textStyle}`}>{t('dashboard.recommended')}</h3>
                            <p className="text-[11px] text-gray-500 font-medium">{t('dashboard.perfect_spots')}</p>
                        </div>
                        <button onClick={() => navigate('/explore')} className="text-[10px] font-bold text-gray-400 bg-white/5 px-3 py-1.5 rounded-full border border-white/5 active:scale-90 transition-transform">
                            {t('dashboard.view_all')}
                        </button>
                    </div>

                    <div className="flex gap-[12px] overflow-x-auto pb-6 -mx-[2.5vw] px-[2.5vw] scrollbar-hide snap-x snap-mandatory">
                        {isLoading
                            ? Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="snap-center flex-shrink-0">
                                    <DashboardCardSkeleton isDark={isDark} />
                                </div>
                            ))
                            : recommended.map((loc) => (
                                <div key={loc.id} className="snap-center">
                                    <LocationCardMobile loc={loc} type="recommended" />
                                </div>
                            ))
                        }
                    </div>
                </div>

                {/* 3. Trending in Krakow */}
                <div className="space-y-4 pb-10">
                    <div className="flex justify-between items-end">
                        <div className="">
                            <h3 className={`text-lg font-black ${textStyle}`}>{t('dashboard.trending')}</h3>
                            <p className="text-[11px] text-gray-500 font-medium">{t('dashboard.hot_spots')}</p>
                        </div>
                        <button onClick={() => navigate('/explore')} className="text-[10px] font-bold text-gray-400 bg-white/5 px-3 py-1.5 rounded-full border border-white/5 active:scale-90 transition-transform">
                            {t('dashboard.view_all')}
                        </button>
                    </div>

                    <div className="flex gap-[12px] overflow-x-auto pb-6 -mx-[2.5vw] px-[2.5vw] scrollbar-hide snap-x snap-mandatory">
                        {isLoading
                            ? Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="snap-center flex-shrink-0">
                                    <DashboardCardSkeleton isDark={isDark} />
                                </div>
                            ))
                            : trending.map((loc) => (
                                <div key={loc.id} className="snap-center">
                                    <LocationCardMobile loc={loc} type="trending" />
                                </div>
                            ))
                        }
                    </div>
                </div>
            </div>

            {/* DESKTOP VIEW (Original Design - Fully Restored) */}
            <div className="hidden md:flex flex-col px-[10px] pt-24 pb-6">
                <DesktopDashboard
                    locations={locations}
                    recommended={recommended}
                    authUser={user}
                    countries={countries}
                    theme={theme}
                    setIsFilterOpen={setIsFilterOpen}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                />
            </div>
            </div>
        </PageTransition>
    )
}

// --- DESKTOP VIEW COMPONENT ---
const DesktopDashboard = ({ locations, recommended, authUser, countries, theme, setIsFilterOpen, searchQuery = '', setSearchQuery = () => {} }) => {
    const { t } = useTranslation()
    const { toggleTheme } = useTheme()
    const navigate = useNavigate()
    const [greeting, setGreeting] = useState('')
    const [activeTab, setActiveTab] = useState('overview')
    const [activeFilter, setActiveFilter] = useState('All')

    useEffect(() => {
        const hour = new Date().getHours()
        if (hour < 12) setGreeting(t('dashboard.greeting_morning'))
        else if (hour < 18) setGreeting(t('dashboard.greeting_afternoon'))
        else setGreeting(t('dashboard.greeting_evening'))
    }, [t])

    const glassStyle = theme === 'light'
        ? "bg-white/40 border-white/40 text-gray-900 shadow-sm hover:bg-white/60"
        : "bg-black/30 border-white/10 text-white shadow-lg hover:bg-black/40"

    const frameCardStyle = theme === 'light'
        ? "bg-white p-3 rounded-[32px] shadow-sm border border-gray-100"
        : "bg-white/10 p-3 rounded-[32px] shadow-lg border border-white/5"

    const textStyle = theme === 'light' ? "text-gray-900" : "text-white"
    const subTextStyle = theme === 'light' ? "text-gray-500" : "text-gray-400"

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    }

    return (
        <div className="pb-20">

            {/* 2. Hero: Greeting, Search */}
            <div className="mt-[40px]">
                <div className="space-y-2">
                    <h1 className={`text-4xl md:text-5xl font-bold tracking-tight ${textStyle}`}>
                        {greeting}, <span className="text-blue-600">{authUser.name.split(' ')[0]}</span>
                    </h1>
                    <p className={`text-lg ${subTextStyle}`}>{t('dashboard.tagline')}</p>
                </div>

                <div className="flex flex-col md:flex-row gap-4 items-center mt-[20px]">
                    <div className="relative flex-1 group w-full">
                        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                            <SearchIcon className="h-5 w-5 text-blue-600" />
                        </div>
                        <input
                            type="text"
                            placeholder={t('dashboard.search_placeholder')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={`w-full h-16 pl-14 pr-6 rounded-[24px] border-2 border-transparent outline-none text-lg transition-all ${theme === 'light' ? 'bg-white shadow-xl focus:border-blue-500' : 'bg-white/10 backdrop-blur-md text-white border-white/10 focus:border-blue-500'
                                }`}
                        />
                    </div>
                    <button
                        onClick={() => navigate(searchQuery ? `/explore?q=${encodeURIComponent(searchQuery)}` : '/explore')}
                        className="h-16 px-8 rounded-[24px] bg-blue-600 text-white font-bold text-lg shadow-xl shadow-blue-500/20 hover:bg-blue-700 active:scale-95 transition-all"
                    >
                        {t('dashboard.search_btn')}
                    </button>
                </div>

                {/* Recommendation Pills - Hidden for now
                <div className="flex flex-wrap gap-3 overflow-x-auto pb-2 scrollbar-hide mt-[10px]">
                    {['Lunch', 'Coffee', 'Fast', 'Dinner', 'Dessert', 'Date Night'].map((pill) => (
                        <button key={pill} className={`px-6 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap border transition-all ${theme === 'light' ? 'bg-white border-gray-100' : 'bg-white/5 border-white/10 hover:bg-white/10'
                            } ${textStyle}`}>
                            {pill}
                        </button>
                    ))}
                </div>
                */}
            </div>

            {/* 3. Control Bar: Tabs & Filters */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 mt-[20px]">
                <div className="bg-blue-600 p-1.5 rounded-full flex shadow-lg relative">
                    {['overview', 'map'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`relative px-8 py-3 rounded-full text-base font-bold capitalize transition-all duration-300 z-10 ${activeTab === tab ? 'text-blue-600' : 'text-white hover:bg-white/10'
                                }`}
                        >
                            {activeTab === tab && (
                                <motion.div layoutId="activeTab" className="absolute inset-0 bg-white rounded-full shadow-sm z-[-1]" />
                            )}
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-4 ml-auto">
                    <button
                        onClick={() => setIsFilterOpen(true)}
                        className={`p-2 rounded-xl active:scale-95 transition-transform ${glassStyle}`}
                    >
                        <SlidersHorizontal size={20} />
                    </button>
                </div>
            </div>

            {activeTab === 'map' ? (
                <div className="h-[600px] rounded-[32px] overflow-hidden shadow-2xl mt-[20px]">
                    <MapTab activeFilter={activeFilter} />
                </div>
            ) : (
                <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }} className="space-y-10 mt-[20px]">

                    {/* 4. Explore by Country - Original Grid */}
                    <motion.div variants={itemVariants} className="space-y-5">
                        <div className="flex justify-between items-end px-1">
                            <div>
                                <h3 className={`text-2xl font-bold ${textStyle}`}>{t('dashboard.explore_countries')}</h3>
                                <p className={`text-sm ${subTextStyle}`}>{t('dashboard.culinary_traditions')}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {countries.map((country) => (
                                <motion.button key={country.slug} onClick={() => navigate(`/explore/${country.slug}`)} aria-label={`Explore ${country.name}`} whileHover={{ y: -8, scale: 1.02 }} className="relative h-56 rounded-[32px] overflow-hidden group cursor-pointer shadow-lg text-left w-full">
                                    <img src={country.image} alt={country.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                    <div className="absolute bottom-6 left-6 text-white">
                                        <h4 className="text-2xl font-bold mb-1">{country.name}</h4>
                                        <div className="flex items-center gap-1.5 text-xs opacity-90">
                                            <MapPin size={12} className="fill-white/20" />
                                            <span>Explore cities</span>
                                        </div>
                                    </div>
                                    <div className="absolute bottom-6 right-6 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ChevronRight className="text-white" size={20} />
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>

                    {/* 5. Recommended for you - Original Grid */}
                    <motion.div variants={itemVariants} className="space-y-5">
                        <div className="flex justify-between items-end px-1">
                            <div>
                                <h3 className={`text-2xl font-bold ${textStyle}`}>{t('dashboard.recommended')}</h3>
                                <p className={`text-sm ${subTextStyle}`}>{t('dashboard.perfect_spots')}</p>
                            </div>
                            <button onClick={() => navigate('/explore')} className="text-blue-500 font-medium text-sm hover:underline">{t('dashboard.view_all')}</button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {recommended.map((item) => (
                                <motion.div key={item.id} onClick={() => navigate(`/location/${item.id}`)} whileHover={{ y: -8 }} className={`${frameCardStyle} transition-all duration-300 group cursor-pointer`}>
                                    <div className="relative h-56 mb-4 overflow-hidden rounded-2xl shadow-inner">
                                        <img src={item.image} crossOrigin="anonymous" alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg text-xs font-bold text-gray-900 flex items-center gap-1 shadow-md">
                                            <Star size={14} className="text-yellow-500 fill-yellow-500" /> {item.rating}
                                        </div>
                                    </div>
                                    <div className="space-y-1.5 px-1">
                                        <div className="flex justify-between items-start">
                                            <h4 className={`text-lg font-bold ${textStyle}`}>{item.title}</h4>
                                            {item.best_time && item.best_time.length > 0 && (
                                                <div className="flex gap-1 text-sm pt-1 opacity-70">
                                                    {item.best_time.includes('morning') && '🌅'}
                                                    {item.best_time.includes('day') && '☀️'}
                                                    {item.best_time.includes('evening') && '🌙'}
                                                    {item.best_time.includes('late_night') && '✨'}
                                                </div>
                                            )}
                                        </div>
                                        <p className={`text-sm ${subTextStyle}`}>{item.subtitle}</p>
                                        <div className="flex flex-wrap gap-1.5 pt-1">
                                            {item.special_labels?.slice(0, 3).map(label => (
                                                <span key={label} className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${theme === 'light' ? 'bg-gray-100 text-gray-400' : 'bg-white/10 text-white/50'}`}>
                                                    {translate(label)}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                    {/* 6. Trending in Krakow - Added for parity */}
                    <motion.div variants={itemVariants} className="space-y-5">
                        <div className="flex justify-between items-end px-1">
                            <div>
                                <h3 className={`text-2xl font-bold ${textStyle}`}>{t('dashboard.trending')}</h3>
                                <p className={`text-sm ${subTextStyle}`}>{t('dashboard.hot_spots')}</p>
                            </div>
                            <button onClick={() => navigate('/explore')} className="text-blue-500 font-medium text-sm hover:underline">{t('dashboard.view_all')}</button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {[...locations].reverse().slice(0, 3).map((item) => (
                                <motion.div key={item.id} onClick={() => navigate(`/location/${item.id}`)} whileHover={{ y: -8 }} className={`${frameCardStyle} transition-all duration-300 group cursor-pointer`}>
                                    <div className="relative h-56 mb-4 overflow-hidden rounded-2xl shadow-inner">
                                        <img src={item.image} crossOrigin="anonymous" alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg text-xs font-bold text-gray-900 flex items-center gap-1 shadow-md">
                                            <Star size={14} className="text-yellow-500 fill-yellow-500" /> {item.rating}
                                        </div>
                                    </div>
                                    <div className="space-y-1.5 px-1">
                                        <div className="flex justify-between items-start">
                                            <h4 className={`text-lg font-bold ${textStyle}`}>{item.title}</h4>
                                            {item.best_time && item.best_time.length > 0 && (
                                                <div className="flex gap-1 text-sm pt-1 opacity-70">
                                                    {item.best_time.includes('morning') && '🌅'}
                                                    {item.best_time.includes('day') && '☀️'}
                                                    {item.best_time.includes('evening') && '🌙'}
                                                    {item.best_time.includes('late_night') && '✨'}
                                                </div>
                                            )}
                                        </div>
                                        <p className={`text-sm ${subTextStyle}`}>{item.subtitle}</p>
                                        <div className="flex flex-wrap gap-1.5 pt-1">
                                            {item.special_labels?.slice(0, 3).map(label => (
                                                <span key={label} className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${theme === 'light' ? 'bg-gray-100 text-gray-400' : 'bg-white/10 text-white/50'}`}>
                                                    {translate(label)}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </div>
    )
}

export default DashboardPage
