/**
 * Locations API — Supabase backend with mock fallback.
 *
 * Uses Supabase when VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY are set,
 * otherwise falls back to mock data so development works offline.
 */

import { MOCK_LOCATIONS, MOCK_CATEGORIES } from '@/mocks/locations'
import { supabase, ApiError } from './client'
import { config } from '@/shared/config/env'

const USE_SUPABASE = config.supabase.isConfigured

// ─── Shape normaliser ──────────────────────────────────────────────────────
// Supabase uses snake_case flat columns; components expect the mock shape.
function normalise(row) {
    return {
        id: row.id,
        title: row.title,
        description: row.description ?? '',
        address: row.address ?? '',
        city: row.city,
        country: row.country,
        coordinates: { lat: Number(row.lat), lng: Number(row.lng) },
        category: row.category ?? 'Other',
        cuisine: row.cuisine ?? '',
        image: row.image ?? '',
        photos: row.photos ?? [],
        rating: Number(row.rating ?? 0),
        priceLevel: row.price_level ?? '$$',
        openingHours: row.opening_hours ?? '',
        tags: row.tags ?? [],
        special_labels: row.special_labels ?? [],
        vibe: row.vibe ?? [],
        features: row.features ?? [],
        best_for: row.best_for ?? [],
        dietary: row.dietary ?? [],
        has_wifi: row.has_wifi ?? false,
        has_outdoor_seating: row.has_outdoor_seating ?? false,
        reservations_required: row.reservations_required ?? false,
        michelin_stars: row.michelin_stars ?? 0,
        michelin_bib: row.michelin_bib ?? false,
        insider_tip: row.insider_tip ?? '',
        what_to_try: row.what_to_try ?? [],
        ai_keywords: row.ai_keywords ?? [],
        ai_context: row.ai_context ?? '',
        status: row.status ?? 'active',
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    }
}

// ─── Read ──────────────────────────────────────────────────────────────────

/**
 * Fetch all locations, optionally filtered.
 * @param {Object} [filters]
 * @returns {Promise<{ data: Array, total: number, hasMore: boolean }>}
 */
export async function getLocations(filters = {}) {
    if (!USE_SUPABASE) return _mockGetLocations(filters)

    const { category, query, priceLevel, minRating, vibe, city, country, limit = 100, offset = 0 } = filters

    let q = supabase
        .from('locations')
        .select('*', { count: 'exact' })
        .eq('status', 'active')
        .order('rating', { ascending: false })
        .range(offset, offset + (limit - 1))

    if (category && category !== 'All') q = q.eq('category', category)
    if (city)    q = q.ilike('city', city)
    if (country) q = q.ilike('country', country)
    if (minRating != null) q = q.gte('rating', minRating)
    if (priceLevel?.length) q = q.in('price_level', priceLevel)
    if (vibe?.length) q = q.overlaps('vibe', vibe)

    if (query) {
        q = q.textSearch('fts', query, { config: 'english', type: 'websearch' })
    }

    const { data, error, count } = await q

    // Gracefully fall back to mock data if DB query fails
    if (error) {
        console.warn('[locations.api] Supabase query failed, using mocks:', error.message)
        return _mockGetLocations(filters)
    }

    return {
        data: (data ?? []).map(normalise),
        total: count ?? 0,
        hasMore: offset + limit < (count ?? 0),
    }
}

/**
 * Fetch a single location by ID.
 * @param {string} id
 * @returns {Promise<Object>}
 */
export async function getLocationById(id) {
    if (!USE_SUPABASE) return _mockGetById(id)

    const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('id', id)
        .single()

    if (error || !data) throw new ApiError(`Location "${id}" not found`, 404, 'LOCATION_NOT_FOUND')
    return normalise(data)
}

/**
 * Fetch all distinct categories.
 * @returns {Promise<string[]>}
 */
export async function getCategories() {
    if (!USE_SUPABASE) return MOCK_CATEGORIES

    const { data, error } = await supabase
        .from('locations')
        .select('category')
        .eq('status', 'active')
        .not('category', 'is', null)

    if (error) return MOCK_CATEGORIES
    const unique = [...new Set((data ?? []).map(r => r.category).filter(Boolean))].sort()
    return unique.length ? unique : MOCK_CATEGORIES
}

/**
 * Fetch locations near a coordinate (Haversine, client-side for now).
 * @param {{ lat: number, lng: number }} coords
 * @param {number} radiusKm
 * @returns {Promise<Array>}
 */
export async function getLocationsNearby(coords, radiusKm = 2) {
    // Fetch all then filter — replace with PostGIS when available
    const { data } = await getLocations({ limit: 500 })
    const toRad = d => (d * Math.PI) / 180
    const haversine = (a, b) => {
        const R = 6371
        const dLat = toRad(b.lat - a.lat)
        const dLng = toRad(b.lng - a.lng)
        const x = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2
        return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
    }
    return data.filter(loc => haversine(coords, loc.coordinates) <= radiusKm)
}

// ─── Write (Admin / Authenticated) ────────────────────────────────────────

/**
 * Create a new location.
 * @param {Object} data
 * @returns {Promise<Object>}
 */
export async function createLocation(data) {
    if (!USE_SUPABASE) return _mockCreate(data)

    const row = _toRow(data)
    const { data: created, error } = await supabase
        .from('locations')
        .insert(row)
        .select()
        .single()

    if (error) throw new ApiError(error.message, 500, error.code)
    return normalise(created)
}

/**
 * Update an existing location.
 * @param {string} id
 * @param {Partial<Object>} updates
 * @returns {Promise<Object>}
 */
export async function updateLocation(id, updates) {
    if (!USE_SUPABASE) return _mockUpdate(id, updates)

    const row = _toRow(updates)
    const { data, error } = await supabase
        .from('locations')
        .update(row)
        .eq('id', id)
        .select()
        .single()

    if (error) throw new ApiError(error.message, 500, error.code)
    return normalise(data)
}

/**
 * Delete a location.
 * @param {string} id
 * @returns {Promise<void>}
 */
export async function deleteLocation(id) {
    if (!USE_SUPABASE) return _mockDelete(id)

    const { error } = await supabase
        .from('locations')
        .delete()
        .eq('id', id)

    if (error) throw new ApiError(error.message, 500, error.code)
}

// ─── Shape converter (app → DB) ────────────────────────────────────────────
function _toRow(d) {
    const row = {}
    if (d.title !== undefined)       row.title = d.title
    if (d.description !== undefined) row.description = d.description
    if (d.address !== undefined)     row.address = d.address
    if (d.city !== undefined)        row.city = d.city
    if (d.country !== undefined)     row.country = d.country
    if (d.coordinates !== undefined) { row.lat = d.coordinates.lat; row.lng = d.coordinates.lng }
    if (d.category !== undefined)    row.category = d.category
    if (d.cuisine !== undefined)     row.cuisine = d.cuisine
    if (d.image !== undefined)       row.image = d.image
    if (d.photos !== undefined)      row.photos = d.photos
    if (d.rating !== undefined)      row.rating = d.rating
    if (d.priceLevel !== undefined)  row.price_level = d.priceLevel
    if (d.openingHours !== undefined) row.opening_hours = d.openingHours
    if (d.tags !== undefined)        row.tags = d.tags
    if (d.special_labels !== undefined) row.special_labels = d.special_labels
    if (d.vibe !== undefined)        row.vibe = d.vibe
    if (d.features !== undefined)    row.features = d.features
    if (d.best_for !== undefined)    row.best_for = d.best_for
    if (d.dietary !== undefined)     row.dietary = d.dietary
    if (d.has_wifi !== undefined)    row.has_wifi = d.has_wifi
    if (d.has_outdoor_seating !== undefined) row.has_outdoor_seating = d.has_outdoor_seating
    if (d.reservations_required !== undefined) row.reservations_required = d.reservations_required
    if (d.michelin_stars !== undefined) row.michelin_stars = d.michelin_stars
    if (d.michelin_bib !== undefined)   row.michelin_bib = d.michelin_bib
    if (d.insider_tip !== undefined) row.insider_tip = d.insider_tip
    if (d.what_to_try !== undefined) row.what_to_try = d.what_to_try
    if (d.ai_keywords !== undefined) row.ai_keywords = d.ai_keywords
    if (d.ai_context !== undefined)  row.ai_context = d.ai_context
    if (d.status !== undefined)      row.status = d.status
    return row
}

// ─── Mock fallbacks ────────────────────────────────────────────────────────
function _mockGetLocations(filters = {}) {
    let results = [...MOCK_LOCATIONS]
    const { category, query, priceLevel, minRating, vibe, limit, offset = 0 } = filters
    if (category && category !== 'All') results = results.filter(l => l.category === category)
    if (query) {
        const q = query.toLowerCase()
        results = results.filter(l =>
            l.title.toLowerCase().includes(q) ||
            l.description?.toLowerCase().includes(q) ||
            l.cuisine?.toLowerCase().includes(q) ||
            l.tags?.some(t => t.toLowerCase().includes(q))
        )
    }
    if (priceLevel?.length) results = results.filter(l => priceLevel.includes(l.priceLevel))
    if (minRating != null)  results = results.filter(l => l.rating >= minRating)
    if (vibe?.length)       results = results.filter(l => vibe.some(v => l.vibe?.includes(v)))
    const paginated = results.slice(offset, limit ? offset + limit : undefined)
    return Promise.resolve({ data: paginated, total: results.length, hasMore: limit ? offset + limit < results.length : false })
}

function _mockGetById(id) {
    const loc = MOCK_LOCATIONS.find(l => l.id === id)
    if (!loc) throw new ApiError(`Location "${id}" not found`, 404, 'LOCATION_NOT_FOUND')
    return Promise.resolve(loc)
}

function _mockCreate(data) {
    const loc = { ...data, id: crypto.randomUUID(), rating: 0, createdAt: new Date().toISOString() }
    MOCK_LOCATIONS.push(loc)
    return Promise.resolve(loc)
}

function _mockUpdate(id, updates) {
    const idx = MOCK_LOCATIONS.findIndex(l => l.id === id)
    if (idx === -1) throw new ApiError(`Location "${id}" not found`, 404, 'LOCATION_NOT_FOUND')
    MOCK_LOCATIONS[idx] = { ...MOCK_LOCATIONS[idx], ...updates }
    return Promise.resolve(MOCK_LOCATIONS[idx])
}

function _mockDelete(id) {
    const idx = MOCK_LOCATIONS.findIndex(l => l.id === id)
    if (idx === -1) throw new ApiError(`Location "${id}" not found`, 404, 'LOCATION_NOT_FOUND')
    MOCK_LOCATIONS.splice(idx, 1)
    return Promise.resolve()
}
