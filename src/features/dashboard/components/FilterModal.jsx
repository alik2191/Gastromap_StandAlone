import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Star, RotateCcw } from 'lucide-react'
import { useLocationsStore } from '@/features/public/hooks/useLocationsStore'

const FilterModal = ({ isOpen, onClose, theme }) => {
    const isDark = theme === 'dark'

    // ── Local filter state ──────────────────────────────────────────────────
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [selectedRating, setSelectedRating] = useState(null)       // null | 4 | 4.5
    const [selectedPriceLevels, setSelectedPriceLevels] = useState([]) // e.g. ['$', '$$']
    const [selectedFeatures, setSelectedFeatures] = useState([])
    const [radius, setRadius] = useState(10)

    const activeCount = [
        selectedCategory !== 'all',
        selectedRating != null,
        selectedPriceLevels.length > 0,
        selectedFeatures.length > 0,
    ].filter(Boolean).length

    const togglePriceLevel = (level) => {
        setSelectedPriceLevels(prev =>
            prev.includes(level) ? prev.filter(l => l !== level) : [...prev, level]
        )
    }

    const toggleFeature = (feature) => {
        setSelectedFeatures(prev =>
            prev.includes(feature) ? prev.filter(f => f !== feature) : [...prev, feature]
        )
    }

    const handleApply = () => {
        const { applyFilters } = useLocationsStore.getState()
        applyFilters({
            activeCategory: selectedCategory === 'all' ? 'All' : selectedCategory,
            minRating: selectedRating,
            activePriceLevels: selectedPriceLevels,
            activeVibes: selectedFeatures,
        })
        onClose()
    }

    const handleReset = () => {
        setSelectedCategory('all')
        setSelectedRating(null)
        setSelectedPriceLevels([])
        setSelectedFeatures([])
        setRadius(10)
        useLocationsStore.getState().resetFilters()
        onClose()
    }

    const modalVariants = {
        hidden:  { y: '100%', opacity: 1, scale: 1 },
        visible: { y: 0, opacity: 1, scale: 1, transition: { type: 'spring', damping: 25, stiffness: 200 } },
        desktopHidden:  { opacity: 0, scale: 0.95, y: 0 },
        desktopVisible: { opacity: 1, scale: 1,    y: 0, transition: { duration: 0.2 } },
    }

    // ── Shared button styles ───────────────────────────────────────────────
    const chipBase = `px-4 py-2 rounded-xl font-bold text-[11px] border transition-all cursor-pointer`
    const chipActive = `bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20`
    const chipInactive = isDark
        ? `bg-white/5 border-white/5 text-white/70 hover:bg-white/10`
        : `bg-gray-50/50 border-gray-100 text-gray-500 hover:border-blue-500/30 hover:text-blue-600`

    const blockBase = `p-2 rounded-[16px] border transition-all duration-300 group cursor-pointer flex items-center gap-3`
    const blockActive = `bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20`
    const blockInactive = isDark
        ? `bg-white/[0.05] border-white/10 text-white/80 hover:bg-white/[0.1] hover:border-white/20`
        : `bg-white border-gray-100 text-gray-900 shadow-sm hover:shadow-lg hover:border-blue-500/30`

    if (typeof document === 'undefined') return null

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center pointer-events-auto">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal Container */}
                    <motion.div
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        className={`relative w-full md:max-w-2xl overflow-hidden shadow-2xl border transition-colors duration-300
                            ${isDark ? 'bg-[#1a1a1a] border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'}
                            rounded-t-[32px] md:rounded-[32px]`}
                        style={{ maxHeight: '90vh' }}
                    >
                        {/* Header */}
                        <div className={`p-6 flex justify-between items-center border-b ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
                            <div>
                                <h2 className="text-[20px] font-bold">Filters</h2>
                                {activeCount > 0 && (
                                    <p className="text-[11px] text-blue-500 font-bold mt-0.5">{activeCount} active</p>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                {activeCount > 0 && (
                                    <button
                                        onClick={handleReset}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all ${isDark ? 'bg-white/5 text-white/60 hover:text-white' : 'bg-gray-100 text-gray-400 hover:text-gray-900'}`}
                                    >
                                        <RotateCcw size={12} />
                                        Reset
                                    </button>
                                )}
                                <button
                                    onClick={onClose}
                                    className={`p-2 rounded-full transition-colors ${isDark ? 'bg-white/5 text-white/60 hover:text-white' : 'bg-gray-100 text-gray-400 hover:text-gray-900'}`}
                                >
                                    <X size={24} />
                                </button>
                            </div>
                        </div>

                        {/* Scrollable Content */}
                        <div data-lenis-prevent className="p-6 md:p-8 overflow-y-auto space-y-8 pb-40 custom-scrollbar" style={{ maxHeight: 'calc(90vh - 80px)' }}>

                            {/* Establishment Type */}
                            <div className="space-y-4 text-left md:col-span-2">
                                <label className={`text-[11px] font-semibold uppercase tracking-widest ${isDark ? 'text-white/40' : 'text-slate-900'}`}>Establishment Type</label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                                    {[
                                        { id: 'all',        label: 'All',        icon: '🌎' },
                                        { id: 'Cafe',       label: 'Cafe',       icon: '☕' },
                                        { id: 'Restaurant', label: 'Restaurant', icon: '🍽️' },
                                        { id: 'Street Food',label: 'Street',     icon: '🍕' },
                                        { id: 'Bar',        label: 'Bar',        icon: '🍸' },
                                        { id: 'Market',     label: 'Market',     icon: '🛒' },
                                        { id: 'Bakery',     label: 'Bakery',     icon: '🥐' },
                                        { id: 'Winery',     label: 'Winery',     icon: '🍷' },
                                        { id: 'Coffee',     label: 'Coffee',     icon: '☕' },
                                        { id: 'Pastry',     label: 'Pastry',     icon: '🍰' },
                                    ].map(type => {
                                        const isActive = selectedCategory === type.id
                                        return (
                                            <button
                                                key={type.id}
                                                onClick={() => setSelectedCategory(isActive ? 'all' : type.id)}
                                                className={`${blockBase} ${isActive ? blockActive : blockInactive}`}
                                            >
                                                <span className="text-xl group-hover:scale-110 transition-transform duration-300">{type.icon}</span>
                                                <span className="text-[11px] font-bold">{type.label}</span>
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Rating + Price Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Rating */}
                                <div className="space-y-4 text-left">
                                    <label className={`text-[11px] font-semibold uppercase tracking-widest ${isDark ? 'text-white/40' : 'text-slate-900'}`}>Rating</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {[
                                            { val: null, label: 'Any' },
                                            { val: 4,    label: '4+' },
                                            { val: 4.5,  label: '4.5+' },
                                        ].map(opt => {
                                            const isActive = selectedRating === opt.val
                                            return (
                                                <button
                                                    key={String(opt.val)}
                                                    onClick={() => setSelectedRating(isActive ? null : opt.val)}
                                                    className={`h-14 rounded-2xl border flex items-center justify-center gap-1.5 font-semibold text-sm transition-all ${isActive
                                                        ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20'
                                                        : isDark ? 'bg-white/5 border-white/5 text-white hover:bg-white/10' : 'bg-white border-gray-100 text-gray-600 shadow-sm hover:border-blue-400'
                                                    }`}
                                                >
                                                    {opt.val != null && <Star size={14} className={isActive ? 'text-white fill-white' : 'text-yellow-500 fill-yellow-500'} />}
                                                    {opt.label}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>

                                {/* Price Level */}
                                <div className="space-y-4 text-left">
                                    <label className={`text-[11px] font-semibold uppercase tracking-widest ${isDark ? 'text-white/40' : 'text-slate-900'}`}>Price Range</label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {['$', '$$', '$$$', '$$$$'].map(level => {
                                            const isActive = selectedPriceLevels.includes(level)
                                            return (
                                                <button
                                                    key={level}
                                                    onClick={() => togglePriceLevel(level)}
                                                    className={`h-14 rounded-2xl border flex items-center justify-center font-bold text-sm transition-all ${isActive
                                                        ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20'
                                                        : isDark ? 'bg-white/5 border-white/5 text-white hover:bg-white/10' : 'bg-white border-gray-100 text-gray-600 shadow-sm hover:border-blue-400'
                                                    }`}
                                                >
                                                    {level}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Best Time to Visit */}
                            <div className="space-y-4 text-left">
                                <label className={`text-[11px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-white/40' : 'text-slate-900'}`}>Best Time to Visit</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { id: 'morning',    label: 'Morning', icon: '🌅' },
                                        { id: 'day',        label: 'Day',     icon: '☀️' },
                                        { id: 'evening',    label: 'Evening', icon: '🌙' },
                                        { id: 'late_night', label: 'Night',   icon: '✨' },
                                    ].map(time => {
                                        const isActive = selectedFeatures.includes(time.id)
                                        return (
                                            <button
                                                key={time.id}
                                                onClick={() => toggleFeature(time.id)}
                                                className={`${blockBase} ${isActive ? blockActive : blockInactive}`}
                                            >
                                                <span className="text-xl">{time.icon}</span>
                                                <span className="text-[11px] font-bold">{time.label}</span>
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Special Features */}
                            <div className="space-y-6 text-left">
                                <label className={`text-[11px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-white/40' : 'text-slate-900'}`}>Special Features & Labels</label>
                                <div className="space-y-6">
                                    {[
                                        {
                                            group: 'Cuisine & Menu',
                                            items: ['Signature Cuisine', 'Vegan Menu', 'Delicious Desserts', 'All Day Breakfast', 'Fusion', 'Italian', 'French', 'Japanese', 'Chinese', 'Greek', 'Spanish', 'Mexican', 'Thai', 'Georgian', 'Polish', 'Israeli', 'American', 'Mediterranean', 'Indian', 'Vietnamese', 'Turkish'],
                                        },
                                        {
                                            group: 'Bar & Drinks',
                                            items: ['Signature Cocktails', 'Wine List', 'Guest Shifts', 'Wine Tasting', 'DJ Sets', 'Craft Beer', 'Mixology', 'Specialty Coffee', 'Wide Gin Selection'],
                                        },
                                        {
                                            group: 'Atmosphere',
                                            items: ['Scenic View', 'Live Music', 'Coworking', 'Board Games', 'Lively', 'Romantic', 'Speakeasy', 'Happy Hours', 'Themed Interior', 'Quiet Atmosphere', 'Cozy'],
                                        },
                                        {
                                            group: 'Amenities & Service',
                                            items: ['Balconies', 'Kids Area', 'High Chairs', 'Delivery', 'Inclusive', 'Local Favorite', 'Parking', 'Pet friendly', 'Takeaway', 'Courtyard Terrace', 'Rooftop Terrace', 'WiFi'],
                                        },
                                        {
                                            group: 'Awards & Special',
                                            items: ['Michelin Guide', 'Michelin Star', 'Hookah', 'Late Dinner'],
                                        },
                                    ].map(cat => (
                                        <div key={cat.group} className="space-y-3">
                                            <h4 className={`text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-white/50' : 'text-slate-800'}`}>{cat.group}</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {cat.items.sort().map(chip => {
                                                    const isActive = selectedFeatures.includes(chip)
                                                    return (
                                                        <button
                                                            key={chip}
                                                            onClick={() => toggleFeature(chip)}
                                                            className={`${chipBase} ${isActive ? chipActive : chipInactive}`}
                                                        >
                                                            {chip}
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Search Radius */}
                            <div className="space-y-4 text-left pt-6 border-t border-white/5">
                                <div className="flex justify-between items-center">
                                    <label className={`text-[11px] font-semibold uppercase tracking-widest ${isDark ? 'text-white/40' : 'text-slate-900'}`}>Search Radius</label>
                                    <span className="text-blue-500 font-bold text-sm">{radius} km</span>
                                </div>
                                <input
                                    type="range"
                                    min={1}
                                    max={50}
                                    value={radius}
                                    onChange={e => setRadius(Number(e.target.value))}
                                    className="w-full h-2 bg-blue-600/10 rounded-full appearance-none cursor-pointer accent-blue-600"
                                />
                                <div className={`flex justify-between text-[10px] font-bold uppercase ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
                                    <span>Nearby</span>
                                    <span>City-wide</span>
                                    <span>Regional</span>
                                </div>
                            </div>

                        </div>

                        {/* Footer */}
                        <div className={`absolute bottom-0 left-0 right-0 p-6 pb-8 md:p-8 backdrop-blur-md border-t ${isDark ? 'bg-[#1a1a1a]/80 border-white/5' : 'bg-white/80 border-gray-100'}`}>
                            <button
                                onClick={handleApply}
                                className="w-full h-16 bg-blue-600 text-white font-bold rounded-[20px] shadow-xl shadow-blue-500/30 active:scale-[0.98] hover:bg-blue-700 transition-all text-base"
                            >
                                {activeCount > 0 ? `Apply ${activeCount} filter${activeCount !== 1 ? 's' : ''}` : 'Apply filters'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    )
}

export default FilterModal
