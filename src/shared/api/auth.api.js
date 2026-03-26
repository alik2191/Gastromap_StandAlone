/**
 * Auth API
 *
 * Mock implementation ready for Supabase Auth swap.
 * Replace each function body with the Supabase equivalent and
 * no component will need to change.
 */

import { ApiError, simulateDelay } from './client'

// ─── Admin emails ──────────────────────────────────────────────────────────
const ADMIN_EMAILS = ['admin@gastromap.com', 'alik2191@gmail.com']

// ─── Mock user store (in-memory for dev) ──────────────────────────────────
const MOCK_USERS = [
    {
        id: 'admin1',
        name: 'Admin User',
        email: 'admin@gastromap.com',
        role: 'admin',
        avatar: null,
        createdAt: '2024-01-01T00:00:00Z',
    },
    {
        id: 'admin2',
        name: 'Alik',
        email: 'alik2191@gmail.com',
        role: 'admin',
        avatar: null,
        createdAt: '2024-01-01T00:00:00Z',
    },
]

// ─── Auth operations ───────────────────────────────────────────────────────

/**
 * Sign in with email + password.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ user: Object, token: string }>}
 */
export async function signIn(email, password) {
    await simulateDelay(400)

    if (!email) {
        throw new ApiError('Email is required', 400, 'VALIDATION_ERROR')
    }

    const knownAdmin = MOCK_USERS.find(u => u.email === email)
    if (knownAdmin) {
        return { user: knownAdmin, token: 'mock-admin-jwt' }
    }

    // Generic user — derive name from email
    const nameFromEmail = email
        .split('@')[0]
        .replace(/[._-]/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase())

    const user = {
        id: `user_${Math.random().toString(36).slice(2, 9)}`,
        name: nameFromEmail || 'Guest',
        email,
        role: 'user',
        avatar: null,
        createdAt: new Date().toISOString(),
    }

    return { user, token: 'mock-user-jwt' }
}

/**
 * Register a new account.
 * @param {string} email
 * @param {string} password
 * @param {string} name
 * @returns {Promise<{ user: Object, token: string }>}
 */
export async function signUp(email, password, name) {
    await simulateDelay(500)

    if (!email || !password) {
        throw new ApiError('Email and password are required', 400, 'VALIDATION_ERROR')
    }

    if (password.length < 6) {
        throw new ApiError('Password must be at least 6 characters', 400, 'WEAK_PASSWORD')
    }

    const user = {
        id: `user_${Math.random().toString(36).slice(2, 9)}`,
        name: name || email.split('@')[0],
        email,
        role: 'user',
        avatar: null,
        createdAt: new Date().toISOString(),
    }

    return { user, token: 'mock-new-user-jwt' }
}

/**
 * Sign out current session.
 * @returns {Promise<void>}
 */
export async function signOut() {
    await simulateDelay(100)
    // TODO: supabase.auth.signOut()
}

/**
 * Update user profile fields.
 * @param {string} userId
 * @param {Partial<Object>} updates
 * @returns {Promise<Object>}
 */
export async function updateProfile(userId, updates) {
    await simulateDelay(300)
    // TODO: supabase.from('profiles').update(updates).eq('id', userId)
    return { id: userId, ...updates }
}
