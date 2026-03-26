/**
 * AI / GastroIntelligence API via OpenRouter
 *
 * Two modes:
 *  1. PRODUCTION — OpenRouter API (free models) when VITE_OPENROUTER_API_KEY is set.
 *     Uses Tool Use (function calling): model decides which filters to apply,
 *     calls search_locations / get_location_details, then generates a response.
 *     Locations are NOT injected into the system prompt — only requested results
 *     are in context, keeping token count minimal.
 *
 *  2. DEVELOPMENT FALLBACK — local scoring engine when no API key.
 *     Full offline dev without any API cost.
 *
 * Models used via OpenRouter (both free):
 *   Primary : meta-llama/llama-3.3-70b-instruct:free  (131K ctx, tool use)
 *   Fallback: qwen/qwen3-coder:free                    (262K ctx, 100+ languages)
 *
 * ⚠️  SECURITY NOTE:
 *   VITE_OPENROUTER_API_KEY is embedded in the client bundle.
 *   For production, proxy all AI calls through a server-side edge function.
 */

import { gastroIntelligence } from '@/services/gastroIntelligence'
import { config } from '@/shared/config/env'
import { ApiError } from './client'
import { useLocationsStore } from '@/features/public/hooks/useLocationsStore'
import { useAppConfigStore } from '@/store/useAppConfigStore'

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'

/**
 * Get active AI config — admin store overrides env vars at runtime.
 * Admin can change model/key in AdminAIPage without redeploying.
 */
function getActiveAIConfig() {
    const appCfg = useAppConfigStore.getState()
    return {
        apiKey:        appCfg.aiApiKey        || config.ai.openRouterKey,
        model:         appCfg.aiPrimaryModel  || config.ai.model,
        fallbackModel: appCfg.aiFallbackModel || config.ai.modelFallback,
    }
}

// ─── Tool definitions (OpenAI function calling format) ────────────────────

const TOOLS = [
    {
        type: 'function',
        function: {
            name: 'search_locations',
            description: 'Search gastro locations (restaurants, cafes, bars) by filters. ALWAYS call this tool before making any specific recommendations. Do not recommend places you have not retrieved via this tool.',
            parameters: {
                type: 'object',
                properties: {
                    city: {
                        type: 'string',
                        description: 'City name, e.g. "Krakow"',
                    },
                    cuisine: {
                        type: 'array',
                        items: { type: 'string' },
                        description: 'Cuisine types, e.g. ["French", "Italian", "Polish"]',
                    },
                    vibe: {
                        type: 'array',
                        items: { type: 'string' },
                        description: 'Atmosphere vibes, e.g. ["Romantic", "Casual", "Sophisticated", "Energetic"]',
                    },
                    price_level: {
                        type: 'array',
                        items: { type: 'string' },
                        description: 'Price levels: "$", "$$", "$$$", "$$$$"',
                    },
                    category: {
                        type: 'string',
                        description: 'Category: Restaurant, Cafe, Bar, Fine Dining, Street Food',
                    },
                    features: {
                        type: 'array',
                        items: { type: 'string' },
                        description: 'Features, e.g. ["outdoor seating", "wifi", "pet-friendly", "river view"]',
                    },
                    best_for: {
                        type: 'array',
                        items: { type: 'string' },
                        description: 'Occasion, e.g. ["date", "family", "business", "solo", "party", "anniversary"]',
                    },
                    dietary: {
                        type: 'array',
                        items: { type: 'string' },
                        description: 'Dietary needs, e.g. ["vegan", "vegetarian", "gluten-free"]',
                    },
                    min_rating: {
                        type: 'number',
                        description: 'Minimum rating (1–5)',
                    },
                    keyword: {
                        type: 'string',
                        description: 'Free-text keyword to match against name, description, tags, and hidden ai_keywords (e.g. "proposal spot", "jazz", "sunday brunch")',
                    },
                    michelin: {
                        type: 'boolean',
                        description: 'True to filter only Michelin-recognized places',
                    },
                    limit: {
                        type: 'integer',
                        description: 'Max results to return (default 5)',
                    },
                },
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'get_location_details',
            description: 'Get full details for a specific location by ID, including insider tips, dishes to try, and expert notes.',
            parameters: {
                type: 'object',
                properties: {
                    location_id: {
                        type: 'string',
                        description: 'The location ID',
                    },
                },
                required: ['location_id'],
            },
        },
    },
]

// ─── Client-side tool executor ────────────────────────────────────────────

/**
 * Execute a tool call locally using the Zustand locations store.
 * This avoids any extra network request — data is already in memory.
 *
 * @param {string} name   tool name
 * @param {Object} args   parsed JSON arguments from the model
 * @returns {Object}      tool result to send back to the model
 */
function executeTool(name, args) {
    const { locations } = useLocationsStore.getState()

    if (name === 'search_locations') {
        const {
            city, cuisine, vibe, price_level, category,
            features, best_for, dietary, min_rating, keyword, michelin, limit = 5
        } = args

        let results = [...locations]

        if (city) {
            const c = city.toLowerCase()
            results = results.filter(l =>
                l.city?.toLowerCase().includes(c) ||
                l.address?.toLowerCase().includes(c)
            )
        }
        if (category) {
            results = results.filter(l => l.category?.toLowerCase() === category.toLowerCase())
        }
        if (cuisine?.length) {
            results = results.filter(l =>
                cuisine.some(c => l.cuisine?.toLowerCase().includes(c.toLowerCase()))
            )
        }
        if (vibe?.length) {
            results = results.filter(l => {
                const locVibes = Array.isArray(l.vibe) ? l.vibe : [l.vibe]
                return vibe.some(v =>
                    locVibes.some(lv => lv?.toLowerCase().includes(v.toLowerCase()))
                )
            })
        }
        if (price_level?.length) {
            results = results.filter(l => price_level.includes(l.priceLevel))
        }
        if (min_rating) {
            results = results.filter(l => (l.rating ?? 0) >= min_rating)
        }
        if (features?.length) {
            results = results.filter(l => {
                const locFeatures = (l.features ?? []).map(f => f.toLowerCase())
                return features.some(f =>
                    locFeatures.some(lf => lf.includes(f.toLowerCase()))
                )
            })
        }
        if (best_for?.length) {
            results = results.filter(l => {
                const locBestFor = Array.isArray(l.best_for) ? l.best_for : []
                return best_for.some(b =>
                    locBestFor.some(lb => lb.toLowerCase().includes(b.toLowerCase()))
                )
            })
        }
        if (dietary?.length) {
            results = results.filter(l => {
                const locDietary = (l.dietary ?? []).map(d => d.toLowerCase())
                return dietary.some(d =>
                    locDietary.some(ld => ld.includes(d.toLowerCase()))
                )
            })
        }
        if (michelin) {
            results = results.filter(l => l.michelin_stars > 0 || l.michelin_bib)
        }
        if (keyword) {
            const kw = keyword.toLowerCase()
            results = results.filter(l =>
                l.title?.toLowerCase().includes(kw) ||
                l.description?.toLowerCase().includes(kw) ||
                l.tags?.some(t => t.toLowerCase().includes(kw)) ||
                l.ai_keywords?.some(k => k.toLowerCase().includes(kw)) ||
                l.ai_context?.toLowerCase().includes(kw) ||
                l.insider_tip?.toLowerCase().includes(kw) ||
                l.what_to_try?.some(w => w.toLowerCase().includes(kw))
            )
        }

        results.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
        results = results.slice(0, limit)

        return results.map(l => ({
            id: l.id,
            name: l.title,
            category: l.category,
            cuisine: l.cuisine,
            vibe: l.vibe,
            price_level: l.priceLevel,
            rating: l.rating,
            address: l.address,
            opening_hours: l.openingHours,
            phone: l.phone ?? null,
            website: l.website ?? null,
            features: l.features ?? [],
            best_for: l.best_for ?? [],
            dietary: l.dietary ?? [],
            michelin_stars: l.michelin_stars ?? 0,
            michelin_bib: l.michelin_bib ?? false,
            description: l.description,
            // Expert data — included for AI context, NOT shown in raw UI
            insider_tip: l.insider_tip ?? null,
            what_to_try: l.what_to_try ?? [],
            ai_context: l.ai_context ?? null,
        }))
    }

    if (name === 'get_location_details') {
        const { location_id } = args
        const loc = locations.find(l => l.id === location_id)
        if (!loc) return { error: `Location ${location_id} not found` }
        return {
            id: loc.id,
            name: loc.title,
            category: loc.category,
            cuisine: loc.cuisine,
            vibe: loc.vibe,
            price_level: loc.priceLevel,
            rating: loc.rating,
            review_count: loc.review_count ?? 0,
            address: loc.address,
            opening_hours: loc.openingHours,
            phone: loc.phone ?? null,
            website: loc.website ?? null,
            features: loc.features ?? [],
            dietary: loc.dietary ?? [],
            michelin_stars: loc.michelin_stars ?? 0,
            michelin_bib: loc.michelin_bib ?? false,
            description: loc.description,
            insider_tip: loc.insider_tip ?? null,
            what_to_try: loc.what_to_try ?? [],
            ai_context: loc.ai_context ?? null,
        }
    }

    return { error: `Unknown tool: ${name}` }
}

// ─── System prompt (compact — no location list injected) ──────────────────

function buildSystemPrompt(userPrefs = {}) {
    const { favoriteCuisines = [], vibePreference = [], priceRange = [], dietaryRestrictions = [] } = userPrefs

    const prefLines = [
        favoriteCuisines.length ? `Favourite cuisines: ${favoriteCuisines.join(', ')}` : '',
        vibePreference.length ? `Preferred vibes: ${vibePreference.join(', ')}` : '',
        priceRange.length ? `Budget: ${priceRange.join(', ')}` : '',
        dietaryRestrictions.length ? `Dietary restrictions: ${dietaryRestrictions.join(', ')}` : '',
    ].filter(Boolean).join('\n')

    return `You are GastroGuide — a warm, knowledgeable dining assistant for GastroMap, a gastronomy app focused on discovering the best places to eat and drink.

CORE RULES:
- NEVER invent or guess restaurant names. ALWAYS use the search_locations tool before recommending any places.
- When the user asks for recommendations, call search_locations with appropriate filters first.
- When the user asks about a specific place by name or ID, use get_location_details.
- Use the insider_tip and what_to_try fields from tool results to make your response feel personal and expert.
- Respond in the same language the user writes in (Russian, English, Polish — match their language).
- Be concise and friendly. Max 3–4 sentences for general responses, slightly longer when detailing recommendations.

${prefLines ? `USER PREFERENCES:\n${prefLines}` : ''}

When recommending places, format your response naturally — mention the name, why it fits, and include one insider tip or dish recommendation from the data.`
}

// ─── OpenRouter fetch helper ──────────────────────────────────────────────

/**
 * Send a chat completion request to OpenRouter.
 * Automatically retries on 429 with the fallback model.
 *
 * @param {Array}   messages
 * @param {boolean} stream
 * @param {boolean} withTools   include tool definitions
 * @param {string}  [modelOverride]
 * @returns {Promise<Response>}
 */
async function fetchOpenRouter(messages, { stream = false, withTools = true, modelOverride } = {}) {
    const { apiKey, model: activeModel, fallbackModel } = getActiveAIConfig()
    const model = modelOverride ?? activeModel

    const body = {
        model,
        messages,
        max_tokens: config.ai.maxResponseTokens,
        stream,
    }
    if (withTools) {
        body.tools = TOOLS
        body.tool_choice = 'auto'
    }

    const res = await fetch(OPENROUTER_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'HTTP-Referer': 'https://gastromap.app',
            'X-Title': 'GastroMap',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    })

    // On rate limit, retry with fallback model (only once)
    if (res.status === 429 && !modelOverride) {
        return fetchOpenRouter(messages, { stream, withTools, modelOverride: fallbackModel })
    }

    if (!res.ok) {
        const errBody = await res.json().catch(() => ({}))
        const msg = errBody?.error?.message ?? `OpenRouter error ${res.status}`
        throw Object.assign(new Error(msg), { status: res.status })
    }

    return res
}

// ─── Intent Detection ────────────────────────────────────────────────────────

/**
 * @param {string} text
 * @returns {'recommendation' | 'info' | 'general'}
 */
function detectIntent(text) {
    const q = text.toLowerCase()
    if (q.match(/\b(recommend|where|best|find|eat|drink|cafe|coffee|dinner|lunch|breakfast|date|romantic|cozy|хочу|найди|посоветуй|порекомендуй|где|лучший|хорошее)\b/)) {
        return 'recommendation'
    }
    if (q.match(/\b(open|close|hours|menu|price|book|reservation|phone|address|открыт|закрыт|часы|меню|цена|бронь|телефон|адрес)\b/)) {
        return 'info'
    }
    return 'general'
}

// ─── Agentic loop: handle tool calls ─────────────────────────────────────

/**
 * Run one agentic pass:
 *  1. Call OpenRouter (no stream) to get tool_calls or direct content.
 *  2. If tool_calls → execute locally → send results back → get final text.
 *
 * @param {Array} messages  Full messages array incl. system prompt
 * @returns {{ text: string, usedLocations: Array }}
 */
async function runAgentPass(messages) {
    // First call: detect tool calls
    const res = await fetchOpenRouter(messages, { stream: false, withTools: true })
    const data = await res.json()
    const choice = data.choices?.[0]

    if (!choice) throw new Error('No response from OpenRouter')

    const assistantMsg = choice.message
    const finishReason = choice.finish_reason

    // No tool calls — return text directly
    if (finishReason !== 'tool_calls' || !assistantMsg.tool_calls?.length) {
        return { text: assistantMsg.content ?? '', usedLocations: [] }
    }

    // Execute tool calls
    const toolResults = []
    let usedLocations = []

    for (const toolCall of assistantMsg.tool_calls) {
        let args = {}
        try {
            args = JSON.parse(toolCall.function.arguments)
        } catch {
            args = {}
        }

        const result = executeTool(toolCall.function.name, args)

        toolResults.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: JSON.stringify(result),
        })

        // Collect full location objects for UI cards
        if (toolCall.function.name === 'search_locations' && Array.isArray(result)) {
            const { locations } = useLocationsStore.getState()
            usedLocations = result
                .map(r => locations.find(l => l.id === r.id))
                .filter(Boolean)
                .slice(0, 3)
        }
        if (toolCall.function.name === 'get_location_details' && result?.id) {
            const { locations } = useLocationsStore.getState()
            const loc = locations.find(l => l.id === result.id)
            if (loc) usedLocations = [loc]
        }
    }

    // Second call: get final text with tool results (no tools needed in second pass)
    const finalMessages = [
        ...messages,
        assistantMsg,         // assistant message that contained tool_calls
        ...toolResults,       // tool result messages
    ]

    const finalRes = await fetchOpenRouter(finalMessages, { stream: false, withTools: false })
    const finalData = await finalRes.json()
    const finalContent = finalData.choices?.[0]?.message?.content ?? ''

    return { text: finalContent, usedLocations }
}

// ─── Public API ───────────────────────────────────────────────────────────

/**
 * @typedef {Object} AIResponse
 * @property {string}   content  - Text to display in chat
 * @property {Array}    matches  - Matched location objects for UI cards (up to 3)
 * @property {string}   intent   - 'recommendation' | 'info' | 'general'
 */

/**
 * Analyze a user query and return a GastroGuide response.
 * Uses OpenRouter when VITE_OPENROUTER_API_KEY is set, else local engine.
 *
 * @param {string} message
 * @param {{ preferences?: Object, history?: Array }} [context]
 * @returns {Promise<AIResponse>}
 */
export async function analyzeQuery(message, context = {}) {
    if (!message?.trim()) throw new ApiError('Message cannot be empty', 400, 'EMPTY_MESSAGE')

    const intent = detectIntent(message)

    if (getActiveAIConfig().apiKey) {
        try {
            const historyMessages = (context.history ?? [])
                .slice(-8)
                .filter(m => m.role === 'user' || m.role === 'assistant')
                .map(m => ({ role: m.role, content: m.content }))

            const messages = [
                { role: 'system', content: buildSystemPrompt(context.preferences) },
                ...historyMessages,
                { role: 'user', content: message },
            ]

            const { text, usedLocations } = await runAgentPass(messages)

            return { content: text, matches: usedLocations, intent }
        } catch (err) {
            if (err.status === 401) throw new ApiError('Invalid OpenRouter API key. Check VITE_OPENROUTER_API_KEY.', 401, 'AUTH_ERROR')
            console.warn('[GastroAI] OpenRouter error, falling back to local engine:', err.message)
        }
    }

    // Local fallback
    const result = await gastroIntelligence.analyzeQuery(message)
    return { content: result.content, matches: result.matches ?? [], intent }
}

/**
 * Streaming variant — runs the agentic pass first (non-streaming for tool calls),
 * then simulates word-by-word streaming via onChunk for a natural typing effect.
 *
 * @param {string} message
 * @param {{ preferences?: Object, history?: Array }} [context]
 * @param {(chunk: string) => void} onChunk
 * @returns {Promise<AIResponse>}
 */
export async function analyzeQueryStream(message, context = {}, onChunk) {
    if (!message?.trim()) throw new ApiError('Message cannot be empty', 400, 'EMPTY_MESSAGE')

    const intent = detectIntent(message)

    if (getActiveAIConfig().apiKey) {
        try {
            const model = config.ai.model || 'deepseek/deepseek-chat-v3-0324:free'
            const historyMessages = (context.history ?? [])
                .slice(-8)
                .filter(m => m.role === 'user' || m.role === 'assistant')
                .map(m => ({ role: m.role, content: m.content }))

            const messages = [
                { role: 'system', content: buildSystemPrompt(context.preferences) },
                ...historyMessages,
                { role: 'user', content: message },
            ]

            const { text, usedLocations } = await runAgentPass(messages)

            // Simulate streaming: emit word by word
            if (onChunk && text) {
                const words = text.split(' ')
                for (let i = 0; i < words.length; i++) {
                    const chunk = (i === 0 ? '' : ' ') + words[i]
                    onChunk(chunk)
                    // Small delay between words for natural typing feel
                    await new Promise(r => setTimeout(r, 18))
                }
            }

            return { content: text, matches: usedLocations, intent }
        } catch (err) {
            if (err.status === 401) throw new ApiError('Invalid OpenRouter API key.', 401, 'AUTH_ERROR')
            console.warn('[GastroAI] OpenRouter streaming error, falling back:', err.message)
        }
    }

    // Fallback: single-shot local engine
    return analyzeQuery(message, context)
}
