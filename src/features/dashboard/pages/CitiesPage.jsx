import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { MapPin, ChevronRight, Search, SlidersHorizontal, Home, AlertCircle } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'
import MapTab from '../components/MapTab'
import { useCitiesQuery } from '@/hooks/useCitiesQuery'
import { CityCardSkeleton } from '@/components/ui/Skeleton'

// ─── City card ────────────────────────────────────────────────────────────────

const itemVariants = {
    hidden:   { opacity: 0, y: 20 },
    visible:  { opacity: 1, y: 0 },
}

function CityCard({ city, country, navigate, desktop = false }) {
    const slug = city.name.toLowerCase().replace(/\s+/g, '-')
    return (
        <motion.button
            variants={itemVariants}
            onClick={() => navigate(`/explore/${country}/${slug}`)}
            whileHover={desktop ? { y: -8, scale: 1.02 } : undefined}
            className={`relative w-full overflow-hidden group shadow-lg active:scale-[0.98] transition-transform text-left ${
                desktop ? 'h-64 rounded-[32px] cursor-pointer' : 'h-48 rounded-[28px]'
            }`}
            aria-label={`Explore ${city.name}`}
        >
            <img
                src={city.image}
                alt={city.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className={`absolute left-6 text-white ${desktop ? 'bottom-6' : 'bottom-5'}`}>
                <h4 className={`font-bold text-white leading-none ${desktop ? 'text-3xl mb-1' : 'text-2xl'}`}>{city.name}</h4>
                <div className="flex items-center gap-1.5 mt-2 text-white/90">
                    <MapPin size={desktop ? 16 : 14} className="text-blue-400" />
                    <span className={`font-bold ${desktop ? 'text-sm' : 'text-[13px]'}`}>
                        Explore venues
                    </span>
                </div>
            </div>
            <div className={`absolute right-6 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20 ${
                desktop
                    ? 'bottom-6 w-12 h-12 opacity-0 group-hover:opacity-100 transition-all'
                    : 'bottom-5 w-10 h-10'
            }`}>
                <ChevronRight className="text-white" size={desktop ? 24 : 20} />
            </div>
        </motion.button>
    )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const CitiesPage = () => {
    const { country } = useParams()
    const navigate = useNavigate()
    const { theme } = useTheme()
    const isDark = theme === 'dark'

    const [activeTab, setActiveTab]     = useState('overview')
    const [searchQuery, setSearchQuery] = useState('')

    const { data: cities = [], isPending, isError } = useCitiesQuery(country)

    const filtered = cities.filter(c =>
        !searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const textStyle    = isDark ? 'text-white'   : 'text-gray-900'
    const subTextStyle = isDark ? 'text-gray-400' : 'text-gray-500'

    // ── Shared error / empty state ─────────────────────────────────────────
    const NoResults = () => (
        <div className="py-20 flex flex-col items-center gap-4 text-center">
            <AlertCircle size={36} className="text-gray-400" />
            <p className={`text-xl font-bold ${textStyle}`}>
                {searchQuery ? `No cities match "${searchQuery}"` : `No cities found for ${country}`}
            </p>
            <button
                onClick={() => navigate('/dashboard')}
                className="text-blue-500 text-sm font-semibold hover:underline"
            >
                Back to Dashboard
            </button>
        </div>
    )

    return (
        <div data-lenis-prevent className="h-[100dvh] bg-transparent relative overscroll-none overflow-y-auto scrollbar-hide">

            {/* ── MOBILE ───────────────────────────────────────────────────── */}
            <motion.div
                className="md:hidden space-y-5 px-[2.5vw] pt-24 pb-12"
                onPanEnd={(_, info) => {
                    if (info.offset.x > 100 && info.velocity.x > 10) navigate(-1)
                }}
            >
                {/* Title */}
                <div>
                    <h2 className={`text-2xl font-bold tracking-tight leading-tight ${textStyle}`}>
                        Explore <span className="text-blue-600 capitalize">{country}</span>
                    </h2>
                    <p className="text-[12px] text-gray-500 font-normal">Select a city to continue</p>
                </div>

                {/* Search */}
                <div className={`flex items-center h-14 px-5 rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-100 shadow-xl shadow-blue-500/5'}`}>
                    <Search size={20} className="text-blue-500 mr-3" />
                    <input
                        type="text"
                        placeholder="Find a city..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        aria-label="Search cities"
                        className={`bg-transparent flex-1 outline-none text-sm font-semibold placeholder:text-gray-400 ${isDark ? 'text-white' : 'text-gray-900'}`}
                    />
                </div>

                {/* Cards */}
                {isPending ? (
                    <div className="space-y-4">
                        {Array.from({ length: 4 }).map((_, i) => <CityCardSkeleton key={i} />)}
                    </div>
                ) : isError || filtered.length === 0 ? (
                    <NoResults />
                ) : (
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
                        className="space-y-4"
                    >
                        {filtered.map(city => (
                            <CityCard key={city.name} city={city} country={country} navigate={navigate} />
                        ))}
                    </motion.div>
                )}
            </motion.div>

            {/* ── DESKTOP ──────────────────────────────────────────────────── */}
            <div className="hidden md:block max-w-7xl mx-auto px-8 pt-24 pb-10">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

                    {/* Hero */}
                    <div className="mt-10 space-y-6">
                        <div className="space-y-2">
                            <h1 className={`text-5xl font-black tracking-tight capitalize ${textStyle}`}>
                                Welcome to <span className="text-blue-600">{country}</span>
                            </h1>
                            <p className={`text-lg ${subTextStyle}`}>Explore the finest culinary cities in this region.</p>
                        </div>

                        <div className="relative max-w-xl">
                            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                                <Search size={20} className="text-blue-600" />
                            </div>
                            <input
                                type="text"
                                placeholder={`Search cities in ${country}...`}
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                aria-label="Search cities"
                                className={`w-full h-16 pl-14 pr-6 rounded-[24px] border-2 border-transparent outline-none text-lg transition-all ${isDark ? 'bg-white/5 text-white border-white/10 focus:border-blue-500' : 'bg-white shadow-xl focus:border-blue-500'}`}
                            />
                        </div>
                    </div>

                    {/* Tab bar + breadcrumb */}
                    <div className="flex items-center gap-6 mt-8">
                        <div className="bg-blue-600 p-1.5 rounded-full flex shadow-lg">
                            {['overview', 'map'].map(tab => (
                                <button
                                    key={tab}
                                    role="tab"
                                    aria-selected={activeTab === tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`relative px-8 py-3 rounded-full text-base font-bold capitalize transition-all z-10 ${activeTab === tab ? 'text-blue-600' : 'text-white hover:bg-white/10'}`}
                                >
                                    {activeTab === tab && (
                                        <motion.div layoutId="activeTabCities" className="absolute inset-0 bg-white rounded-full shadow-sm z-[-1]" />
                                    )}
                                    {tab}
                                </button>
                            ))}
                        </div>

                        <nav className={`flex items-center px-4 py-2 rounded-full border backdrop-blur-md ${isDark ? 'bg-white/5 border-white/10' : 'bg-black/5 border-gray-100'}`}>
                            <Link to="/dashboard" className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase text-gray-400 hover:text-blue-500 transition-colors">
                                <Home size={12} /><span>Dashboard</span>
                            </Link>
                            <ChevronRight size={14} className="mx-2 text-gray-500/50" />
                            <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase text-blue-600">
                                <MapPin size={12} className="fill-blue-600/20" />
                                <span className="capitalize">{country}</span>
                            </div>
                        </nav>
                    </div>

                    {/* Content */}
                    <div className="mt-8 min-h-[400px]">
                        {activeTab === 'map' ? (
                            <div className="h-[600px] rounded-[32px] overflow-hidden shadow-2xl">
                                <MapTab activeFilter="All" />
                            </div>
                        ) : isPending ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                {Array.from({ length: 6 }).map((_, i) => <CityCardSkeleton key={i} desktop />)}
                            </div>
                        ) : isError || filtered.length === 0 ? (
                            <NoResults />
                        ) : (
                            <motion.div
                                initial="hidden"
                                animate="visible"
                                variants={{ visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } } }}
                                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
                            >
                                {filtered.map(city => (
                                    <CityCard key={city.name} city={city} country={country} navigate={navigate} desktop />
                                ))}
                            </motion.div>
                        )}
                    </div>

                </motion.div>
            </div>
        </div>
    )
}

export default CitiesPage
