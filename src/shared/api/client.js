import { createClient } from '@supabase/supabase-js'
import { config } from '@/shared/config/env'

// ─── Supabase Client ──────────────────────────────────────────────────────
export const supabase = createClient(config.supabase.url, config.supabase.anonKey)

/**
 * Generic API error — carries HTTP status for consistent error handling
 * in React Query's onError callbacks.
 */
export class ApiError extends Error {
    constructor(message, status = 500, code = 'UNKNOWN_ERROR') {
        super(message)
        this.name = 'ApiError'
        this.status = status
        this.code = code
    }
}

/** Simulate network latency in dev (used by auth.api and other mock modules). */
export const simulateDelay = (ms = 300) =>
    config.app.isDev ? new Promise(resolve => setTimeout(resolve, ms)) : Promise.resolve()
