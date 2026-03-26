import React from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, Map, List, Globe, ArrowUpRight, Search, Check, ChevronDown, Coffee, Wine, Utensils, Award, Zap, Shield, Heart, User, Instagram, Twitter, Linkedin, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion'


// --- Animations (Apple-like Springs) ---
const SPRING_TRANSITION = { type: "spring", stiffness: 100, damping: 20 }
const STAGGER_TIMING = 0.08

const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: SPRING_TRANSITION }
}

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: STAGGER_TIMING,
            delayChildren: 0.1
        }
    }
}

// Reuseable subtle Apple border/shadow classes
const surfaceApple = "bg-white dark:bg-[#1C1C1E] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(255,255,255,0.02)] border border-black/[0.03] dark:border-white/[0.04]"

// --- Component: Hero (Bento) ---
const BentoHero = () => {
    // Stats Review Logic
    const [reviewIndex, setReviewIndex] = React.useState(0)
    // Smart List Toggle Logic
    const [listMode, setListMode] = React.useState('wishlist')

    const reviews = [
        { name: "Anna K.", loc: "Warsaw", text: "Incredible atmosphere ☕", img: "https://i.pravatar.cc/100?img=5" },
        { name: "James L.", loc: "London", text: "Best hidden bar I've visited. 🥃", img: "https://i.pravatar.cc/100?img=3" },
        { name: "Sarah M.", loc: "NYC", text: "Outstanding vegan options. 🥗", img: "https://i.pravatar.cc/100?img=9" },
        { name: "David R.", loc: "Tokyo", text: "Life-changing experience. 🍣", img: "https://i.pravatar.cc/100?img=11" }
    ]

    React.useEffect(() => {
        const statTimer = setInterval(() => {
            setReviewIndex((prev) => (prev + 1) % reviews.length)
        }, 4000)

        const listTimer = setInterval(() => {
            setListMode(prev => prev === 'wishlist' ? 'visited' : 'wishlist')
        }, 3000)

        return () => {
            clearInterval(statTimer)
            clearInterval(listTimer)
        }
    }, [reviews.length])

    return (
        <section className={`pt-24 md:pt-32 pb-12 md:pb-20 transition-colors duration-500 relative z-10`}>
            <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 mb-6">
                    {/* Main Banner */}
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={fadeInUp}
                        className={`lg:col-span-7 rounded-[32px] md:rounded-[40px] p-8 sm:p-12 md:p-16 flex flex-col justify-center relative overflow-hidden ${surfaceApple}`}
                    >
                        <div className="bg-black/5 dark:bg-white/10 w-fit px-3 py-1.5 rounded-full text-xs font-semibold text-black/60 dark:text-white/70 mb-8 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                            100% Free Community Guide
                        </div>
                        <h1 className="text-4xl sm:text-5xl md:text-7xl font-semibold tracking-[-0.03em] leading-[1.05] text-black/90 dark:text-white mb-6 md:mb-8">
                            Discover places. <br className="hidden sm:block" /> Share with <span className="text-blue-600 dark:text-blue-500">friends.</span>
                        </h1>
                        <p className="text-base md:text-xl text-black/50 dark:text-white/50 mb-8 md:mb-10 max-w-md leading-relaxed font-medium tracking-tight">
                            Join the community-driven map to find the best local spots or add your own discoveries.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                            <Link to="/auth/signup" className="w-full sm:w-auto">
                                <Button size="lg" className="w-full h-12 md:h-14 rounded-full px-8 text-base bg-blue-600 hover:bg-blue-700 text-white font-medium transition-transform active:scale-95 duration-200 shadow-lg shadow-blue-500/20">
                                    Get Started
                                </Button>
                            </Link>
                            <Link to="/auth/signup?action=add-place" className="w-full sm:w-auto">
                                <Button variant="outline" size="lg" className="w-full h-12 md:h-14 rounded-full px-8 text-base bg-transparent border-blue-600/20 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 font-medium transition-transform active:scale-95 duration-200">
                                    Add a Place
                                </Button>
                            </Link>
                        </div>
                    </motion.div>

                    {/* Sidebar Area (Photo + Review) */}
                    <div className="lg:col-span-5 flex flex-col gap-4 md:gap-6">
                        {/* Immersive Photo Card */}
                        <div className="flex-1 bg-[#1C1C1E] rounded-[32px] md:rounded-[40px] relative overflow-hidden group min-h-[200px] md:min-h-[300px] animate-in fade-in zoom-in-95 duration-1000 fill-mode-both">
                            <img
                                src="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=1600&auto=format&fit=crop"
                                alt="Hero Background"
                                fetchpriority="high"
                                crossOrigin="anonymous"
                                loading="eager"
                                decoding="async"
                                className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform [transition-duration:2000ms] ease-out"
                            />
                            <div className="absolute bottom-6 left-6 right-6 z-10 flex items-end justify-between">
                                <div className="bg-white/20 backdrop-blur-2xl border border-white/20 px-5 py-3 rounded-[24px] text-white/90">
                                    <h3 className="font-semibold text-lg tracking-tight leading-tight">The Aviary</h3>
                                    <p className="text-sm text-white/70 font-medium">Chicago, IL</p>
                                </div>
                            </div>
                        </div>

                        {/* Review / Stats Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, ...SPRING_TRANSITION }}
                            className={`rounded-[32px] md:rounded-[40px] p-6 md:p-8 relative min-h-[200px] md:min-h-[220px] flex flex-col justify-between ${surfaceApple}`}
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-4xl md:text-5xl font-semibold text-black/90 dark:text-white mb-1 tracking-tight">12k+</h3>
                                    <p className="text-sm md:text-base text-black/40 dark:text-white/40 font-medium">Curated Locations</p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center">
                                    <ArrowUpRight className="w-5 h-5 text-black/60 dark:text-white/60" />
                                </div>
                            </div>

                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={reviewIndex}
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -5 }}
                                    transition={{ duration: 0.3 }}
                                    className="mt-6 flex gap-4 items-center"
                                >
                                    <img src={reviews[reviewIndex].img} alt="User" className="w-12 h-12 rounded-full ring-2 ring-black/5 dark:ring-white/10 object-cover" />
                                    <div>
                                        <p className="text-sm font-medium text-black/80 dark:text-white/80 leading-snug line-clamp-2">
                                            "{reviews[reviewIndex].text}"
                                        </p>
                                        <div className="text-xs text-black/40 dark:text-white/40 font-medium mt-1">
                                            {reviews[reviewIndex].name} &middot; {reviews[reviewIndex].loc}
                                        </div>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </motion.div>
                    </div>
                </div>

                {/* 4 Feature Columns */}
                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
                >
                    {/* 1. AI Bio-Sync Card */}
                    <motion.div variants={fadeInUp} className={`rounded-[32px] p-6 h-full flex flex-col ${surfaceApple}`}>
                        <div className="mb-6">
                            <div className="w-12 h-12 bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-4">
                                <Heart size={24} className="fill-blue-500/20" />
                            </div>
                            <h3 className="font-semibold text-lg text-black/90 dark:text-white tracking-tight">Bio-Sync AI</h3>
                            <p className="text-sm text-black/50 dark:text-white/50 font-medium mt-1">Health-aware dining</p>
                        </div>
                        <div className="bg-[#F5F5F7] dark:bg-white/5 rounded-[20px] p-4 mt-auto">
                            <motion.p
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                transition={{ delay: 0.3, duration: 0.5 }}
                                className="text-xs leading-relaxed text-black/70 dark:text-white/70 font-medium"
                            >
                                "You walked 10k steps today. How about a healthy lunch at <span className="font-semibold text-blue-600 dark:text-blue-400">Green Bowl</span>?"
                                <motion.span
                                    animate={{ opacity: [0, 1, 0] }}
                                    transition={{ repeat: Infinity, duration: 0.8 }}
                                    className="inline-block w-1.5 h-3 bg-blue-500 ml-1 align-middle rounded-full"
                                />
                            </motion.p>
                        </div>
                    </motion.div>

                    {/* 2. Smart Lists Card */}
                    <motion.div variants={fadeInUp} className={`rounded-[32px] p-6 h-full flex flex-col ${surfaceApple}`}>
                        <div className="mb-6">
                            <div className="w-12 h-12 bg-black/5 dark:bg-white/10 text-black/80 dark:text-white/80 rounded-2xl flex items-center justify-center mb-4">
                                <List size={24} />
                            </div>
                            <h3 className="font-semibold text-lg text-black/90 dark:text-white tracking-tight">Collections</h3>
                            <p className="text-sm text-black/50 dark:text-white/50 font-medium mt-1">Wishlists & histories</p>
                        </div>

                        <div className="relative h-[88px] mt-auto">
                            <AnimatePresence mode="wait">
                                {listMode === 'wishlist' ? (
                                    <motion.div
                                        key="wishlist"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.3 }}
                                        className="absolute inset-0 space-y-2"
                                    >
                                        <div className="bg-[#F5F5F7] dark:bg-white/5 p-3 rounded-[16px] flex items-center gap-3">
                                            <Heart size={14} className="text-rose-500 fill-rose-500" />
                                            <span className="text-xs font-semibold text-black/80 dark:text-white/80">Jazz Club Tokyo</span>
                                        </div>
                                        <div className="bg-[#F5F5F7] dark:bg-white/5 p-3 rounded-[16px] flex items-center gap-3 opacity-50">
                                            <div className="w-3.5 h-3.5 rounded-full bg-black/10 dark:bg-white/20" />
                                            <span className="text-xs font-semibold text-black/80 dark:text-white/80">Omakase Room</span>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="visited"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.3 }}
                                        className="absolute inset-0 space-y-2"
                                    >
                                        <div className="bg-[#F5F5F7] dark:bg-white/5 p-3 rounded-[16px] flex items-center gap-3 border border-green-500/20">
                                            <CheckCircle size={14} className="text-green-500" />
                                            <span className="text-xs font-semibold text-black/80 dark:text-white/80">Cafe Leon</span>
                                        </div>
                                        <div className="bg-[#F5F5F7] dark:bg-white/5 p-3 rounded-[16px] flex items-center gap-3 opacity-50">
                                            <CheckCircle size={14} className="text-green-500" />
                                            <span className="text-xs font-semibold text-black/80 dark:text-white/80">Bottega</span>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>

                    {/* 3. Social Radar Card */}
                    <motion.div variants={fadeInUp} className={`rounded-[32px] p-6 h-full flex flex-col ${surfaceApple}`}>
                        <div className="mb-6">
                            <div className="w-12 h-12 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mb-4">
                                <User size={24} />
                            </div>
                            <h3 className="font-semibold text-lg text-black/90 dark:text-white tracking-tight">Dine With Me</h3>
                            <p className="text-sm text-black/50 dark:text-white/50 font-medium mt-1">Social dining radar</p>
                        </div>
                        <div className="bg-[#F5F5F7] dark:bg-white/5 rounded-[20px] mt-auto relative overflow-hidden h-[88px] flex items-center justify-center">
                            {/* Simple minimalist grid */}
                            <svg className="absolute inset-0 w-full h-full opacity-10 dark:opacity-[0.05]">
                                <pattern id="appleGrid" width="16" height="16" patternUnits="userSpaceOnUse">
                                    <path d="M 16 0 L 0 0 0 16" fill="none" stroke="currentColor" strokeWidth="1" />
                                </pattern>
                                <rect width="100%" height="100%" fill="url(#appleGrid)" />
                            </svg>
                            {/* Social avatars pulsing */}
                            <div className="relative flex gap-4">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-20"></div>
                                    <img src="https://i.pravatar.cc/100?img=5" alt="Friend" className="w-8 h-8 rounded-full border-2 border-white dark:border-[#1C1C1E] shadow-sm relative z-10" />
                                </div>
                                <div className="relative top-3">
                                    <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-20" style={{ animationDelay: '1s' }}></div>
                                    <img src="https://i.pravatar.cc/100?img=3" alt="Friend" className="w-8 h-8 rounded-full border-2 border-white dark:border-[#1C1C1E] shadow-sm relative z-10" />
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* 4. Global Search */}
                    <motion.div variants={fadeInUp} className={`rounded-[32px] p-6 h-full flex flex-col ${surfaceApple}`}>
                        <div className="mb-6">
                            <div className="w-12 h-12 bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center mb-4">
                                <Globe size={24} />
                            </div>
                            <h3 className="font-semibold text-lg text-black/90 dark:text-white tracking-tight">Global</h3>
                            <p className="text-sm text-black/50 dark:text-white/50 font-medium mt-1">Find anywhere</p>
                        </div>
                        <div className="relative h-[88px] overflow-hidden mt-auto rounded-[20px] bg-[#F5F5F7] dark:bg-white/5 mask-gradient-vertical">
                            <motion.div
                                animate={{ y: [0, -100] }}
                                transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                                className="py-2 px-4 space-y-4"
                            >
                                {["New York", "Paris", "Tokyo", "London", "Milan", "New York", "Paris"].map((city, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <Search size={14} className="text-black/30 dark:text-white/30" />
                                        <span className="text-xs font-semibold text-black/60 dark:text-white/60">{city}</span>
                                    </div>
                                ))}
                            </motion.div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </section >
    )
}

// --- Component: Collection ---
const CollectionPreview = () => (
    <section className="py-12 md:py-24 relative z-10">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8">
            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                className="text-left md:text-center mb-12 md:mb-20 max-w-2xl mx-auto"
            >
                <h2 className="text-3xl md:text-5xl font-semibold mb-6 tracking-[-0.03em] text-black/90 dark:text-white">
                    The <span className="text-blue-600 dark:text-blue-500">Collection</span>
                </h2>
                <p className="text-lg md:text-xl font-medium text-black/50 dark:text-white/50 leading-relaxed">
                    A highly curated selection of the world’s finest rooms, hidden haunts, and culinary landmarks.
                </p>
            </motion.div>
            <motion.div
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
            >
                {[
                    { title: "Venice", sub: "La Delicaze del Caffe", img: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=800&auto=format&fit=crop" },
                    { title: "New York", sub: "The Blind Tiger", img: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=800&auto=format&fit=crop" },
                    { title: "Madrid", sub: "Mercardo San Miguel", img: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=800&auto=format&fit=crop" },
                    { title: "Tokyo", sub: "Sushi Arai", img: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=800&auto=format&fit=crop" }
                ].map((item, i) => (
                    <motion.div key={i} variants={fadeInUp} className="group relative h-[350px] md:h-[480px] rounded-[32px] md:rounded-[40px] overflow-hidden bg-[#1C1C1E] cursor-pointer">
                        <img
                            src={item.img}
                            alt={item.title}
                            loading="lazy"
                            className="absolute inset-0 w-full h-full object-cover transition-transform [transition-duration:2000ms] ease-out group-hover:scale-105 opacity-90"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        <div className="absolute bottom-6 left-6 right-6 md:bottom-8 md:left-8 text-white">
                            <h3 className="text-sm font-semibold uppercase tracking-widest text-white/50 mb-1">{item.title}</h3>
                            <h4 className="text-2xl font-semibold tracking-tight">{item.sub}</h4>
                        </div>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    </section>
)

// --- Component: Pricing ---
const Pricing = () => (
    <section id="pricing" className="py-12 md:py-24 relative z-10">
        <div className="mx-4 lg:mx-8 rounded-[40px] py-16 md:py-24 bg-white dark:bg-[#1C1C1E] shadow-sm relative overflow-hidden">
            <div className="w-full max-w-[1200px] mx-auto px-4 md:px-8 relative z-10">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeInUp}
                    className="text-center mb-16 md:mb-24"
                >
                    <div className="bg-blue-500/10 dark:bg-blue-500/20 w-fit mx-auto px-4 py-2 rounded-full text-sm font-semibold text-blue-600 dark:text-blue-400 mb-6 flex items-center gap-2">
                        <Heart size={16} /> Community First
                    </div>
                    <h2 className="text-3xl md:text-5xl font-semibold mb-6 tracking-[-0.03em] text-black/90 dark:text-white">
                        100% Free. <br className="hidden sm:block" />
                        <span className="text-blue-600 dark:text-blue-500">Support the community.</span>
                    </h2>
                    <p className="text-lg md:text-xl font-medium text-black/50 dark:text-white/50 max-w-2xl mx-auto">
                        GastroMap is built by locals for travelers. Enjoy full access forever, or become a supporter.
                    </p>
                </motion.div>
                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto items-stretch"
                >
                    {/* Explorer (Free) */}
                    <motion.div variants={fadeInUp} className={`p-8 md:p-10 rounded-[40px] flex flex-col ${surfaceApple}`}>
                        <div className="text-xs font-semibold text-black/40 dark:text-white/40 uppercase tracking-widest mb-6">Explorer</div>
                        <div className="text-5xl font-semibold tracking-tight mb-2 text-black/90 dark:text-white">Free</div>
                        <p className="text-sm font-medium text-black/50 dark:text-white/50 mb-10">Everything you need to discover and share.</p>
                        <ul className="space-y-5 mb-12 text-sm font-medium text-black/70 dark:text-white/70 flex-1">
                            <li className="flex items-center gap-3"><Check className="w-5 h-5 text-blue-600/50" /> Add & Review Places</li>
                            <li className="flex items-center gap-3"><Check className="w-5 h-5 text-blue-600/50" /> Full AI Guidance</li>
                            <li className="flex items-center gap-3"><Check className="w-5 h-5 text-blue-600/50" /> Earn Points & Badges</li>
                            <li className="flex items-center gap-3"><Check className="w-5 h-5 text-blue-600/50" /> "Dine With Me" Radar</li>
                        </ul>
                        <Link to="/auth/signup">
                            <Button className="w-full bg-[#F5F5F7] hover:bg-blue-50 text-blue-600 dark:bg-[#1C1C1E] dark:text-white dark:hover:bg-blue-900/20 rounded-full h-14 font-medium transition-colors">
                                Join for Free
                            </Button>
                        </Link>
                    </motion.div>

                    {/* Supporter (Highlighted) */}
                    <motion.div variants={fadeInUp} className="bg-gradient-to-br from-blue-900 to-black text-white p-8 md:p-10 rounded-[40px] shadow-2xl flex flex-col relative overflow-hidden">
                        {/* Background glow */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full blur-[100px] opacity-20 pointer-events-none"></div>

                        <div className="absolute top-8 right-8 bg-white/10 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase text-white backdrop-blur-md">Optional</div>
                        <div className="text-xs font-semibold text-blue-400 uppercase tracking-widest mb-6">Supporter</div>
                        <div className="text-5xl font-semibold tracking-tight mb-2">$5<span className="text-lg text-white/40 font-medium">/mo</span></div>
                        <p className="text-sm font-medium text-white/50 mb-10">Help keep the servers running.</p>
                        <ul className="space-y-5 mb-12 text-sm font-medium text-white/90 flex-1 relative z-10">
                            <li className="flex items-center gap-3"><Check className="w-5 h-5 text-blue-400" /> Exclusive "Supporter" Badge</li>
                            <li className="flex items-center gap-3"><Check className="w-5 h-5 text-blue-400" /> Early access to new features</li>
                            <li className="flex items-center gap-3"><Check className="w-5 h-5 text-blue-400" /> Skip the moderation queue</li>
                            <li className="flex items-center gap-3"><Heart className="w-5 h-5 text-rose-400" /> Developer gratitude</li>
                        </ul>
                        <Button className="w-full bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-500/20 rounded-full h-14 font-medium transition-all relative z-10">
                            Become a Supporter
                        </Button>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    </section>
)

// --- Component: FAQ ---
const FAQ = () => {
    const [openIndex, setOpenIndex] = React.useState(null)

    const toggleFAQ = (index) => {
        setOpenIndex(openIndex === index ? null : index)
    }

    const questions = [
        { q: 'Is GastroMap really free?', a: 'Yes! Access to the global map, AI features, and community tools is 100% free. We believe finding great food should not be behind a paywall.' },
        { q: 'How does the Bio-Sync AI work?', a: 'It utilizes advanced machine learning combined with optional Apple Health or Google Fit data to recommend meals based on your real-time daily activity and fatigue levels.' },
        { q: 'How does the "Dine With Me" radar work?', a: 'It securely highlights nearby friends or colleagues who have also opted in for a meal, allowing you to instantly connect and map out shared restaurant preferences.' },
        { q: 'Can I use GastroMap while traveling abroad?', a: 'Yes! This app is being built exactly for a global community. We welcome contributions from everywhere and want everyone to find their perfect gastro location, no matter what country they are in.' },
        { q: 'What makes the routing different from typical maps?', a: 'Your route is crafted by our AI GastroGuide based on your preferences, weather, mood, distance, promotions, recommendations, and 10+ other parameters to offer exactly what you want. *Note: AI models can make mistakes, so verifying information is recommended.' },
        { q: 'How do I add a new place?', a: 'Simply register for a free account, click "Add a Place", and fill out the details. Our community moderators will review it, and you will earn reputation points when it goes live.' },
        { q: 'Can I become part of the community and help moderate content?', a: 'Yes, of course! Since our app is built as a free platform by a small independent team, we warmly welcome any help in operating, promoting, and improving the application together.' },
        { q: 'Why is there a Supporter tier?', a: 'GastroMap is built by a small independent team. The optional Supporter tier helps us keep the servers running, develop new features faster, and remain independent from intrusive ads.' }
    ]

    return (
        <section id="faq" className="py-12 md:py-24 relative z-10">
            <div className="w-full max-w-[800px] mx-auto px-4 md:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-semibold tracking-[-0.03em] text-black/90 dark:text-white">
                        Common <span className="text-blue-600 dark:text-blue-500">Questions</span>
                    </h2>
                </div>
                <div className="space-y-2">
                    {questions.map((item, i) => {
                        const isOpen = openIndex === i
                        return (
                            <div
                                key={i}
                                onClick={() => toggleFAQ(i)}
                                className={`cursor-pointer overflow-hidden transition-all duration-300 rounded-[28px] ${isOpen ? 'bg-white dark:bg-[#1C1C1E] shadow-[0_8px_30px_rgb(0,0,0,0.04)] px-6 py-6' : 'hover:bg-black/5 dark:hover:bg-white/5 px-6 py-5'}`}
                            >
                                <div className="flex justify-between items-center">
                                    <span className={`font-semibold text-lg transition-colors ${isOpen ? 'text-black/90 dark:text-white' : 'text-black/70 dark:text-white/70'}`}>{item.q}</span>
                                    <ChevronDown size={20} className={`text-black/30 dark:text-white/30 transition-transform duration-300 [transition-timing-function:cubic-bezier(0.87,0,0.13,1)] ${isOpen ? 'rotate-180' : ''}`} />
                                </div>
                                <AnimatePresence>
                                    {isOpen && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ ...SPRING_TRANSITION, duration: 0.3 }}
                                        >
                                            <p className="text-base text-black/50 dark:text-white/50 leading-relaxed font-medium mt-4">
                                                {item.a}
                                            </p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}

export default function LandingPage() {
    return (
        <div className="bg-[#F5F5F7] dark:bg-black min-h-screen relative overflow-hidden">
            {/* Subtle CSS Gradient Background */}
            <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true" style={{
                background: 'radial-gradient(ellipse 80% 60% at 20% 10%, rgba(59,130,246,0.06) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 80%, rgba(16,185,129,0.05) 0%, transparent 55%), radial-gradient(ellipse 50% 40% at 50% 50%, rgba(99,102,241,0.03) 0%, transparent 70%)'
            }} />

            {/* Content Layers */}
            <div className="relative z-10">
                <BentoHero />
                <CollectionPreview />
                <Pricing />
                <FAQ />
            </div>

            {/* Global style overrides needed for mask-gradients */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .mask-gradient-vertical {
                    -webkit-mask-image: linear-gradient(to bottom, transparent, black 15%, black 85%, transparent);
                    mask-image: linear-gradient(to bottom, transparent, black 15%, black 85%, transparent);
                }
            `}} />
        </div>
    )
}
