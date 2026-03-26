/**
 * Centralized application configuration.
 * All environment variables are accessed through this module — never directly
 * via import.meta.env in components or services.
 */

export const config = {
    // ─── Supabase ─────────────────────────────────────────────────────────────
    supabase: {
        url: import.meta.env.VITE_SUPABASE_URL ?? '',
        anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY ?? '',
        get isConfigured() {
            return Boolean(this.url && this.anonKey)
        },
    },

    // ─── AI / LLM (OpenRouter) ────────────────────────────────────────────────
    ai: {
        provider: 'openrouter', // 'openrouter' | 'anthropic' | 'direct'
        openRouter: {
            apiKey: import.meta.env.VITE_OPENROUTER_API_KEY ?? '',
            baseUrl: 'https://openrouter.ai/api/v1',
            siteUrl: import.meta.env.VITE_SITE_URL ?? 'http://localhost:5173',
            appName: import.meta.env.VITE_APP_NAME ?? 'GastroMap',
        },
        model: import.meta.env.VITE_AI_MODEL ?? 'deepseek/deepseek-chat-v3-0324:free',
        apiKey: import.meta.env.VITE_AI_API_KEY ?? '', // legacy Anthropic key
        maxHistoryLength: 50,
        maxResponseTokens: 1024,
        
        // Free models optimized for GastroMap
        freeModels: [
            { id: 'deepseek/deepseek-chat-v3-0324:free', name: 'DeepSeek V3.2 (Free)', context: 128000 },
            { id: 'nvidia/nemotron-3-super:free', name: 'Nemotron 3 Super (Free)', context: 128000 },
            { id: 'qwen/qwen-3-coder-480b:free', name: 'Qwen3 Coder 480B (Free)', context: 262000 },
            { id: 'meta-llama/llama-4-maverick:free', name: 'Llama 4 Maverick (Free)', context: 128000 },
            { id: 'stepfun-ai/step-3.5-flash:free', name: 'Step 3.5 Flash (Free)', context: 200000 },
        ],
        
        // Premium models for comparison
        premiumModels: [
            { id: 'anthropic/claude-3-7-sonnet', name: 'Claude 3.7 Sonnet', cost: '$3/$15 per 1M tokens' },
            { id: 'openai/gpt-5.4', name: 'GPT-5.4', cost: '$2.5/$10 per 1M tokens' },
            { id: 'google/gemini-2.5-pro', name: 'Gemini 2.5 Pro', cost: '$1.25/$5 per 1M tokens' },
        ],
        
        get isConfigured() {
            return Boolean(this.openRouter.apiKey) || Boolean(this.apiKey)
        },
    },

    // ─── Map ──────────────────────────────────────────────────────────────────
    map: {
        defaultCenter: { lat: 50.0619, lng: 19.9368 }, // Krakow
        defaultZoom: 14,
        tiles: {
            light: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
            dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        },
        attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
    },

    // ─── App ──────────────────────────────────────────────────────────────────
    app: {
        name: 'GastroMap',
        version: import.meta.env.VITE_APP_VERSION ?? '2.0.0',
        isDev: import.meta.env.DEV,
        isProd: import.meta.env.PROD,
    },

    // ─── Images ───────────────────────────────────────────────────────────────
    images: {
        unsplashQuality: '?q=80&w=800&auto=format&fit=crop',
    },
}
