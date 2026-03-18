/**
 * Locations API
 *
 * Swap mock implementations for Supabase calls without touching any component.
 * Each function is async and returns a consistent shape.
 */

import { MOCK_LOCATIONS, MOCK_CATEGORIES } from '@/mocks/locations'
import { ApiError, simulateDelay } from './client'

// ─── Types (JSDoc for IDE autocompletion without TypeScript) ───────────────
/**
 * @typedef {Object} LocationFilters
 * @property {string}   [category]    - e.g. 'Cafe', 'Restaurant'
 * @property {string}   [query]       - free-text search
 * @property {string[]} [priceLevel]  - e.g. ['$', '$$']
 * @property {number}   [minRating]   - 0–5
 * @property {string[]} [vibe]        - e.g. ['Cozy', 'Romantic']
 * @property {string}   [city]        - city slug
 * @property {string}   [country]     - country slug
 * @property {number}   [limit]       - pagination limit
 * @property {number}   [offset]      - pagination offset
 */

// ─── Read ──────────────────────────────────────────────────────────────────

/**
 * Fetch all locations, optionally filtered.
 * @param {LocationFilters} [filters]
 * @returns {Promise<Array>}
 */
export async function getLocations(filters = {}) {
    await simulateDelay(250)

    let results = [...MOCK_LOCATIONS]

    const { category, query, priceLevel, minRating, vibe, limit, offset = 0 } = filters

    if (category && category !== 'All') {
        results = results.filter(loc => loc.category === category)
    }

    if (query) {
        const q = query.toLowerCase()
        results = results.filter(
            loc =>
                loc.title.toLowerCase().includes(q) ||
                loc.description.toLowerCase().includes(q) ||
                loc.cuisine?.toLowerCase().includes(q) ||
                loc.tags?.some(tag => tag.toLowerCase().includes(q))
        )
    }

    if (priceLevel?.length) {
        results = results.filter(loc => priceLevel.includes(loc.priceLevel))
    }

    if (minRating != null) {
        results = results.filter(loc => loc.rating >= minRating)
    }

    if (vibe?.length) {
        results = results.filter(loc => vibe.includes(loc.vibe))
    }

    const paginated = results.slice(offset, limit ? offset + limit : undefined)

    return {
        data: paginated,
        total: results.length,
        hasMore: limit ? offset + limit < results.length : false,
    }
}

/**
 * Fetch a single location by ID.
 * @param {string} id
 * @returns {Promise<Object>}
 */
export async function getLocationById(id) {
    await simulateDelay(150)
    const location = MOCK_LOCATIONS.find(loc => loc.id === id)
    if (!location) {
        throw new ApiError(`Location "${id}" not found`, 404, 'LOCATION_NOT_FOUND')
    }
    return location
}

/**
 * Fetch all available categories.
 * @returns {Promise<string[]>}
 */
export async function getCategories() {
    await simulateDelay(50)
    return MOCK_CATEGORIES
}

/**
 * Fetch locations near a coordinate.
 * @param {{ lat: number, lng: number }} coords
 * @param {number} radiusKm
 * @returns {Promise<Array>}
 */
export async function getLocationsNearby(coords, radiusKm = 2) {
    await simulateDelay(300)

    const toRad = deg => (deg * Math.PI) / 180
    const haversine = (a, b) => {
        const R = 6371
        const dLat = toRad(b.lat - a.lat)
        const dLng = toRad(b.lng - a.lng)
        const x =
            Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2
        return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
    }

    return MOCK_LOCATIONS.filter(
        loc => haversine(coords, loc.coordinates) <= radiusKm
    )
}

// ─── Write (Admin / Authenticated) ────────────────────────────────────────

/**
 * Create a new location.
 * @param {Object} data
 * @returns {Promise<Object>}
 */
export async function createLocation(data) {
    await simulateDelay(400)
    // TODO: replace with supabase.from('locations').insert(data)
    const newLocation = {
        ...data,
        id: Math.random().toString(36).slice(2, 11),
        rating: 0,
        createdAt: new Date().toISOString(),
    }
    MOCK_LOCATIONS.push(newLocation)
    return newLocation
}

/**
 * Update an existing location.
 * @param {string} id
 * @param {Partial<Object>} updates
 * @returns {Promise<Object>}
 */
export async function updateLocation(id, updates) {
    await simulateDelay(350)
    const idx = MOCK_LOCATIONS.findIndex(loc => loc.id === id)
    if (idx === -1) {
        throw new ApiError(`Location "${id}" not found`, 404, 'LOCATION_NOT_FOUND')
    }
    MOCK_LOCATIONS[idx] = { ...MOCK_LOCATIONS[idx], ...updates }
    return MOCK_LOCATIONS[idx]
}

/**
 * Delete a location.
 * @param {string} id
 * @returns {Promise<void>}
 */
export async function deleteLocation(id) {
    await simulateDelay(300)
    const idx = MOCK_LOCATIONS.findIndex(loc => loc.id === id)
    if (idx === -1) {
        throw new ApiError(`Location "${id}" not found`, 404, 'LOCATION_NOT_FOUND')
    }
    MOCK_LOCATIONS.splice(idx, 1)
}
