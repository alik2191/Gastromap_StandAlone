import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Sparkles, MapPin, ChefHat, X, MoveUp } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useLocationsStore } from '@/features/public/hooks/useLocationsStore'
import { useAuthStore } from '@/features/auth/hooks/useAuthStore'
import { useTheme } from '@/hooks/useTheme'

// Shared AI Logic Hook
export const useGastroAI = () => {
    const { user, addToChatHistory } = useAuthStore()
    const [messages, setMessages] = useState([
        { id: 1, role: 'ai', content: `Hi ${user?.name || 'there'}! I'm GastroGuide. Ask me anything about dining in Krakow.` },
        { id: 2, role: 'user', content: "I'm looking for a cozy Italian place for a date tonight. Any ideas?" },
        {
            id: 3,
            role: 'ai',
            content: "Italian and cozy? Great choice! For a date in Krakow, I highly recommend these spots. They have amazing pasta and very intimate lighting.",
            attachments: [
                { id: 'loc1', title: 'Ti Amo Bella', category: 'Italian', rating: 4.8, image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=300&q=80', tags: ['Date', 'Pasta'] },
                { id: 'loc2', title: 'Mamma Mia', category: 'Italian', rating: 4.6, image: 'https://images.unsplash.com/photo-1595854341625-f33ee10dbf94?auto=format&fit=crop&w=300&q=80', tags: ['Family', 'Authentic'] }
            ]
        },
        { id: 4, role: 'user', content: "Ti Amo Bella looks perfect! Do they have outdoor seating?" },
        { id: 5, role: 'ai', content: "Yes! They have a beautiful hidden garden in the back. It's one of the quietest courtyards in the Old Town. Would you like me to check their menu or book a table?" },
        { id: 6, role: 'user', content: "Actually, let's look for something else. Maybe a specialty coffee shop for tomorrow morning?" },
        {
            id: 7,
            role: 'ai',
            content: "Coffee is my specialty! Krakow has a world-class specialty coffee scene. Here are the top-rated cafes near the center where you can find excellent V60 or a perfect flat white:",
            attachments: [
                { id: 'loc3', title: 'Karma Coffee', category: 'Cafe', rating: 4.9, image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=300&q=80', tags: ['Specialty', 'Roastery'] },
                { id: 'loc4', title: 'Wesola Cafe', category: 'Cafe', rating: 4.7, image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=300&q=80', tags: ['Breakfast', 'Vibe'] }
            ]
        },
        { id: 8, role: 'user', content: "Wesola looks very vibrant. Is it good for working on a laptop?" },
        { id: 9, role: 'ai', content: "Wesola is very popular, so it can get loud! If you want to work, I'd suggest Karma or Blossom. They have more 'work-friendly' zones and reliable Wi-Fi." }
    ])
    const [isTyping, setIsTyping] = useState(false)
    const { locations } = useLocationsStore()
    const [sessionContext, setSessionContext] = useState({})

    // Helper function to analyze the query
    const analyzeQuery = (query) => {
        const context = { ...sessionContext };
        const lowerQuery = query.toLowerCase();

        if (lowerQuery.includes("pizza")) {
            context.wantsPizza = true;
        }
        if (lowerQuery.includes("coffee") || lowerQuery.includes("cafe")) {
            context.wantsCoffee = true;
        }
        if (lowerQuery.includes("cheap") || lowerQuery.includes("budget")) {
            context.budget = true;
        }

        return { sessionContext: context };
    };

    // Helper function to get personalized recommendations
    const getPersonalizedRecommendation = (query, currentSessionContext) => {
        let aiResponse = { id: Date.now() + 1, role: 'ai', content: "I'm looking for the best matches..." };

        let filteredLocations = [...locations];

        // Apply user's long-term DNA preferences (Deep Personalization)
        if (user?.preferences?.longTerm) {
            const { foodieDNA, atmospherePreference, features } = user.preferences.longTerm;
            const combinedDNA = [foodieDNA, atmospherePreference, features].filter(Boolean).join(' ').toLowerCase();

            if (combinedDNA) {
                filteredLocations = filteredLocations.sort((a, b) => {
                    let aScore = 0;
                    let bScore = 0;

                    // Simple keyword matching for all DNA text
                    const keywords = combinedDNA.split(/\s+/).filter(w => w.length > 3);

                    keywords.forEach(word => {
                        const aData = [a.title, a.category, ...a.tags].join(' ').toLowerCase();
                        const bData = [b.title, b.category, ...b.tags].join(' ').toLowerCase();

                        if (aData.includes(word)) aScore++;
                        if (bData.includes(word)) bScore++;
                    });

                    return bScore - aScore;
                });
            }
        }

        // Filter locations based on short-term context
        if (currentSessionContext.wantsPizza) {
            filteredLocations = filteredLocations.filter(loc =>
                loc.category.toLowerCase().includes('pizza') ||
                loc.tags.some(t => t.toLowerCase().includes('pizza'))
            );
        }

        if (currentSessionContext.wantsCoffee) {
            filteredLocations = filteredLocations.filter(loc =>
                loc.category.toLowerCase().includes('cafe') ||
                loc.category.toLowerCase().includes('coffee') ||
                loc.tags.some(t => t.toLowerCase().includes('coffee'))
            );
        }

        // Fallback search
        if (!currentSessionContext.wantsPizza && !currentSessionContext.wantsCoffee) {
            const lowerText = query.toLowerCase();
            filteredLocations = filteredLocations.filter(loc =>
                lowerText.includes(loc.category.toLowerCase()) ||
                loc.tags.some(tag => lowerText.includes(tag.toLowerCase())) ||
                loc.title.toLowerCase().includes(lowerText)
            );
        }

        // Format response
        if (filteredLocations.length > 0) {
            aiResponse = {
                id: Date.now() + 1,
                role: 'ai',
                content: `Based on your preferences, I found ${filteredLocations.length} places for you!`,
                attachments: filteredLocations.slice(0, 3)
            };
        } else if (query.toLowerCase().includes('hello') || query.toLowerCase().includes('hi')) {
            aiResponse = { id: Date.now() + 1, role: 'ai', content: `Hello ${user?.name || 'there'}! Ready for a culinary adventure?` }
        } else {
            aiResponse = { id: Date.now() + 1, role: 'ai', content: "I didn't find specific matches, but I can recommend some great cafes generally." };
        }

        return aiResponse;
    };

    const sendMessage = async (text) => {
        const userMsg = { id: Date.now(), role: 'user', content: text }
        setMessages(prev => [...prev, userMsg])
        setIsTyping(true)

        if (addToChatHistory) {
            addToChatHistory({ role: 'user', content: text, timestamp: Date.now() })
        }

        const { sessionContext: newContext } = analyzeQuery(text);
        setSessionContext(newContext);

        setTimeout(() => {
            const aiResponse = getPersonalizedRecommendation(text, newContext);
            setMessages(prev => [...prev, aiResponse])

            if (addToChatHistory) {
                addToChatHistory({ role: 'ai', content: aiResponse.content, timestamp: Date.now() })
            }

            setIsTyping(false)
        }, 1500)
    }

    return { messages, isTyping, sendMessage }
}

// Unified Chat Interface Component
export function ChatInterface({ messages, isTyping, onSendMessage, transparent = false, hideInput = false, className = "", contentClassName = "" }) {
    const { theme } = useTheme()
    const isDark = theme === 'dark'
    const [input, setInput] = useState('')
    const scrollRef = useRef(null)

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    const handleSend = (e) => {
        e.preventDefault()
        if (!input.trim()) return
        onSendMessage(input)
        setInput('')
    }

    return (
        <div className={`flex flex-col h-full relative ${className}`}>
            {/* Top Mask - Fixed Gradient Overlay */}
            {transparent && (
                <div
                    className="absolute top-0 left-0 right-0 h-40 z-20 pointer-events-none"
                    style={{
                        background: `linear-gradient(to bottom, ${isDark ? '#000' : '#fff'} 0%, ${isDark ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.8)'} 40%, transparent 100%)`
                    }}
                />
            )}

            {/* Chat Area */}
            <div className={`flex-1 overflow-y-auto p-4 md:p-6 space-y-4 relative ${transparent ? 'pb-32' : ''} ${contentClassName}`} ref={scrollRef}>

                {/* Background Glow when thinking (Aurora effect inside the scroll area) */}
                {isTyping && transparent && (
                    <div className="absolute inset-x-0 bottom-0 h-96 bg-gradient-to-t from-purple-400/30 via-pink-300/10 to-transparent blur-3xl animate-pulse pointer-events-none z-0" />
                )}
                {messages.map(msg => (
                    <div key={msg.id} className={`flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                        <div
                            className={`px-4 py-3 rounded-2xl text-[15px] leading-relaxed max-w-[85%] shadow-lg backdrop-blur-sm ${msg.role === 'user'
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

                        {/* Attachments (Cards) */}
                        {msg.attachments && (
                            <div className="mt-2 space-y-3 w-full max-w-[85%]">
                                {msg.attachments.map(loc => (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        key={loc.id}
                                        className={`rounded-2xl p-3 flex gap-3 items-center shadow-lg backdrop-blur-sm cursor-pointer group transition-all hover:scale-[1.02] ${transparent
                                            ? 'bg-white/90 dark:bg-black/70 border border-white/40 dark:border-white/20'
                                            : 'bg-white border border-gray-100'
                                            }`}
                                    >
                                        <img src={loc.image} alt="" className="w-14 h-14 rounded-xl object-cover shadow-sm" />
                                        <div className="flex-1 min-w-0">
                                            <h4 className={`font-bold text-sm truncate ${transparent ? 'text-gray-900 dark:text-white' : 'text-gray-900'}`}>
                                                {loc.title}
                                            </h4>
                                            <p className={`text-xs flex items-center gap-1 mt-1 ${transparent ? 'text-gray-700 dark:text-gray-300' : 'text-muted-foreground'}`}>
                                                <ChefHat className="h-3 w-3" /> {loc.category} • ⭐ {loc.rating}
                                            </p>
                                        </div>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${transparent
                                            ? 'bg-gray-100/50 dark:bg-white/10 group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black'
                                            : 'bg-gray-50 group-hover:bg-black group-hover:text-white'
                                            }`}>
                                            <MoveUp className="h-4 w-4 rotate-45" />
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}

                {isTyping && (
                    <div className="flex gap-1 px-2">
                        <div className={`w-2 h-2 rounded-full animate-bounce delay-0 ${transparent ? 'bg-white/80' : 'bg-gray-400'}`} />
                        <div className={`w-2 h-2 rounded-full animate-bounce delay-100 ${transparent ? 'bg-white/80' : 'bg-gray-400'}`} />
                        <div className={`w-2 h-2 rounded-full animate-bounce delay-200 ${transparent ? 'bg-white/80' : 'bg-gray-400'}`} />
                    </div>
                )}
            </div>

            {/* Input Area - Fixed at bottom on mobile (hidden if hideInput=true on mobile) */}
            {!hideInput && (
                <form
                    onSubmit={handleSend}
                    className={`flex-shrink-0 p-3 md:p-4 border-t backdrop-blur-xl ${transparent
                        ? 'bg-white/20 dark:bg-black/30 border-white/20 dark:border-white/10 fixed bottom-20 left-0 right-0 md:relative md:bottom-0 z-[80]'
                        : 'bg-white/80 dark:bg-gray-900/80 border-black/5 dark:border-white/5'
                        } ${hideInput ? 'md:hidden' : ''}`}
                >
                    <div className={`relative flex items-center rounded-full border transition-all shadow-lg ${transparent
                        ? 'bg-white/90 dark:bg-black/70 border-white/40 dark:border-white/20 focus-within:border-white/60 focus-within:bg-white/95 dark:focus-within:bg-black/80 focus-within:shadow-2xl'
                        : 'bg-gray-100/50 dark:bg-gray-800/50 border-transparent focus-within:border-purple-200 focus-within:bg-white dark:focus-within:bg-gray-800 focus-within:shadow-md'
                        }`}>
                        <Input
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            placeholder="Message..."
                            className={`bg-transparent border-none shadow-none focus-visible:ring-0 text-base py-5 md:py-6 pl-5 md:pl-6 pr-12 placeholder:font-medium ${transparent
                                ? 'text-gray-900 dark:text-white placeholder:text-gray-600 dark:placeholder:text-gray-400'
                                : 'text-gray-900 dark:text-white placeholder:text-gray-400'
                                }`}
                        />
                        <Button
                            type="submit"
                            size="icon"
                            className={`absolute right-2 w-9 h-9 rounded-full transition-all shadow-lg ${input.trim()
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
