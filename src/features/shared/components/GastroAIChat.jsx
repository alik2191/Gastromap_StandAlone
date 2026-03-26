import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChefHat, MoveUp } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useAIChat } from '@/hooks/useAIChat'
import { useAuthStore } from '@/features/auth/hooks/useAuthStore'
import { useTheme } from '@/hooks/useTheme'

// ─── Welcome messages shown before user types anything ────────────────────
const buildWelcomeMessages = (userName) => [
    {
        id: 'welcome-1',
        role: 'assistant',
        content: `Hi ${userName || 'there'}! I'm GastroGuide. Ask me anything about dining in Krakow.`,
    },
    {
        id: 'welcome-2',
        role: 'user',
        content: "I'm looking for a cozy Italian place for a date tonight. Any ideas?",
    },
    {
        id: 'welcome-3',
        role: 'assistant',
        content:
            'Italian and cozy? Great choice! For a date in Krakow, I highly recommend these spots.',
        matches: [
            {
                id: 'loc1',
                title: 'Ti Amo Bella',
                category: 'Italian',
                rating: 4.8,
                image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=300&q=80',
                tags: ['Date', 'Pasta'],
            },
            {
                id: 'loc2',
                title: 'Mamma Mia',
                category: 'Italian',
                rating: 4.6,
                image: 'https://images.unsplash.com/photo-1595854341625-f33ee10dbf94?auto=format&fit=crop&w=300&q=80',
                tags: ['Family', 'Authentic'],
            },
        ],
    },
]

/**
 * useGastroAI — backward-compatible wrapper around the new useAIChat hook.
 *
 * Merges welcome demo messages with real persisted chat history so the
 * interface never looks empty on first launch.
 */
export const useGastroAI = () => {
    const { user } = useAuthStore()
    const { messages: storedMessages, isTyping, sendMessage, clearHistory } = useAIChat()

    // Show welcome messages only when there's no real history yet
    const welcomeMessages = buildWelcomeMessages(user?.name)
    const messages = storedMessages.length > 0 ? storedMessages : welcomeMessages

    return { messages, isTyping, sendMessage, clearHistory }
}

// ─── Unified Chat Interface Component ─────────────────────────────────────

export function ChatInterface({
    messages,
    isTyping,
    onSendMessage,
    transparent = false,
    hideInput = false,
    className = '',
    contentClassName = '',
}) {
    const { theme } = useTheme()
    const isDark = theme === 'dark'
    const [input, setInput] = useState('')
    const scrollRef = useRef(null)

    // Auto-scroll to latest message
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages, isTyping])

    const handleSend = (e) => {
        e.preventDefault()
        if (!input.trim()) return
        onSendMessage(input)
        setInput('')
    }

    return (
        <div className={`flex flex-col h-full relative ${className}`}>
            {/* Top fade mask */}
            {transparent && (
                <div
                    className="absolute top-0 left-0 right-0 h-40 z-20 pointer-events-none"
                    style={{
                        background: `linear-gradient(to bottom, ${isDark ? '#000' : '#fff'} 0%, ${isDark ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.8)'} 40%, transparent 100%)`,
                    }}
                />
            )}

            {/* Messages */}
            <div
                data-lenis-prevent
                className={`flex-1 overflow-y-auto p-4 md:p-6 space-y-4 relative ${transparent ? 'pb-32' : ''} ${contentClassName}`}
                ref={scrollRef}
            >
                {isTyping && transparent && (
                    <div className="absolute inset-x-0 bottom-0 h-96 bg-gradient-to-t from-purple-400/30 via-pink-300/10 to-transparent blur-3xl animate-pulse pointer-events-none z-0" />
                )}

                {messages.map((msg) => {
                    const isUser = msg.role === 'user'
                    // Support both 'ai' (legacy) and 'assistant' (new store)
                    const attachments = msg.attachments ?? msg.matches ?? []

                    return (
                        <div
                            key={msg.id}
                            className={`flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`}
                        >
                            <div
                                className={`px-4 py-3 rounded-2xl text-[15px] leading-relaxed max-w-[85%] shadow-lg backdrop-blur-sm ${
                                    isUser
                                        ? transparent
                                            ? 'bg-white/90 dark:bg-white/95 text-gray-900 rounded-br-none border border-white/40'
                                            : 'bg-black text-white rounded-br-none'
                                        : transparent
                                        ? 'bg-white/80 dark:bg-black/60 text-gray-900 dark:text-white rounded-bl-none border border-white/30 dark:border-white/20'
                                        : 'bg-white border border-black/5 text-gray-800 rounded-bl-none'
                                }`}
                            >
                                {msg.content}
                            </div>

                            {/* Location recommendation cards */}
                            {attachments.length > 0 && (
                                <div className="mt-2 space-y-3 w-full max-w-[85%]">
                                    {attachments.map((loc) => (
                                        <motion.div
                                            key={loc.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`rounded-2xl p-3 flex gap-3 items-center shadow-lg backdrop-blur-sm cursor-pointer group transition-all hover:scale-[1.02] ${
                                                transparent
                                                    ? 'bg-white/90 dark:bg-black/70 border border-white/40 dark:border-white/20'
                                                    : 'bg-white border border-gray-100'
                                            }`}
                                        >
                                            <img
                                                src={loc.image}
                                                alt={loc.title}
                                                className="w-14 h-14 rounded-xl object-cover shadow-sm"
                                                loading="lazy"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <h4
                                                    className={`font-bold text-sm truncate ${
                                                        transparent ? 'text-gray-900 dark:text-white' : 'text-gray-900'
                                                    }`}
                                                >
                                                    {loc.title}
                                                </h4>
                                                <p
                                                    className={`text-xs flex items-center gap-1 mt-1 ${
                                                        transparent ? 'text-gray-700 dark:text-gray-300' : 'text-muted-foreground'
                                                    }`}
                                                >
                                                    <ChefHat className="h-3 w-3" /> {loc.category} • ⭐ {loc.rating}
                                                </p>
                                            </div>
                                            <div
                                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                                                    transparent
                                                        ? 'bg-gray-100/50 dark:bg-white/10 group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black'
                                                        : 'bg-gray-50 group-hover:bg-black group-hover:text-white'
                                                }`}
                                            >
                                                <MoveUp className="h-4 w-4 rotate-45" />
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )
                })}

                {/* Typing indicator */}
                {isTyping && (
                    <div className="flex gap-1 px-2">
                        {[0, 100, 200].map((delay) => (
                            <div
                                key={delay}
                                className={`w-2 h-2 rounded-full animate-bounce ${
                                    transparent ? 'bg-white/80' : 'bg-gray-400'
                                }`}
                                style={{ animationDelay: `${delay}ms` }}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Input form */}
            {!hideInput && (
                <form
                    onSubmit={handleSend}
                    className={`flex-shrink-0 p-3 md:p-4 border-t backdrop-blur-xl ${
                        transparent
                            ? 'bg-white/20 dark:bg-black/30 border-white/20 dark:border-white/10 fixed bottom-20 left-0 right-0 md:relative md:bottom-0 z-[80]'
                            : 'bg-white/80 dark:bg-gray-900/80 border-black/5 dark:border-white/5'
                    }`}
                >
                    <div
                        className={`relative flex items-center rounded-full border transition-all shadow-lg ${
                            transparent
                                ? 'bg-white/90 dark:bg-black/70 border-white/40 dark:border-white/20 focus-within:border-white/60 focus-within:bg-white/95 dark:focus-within:bg-black/80 focus-within:shadow-2xl'
                                : 'bg-gray-100/50 dark:bg-gray-800/50 border-transparent focus-within:border-purple-200 focus-within:bg-white dark:focus-within:bg-gray-800 focus-within:shadow-md'
                        }`}
                    >
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Message GastroGuide..."
                            className={`bg-transparent border-none shadow-none focus-visible:ring-0 text-base py-5 md:py-6 pl-5 md:pl-6 pr-12 placeholder:font-medium ${
                                transparent
                                    ? 'text-gray-900 dark:text-white placeholder:text-gray-600 dark:placeholder:text-gray-400'
                                    : 'text-gray-900 dark:text-white placeholder:text-gray-400'
                            }`}
                        />
                        <Button
                            type="submit"
                            size="icon"
                            className={`absolute right-2 w-9 h-9 rounded-full transition-all shadow-lg ${
                                input.trim()
                                    ? transparent
                                        ? 'bg-gradient-to-tr from-indigo-500 to-purple-500 text-white scale-100 hover:scale-110'
                                        : 'bg-black text-white scale-100'
                                    : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 scale-90'
                            }`}
                            disabled={!input.trim() || isTyping}
                        >
                            <MoveUp className="h-4 w-4" />
                        </Button>
                    </div>
                </form>
            )}
        </div>
    )
}
