import React, { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { BottomNav } from './BottomNav'
import { UniversalHeader } from './UniversalHeader'
import GastroGuideChat from '@/features/public/components/GastroGuideChat'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Sparkles } from 'lucide-react'
import AuroraBackground from '@/components/ui/aurora-background'
import { useTheme } from '@/hooks/useTheme'

export function MainLayout() {
    const { theme } = useTheme()
    const [isChatOpen, setIsChatOpen] = useState(false)
    const location = useLocation()
    const isProfile = location.pathname === '/profile'
    const isAIGuide = location.pathname === '/ai-guide'
    const isExplore = location.pathname.startsWith('/explore')
    const hasSearch = !isProfile && !isAIGuide && !isExplore

    return (
        <AuroraBackground theme={theme}>
            <div className="flex flex-col min-h-screen text-foreground relative">
                <UniversalHeader />
                <main className={`flex-1 relative transition-all duration-300 ${isAIGuide || isExplore ? 'pb-0' : 'pb-24'} md:pb-0`}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="w-full h-full"
                        >
                            <Outlet />
                        </motion.div>
                    </AnimatePresence>
                </main>
                <BottomNav />

                {/* AI Floating Action Button (Desktop Only) */}
                {!isChatOpen && (
                    <Button
                        size="lg"
                        className="fixed bottom-8 right-8 z-40 rounded-full w-14 h-14 shadow-xl shadow-primary/30 bg-primary hover:bg-primary/90 hover:scale-105 transition-all duration-300 hidden md:flex"
                        onClick={() => setIsChatOpen(true)}
                    >
                        <Sparkles className="h-6 w-6 text-white" />
                    </Button>
                )}

                <GastroGuideChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
            </div>
        </AuroraBackground>
    )
}
