import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * useUserPrefsStore — user preferences & personalisation.
 *
 * Separated from auth so preferences survive logout/re-login
 * and can be edited without touching auth state.
 */

const DEFAULT_PREFS = {
    // Cuisine & food
    favoriteCuisines: [],
    dietaryRestrictions: [],

    // Atmosphere
    atmospherePreference: [],   // ['cozy', 'modern', 'quiet', 'lively']
    vibePreference: [],         // ['Romantic', 'Casual', 'Sophisticated', 'Energetic']

    // Budget
    priceRange: ['$', '$$'],

    // Features
    features: [],               // ['wifi', 'pet-friendly', 'outdoor-seating']

    // Discovery
    foodieDNA: '',              // free-form self-description for AI context

    // History (non-auth, non-AI)
    lastVisited: [],            // location IDs
    frequentSearches: [],       // search query strings
}

export const useUserPrefsStore = create(
    persist(
        (set, get) => ({
            prefs: DEFAULT_PREFS,

            // ─── Actions ─────────────────────────────────────────────────

            updatePrefs: (updates) =>
                set((state) => ({
                    prefs: { ...state.prefs, ...updates },
                })),

            addVisited: (locationId) => {
                const { lastVisited } = get().prefs
                if (lastVisited.includes(locationId)) return
                set((state) => ({
                    prefs: {
                        ...state.prefs,
                        lastVisited: [locationId, ...state.prefs.lastVisited].slice(0, 50),
                    },
                }))
            },

            addFrequentSearch: (query) => {
                if (!query?.trim()) return
                const q = query.trim()
                set((state) => {
                    const existing = state.prefs.frequentSearches.filter(s => s !== q)
                    return {
                        prefs: {
                            ...state.prefs,
                            frequentSearches: [q, ...existing].slice(0, 20),
                        },
                    }
                })
            },

            resetPrefs: () => set({ prefs: DEFAULT_PREFS }),
        }),
        {
            name: 'user-prefs-storage',
        }
    )
)
