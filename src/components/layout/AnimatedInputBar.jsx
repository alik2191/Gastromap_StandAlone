import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Home, Heart, MoveUp, ChevronLeft, ChevronRight } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'
import { useNavigate } from 'react-router-dom'

// Animated Input Bar component that replaces navigation on AI Guide page
export function AnimatedInputBar({ input, onInputChange, onSubmit, isTyping }) {
    const { theme } = useTheme()
    const navigate = useNavigate()
    const isDark = theme === 'dark'
    const [isFocused, setIsFocused] = useState(false)
    const [dragX, setDragX] = useState(0)
    const DRAG_THRESHOLD = 80

    const navItems = {
        left: { icon: Home, label: 'Dashboard', path: '/dashboard' },
        right: { icon: Heart, label: 'Saved', path: '/saved' }
    }
    // New form submit handler
    const handleLocalSubmit = (e) => {
        e.preventDefault()
        if (!input.trim() || isTyping) return
        onSubmit(e)
    }

    return (
        <motion.div
            initial={{ rotateX: -90, opacity: 0 }}
            animate={{ rotateX: 0, opacity: 1 }}
            exit={{ rotateX: 90, opacity: 0 }}
            transition={{
                type: "spring",
                stiffness: 100,
                damping: 15,
                duration: 0.6
            }}
            className="fixed left-0 right-0 bottom-6 z-[70] px-4 pointer-events-none"
            style={{ perspective: 1000 }}
        >
            <form
                onSubmit={handleLocalSubmit}
                className="max-w-md mx-auto pointer-events-auto"
            >
                <motion.div
                    onPan={(e, info) => setDragX(info.offset.x)}
                    onPanEnd={(e, info) => {
                        if (info.offset.x > DRAG_THRESHOLD) {
                            navigate(navItems.left.path)
                        } else if (info.offset.x < -DRAG_THRESHOLD) {
                            navigate(navItems.right.path)
                        }
                        setDragX(0)
                    }}
                    animate={{ x: dragX * 0.4 }}
                    className={`relative flex items-center h-[64px] rounded-[32px] border backdrop-blur-3xl transition-all duration-500 overflow-hidden ${isDark
                        ? 'bg-black/40 border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]'
                        : 'bg-white/70 border-white/30 shadow-[0_10px_30px_rgba(0,0,0,0.08)]'
                        } ${isFocused ? 'ring-2 ring-blue-500/20 border-blue-500/30' : ''}`}
                >
                    <Input
                        value={input}
                        onChange={onInputChange}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        placeholder="Ask GastroGuide..."
                        className="flex-1 bg-transparent border-none shadow-none outline-none focus:outline-none focus:border-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-full text-base py-2 px-6 placeholder:font-medium text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-500"
                    />

                    <div className="relative pr-4 z-20">
                        <Button
                            type="submit"
                            size="icon"
                            disabled={!input.trim() || isTyping}
                            className={`w-10 h-10 rounded-full transition-all shadow-lg active:scale-90 ${input.trim()
                                ? 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-blue-500/40'
                                : 'bg-gray-100 dark:bg-zinc-800 text-gray-400 dark:text-zinc-600'
                                }`}
                        >
                            <MoveUp className="h-5 w-5" />
                        </Button>
                    </div>
                </motion.div>

                {/* Gesture Label Overlays (Appears on Swipe) */}
                <AnimatePresence>
                    {Math.abs(dragX) > 20 && (
                        <>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{
                                    opacity: Math.min(dragX / DRAG_THRESHOLD, 1),
                                    scale: 1,
                                    x: dragX * 0.1
                                }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="fixed left-6 bottom-10 flex items-center gap-3 px-5 py-2.5 rounded-full bg-blue-600 text-white shadow-[0_10px_30px_rgba(37,99,235,0.4)] z-[80]"
                            >
                                <Home className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Dashboard</span>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{
                                    opacity: Math.min(-dragX / DRAG_THRESHOLD, 1),
                                    scale: 1,
                                    x: dragX * 0.1
                                }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="fixed right-6 bottom-10 flex items-center gap-3 px-5 py-2.5 rounded-full bg-indigo-600 text-white shadow-[0_10px_30px_rgba(79,70,229,0.4)] z-[80]"
                            >
                                <span className="text-[10px] font-black uppercase tracking-widest">Saved Locations</span>
                                <Heart className="w-4 h-4" />
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </form>
        </motion.div>
    );
}

export default AnimatedInputBar;
