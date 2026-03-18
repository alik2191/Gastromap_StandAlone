import { create } from 'zustand'
import { MOCK_LOCATIONS } from '@/mocks/locations'

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

    if (activeCategory && activeCategory !== 'All') {
        result = result.filter(loc => loc.category === activeCategory)
    }

    if (searchQuery) {
        const q = searchQuery.toLowerCase()
        result = result.filter(
            loc =>
                loc.title.toLowerCase().includes(q) ||
                loc.description.toLowerCase().includes(q) ||
                loc.cuisine?.toLowerCase().includes(q) ||
                loc.tags?.some(tag => tag.toLowerCase().includes(q))
        )
    }

    if (activePriceLevels?.length) {
        result = result.filter(loc => activePriceLevels.includes(loc.priceLevel))
    }

    if (minRating != null) {
        result = result.filter(loc => loc.rating >= minRating)
    }

    if (activeVibes?.length) {
        result = result.filter(loc => activeVibes.includes(loc.vibe))
    }

    // ─── Sort ────────────────────────────────────────────────────────────
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

    return result
}

export const useLocationsStore = create((set, get) => ({
    locations: MOCK_LOCATIONS,
    filteredLocations: MOCK_LOCATIONS,

    ...DEFAULT_FILTERS,

    // ─── Filter setters ───────────────────────────────────────────────────

    setCategory: (activeCategory) => {
        set({ activeCategory })
        set((state) => ({ filteredLocations: applyAllFilters(state.locations, { ...state, activeCategory }) }))
    },

    setSearchQuery: (searchQuery) => {
        set({ searchQuery })
        set((state) => ({ filteredLocations: applyAllFilters(state.locations, { ...state, searchQuery }) }))
    },

    setPriceLevels: (activePriceLevels) => {
        set({ activePriceLevels })
        set((state) => ({ filteredLocations: applyAllFilters(state.locations, { ...state, activePriceLevels }) }))
    },

    setMinRating: (minRating) => {
        set({ minRating })
        set((state) => ({ filteredLocations: applyAllFilters(state.locations, { ...state, minRating }) }))
    },

    setVibes: (activeVibes) => {
        set({ activeVibes })
        set((state) => ({ filteredLocations: applyAllFilters(state.locations, { ...state, activeVibes }) }))
    },

    setSortBy: (sortBy) => {
        set({ sortBy })
        set((state) => ({ filteredLocations: applyAllFilters(state.locations, { ...state, sortBy }) }))
    },

    /**
     * Apply multiple filter changes at once — avoids multiple re-renders.
     * @param {Partial<LocationFiltersState>} updates
     */
    applyFilters: (updates = {}) => {
        set(updates)
        set((state) => ({ filteredLocations: applyAllFilters(state.locations, state) }))
    },

    /** Reset all filters to defaults */
    resetFilters: () => {
        set({ ...DEFAULT_FILTERS })
        set((state) => ({ filteredLocations: state.locations }))
    },

    /** Derived: number of active filters (for badge on filter button) */
    get activeFilterCount() {
        const s = get()
        let count = 0
        if (s.activeCategory !== 'All') count++
        if (s.activePriceLevels.length) count++
        if (s.minRating != null) count++
        if (s.activeVibes.length) count++
        return count
    },

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
}))
