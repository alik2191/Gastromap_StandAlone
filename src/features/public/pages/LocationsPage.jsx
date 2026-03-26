import React, { useState, useEffect, useRef, memo } from 'react'
import { motion, AnimatePresence, useDragControls } from 'framer-motion'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useVirtualizer } from '@tanstack/react-virtual'
import {
    MapPin, Search, SlidersHorizontal, Star, Clock,
    Heart, Share2, ChevronRight, Home, Utensils,
    Coffee, Wine, Store, Navigation, List, ChevronUp,
    ArrowUpDown, X, SearchX
} from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'
import FilterModal from '@/features/dashboard/components/FilterModal'
import MapTab from '@/features/dashboard/components/MapTab'
import { useLocationsStore } from '@/features/public/hooks/useLocationsStore'
import { useFavoritesStore } from '@/features/dashboard/hooks/useFavoritesStore'
import { useDebounce } from '@/hooks/useDebounce'
import { useOpenStatus } from '@/hooks/useOpenStatus'
import LazyImage from '@/components/ui/LazyImage'
import { LocationCardMobileSkeleton, LocationCardDesktopSkeleton } from '@/components/ui/Skeleton'
import { useLocationsQuery } from '@/hooks/useLocationsQuery'

// ─── Category config ──────────────────────────────────────────────────────
const CATEGORIES = [
    { name: 'All',        icon: Store },
    { name: 'Cafe',       icon: Coffee },
    { name: 'Restaurant', icon: Utensils },
    { name: 'Bar',        icon: Wine },
    { name: 'Fine Dining',icon: Star },
]

const SORT_OPTIONS = [
    { value: 'rating',     label: 'Top Rated' },
    { value: 'price_asc',  label: 'Price ↑' },
    { value: 'price_desc', label: 'Price ↓' },
    { value: 'name',       label: 'A → Z' },
]

// ─── Open status badge (uses real openingHours) ───────────────────────────
function OpenBadge({ openingHours }) {
    const { label, color, isOpen } = useOpenStatus(openingHours)
    if (isOpen === null) return null
    return (
        <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-tighter ${color}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-red-400'}`} />
            {label}
        </div>
    )
}

// ─── Mobile location card ─────────────────────────────────────────────────
const MobileCard = memo(function MobileCard({ item, isDark, textStyle, subTextStyle }) {
    const navigate = useNavigate()
    const { isFavorite, toggleFavorite } = useFavoritesStore()
    const saved = isFavorite(item.id)

    return (
        <motion.div
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            onClick={() => navigate(`/location/${item.id}`)}
            className={`relative flex flex-col p-3 rounded-[32px] overflow-hidden shadow-sm border transition-all active:scale-[0.98] cursor-pointer ${isDark ? 'bg-white/[0.03] border-white/5' : 'bg-white border-gray-100'}`}
        >
            <div className="relative h-48 w-full rounded-[24px] overflow-hidden mb-3">
                <LazyImage
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                {/* Labels */}
                <div className="absolute top-3 left-3 flex gap-2">
                    {item.special_labels?.slice(0, 1).map(label => (
                        <div key={label} className="bg-blue-600 text-white px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider shadow-lg">
                            {label}
                        </div>
                    ))}
                </div>

                {/* Save button */}
                <button
                    onClick={(e) => { e.stopPropagation(); toggleFavorite(item.id) }}
                    aria-label={saved ? 'Remove from favorites' : 'Add to favorites'}
                    className={`absolute top-3 right-3 w-10 h-10 rounded-xl backdrop-blur-md flex items-center justify-center border active:scale-90 transition-all ${
                        saved ? 'bg-red-500 border-red-400 text-white' : 'bg-white/20 border-white/30 text-white'
                    }`}
                >
                    <Heart size={18} fill={saved ? 'currentColor' : 'none'} />
                </button>

                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                    <div className="space-y-1">
                        <span className="bg-white/20 backdrop-blur-md text-white px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase border border-white/40">
                            {item.category}
                        </span>
                        <h4 className="text-xl font-black text-white leading-tight mt-1">{item.title}</h4>
                    </div>
                    <div className="bg-blue-600 p-2.5 rounded-xl text-white shadow-xl shadow-blue-600/30">
                        <Navigation size={18} />
                    </div>
                </div>
            </div>

            <div className="px-1 pb-1 space-y-2.5">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1.5">
                        <Star size={16} className="text-yellow-400 fill-yellow-400" />
                        <span className={`text-sm font-black ${textStyle}`}>{item.rating}</span>
                        <span className={`text-[11px] ${subTextStyle}`}>({item.reviews ?? '—'})</span>
                    </div>
                    <span className="text-blue-500 font-bold text-sm">{item.priceLevel}</span>
                </div>
                <OpenBadge openingHours={item.openingHours} />
            </div>
        </motion.div>
    )
})

// ─── Desktop location card ────────────────────────────────────────────────
const DesktopCard = memo(function DesktopCard({ item, isDark, textStyle, subTextStyle }) {
    const navigate = useNavigate()
    const { isFavorite, toggleFavorite } = useFavoritesStore()
    const saved = isFavorite(item.id)

    return (
        <motion.div
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            onClick={() => navigate(`/location/${item.id}`)}
            whileHover={{ y: -8 }}
            className={`relative flex flex-col p-4 rounded-[40px] overflow-hidden group cursor-pointer transition-all duration-300 border ${
                isDark ? 'bg-white/[0.03] border-white/5 shadow-2xl' : 'bg-white border-gray-100 shadow-xl shadow-gray-200/50'
            }`}
        >
            <div className="relative h-56 mb-5 rounded-[28px] overflow-hidden">
                <LazyImage
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {/* Rating */}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-black text-gray-900 flex items-center gap-1 shadow-md">
                    <Star size={12} className="text-yellow-500 fill-yellow-500" /> {item.rating}
                </div>
                {/* Save */}
                <button
                    onClick={(e) => { e.stopPropagation(); toggleFavorite(item.id) }}
                    className={`absolute top-4 left-4 w-9 h-9 rounded-xl backdrop-blur-md flex items-center justify-center border active:scale-90 transition-all ${
                        saved ? 'bg-red-500 border-red-400 text-white shadow-md' : 'bg-white/20 border-white/30 text-white'
                    }`}
                >
                    <Heart size={15} fill={saved ? 'currentColor' : 'none'} />
                </button>
            </div>

            <div className="space-y-3 px-2 flex-1">
                <div className="flex justify-between items-start gap-2">
                    <h4 className={`text-xl font-black leading-tight group-hover:text-blue-600 transition-colors ${textStyle}`}>
                        {item.title}
                    </h4>
                    <span className="text-blue-500 font-black text-sm flex-shrink-0">{item.priceLevel}</span>
                </div>
                <p className={`text-[13px] font-bold ${subTextStyle}`}>{item.cuisine} · {item.category}</p>

                <div className={`pt-4 flex justify-between items-center border-t ${isDark ? 'border-white/5' : 'border-gray-50'}`}>
                    <div className="space-y-0.5">
                        <OpenBadge openingHours={item.openingHours} />
                        {item.vibe && (
                            <span className={`text-[10px] font-bold ${subTextStyle}`}>{item.vibe}</span>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <button onClick={(e) => e.stopPropagation()}
                            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${isDark ? 'bg-white/5 hover:bg-white/10 text-white/50' : 'bg-gray-50 hover:bg-gray-100 text-gray-400'}`}>
                            <Share2 size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    )
})

// ─── Empty state ──────────────────────────────────────────────────────────
function EmptyState({ query, isDark }) {
    const { resetFilters } = useLocationsStore()
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center py-20 text-center"
        >
            <div className={`w-20 h-20 rounded-[28px] flex items-center justify-center mb-6 ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
                <SearchX size={36} className={isDark ? 'text-white/30' : 'text-gray-400'} />
            </div>
            <h3 className={`text-lg font-black mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                No results {query ? `for "${query}"` : ''}
            </h3>
            <p className={`text-sm font-medium mb-6 ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
                Try a different keyword or remove some filters.
            </p>
            <button
                onClick={resetFilters}
                className="px-6 py-3 bg-blue-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl active:scale-95 transition-all"
            >
                Clear filters
            </button>
        </motion.div>
    )
}

// ─── Page ─────────────────────────────────────────────────────────────────
const LocationsPage = () => {
    const { country, city } = useParams()
    const navigate = useNavigate()
    const { theme } = useTheme()
    const isDark = theme === 'dark'

    // Store
    const {
        filteredLocations,
        activeCategory,
        searchQuery: storeQuery,
        sortBy,
        setCategory,
        setSearchQuery: storeSetSearch,
        setSortBy,
        resetFilters,
    } = useLocationsStore()

    // Local search input → debounce → store
    const [localSearch, setLocalSearch] = useState(storeQuery)
    const debouncedSearch = useDebounce(localSearch, 300)

    useEffect(() => {
        storeSetSearch(debouncedSearch)
    }, [debouncedSearch, storeSetSearch])

    // Sync from URL query param on mount
    useEffect(() => {
        const q = new URLSearchParams(window.location.search).get('q')
        if (q) { setLocalSearch(q); storeSetSearch(q) }
        return () => resetFilters()
    }, [])

    // Fetch real venue data from OpenStreetMap; syncs to Zustand store automatically
    const { isPending: isLoading, isError } = useLocationsQuery(city, country)

    const scrollContainerRef = useRef(null)
    const virtualizer = useVirtualizer({
        count: isLoading ? 0 : filteredLocations.length,
        getScrollElement: () => scrollContainerRef.current,
        estimateSize: () => 342,
        overscan: 3,
    })

    const [activeTab, setActiveTab] = useState('overview')
    const [isFilterOpen, setIsFilterOpen] = useState(false)
    const [sheetMode, setSheetMode] = useState('full')
    const [sortOpen, setSortOpen] = useState(false)
    const dragControls = useDragControls()

    const textStyle = isDark ? 'text-white' : 'text-gray-900'
    const subTextStyle = isDark ? 'text-gray-400' : 'text-gray-500'
    const cardVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }

    const currentSort = SORT_OPTIONS.find(o => o.value === sortBy)

    return (
        // Using a plain div here (not PageTransition) because:
        // 1. This page uses `fixed inset-0` children (map layer, bottom sheet).
        //    Wrapping them in a motion.div with scale/y transforms breaks `position:fixed`
        //    — fixed elements inside a CSS-transformed parent are positioned relative
        //    to that parent, not the viewport.
        // 2. The individual child elements already have their own motion animations.
        <div className="fixed inset-0 w-full h-[100dvh] bg-transparent overflow-hidden overscroll-none">
            <FilterModal isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} theme={theme} />

            {/* ── MOBILE: Map layer ─────────────────────────────────────── */}
            <div className="md:hidden fixed inset-0 z-0 pt-16">
                <div className="w-full h-full [&>div]:h-full [&>div]:w-full [&>div]:rounded-none [&>div]:border-none">
                    <MapTab activeFilter={activeCategory} />
                </div>

                {/* Floating search */}
                <div className="absolute top-24 left-[4vw] right-[4vw] z-40">
                    <div className="flex gap-2">
                        <div className={`flex-1 relative flex items-center h-14 px-5 rounded-2xl transition-all border backdrop-blur-xl ${isDark ? 'bg-[#0a0a0a]/70 border-white/10' : 'bg-white/85 border-gray-100 shadow-xl'}`}>
                            <Search size={18} className="text-blue-500 mr-3 flex-shrink-0" />
                            <input
                                type="text"
                                placeholder={`Find in ${city}...`}
                                value={localSearch}
                                onChange={(e) => setLocalSearch(e.target.value)}
                                className={`bg-transparent flex-1 outline-none text-sm font-semibold placeholder:text-gray-400 ${isDark ? 'text-white' : 'text-gray-900'}`}
                            />
                            {localSearch && (
                                <button onClick={() => setLocalSearch('')} className="ml-2 text-gray-400 hover:text-gray-600">
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                        <button
                            onClick={() => setIsFilterOpen(true)}
                            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all active:scale-95 border backdrop-blur-xl ${isDark ? 'bg-blue-600/20 border-blue-500/20 text-blue-500' : 'bg-blue-600 text-white shadow-lg border-transparent'}`}
                        >
                            <SlidersHorizontal size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* ── MOBILE: Bottom sheet ──────────────────────────────────── */}
            <motion.div
                className="md:hidden fixed inset-x-0 bottom-0 z-[60] overflow-visible"
                initial={{ y: '100%' }}
                animate={{ y: sheetMode === 'mini' ? '84%' : '88px' }}
                transition={{ type: 'spring', damping: 30, stiffness: 250 }}
                drag="y"
                dragControls={dragControls}
                dragListener={false}
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={{ top: 0, bottom: 0.2 }}
                onDragEnd={(_, info) => {
                    if (info.offset.y < -50) setSheetMode('full')
                    if (info.offset.y > 50) setSheetMode('mini')
                }}
            >
                <div className={`flex flex-col h-[100dvh] rounded-t-[48px] pb-32 border-t backdrop-blur-3xl shadow-[0_-20px_60px_-15px_rgba(0,0,0,0.4)] ${isDark ? 'bg-[#1a1c24]/95 border-white/10' : 'bg-white/98 border-gray-200'}`}>
                    {/* Drag handle */}
                    <div
                        onPointerDown={(e) => dragControls.start(e)}
                        className="flex flex-col items-center pt-0 pb-2 px-[4vw] cursor-grab active:cursor-grabbing touch-none"
                    >
                        <div className="w-12 h-1.5 bg-gray-400/30 rounded-full my-4" />
                        <div
                            className="flex items-center gap-2 cursor-pointer active:scale-95 transition-transform"
                            onClick={(e) => { e.stopPropagation(); setSheetMode(sheetMode === 'full' ? 'mini' : 'full') }}
                        >
                            <ChevronUp size={14} className={`text-blue-500 transition-transform duration-500 ${sheetMode === 'full' ? 'rotate-180' : ''}`} />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                                {sheetMode === 'full' ? 'View Map' : 'View List'}
                            </span>
                        </div>
                    </div>

                    {/* Sheet content */}
                    <motion.div
                        ref={scrollContainerRef}
                        className="flex-1 overflow-y-auto pt-2 pb-32 px-[4vw] scrollbar-hide overscroll-contain touch-pan-y"
                        animate={{ opacity: sheetMode === 'full' ? 1 : 0, filter: sheetMode === 'full' ? 'blur(0px)' : 'blur(10px)' }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="space-y-1 mb-2.5">
                            <h2 className={`text-3xl font-black ${textStyle}`}>Discover {city}</h2>
                            <p className={`text-sm font-medium ${subTextStyle}`}>
                                {filteredLocations.length} place{filteredLocations.length !== 1 ? 's' : ''} found
                            </p>
                        </div>

                        {/* Category chips */}
                        <div className="flex gap-2.5 overflow-x-auto pb-4 -mx-[4vw] px-[4vw] scrollbar-hide">
                            <button
                                onClick={() => setIsFilterOpen(true)}
                                className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-2xl border ${isDark ? 'bg-blue-600/20 border-blue-500/20 text-blue-500' : 'bg-blue-600 text-white shadow-lg border-transparent'}`}
                            >
                                <SlidersHorizontal size={20} />
                            </button>
                            {CATEGORIES.filter(c => c.name !== 'All').map((cat) => (
                                <button
                                    key={cat.name}
                                    onClick={() => setCategory(cat.name === activeCategory ? 'All' : cat.name)}
                                    className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-[13px] font-black whitespace-nowrap transition-all border ${
                                        activeCategory === cat.name
                                            ? 'bg-blue-600 border-blue-600 text-white shadow-xl'
                                            : isDark ? 'bg-white/5 border-white/10 text-white/50' : 'bg-gray-100 border-gray-100 text-gray-500'
                                    }`}
                                >
                                    <cat.icon size={14} />
                                    {cat.name}
                                </button>
                            ))}
                        </div>

                        {/* Cards */}
                        {isLoading ? (
                            <div className="space-y-5">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <LocationCardMobileSkeleton key={i} isDark={isDark} />
                                ))}
                            </div>
                        ) : filteredLocations.length === 0 ? (
                            <EmptyState query={localSearch} isDark={isDark} />
                        ) : (
                            <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
                                {virtualizer.getVirtualItems().map((virtualRow) => (
                                    <div
                                        key={virtualRow.key}
                                        data-index={virtualRow.index}
                                        ref={virtualizer.measureElement}
                                        style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: '100%',
                                            transform: `translateY(${virtualRow.start}px)`,
                                            paddingBottom: '20px',
                                        }}
                                    >
                                        <MobileCard
                                            item={filteredLocations[virtualRow.index]}
                                            isDark={isDark}
                                            textStyle={textStyle}
                                            subTextStyle={subTextStyle}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                </div>
            </motion.div>

            {/* ── DESKTOP VIEW ──────────────────────────────────────────── */}
            {/* Wraps in absolute+overflow-y-auto so the grid scrolls within the
                fixed inset-0 root that is required by the mobile map/sheet layout. */}
            <div className="hidden md:flex absolute inset-0 overflow-y-auto z-10">
                <div className="w-full max-w-7xl mx-auto px-8 pt-24 pb-10">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

                    {/* Hero */}
                    <div className="mt-10 space-y-6">
                        <div className="space-y-2">
                            <h1 className={`text-5xl font-black tracking-tight capitalize ${textStyle}`}>
                                Explore <span className="text-blue-600">{city}</span>
                            </h1>
                            <p className={`text-lg ${subTextStyle}`}>
                                Premium restaurants and hidden gems in the heart of {city}.
                            </p>
                        </div>

                        {/* Search bar */}
                        <div className="flex gap-4 items-center">
                            <div className="relative flex-1 group">
                                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                                    <Search size={22} className="text-blue-600" />
                                </div>
                                <input
                                    type="text"
                                    placeholder={`Search in ${city}, ${country}...`}
                                    value={localSearch}
                                    onChange={(e) => setLocalSearch(e.target.value)}
                                    className={`w-full h-16 pl-14 pr-12 rounded-[24px] border-2 border-transparent outline-none text-lg transition-all ${isDark ? 'bg-white/5 text-white border-white/10 focus:border-blue-500' : 'bg-white shadow-xl focus:border-blue-500'}`}
                                />
                                {localSearch && (
                                    <button
                                        onClick={() => setLocalSearch('')}
                                        className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        <X size={20} />
                                    </button>
                                )}
                            </div>

                            {/* Sort dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => setSortOpen((o) => !o)}
                                    aria-label="Sort locations"
                                    aria-expanded={sortOpen}
                                    className={`h-16 px-6 rounded-[24px] flex items-center gap-2 font-bold text-sm border transition-all ${isDark ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-white border-gray-200 text-gray-700 shadow-sm hover:border-blue-400'}`}
                                >
                                    <ArrowUpDown size={18} className="text-blue-500" />
                                    {currentSort?.label}
                                </button>
                                <AnimatePresence>
                                    {sortOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -8, scale: 0.96 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -8, scale: 0.96 }}
                                            transition={{ duration: 0.15 }}
                                            className={`absolute right-0 top-full mt-2 w-40 rounded-2xl border shadow-xl z-50 overflow-hidden ${isDark ? 'bg-gray-900 border-white/10' : 'bg-white border-gray-100'}`}
                                        >
                                            {SORT_OPTIONS.map((opt) => (
                                                <button
                                                    key={opt.value}
                                                    onClick={() => { setSortBy(opt.value); setSortOpen(false) }}
                                                    className={`w-full text-left px-5 py-3 text-sm font-bold transition-colors ${
                                                        sortBy === opt.value
                                                            ? 'text-blue-600 bg-blue-50 dark:bg-blue-600/10'
                                                            : isDark ? 'text-white/70 hover:bg-white/5' : 'text-gray-700 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <button
                                onClick={() => setIsFilterOpen(true)}
                                aria-label="Open filters"
                                className={`h-16 w-16 rounded-[24px] flex items-center justify-center transition-all active:scale-95 border ${isDark ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-white border-gray-200 text-gray-700 shadow-sm hover:border-blue-400'}`}
                            >
                                <SlidersHorizontal size={22} />
                            </button>
                        </div>
                    </div>

                    {/* Controls row */}
                    <div className="flex justify-between items-center gap-6 mt-10">
                        {/* Tab switcher */}
                        <div className="bg-blue-600 p-1.5 rounded-full flex shadow-lg">
                            {['overview', 'map'].map((tab) => (
                                <button
                                    key={tab}
                                    role="tab"
                                    aria-selected={activeTab === tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`relative px-10 py-3 rounded-full text-base font-bold capitalize transition-all z-10 ${activeTab === tab ? 'text-blue-600' : 'text-white hover:bg-white/10'}`}
                                >
                                    {activeTab === tab && (
                                        <motion.div layoutId="activeTabLocations" className="absolute inset-0 bg-white rounded-full shadow-sm z-[-1]" />
                                    )}
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* Breadcrumb */}
                        <nav className={`hidden md:flex items-center px-5 py-2.5 rounded-full border backdrop-blur-md ${isDark ? 'bg-white/5 border-white/10' : 'bg-black/5 border-gray-100'}`}>
                            <Link to="/dashboard" className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase text-gray-400 hover:text-blue-500 transition-colors">
                                <Home size={12} /><span>Dashboard</span>
                            </Link>
                            <ChevronRight size={14} className="mx-2 text-gray-500/50" />
                            <Link to={`/explore/${country}`} className="text-[10px] font-bold tracking-widest uppercase text-gray-400 hover:text-blue-500 transition-colors capitalize">{country}</Link>
                            <ChevronRight size={14} className="mx-2 text-gray-500/50" />
                            <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase text-blue-600">
                                <MapPin size={12} className="fill-blue-600/20" />
                                <span className="capitalize">{city}</span>
                            </div>
                        </nav>

                        {/* Results count */}
                        <p className={`text-sm font-bold ml-auto ${subTextStyle}`}>
                            {filteredLocations.length} result{filteredLocations.length !== 1 ? 's' : ''}
                        </p>
                    </div>

                    {/* Content */}
                    <div className="mt-8 min-h-[400px]">
                        {activeTab === 'map' ? (
                            <MapTab activeFilter={activeCategory} />
                        ) : isLoading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {Array.from({ length: 8 }).map((_, i) => (
                                    <LocationCardDesktopSkeleton key={i} isDark={isDark} />
                                ))}
                            </div>
                        ) : filteredLocations.length === 0 ? (
                            <EmptyState query={localSearch} isDark={isDark} />
                        ) : (
                            <motion.div
                                initial="hidden"
                                animate="visible"
                                variants={{ visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } } }}
                                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                            >
                                {filteredLocations.map((item) => (
                                    <DesktopCard
                                        key={item.id}
                                        item={item}
                                        isDark={isDark}
                                        textStyle={textStyle}
                                        subTextStyle={subTextStyle}
                                    />
                                ))}
                            </motion.div>
                        )}
                    </div>
                </motion.div>
                </div>
            </div>
        </div>
    )
}

export default LocationsPage
