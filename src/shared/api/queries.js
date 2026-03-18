/**
 * React Query hooks — the only way components should fetch data.
 *
 * Naming convention:
 *   useLocations()          → list
 *   useLocation(id)         → single item
 *   useLocationsNearby()    → geo-filtered list
 *   useCategories()         → reference data
 *
 * Mutation hooks follow the pattern: use<Verb><Entity>Mutation
 */

import {
    useQuery,
    useMutation,
    useInfiniteQuery,
    useQueryClient,
} from '@tanstack/react-query'

import {
    getLocations,
    getLocationById,
    getCategories,
    getLocationsNearby,
    createLocation,
    updateLocation,
    deleteLocation,
} from './locations.api'

import { analyzeQuery } from './ai.api'

// ─── Query Keys (centralised to avoid string typos) ───────────────────────
export const queryKeys = {
    locations: {
        all: ['locations'],
        filtered: (filters) => ['locations', 'filtered', filters],
        detail: (id) => ['locations', 'detail', id],
        nearby: (coords) => ['locations', 'nearby', coords],
    },
    categories: ['categories'],
    ai: {
        query: (message) => ['ai', 'query', message],
    },
}

// ─── Location Queries ──────────────────────────────────────────────────────

/**
 * Fetch filtered locations list.
 * @param {import('./locations.api').LocationFilters} filters
 */
export function useLocations(filters = {}) {
    return useQuery({
        queryKey: queryKeys.locations.filtered(filters),
        queryFn: () => getLocations(filters),
    })
}

/**
 * Infinite scroll / pagination variant.
 * @param {import('./locations.api').LocationFilters} filters
 */
export function useInfiniteLocations(filters = {}) {
    return useInfiniteQuery({
        queryKey: [...queryKeys.locations.filtered(filters), 'infinite'],
        queryFn: ({ pageParam = 0 }) =>
            getLocations({ ...filters, limit: 10, offset: pageParam }),
        getNextPageParam: (lastPage, pages) =>
            lastPage.hasMore ? pages.length * 10 : undefined,
        initialPageParam: 0,
    })
}

/**
 * Fetch a single location by ID.
 * @param {string|null} id
 */
export function useLocation(id) {
    return useQuery({
        queryKey: queryKeys.locations.detail(id),
        queryFn: () => getLocationById(id),
        enabled: Boolean(id),
    })
}

/**
 * Fetch categories list.
 */
export function useCategories() {
    return useQuery({
        queryKey: queryKeys.categories,
        queryFn: getCategories,
        staleTime: Infinity, // categories rarely change
    })
}

/**
 * Fetch locations near given coordinates.
 * @param {{ lat: number, lng: number }|null} coords
 * @param {number} radiusKm
 */
export function useLocationsNearby(coords, radiusKm = 2) {
    return useQuery({
        queryKey: queryKeys.locations.nearby(coords),
        queryFn: () => getLocationsNearby(coords, radiusKm),
        enabled: Boolean(coords?.lat && coords?.lng),
    })
}

// ─── Location Mutations ────────────────────────────────────────────────────

export function useCreateLocationMutation() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: createLocation,
        onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.locations.all }),
    })
}

export function useUpdateLocationMutation() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ id, updates }) => updateLocation(id, updates),
        onSuccess: (_data, { id }) => {
            qc.invalidateQueries({ queryKey: queryKeys.locations.all })
            qc.invalidateQueries({ queryKey: queryKeys.locations.detail(id) })
        },
    })
}

export function useDeleteLocationMutation() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: deleteLocation,
        onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.locations.all }),
    })
}

// ─── AI Query ─────────────────────────────────────────────────────────────

/**
 * One-shot AI query (not cached between sessions intentionally).
 */
export function useAIQueryMutation() {
    return useMutation({
        mutationFn: ({ message, context }) => analyzeQuery(message, context),
    })
}
