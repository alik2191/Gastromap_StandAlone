import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { signIn, signUp, signOut, updateProfile } from '@/shared/api/auth.api'

/**
 * useAuthStore — session & identity only.
 *
 * Stores: user identity, auth state, token.
 * Does NOT store: preferences, AI chat history (moved to dedicated stores).
 *
 * @see useUserPrefsStore  src/features/auth/hooks/useUserPrefsStore.js
 * @see useAIChatStore     src/features/shared/hooks/useAIChatStore.js
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

            login: async (email, password) => {
                set({ isLoading: true, error: null })
                try {
                    const { user, token } = await signIn(email, password)
                    set({ user, token, isAuthenticated: true, isLoading: false })
                    return true
                } catch (err) {
                    set({ error: err.message, isLoading: false })
                    return false
                }
            },

            register: async (email, password, name) => {
                set({ isLoading: true, error: null })
                try {
                    const { user, token } = await signUp(email, password, name)
                    set({ user, token, isAuthenticated: true, isLoading: false })
                    return true
                } catch (err) {
                    set({ error: err.message, isLoading: false })
                    return false
                }
            },

            logout: async () => {
                await signOut()
                set({ user: null, token: null, isAuthenticated: false, error: null })
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
            // Only persist identity — not transient loading/error states
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
)
