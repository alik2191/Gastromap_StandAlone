import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { signIn, signUp, signOut, updateProfile, subscribeToAuthChanges } from '@/shared/api/auth.api'

/**
 * useAuthStore — session & identity.
 *
 * Stores: user identity, auth state, token.
 * Persists to localStorage ('auth-storage') — survives page refresh.
 *
 * On app mount, call initAuth() once to:
 *   1. Restore session from Supabase (if configured)
 *   2. Set up onAuthStateChange listener for token refresh, tab sync, logout
 */
export const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,            // { id, name, email, role, avatar, createdAt }
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,

            // ─── Actions ─────────────────────────────────────────────────

            /**
             * Call once on App mount. Sets up Supabase auth listener
             * and restores session if it exists.
             */
            initAuth: () => {
                set({ isLoading: true })

                const unsubscribe = subscribeToAuthChanges(
                    // onSession — called with current + future sessions
                    ({ user, token }) => {
                        set({ user, token, isAuthenticated: true, isLoading: false })
                    },
                    // onSignOut
                    () => {
                        set({ user: null, token: null, isAuthenticated: false, isLoading: false })
                    }
                )

                // Store unsubscribe so logout can clean it up (optional)
                set({ _unsubscribeAuth: unsubscribe, isLoading: false })
            },

            login: async (email, password) => {
                set({ isLoading: true, error: null })
                try {
                    const result = await signIn(email, password)
                    set({ user: result.user, token: result.token, isAuthenticated: true, isLoading: false })
                    return { success: true, user: result.user }
                } catch (err) {
                    set({ error: err.message, isLoading: false })
                    return { success: false, error: err.message }
                }
            },

            register: async (email, password, name) => {
                set({ isLoading: true, error: null })
                try {
                    const result = await signUp(email, password, name)

                    // Email confirmation required (Supabase setting enabled)
                    if (result.emailConfirmation) {
                        set({ isLoading: false })
                        return { success: true, emailConfirmation: true }
                    }

                    set({ user: result.user, token: result.token, isAuthenticated: true, isLoading: false })
                    return { success: true, user: result.user }
                } catch (err) {
                    set({ error: err.message, isLoading: false })
                    return { success: false, error: err.message }
                }
            },

            logout: async () => {
                const { _unsubscribeAuth } = get()
                if (_unsubscribeAuth) _unsubscribeAuth()
                await signOut()
                set({ user: null, token: null, isAuthenticated: false, error: null, _unsubscribeAuth: null })
            },

            updateUserProfile: async (updates) => {
                const { user } = get()
                if (!user) return
                try {
                    const updated = await updateProfile(user.id, updates)
                    set({ user: { ...user, ...updated } })
                } catch (err) {
                    set({ error: err.message })
                }
            },

            clearError: () => set({ error: null }),
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
)
