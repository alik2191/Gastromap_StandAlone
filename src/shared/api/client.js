/**
 * API Client — single data access layer.
 *
 * Currently returns mock data. To switch to Supabase:
 * 1. `npm install @supabase/supabase-js`
 * 2. Uncomment the Supabase block below
 * 3. Remove mock imports
 *
 * All features/components should import from `@/shared/api/*`
 * and NEVER access mock data or Supabase directly.
 */

import { config } from '@/shared/config/env'

// ─── Future Supabase Client ────────────────────────────────────────────────
// import { createClient } from '@supabase/supabase-js'
// export const supabase = createClient(config.supabase.url, config.supabase.anonKey)

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

/**
 * Simulate network latency in dev mode so the UI behaves
 * realistically before the real backend is connected.
 */
export const simulateDelay = (ms = 300) =>
    config.app.isDev ? new Promise(resolve => setTimeout(resolve, ms)) : Promise.resolve()
