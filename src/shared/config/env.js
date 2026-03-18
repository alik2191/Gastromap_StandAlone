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

    // ─── AI / LLM ─────────────────────────────────────────────────────────────
    ai: {
        model: import.meta.env.VITE_AI_MODEL ?? 'claude-sonnet-4-6',
        apiKey: import.meta.env.VITE_AI_API_KEY ?? '',
        maxHistoryLength: 50,
        maxResponseTokens: 1024,
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
