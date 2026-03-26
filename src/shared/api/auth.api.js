/**
 * Auth API  —  Supabase Auth with mock fallback.
 *
 * When VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are set → uses Supabase.
 * Otherwise → falls back to in-memory mocks (dev / preview without DB).
 */

import { supabase, ApiError, simulateDelay } from './client'
import { config } from '@/shared/config/env'

const USE_SUPABASE = config.supabase.isConfigured

// ─── Admin emails (used as role fallback when DB profile not yet seeded) ───
const ADMIN_EMAILS = ['admin@gastromap.com', 'alik2191@gmail.com']

// ─── Mock users (fallback when Supabase not configured) ────────────────────
const MOCK_USERS = [
    { id: 'admin1', name: 'Admin User', email: 'admin@gastromap.com', role: 'admin', avatar: null, createdAt: '2024-01-01T00:00:00Z' },
    { id: 'admin2', name: 'Alik', email: 'alik2191@gmail.com', role: 'admin', avatar: null, createdAt: '2024-01-01T00:00:00Z' },
]

// ─── Supabase helpers ──────────────────────────────────────────────────────

async function _fetchProfile(userId) {
    try {
        const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
        return data
    } catch {
        return null
    }
}

function _mapUser(authUser, profile) {
    return {
        id: authUser.id,
        name: profile?.name || authUser.user_metadata?.name || authUser.email.split('@')[0],
        email: authUser.email,
        // DB profile role takes priority; ADMIN_EMAILS is a fallback for fresh installs
        role: profile?.role || (ADMIN_EMAILS.includes(authUser.email) ? 'admin' : 'user'),
        avatar: profile?.avatar_url || null,
        createdAt: authUser.created_at,
    }
}

// ─── Auth operations ───────────────────────────────────────────────────────

/**
 * Sign in with email + password.
 * @returns {Promise<{ user: Object, token: string }>}
 */
export async function signIn(email, password) {
    // ── Mock ──
    if (!USE_SUPABASE) {
        await simulateDelay(400)
        if (!email) throw new ApiError('Email is required', 400, 'VALIDATION_ERROR')
        const knownAdmin = MOCK_USERS.find(u => u.email === email)
        if (knownAdmin) return { user: knownAdmin, token: 'mock-admin-jwt' }
        const name = email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
        return {
            user: { id: `user_${Math.random().toString(36).slice(2, 9)}`, name, email, role: 'user', avatar: null, createdAt: new Date().toISOString() },
            token: 'mock-user-jwt',
        }
    }

    // ── Supabase ──
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw new ApiError(error.message, 401, 'AUTH_ERROR')

    const profile = await _fetchProfile(data.user.id)
    return { user: _mapUser(data.user, profile), token: data.session.access_token }
}

/**
 * Register a new account.
 * @returns {Promise<{ user: Object, token: string } | { emailConfirmation: true }>}
 */
export async function signUp(email, password, name) {
    // ── Mock ──
    if (!USE_SUPABASE) {
        await simulateDelay(500)
        if (!email || !password) throw new ApiError('Email and password are required', 400, 'VALIDATION_ERROR')
        if (password.length < 6) throw new ApiError('Password must be at least 6 characters', 400, 'WEAK_PASSWORD')
        return {
            user: { id: `user_${Math.random().toString(36).slice(2, 9)}`, name: name || email.split('@')[0], email, role: 'user', avatar: null, createdAt: new Date().toISOString() },
            token: 'mock-new-user-jwt',
        }
    }

    // ── Supabase ──
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
    })
    if (error) throw new ApiError(error.message, 400, 'AUTH_ERROR')

    // Email confirmation required (Supabase setting)
    if (!data.session) {
        return { emailConfirmation: true }
    }

    const profile = await _fetchProfile(data.user.id)
    return { user: _mapUser(data.user, profile), token: data.session.access_token }
}

/**
 * Sign out current session.
 */
export async function signOut() {
    if (!USE_SUPABASE) { await simulateDelay(100); return }
    await supabase.auth.signOut()
}

/**
 * Update user profile fields (name, avatar).
 */
export async function updateProfile(userId, updates) {
    if (!USE_SUPABASE) { await simulateDelay(300); return { id: userId, ...updates } }

    const dbUpdates = {}
    if (updates.name) dbUpdates.name = updates.name
    if (updates.avatar !== undefined) dbUpdates.avatar_url = updates.avatar

    const { data, error } = await supabase
        .from('profiles')
        .update(dbUpdates)
        .eq('id', userId)
        .select()
        .single()

    if (error) throw new ApiError(error.message, 400, 'UPDATE_ERROR')
    return { id: data.id, name: data.name, avatar: data.avatar_url, role: data.role }
}

/**
 * Restore session from Supabase on app mount (called once in App.jsx).
 * Sets up onAuthStateChange listener — auto-syncs all future auth events.
 *
 * @param {Function} onSession  called with { user, token } when session found
 * @param {Function} onSignOut  called when signed out
 * @returns {Function} unsubscribe function
 */
export function subscribeToAuthChanges(onSession, onSignOut) {
    if (!USE_SUPABASE || !supabase) return () => {}

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
            onSignOut()
            return
        }
        if (session?.user) {
            const profile = await _fetchProfile(session.user.id)
            onSession({ user: _mapUser(session.user, profile), token: session.access_token })
        }
    })

    return () => subscription.unsubscribe()
}
