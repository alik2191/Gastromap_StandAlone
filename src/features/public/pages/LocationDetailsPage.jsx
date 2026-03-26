import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Star, MapPin, Clock, Phone, Share2, Heart,
    MessageSquare, Navigation, ArrowLeft, ShieldCheck,
    Calendar, Users, Lock, Sparkles, Lightbulb,
    UtensilsCrossed, Camera, User, ChevronRight, CheckCircle2,
    FileText, Image as ImageIcon, Plus, Edit3, Send, Trash2,
    Instagram, Facebook, Twitter, ExternalLink, Globe
} from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'
import { useLocationsStore } from '@/features/public/hooks/useLocationsStore'
import { MOCK_LOCATIONS } from '@/mocks/locations'
import { PageTransition } from '@/components/ui/PageTransition'
import { translate } from '@/utils/translation'
import { useFavoritesStore } from '@/features/dashboard/hooks/useFavoritesStore'
import { useUserPrefsStore } from '@/features/auth/hooks/useUserPrefsStore'
import { useOpenStatus } from '@/hooks/useOpenStatus'
import { useReviewsStore } from '@/features/dashboard/hooks/useReviewsStore'
import LazyImage from '@/components/ui/LazyImage'
import { useAuthStore } from '@/features/auth/hooks/useAuthStore'

const LocationDetailsPage = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { theme } = useTheme()
    const isDark = theme === 'dark'

    // Find location: store first (OSM data), then mock fallback, then null
    // Use String() coercion — URL params are always strings, DB ids may be numbers
    const storeLocations = useLocationsStore(s => s.locations)
    const location = storeLocations.find(loc => String(loc.id) === id)
        ?? MOCK_LOCATIONS.find(loc => String(loc.id) === id)
        ?? null

    // Connect to real stores
    const { isFavorite, toggleFavorite } = useFavoritesStore()
    const { prefs, addVisited } = useUserPrefsStore()
    const { user } = useAuthStore()
    const isSaved = isFavorite(location?.id)
    const isVisited = prefs.lastVisited?.includes(location?.id)
    const { label: openLabel, color: openColor, isOpen } = useOpenStatus(location?.openingHours)

    // Reviews
    const { getReviews, getAggregate, addReview } = useReviewsStore()
    const reviews = getReviews(location?.id)
    const aggregate = getAggregate(location?.id)

    const [activeTab, setActiveTab] = useState('Overview')
    const [showScrollHint, setShowScrollHint] = useState(true)

    // User interaction states
    const [userNote, setUserNote] = useState("")
    const [isWritingReview, setIsWritingReview] = useState(false)
    const [newReview, setNewReview] = useState({ rating: 5, text: "" })

    if (!location) return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center">
            <MapPin size={48} className="text-gray-300" />
            <h2 className="text-xl font-black text-gray-700 dark:text-gray-200">Location not found</h2>
            <p className="text-sm text-gray-400">This place may have been removed or the link is incorrect.</p>
            <button
                onClick={() => navigate('/explore')}
                className="mt-2 px-6 py-3 rounded-2xl bg-blue-600 text-white font-bold text-sm"
            >
                Browse places
            </button>
        </div>
    )

    const handleScroll = (e) => {
        const { scrollLeft, scrollWidth, clientWidth } = e.target
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
            setShowScrollHint(false)
        } else {
            setShowScrollHint(true)
        }
    }

    const openInMaps = () => {
        const encodedAddress = encodeURIComponent(location.address)
        window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank')
    }

    const callNumber = () => {
        const phone = location?.phone
        if (!phone) return
        // Validate: must start with + or digits only — prevents open redirects via tel:
        if (!/^\+?[\d\s\-().]{7,20}$/.test(phone)) return
        window.location.href = `tel:${phone}`
    }

    const textStyle = isDark ? "text-white" : "text-gray-900"
    const subTextStyle = isDark ? "text-gray-400" : "text-gray-500"
    const cardBg = isDark ? "bg-white/[0.05] border-white/10" : "bg-white border-gray-100 shadow-sm"

    const fadeInUp = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    }

    // Render Helpers
    const renderOverview = () => (
        <div className="space-y-5">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    { icon: Clock, label: openLabel || "Hours Today", value: location.openingHours || '—', color: isOpen ? "bg-emerald-500/10 text-emerald-500" : isOpen === false ? "bg-red-500/10 text-red-400" : "bg-blue-500/10 text-blue-500" },
                    { icon: Phone, label: "Contact", value: location.phone || '—', color: "bg-green-500/10 text-green-500", hidden: !location.phone },
                    { icon: MessageSquare, label: "Total Reviews", value: aggregate.count ? `${aggregate.count} reviews` : 'No reviews', color: "bg-purple-500/10 text-purple-500" },
                    { icon: Navigation, label: "Directions", value: location.address ? 'Open in Maps' : '—', color: "bg-orange-500/10 text-orange-500" }
                ].filter(info => !info.hidden).map((info, i) => (
                    <motion.div
                        key={i}
                        role="button"
                        tabIndex={0}
                        aria-label={info.label}
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: 0.1 * i }}
                        onClick={() => {
                            if (info.label === "Directions") openInMaps()
                            if (info.label === "Contact") callNumber()
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                if (info.label === "Directions") openInMaps()
                                if (info.label === "Contact") callNumber()
                            }
                        }}
                        className={`p-4 rounded-[24px] border transition-all duration-500 group cursor-pointer ${cardBg} hover:shadow-lg`}
                    >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-105 ${info.color}`}>
                            <info.icon size={20} />
                        </div>
                        <p className={`text-[9px] font-black uppercase tracking-widest opacity-40 mb-1 ${textStyle}`}>{info.label}</p>
                        <p className={`text-xs font-black ${textStyle}`}>{info.value}</p>
                    </motion.div>
                ))}
            </div>

            <section className="space-y-4">
                <div className="flex items-center gap-2.5">
                    <div className="w-1 h-5 bg-blue-600 rounded-full" />
                    <h3 className={`text-lg font-black ${textStyle}`}>Cuisine & Menu</h3>
                </div>

                <div className={`p-6 rounded-[32px] border ${cardBg} space-y-4`}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                            <UtensilsCrossed size={20} />
                        </div>
                        <div>
                            <p className={`text-[10px] font-black uppercase tracking-widest opacity-40 ${textStyle}`}>Primary Cuisine</p>
                            <p className={`text-sm font-black ${textStyle}`}>{translate(location.cuisine) || 'International'}</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
                        {location.special_labels?.map(label => (
                            <span key={label} className={`px-4 py-2 rounded-xl text-[10px] font-black border transition-all ${isDark ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-blue-50 border-blue-100 text-blue-600'}`}>
                                {translate(label)}
                            </span>
                        ))}
                    </div>
                </div>
            </section>

            <section className="space-y-2.5">
                <div className="flex items-center gap-2.5">
                    <div className="w-1 h-5 bg-blue-600 rounded-full" />
                    <h3 className={`text-lg font-black ${textStyle}`}>Experience {location.title}</h3>
                </div>
                <p className={`text-sm leading-relaxed font-medium ${subTextStyle}`}>
                    {location.description}
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                    {location.tags?.map(tag => (
                        <span key={tag} className={`px-4 py-1.5 rounded-full text-[10px] font-black border transition-all cursor-default ${isDark ? 'bg-white/5 border-white/5 text-gray-400' : 'bg-gray-50 border-gray-100 text-gray-500'}`}>
                            #{translate(tag).toUpperCase()}
                        </span>
                    ))}
                </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className={`p-5 rounded-[32px] border relative overflow-hidden ${isDark ? 'bg-orange-500/5 border-orange-500/10' : 'bg-orange-50 border-orange-100'}`}>
                    <Lightbulb className="absolute top-4 right-4 text-orange-500 opacity-20" size={32} />
                    <div className="flex items-center gap-2 mb-3">
                        <Sparkles size={16} className="text-orange-500" />
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-orange-600">Curator's Tip</h4>
                    </div>
                    <p className={`text-sm font-bold italic leading-relaxed ${isDark ? 'text-orange-200/80' : 'text-orange-900/80'}`}>
                        "To experience the full magic, visit right before sunset. The lighting makes every photo look like a cinematic masterpiece."
                    </p>
                </div>
                <div className={`p-5 rounded-[32px] border relative overflow-hidden ${isDark ? 'bg-blue-500/5 border-blue-500/10' : 'bg-blue-50 border-blue-100'}`}>
                    <UtensilsCrossed className="absolute top-4 right-4 text-blue-500 opacity-20" size={32} />
                    <div className="flex items-center gap-2 mb-3">
                        <Star size={16} className="text-blue-500" />
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">Must Try</h4>
                    </div>
                    <p className={`text-sm font-bold leading-relaxed ${isDark ? 'text-blue-200/80' : 'text-blue-900/80'}`}>
                        Our signature truffle-infused specialty is a non-negotiable choice for first-timers.
                    </p>
                </div>
            </div>

            <section className="space-y-3">
                <div className="flex justify-between items-center">
                    <h3 className={`text-lg font-black ${textStyle}`}>Venue Gallery</h3>
                    <button onClick={() => setActiveTab('Photos')} className="text-blue-600 font-black text-xs hover:underline">Full Album</button>
                </div>

                {/* Bento Style Gallery Grid */}
                <div className="grid grid-cols-2 md:grid-cols-12 gap-2 h-[300px] md:h-[600px]">
                    <div className="col-span-2 md:col-span-6 rounded-[24px] md:rounded-[48px] overflow-hidden group cursor-pointer relative shadow-lg">
                        <LazyImage
                            src={location.image}
                            alt={location.title}
                            crossOrigin="anonymous"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

                    <div className="col-span-1 md:col-span-3 rounded-[24px] md:rounded-[40px] overflow-hidden group cursor-pointer relative shadow-lg">
                        <LazyImage src="https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1000&auto=format&fit=crop" crossOrigin="anonymous" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="detail 1" />
                    </div>

                    <div className="col-span-1 md:col-span-3 rounded-[24px] md:rounded-[40px] overflow-hidden group cursor-pointer relative shadow-lg">
                        <LazyImage src="https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=1000&auto=format&fit=crop" crossOrigin="anonymous" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="detail 2" />
                    </div>

                    <div className="col-span-1 md:col-span-4 rounded-[24px] md:rounded-[40px] overflow-hidden group cursor-pointer relative shadow-lg">
                        <LazyImage src="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=1000&auto=format&fit=crop" crossOrigin="anonymous" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="detail 3" />
                    </div>

                    <div className="col-span-1 md:col-span-8 rounded-[24px] md:rounded-[40px] overflow-hidden relative group cursor-pointer shadow-lg">
                        <LazyImage src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1000&auto=format&fit=crop" crossOrigin="anonymous" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="detail 4" />
                        <div className="absolute inset-0 bg-blue-600/80 backdrop-blur-md flex flex-col items-center justify-center text-white p-4 opacity-0 group-hover:opacity-100 transition-all duration-500">
                            <Camera size={24} className="mb-1" />
                            <span className="text-xl font-black">+24</span>
                            <span className="text-[9px] font-black uppercase tracking-widest">Explore</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. Connect & External Links */}
            <section className="pt-8 space-y-6">
                <div className="flex flex-col md:flex-row gap-6 items-center justify-between p-10 rounded-[48px] border overflow-hidden relative group transition-all duration-700 hover:border-blue-500/30 ${isDark ? 'bg-white/[0.02] border-white/5 shadow-2xl shadow-blue-500/5' : 'bg-gray-50 border-gray-100 shadow-xl shadow-gray-200/50'}">
                    <div className="absolute top-0 left-0 w-40 h-40 bg-blue-600/5 rounded-full -ml-20 -mt-20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="space-y-4 text-center md:text-left relative z-10">
                        <h3 className={`text-2xl font-black ${textStyle}`}>Find them online</h3>
                        <div className="flex gap-3 justify-center md:justify-start">
                            {[
                                { icon: Instagram, color: "hover:bg-pink-500 hover:text-white", label: "Instagram" },
                                { icon: Facebook, color: "hover:bg-blue-600 hover:text-white", label: "Facebook" },
                                { icon: Twitter, color: "hover:bg-black hover:text-white", label: "Twitter / X" }
                            ].map((social, i) => (
                                <button key={i} aria-label={social.label} className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 border ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-500'} ${social.color}`}>
                                    <social.icon size={22} />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto relative z-10">
                        <button className={`flex-1 sm:flex-none px-10 py-5 rounded-2xl flex items-center justify-center gap-3 font-black text-sm border transition-all ${isDark ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-white border-gray-200 text-gray-900 hover:bg-gray-50'}`}>
                            <Globe size={18} className="text-blue-500" />
                            Visit Website
                        </button>
                        <button className="flex-1 sm:flex-none px-10 py-5 bg-blue-600 text-white rounded-2xl flex items-center justify-center gap-3 font-black text-sm shadow-xl shadow-blue-600/20 hover:scale-[1.02] active:scale-95 transition-all">
                            <ExternalLink size={18} />
                            External Booking
                        </button>
                    </div>
                </div>
            </section>
        </div>
    )

    const renderMenu = () => {
        // Mocking an admin choice: "text" vs "file"
        const menuType = location.id === '1' ? 'text' : 'file';

        if (menuType === 'file') {
            return (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    <div className={`p-10 rounded-[40px] border-2 border-dashed flex flex-col items-center justify-center gap-6 text-center ${isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50'}`}>
                        <div className="w-20 h-20 rounded-3xl bg-blue-600/10 flex items-center justify-center text-blue-600">
                            <FileText size={40} />
                        </div>
                        <div className="space-y-2">
                            <h4 className={`text-xl font-black ${textStyle}`}>Digital Menu Available</h4>
                            <p className={`text-sm max-w-xs mx-auto ${subTextStyle}`}>This location has provided their menu in a physical or digital document format.</p>
                        </div>
                        <button className="px-8 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-600/20 hover:scale-[1.02] active:scale-95 transition-all">
                            View Full Menu (PDF)
                        </button>
                    </div>
                    {/* Visual hint of the file */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {[1, 2].map(i => (
                            <div key={i} className="aspect-[3/4] rounded-3xl overflow-hidden border border-gray-100 dark:border-white/10 relative group bg-black">
                                <LazyImage src="https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?q=80&w=1970&auto=format&fit=crop" crossOrigin="anonymous" className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700" alt="menu page" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <ImageIcon className="text-white opacity-40" />
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )
        }

        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                {[
                    {
                        title: "Signature Mains", items: [
                            { name: "Truffle Pasta", desc: "Fresh house-made pasta with black truffle cream", price: "$28" },
                            { name: "Roasted Duck", desc: "Slow-cooked with cherry glaze", price: "$34" }
                        ]
                    },
                    {
                        title: "Small Plates", items: [
                            { name: "Burrata", desc: "Creamy cheese with basaltic pearls", price: "$16" }
                        ]
                    }
                ].map((section, idx) => (
                    <div key={idx} className="space-y-4">
                        <h4 className={`text-lg font-black border-b pb-3 ${isDark ? 'border-white/10 text-white' : 'border-gray-100 text-gray-900'}`}>{section.title}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {section.items.map((item, i) => (
                                <div key={i} className={`p-6 rounded-3xl border ${cardBg} flex justify-between items-start group hover:border-blue-500/50 transition-colors`}>
                                    <div className="space-y-1">
                                        <p className={`font-black group-hover:text-blue-500 transition-colors ${textStyle}`}>{item.name}</p>
                                        <p className={`text-xs ${subTextStyle}`}>{item.desc}</p>
                                    </div>
                                    <span className="text-blue-500 font-black">{item.price}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </motion.div>
        )
    }

    const handleSubmitReview = () => {
        if (!newReview.text.trim()) return
        addReview(location.id, {
            authorName: user?.name || 'Anonymous',
            rating: newReview.rating,
            text: newReview.text,
        })
        setNewReview({ rating: 5, text: '' })
        setIsWritingReview(false)
    }

    const renderReviews = () => {
        const maxDist = Math.max(...Object.values(aggregate.distribution), 1)
        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                {/* Aggregate score */}
                <div className="flex flex-col md:flex-row gap-8 items-center bg-blue-600/5 p-10 rounded-[40px] border border-blue-500/10">
                    <div className="text-center md:text-left space-y-1 flex-shrink-0">
                        <p className="text-6xl font-black text-blue-500">{aggregate.average || '—'}</p>
                        <div className="flex gap-1 justify-center md:justify-start">
                            {[1, 2, 3, 4, 5].map(s => (
                                <Star key={s} size={16} className={s <= Math.round(aggregate.average) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 fill-gray-300'} />
                            ))}
                        </div>
                        <p className={`text-xs font-black uppercase tracking-widest ${subTextStyle}`}>
                            Based on {aggregate.count} {aggregate.count === 1 ? 'review' : 'reviews'}
                        </p>
                    </div>
                    {/* Distribution bars */}
                    <div className="flex-1 space-y-2 w-full">
                        {[5, 4, 3, 2, 1].map(lvl => {
                            const count = aggregate.distribution[lvl] ?? 0
                            const pct = aggregate.count > 0 ? Math.round((count / aggregate.count) * 100) : 0
                            return (
                                <div key={lvl} className="flex items-center gap-3 w-full">
                                    <span className={`text-[11px] font-black w-3 ${textStyle}`}>{lvl}</span>
                                    <div className="h-1.5 flex-1 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-blue-600 rounded-full"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${pct}%` }}
                                            transition={{ duration: 0.6, ease: 'easeOut', delay: (5 - lvl) * 0.06 }}
                                        />
                                    </div>
                                    <span className={`text-[10px] font-bold w-6 text-right ${subTextStyle}`}>{count}</span>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Write review */}
                <div className={`p-8 rounded-[40px] border border-dashed transition-all ${isWritingReview ? 'border-blue-500 bg-blue-500/5' : 'border-gray-200 dark:border-white/10'}`}>
                    {!isWritingReview ? (
                        <button
                            onClick={() => setIsWritingReview(true)}
                            className="w-full flex items-center justify-center gap-3 py-4 text-blue-500 font-black hover:scale-[1.01] transition-transform"
                        >
                            <Plus size={20} /> Write your review
                        </button>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h4 className={`font-black ${textStyle}`}>Rate your experience</h4>
                                <button onClick={() => setIsWritingReview(false)} className="text-gray-400"><X size={20} /></button>
                            </div>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map(s => (
                                    <button
                                        key={s}
                                        onClick={() => setNewReview({ ...newReview, rating: s })}
                                        className={`transition-all active:scale-90 ${s <= newReview.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                    >
                                        <Star size={28} fill={s <= newReview.rating ? 'currentColor' : 'none'} />
                                    </button>
                                ))}
                            </div>
                            <textarea
                                value={newReview.text}
                                onChange={(e) => setNewReview({ ...newReview, text: e.target.value })}
                                placeholder="Share the details of your visit..."
                                className={`w-full p-6 rounded-3xl border bg-transparent outline-none focus:border-blue-500 transition-colors h-32 text-sm font-medium resize-none ${isDark ? 'border-white/10 text-white placeholder:text-white/30' : 'border-gray-100 text-gray-900'}`}
                            />
                            <button
                                onClick={handleSubmitReview}
                                disabled={!newReview.text.trim()}
                                className={`w-full py-4 font-black rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${newReview.text.trim() ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20' : 'bg-gray-200 dark:bg-white/10 text-gray-400 cursor-not-allowed'}`}
                            >
                                <Send size={18} /> Submit Review
                            </button>
                        </div>
                    )}
                </div>

                {/* Review list */}
                <div className="space-y-4">
                    <AnimatePresence initial={false}>
                        {reviews.length === 0 ? (
                            <div className="text-center py-10">
                                <p className={`text-sm font-medium ${subTextStyle}`}>No reviews yet. Be the first!</p>
                            </div>
                        ) : reviews.map((rev, i) => (
                            <motion.div
                                key={rev.id}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ delay: i * 0.05 }}
                                className={`p-8 rounded-[40px] border ${cardBg}`}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-600">
                                            <User size={22} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className={`font-black ${textStyle}`}>{rev.authorName}</p>
                                                {rev.verified && (
                                                    <span className="text-[9px] font-black uppercase tracking-wider text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                                        Verified
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">
                                                {new Date(rev.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-0.5">
                                        {[1, 2, 3, 4, 5].map(s => (
                                            <Star key={s} size={13} className={s <= rev.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'} />
                                        ))}
                                    </div>
                                </div>
                                <p className={`leading-relaxed text-sm font-medium ${subTextStyle}`}>{rev.text}</p>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </motion.div>
        )
    }

    const renderPhotos = () => (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
                <div key={i} className="aspect-square rounded-[32px] overflow-hidden group cursor-pointer relative bg-gray-100">
                    <LazyImage src={`https://images.unsplash.com/photo-${1517248135467 + i}-4c7edcad34c4?q=80&w=400&fit=crop`} crossOrigin="anonymous" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="gallery" />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
            ))}
        </motion.div>
    )

    const renderNotes = () => (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className={`p-10 rounded-[48px] border overflow-hidden relative ${isDark ? 'bg-blue-600/[0.03] border-blue-500/10' : 'bg-blue-50/50 border-blue-100'}`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full -mr-16 -mt-16 blur-3xl" />

                <div className="relative z-10 space-y-6">
                    <div className="flex items-center gap-4">
                        <img src="/pwa-icon-192.png" alt="GastroMap Logo" className="w-14 h-14 object-cover rounded-full shadow-lg shadow-blue-500/20" />
                        <div>
                            <h3 className={`text-2xl font-black ${textStyle}`}>Private Notes</h3>
                            <p className={`text-xs font-bold uppercase tracking-widest text-blue-500`}>Only you can see this</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <textarea
                            value={userNote}
                            onChange={(e) => setUserNote(e.target.value)}
                            placeholder="Remember their best table, your favorite wine, or a dish to avoid next time..."
                            className={`w-full p-8 rounded-[32px] border bg-transparent outline-none focus:border-blue-500 transition-all min-h-[200px] text-lg font-medium leading-relaxed ${isDark ? 'border-white/10 text-white' : 'border-gray-200 text-gray-900 shadow-inner'}`}
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={() => setUserNote("")}
                                className={`flex-1 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 border transition-all ${isDark ? 'border-white/10 text-white hover:bg-white/5' : 'border-gray-200 text-gray-500 hover:bg-gray-100'}`}
                            >
                                <Trash2 size={18} /> Clear
                            </button>
                            <button className="flex-[2] py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-600/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2">
                                <CheckCircle2 size={18} /> Save Note
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`p-6 rounded-3xl flex items-center gap-4 ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                    <ShieldCheck className="text-green-500" size={24} />
                    <div>
                        <p className={`text-sm font-black ${textStyle}`}>End-to-End Private</p>
                        <p className={`text-[10px] ${subTextStyle}`}>Notes are stored locally or in your private vault.</p>
                    </div>
                </div>
                <div className={`p-6 rounded-3xl flex items-center gap-4 ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                    <Sparkles className="text-blue-500" size={24} />
                    <div>
                        <p className={`text-sm font-black ${textStyle}`}>Auto-Sync</p>
                        <p className={`text-[10px] ${subTextStyle}`}>Accessible across all your devices.</p>
                    </div>
                </div>
            </div>
        </motion.div>
    )

    return (
        <PageTransition className={`min-h-screen ${isDark ? 'bg-[#0a0a0a]' : 'bg-white'} relative pb-32 pt-20 md:pt-24`}>

            <div className="relative">
                {/* Action Bar Container - Now relative to content start */}
                <div className="absolute top-4 left-[4vw] right-[4vw] flex justify-between items-center z-40">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-2xl border border-white/20 text-white hover:bg-white/20 active:scale-95 transition-all"
                    >
                        <ArrowLeft size={22} />
                    </button>
                    <div className="flex gap-2.5">
                        <button
                            onClick={() => addVisited(location.id)}
                            className={`p-3.5 rounded-2xl backdrop-blur-2xl border transition-all active:scale-95 ${isVisited ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-600/30' : 'bg-white/10 border-white/20 text-white hover:bg-white/20'}`}
                            aria-label="Mark as visited"
                        >
                            <CheckCircle2 size={22} className={isVisited ? "fill-white" : ""} />
                        </button>
                        <button
                            onClick={() => toggleFavorite(location.id)}
                            className={`p-3.5 rounded-2xl backdrop-blur-2xl border transition-all active:scale-95 ${isSaved ? 'bg-red-500 border-red-500 text-white shadow-lg shadow-red-500/30' : 'bg-white/10 border-white/20 text-white hover:bg-white/20'}`}
                            aria-label="Save location"
                        >
                            <Heart size={20} fill={isSaved ? "currentColor" : "none"} />
                        </button>
                    </div>
                </div>

                {/* Hero Image Section */}
                {/* Hero Image Section */}
                <div className="relative h-[35vh] md:h-[50vh] w-full overflow-hidden">
                    <LazyImage
                        src={location.image}
                        crossOrigin="anonymous"
                        fetchpriority="high"
                        className="w-full h-full object-cover"
                        alt={location.title}
                        rootMargin="0px"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/80 to-transparent z-10" />
                    <div className="absolute inset-0 bg-black/20 z-0" />

                    {/* Hero Info */}
                    <div className="absolute bottom-6 left-[4vw] right-[4vw] z-20 space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="bg-blue-600 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full text-white shadow-lg">
                                {location.category}
                            </span>
                            <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 text-white text-[10px] font-black">
                                <Star size={12} className="text-yellow-400 fill-yellow-400" />
                                {location.rating}
                            </div>
                        </div>
                        <h1 className="text-2xl md:text-5xl font-black text-white leading-tight tracking-tight">
                            {location.title}
                        </h1>
                        <button
                            onClick={openInMaps}
                            className="flex items-center gap-1.5 text-white/80 font-bold hover:text-white transition-all text-left group"
                        >
                            <MapPin size={14} className="text-blue-500 group-hover:scale-110 transition-transform" />
                            <span className="text-xs md:text-sm border-b border-transparent group-hover:border-white/20 pb-0.5">{location.address}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-[4vw] pt-4 relative z-30">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Tab Switcher */}
                        <div className="w-full relative group">
                            <div
                                onScroll={handleScroll}
                                className={`p-1.5 rounded-2xl flex gap-1 items-center overflow-x-auto scrollbar-hide w-full md:w-fit ${isDark ? 'bg-white/[0.03]' : 'bg-gray-100/50'}`}
                            >
                                {['Overview', 'Menu', 'Reviews', 'Photos', 'Notes'].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`flex-shrink-0 px-8 py-3 rounded-xl text-sm font-black transition-all ${activeTab === tab ? 'bg-blue-600 text-white shadow-xl px-10' : 'text-gray-500 hover:text-blue-500'}`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                            <AnimatePresence>
                                {showScrollHint && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className={`pointer-events-none absolute right-0 top-0 bottom-0 w-20 z-10 md:hidden rounded-r-2xl bg-gradient-to-l ${isDark ? 'from-blue-600/20 to-transparent' : 'from-blue-600/10 to-transparent'}`}
                                    >
                                        <div className="absolute right-2 top-1/2 -translate-y-1/2 animate-pulse">
                                            <ChevronRight size={16} className="text-blue-500" />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {activeTab === 'Overview' && renderOverview()}
                        {activeTab === 'Menu' && renderMenu()}
                        {activeTab === 'Reviews' && renderReviews()}
                        {activeTab === 'Photos' && renderPhotos()}
                        {activeTab === 'Notes' && renderNotes()}
                    </div>

                    {/* Reservation Panel (Placeholder) */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-32">
                            <div className={`p-10 rounded-[48px] border space-y-8 relative overflow-hidden blur-[2px] opacity-60 ${isDark ? 'bg-[#121212] border-white/5' : 'bg-white border-gray-100 shadow-sm'}`}>
                                <h3 className={`text-2xl font-black ${textStyle}`}>Reservation</h3>
                                <div className="space-y-3">
                                    <div className="h-14 w-full bg-gray-400/10 rounded-2xl" />
                                    <div className="h-14 w-full bg-gray-400/10 rounded-2xl" />
                                </div>
                                <button disabled className="w-full h-18 bg-gray-400/20 text-gray-400 font-black rounded-2xl cursor-not-allowed">Book Now</button>
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center z-40 bg-black/10 rounded-[48px]">
                                <div className="bg-[#1a1c24]/95 backdrop-blur-xl border border-blue-500/30 px-8 py-5 rounded-[32px] shadow-2xl text-center">
                                    <Lock size={24} className="text-blue-500 mx-auto mb-2" />
                                    <p className="text-white font-black">In Development</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Fixed Action Bar Placeholder */}
            <div className={`fixed bottom-0 left-0 right-0 p-6 md:hidden z-[100] backdrop-blur-2xl border-t ${isDark ? 'bg-black/80 border-white/5' : 'bg-white/90 border-gray-100'}`}>
                <div className="flex gap-4 items-center opacity-40">
                    <div className="flex-1">
                        <p className="text-[10px] font-black uppercase text-gray-500">Approximate</p>
                        <p className={`text-2xl font-black ${textStyle}`}>$35</p>
                    </div>
                    <button disabled className="flex-[2] h-16 bg-gray-400/20 text-gray-500 font-black rounded-2xl">Coming Soon</button>
                </div>
            </div>
        </PageTransition>
    )
}

export default LocationDetailsPage
