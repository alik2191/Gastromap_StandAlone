import { create } from 'zustand'
import { MOCK_LOCATIONS } from '@/mocks/locations'
import { getLocations } from '@/shared/api/locations.api'

/**
 * useLocationsStore — client-side filter state for the locations list.
 *
 * This store manages UI filter state only (active filters, search query).
 * The actual data fetching is done by React Query hooks in @/shared/api/queries.js.
 *
 * For components that need the full filtered dataset without React Query
 * (e.g. map markers, quick counts), the store also caches filteredLocations.
 *
 * @typedef {Object} LocationFiltersState
 * @property {string}   activeCategory
 * @property {string}   searchQuery
 * @property {string[]} activePriceLevels   - e.g. ['$', '$$']
 * @property {number|null} minRating        - 0–5
 * @property {string[]} activeVibes         - e.g. ['Romantic', 'Casual']
 * @property {'rating'|'price_asc'|'price_desc'|'name'} sortBy
 */

const DEFAULT_FILTERS = {
    activeCategory: 'All',
    searchQuery: '',
    activePriceLevels: [],
    minRating: null,
    activeVibes: [],
    sortBy: 'rating',
}

/** Compare price levels for sort: $ < $$ < $$$ */
const PRICE_ORDER = { '$': 1, '$$': 2, '$$$': 3 }

// ─── Hybrid Scoring ───────────────────────────────────────────────────────
//
// For each query token we score each location across multiple fields
// with different weights, then sort by descending score.
//
// Weights (tweak as needed):
//   title          × 10  — exact match in name is most relevant
//   tags           × 6   — structured, human-curated
//   cuisine        × 5   — explicit cuisine match
//   ai_keywords    × 5   — hidden semantic keywords from AI enrichment
//   what_to_try    × 4   — dish names — very specific
//   vibe           × 4   — atmosphere
//   features       × 3   — amenities
//   best_for       × 3   — occasions
//   insider_tip    × 2   — rich text, lower weight
//   description    × 2   — general description
//   ai_context     × 1   — longest field, broadest — useful but noisy
//   city/address   × 2   — location match
//
// A location must score > 0 on ALL tokens (AND semantics) to be included.
// If no tokens match anywhere (score = 0), the location is excluded.

const SEARCH_FIELDS = [
    { key: 'title',       weight: 10, type: 'string'  },
    { key: 'tags',        weight: 6,  type: 'array'   },
    { key: 'cuisine',     weight: 5,  type: 'string'  },
    { key: 'ai_keywords', weight: 5,  type: 'array'   },
    { key: 'what_to_try', weight: 4,  type: 'array'   },
    { key: 'vibe',        weight: 4,  type: 'array'   },
    { key: 'features',    weight: 3,  type: 'array'   },
    { key: 'best_for',    weight: 3,  type: 'array'   },
    { key: 'insider_tip', weight: 2,  type: 'string'  },
    { key: 'description', weight: 2,  type: 'string'  },
    { key: 'city',        weight: 2,  type: 'string'  },
    { key: 'address',     weight: 2,  type: 'string'  },
    { key: 'dietary',     weight: 4,  type: 'array'   },
    { key: 'ai_context',  weight: 1,  type: 'string'  },
]

/**
 * Score a single location against a single query token.
 * Returns 0 if the token is not found anywhere.
 */
function scoreLocation(loc, token) {
    let score = 0
    for (const field of SEARCH_FIELDS) {
        const value = loc[field.key]
        if (!value) continue

        if (field.type === 'string') {
            if (value.toLowerCase().includes(token)) {
                // Bonus for exact word boundary match (not just substring)
                const isWordMatch = new RegExp(`\\b${token}\\b`).test(value.toLowerCase())
                score += field.weight * (isWordMatch ? 1.5 : 1)
            }
        } else if (field.type === 'array') {
            const arr = Array.isArray(value) ? value : [value]
            for (const item of arr) {
                if (typeof item === 'string' && item.toLowerCase().includes(token)) {
                    const isWordMatch = new RegExp(`\\b${token}\\b`).test(item.toLowerCase())
                    score += field.weight * (isWordMatch ? 1.5 : 1)
                    break // Count each field once per token
                }
            }
        }
    }
    return score
}

/**
 * Compute total relevance score for a location against a multi-word query.
 * Uses AND logic: ALL tokens must match somewhere (score > 0 for each token).
 * Final score = sum of per-token scores (higher = more relevant).
 *
 * @param {Object} loc      - location object
 * @param {string[]} tokens - lowercase query tokens
 * @returns {number}  0 = no match, >0 = relevance score
 */
function computeRelevanceScore(loc, tokens) {
    let totalScore = 0
    for (const token of tokens) {
        const tokenScore = scoreLocation(loc, token)
        if (tokenScore === 0) return 0  // AND: all tokens required
        totalScore += tokenScore
    }
    return totalScore
}

/**
 * Tokenise a search query into meaningful tokens.
 * Filters out common stop words and very short tokens.
 */
const STOP_WORDS = new Set(['a', 'an', 'the', 'and', 'or', 'for', 'in', 'at', 'to', 'of', 'с', 'в', 'и', 'на', 'для', 'по'])

function tokenise(query) {
    return query
        .toLowerCase()
        .split(/[\s,;/]+/)
        .map(t => t.replace(/[^a-zа-яёА-ЯЁ0-9]/g, ''))
        .filter(t => t.length >= 2 && !STOP_WORDS.has(t))
}

// ─── Main filter function ─────────────────────────────────────────────────

function applyAllFilters(locations, filters) {
    const {
        activeCategory,
        searchQuery,
        activePriceLevels,
        minRating,
        activeVibes,
        sortBy,
    } = filters

    let result = [...locations]

    // ── 1. Category filter ────────────────────────────────────────────────
    if (activeCategory && activeCategory !== 'All') {
        result = result.filter(loc => loc.category === activeCategory)
    }

    // ── 2. Hybrid search with relevance scoring ───────────────────────────
    if (searchQuery?.trim()) {
        const tokens = tokenise(searchQuery)

        if (tokens.length > 0) {
            // Score every location
            const scored = result
                .map(loc => ({ loc, score: computeRelevanceScore(loc, tokens) }))
                .filter(({ score }) => score > 0)

            // Sort by descending relevance score
            // (will be overridden by sortBy below unless sortBy === 'rating')
            scored.sort((a, b) => b.score - a.score)
            result = scored.map(({ loc }) => loc)
        } else {
            // Query was all stop words / too short — fall back to simple title match
            const q = searchQuery.toLowerCase()
            result = result.filter(loc => loc.title?.toLowerCase().includes(q))
        }
    }

    // ── 3. Price level filter ─────────────────────────────────────────────
    if (activePriceLevels?.length) {
        result = result.filter(loc => activePriceLevels.includes(loc.priceLevel))
    }

    // ── 4. Rating filter ──────────────────────────────────────────────────
    if (minRating != null) {
        result = result.filter(loc => loc.rating >= minRating)
    }

    // ── 5. Vibe filter ────────────────────────────────────────────────────
    if (activeVibes?.length) {
        result = result.filter(loc => {
            const locVibes = Array.isArray(loc.vibe) ? loc.vibe : [loc.vibe]
            return activeVibes.some(v =>
                locVibes.some(lv => lv?.toLowerCase() === v.toLowerCase())
            )
        })
    }

    // ── 6. Sort ───────────────────────────────────────────────────────────
    // When there's a search query, we already sorted by relevance above.
    // Only apply sortBy if no search query (or sortBy is explicitly non-default).
    if (!searchQuery?.trim() || sortBy !== 'rating') {
        switch (sortBy) {
            case 'rating':
                result.sort((a, b) => b.rating - a.rating)
                break
            case 'price_asc':
                result.sort(
                    (a, b) => (PRICE_ORDER[a.priceLevel] ?? 0) - (PRICE_ORDER[b.priceLevel] ?? 0)
                )
                break
            case 'price_desc':
                result.sort(
                    (a, b) => (PRICE_ORDER[b.priceLevel] ?? 0) - (PRICE_ORDER[a.priceLevel] ?? 0)
                )
                break
            case 'name':
                result.sort((a, b) => a.title.localeCompare(b.title))
                break
            default:
                break
        }
    }

    return result
}

export const useLocationsStore = create((set, get) => ({
    locations: MOCK_LOCATIONS,
    filteredLocations: MOCK_LOCATIONS,
    isLoading: false,

    ...DEFAULT_FILTERS,

    // ─── Filter setters ───────────────────────────────────────────────────

    setCategory: (activeCategory) =>
        set(state => ({
            activeCategory,
            filteredLocations: applyAllFilters(state.locations, { ...state, activeCategory }),
        })),

    setSearchQuery: (searchQuery) =>
        set(state => ({
            searchQuery,
            filteredLocations: applyAllFilters(state.locations, { ...state, searchQuery }),
        })),

    setPriceLevels: (activePriceLevels) =>
        set(state => ({
            activePriceLevels,
            filteredLocations: applyAllFilters(state.locations, { ...state, activePriceLevels }),
        })),

    setMinRating: (minRating) =>
        set(state => ({
            minRating,
            filteredLocations: applyAllFilters(state.locations, { ...state, minRating }),
        })),

    setVibes: (activeVibes) =>
        set(state => ({
            activeVibes,
            filteredLocations: applyAllFilters(state.locations, { ...state, activeVibes }),
        })),

    setSortBy: (sortBy) =>
        set(state => ({
            sortBy,
            filteredLocations: applyAllFilters(state.locations, { ...state, sortBy }),
        })),

    /**
     * Apply multiple filter changes at once — single set() call, one re-render.
     * @param {Partial<LocationFiltersState>} updates
     */
    applyFilters: (updates = {}) =>
        set(state => {
            const next = { ...state, ...updates }
            return { ...updates, filteredLocations: applyAllFilters(state.locations, next) }
        }),

    /** Reset all filters to defaults — single re-render */
    resetFilters: () =>
        set(state => ({
            ...DEFAULT_FILTERS,
            filteredLocations: state.locations,
        })),

    // ─── Data mutations (used by Admin) ──────────────────────────────────

    setLocations: (locations) =>
        set((state) => ({
            locations,
            filteredLocations: applyAllFilters(locations, state),
        })),

    addLocation: (location) =>
        set((state) => {
            const locations = [
                ...state.locations,
                { ...location, id: Math.random().toString(36).slice(2, 11) },
            ]
            return { locations, filteredLocations: applyAllFilters(locations, state) }
        }),

    updateLocation: (id, updates) =>
        set((state) => {
            const locations = state.locations.map(loc =>
                loc.id === id ? { ...loc, ...updates } : loc
            )
            return { locations, filteredLocations: applyAllFilters(locations, state) }
        }),

    deleteLocation: (id) =>
        set((state) => {
            const locations = state.locations.filter(loc => loc.id !== id)
            return { locations, filteredLocations: applyAllFilters(locations, state) }
        }),

    /** Load all locations from Supabase (or mocks) and populate the store. */
    initialize: async () => {
        if (get().isLoading) return
        set({ isLoading: true })
        try {
            const { data } = await getLocations({ limit: 500 })
            if (data?.length) {
                set((state) => ({
                    locations: data,
                    filteredLocations: applyAllFilters(data, state),
                    isLoading: false,
                }))
            } else {
                set({ isLoading: false })
            }
        } catch {
            set({ isLoading: false })
        }
    },
}))
