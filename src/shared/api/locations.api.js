/**
 * Locations API — Supabase backend with auto-translation.
 *
 * Uses Supabase when VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY are set,
 * otherwise falls back to mock data so development works offline.
 * 
 * Auto-translation: When creating/updating locations, data is automatically
 * translated to all supported languages (EN, PL, UK, RU).
 */

import { MOCK_LOCATIONS, MOCK_CATEGORIES } from '@/mocks/locations'
import { supabase, ApiError } from './client'
import { config } from '@/shared/config/env'
import { 
    processLocationTranslations, 
    saveTranslations,
    getTranslations 
} from './translation.api'

const USE_SUPABASE = config.supabase.isConfigured
const AUTO_TRANSLATE = config.ai.isOpenRouterConfigured

// ─── Shape normaliser ──────────────────────────────────────────────────────
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

export async function getLocation(id) {
    if (!USE_SUPABASE) return _mockGetLocation(id)

    const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('id', id)
        .eq('status', 'active')
        .single()

    if (error) {
        console.warn('[locations.api] Supabase query failed, using mocks:', error.message)
        return _mockGetLocation(id)
    }

    return normalise(data)
}

// ─── Create with Auto-Translation ──────────────────────────────────────────

/**
 * Create location with automatic translation
 * @param {Object} data - Location data
 * @param {boolean} enableTranslation - Enable auto-translation (default: true if AI configured)
 * @returns {Promise<Object>} Created location with translations
 */
export async function createLocation(data, enableTranslation = AUTO_TRANSLATE) {
    if (!USE_SUPABASE) return _mockCreate(data)

    let locationData = { ...data }
    let translations = null
    
    // Auto-translate before saving
    if (enableTranslation && config.ai.isOpenRouterConfigured) {
        console.log('[locations.api] Auto-translating location...')
        
        try {
            const result = await processLocationTranslations(data, true)
            locationData = result
            translations = result.translations
        } catch (error) {
            console.error('[locations.api] Auto-translation failed, saving without translations:', error)
            // Continue without translations (non-blocking)
        }
    }

    const row = _toRow(locationData)
    const { data: created, error } = await supabase
        .from('locations')
        .insert(row)
        .select()
        .single()

    if (error) throw new ApiError(error.message, 500, error.code)
    
    // Save translations separately
    if (translations) {
        try {
            await saveTranslations(created.id, translations)
        } catch (error) {
            console.error('[locations.api] Failed to save translations:', error)
            // Non-blocking, continue
        }
    }
    
    return normalise(created)
}

// ─── Update with Auto-Translation ──────────────────────────────────────────

/**
 * Update location with automatic translation
 * @param {string} id - Location ID
 * @param {Object} updates - Updated fields
 * @param {boolean} enableTranslation - Enable auto-translation (default: true if AI configured)
 * @returns {Promise<Object>} Updated location
 */
export async function updateLocation(id, updates, enableTranslation = AUTO_TRANSLATE) {
    if (!USE_SUPABASE) return _mockUpdate(id, updates)

    let locationData = { ...updates }
    let translations = null
    
    // Auto-translate if translatable fields changed
    if (enableTranslation && config.ai.isOpenRouterConfigured) {
        const translatableFields = ['title', 'description', 'address', 'insider_tip', 'what_to_try', 'ai_context']
        const hasTranslatableField = translatableFields.some(field => updates[field] !== undefined)
        
        if (hasTranslatableField) {
            console.log('[locations.api] Auto-translating updated fields...')
            
            try {
                // Get current location first
                const current = await getLocation(id)
                const merged = { ...current, ...updates }
                
                const result = await processLocationTranslations(merged, true)
                locationData = result
                translations = result.translations
            } catch (error) {
                console.error('[locations.api] Auto-translation failed:', error)
                // Continue without translations
            }
        }
    }

    const row = _toRow(locationData)
    const { data: updated, error } = await supabase
        .from('locations')
        .update(row)
        .eq('id', id)
        .select()
        .single()

    if (error) throw new ApiError(error.message, 500, error.code)
    
    // Update translations
    if (translations) {
        try {
            await saveTranslations(updated.id, translations)
        } catch (error) {
            console.error('[locations.api] Failed to save translations:', error)
        }
    }
    
    return normalise(updated)
}

// ─── Delete ────────────────────────────────────────────────────────────────

export async function deleteLocation(id) {
    if (!USE_SUPABASE) return _mockDelete(id)

    const { error } = await supabase
        .from('locations')
        .delete()
        .eq('id', id)

    if (error) throw new ApiError(error.message, 500, error.code)
}

// ─── Get with Translation ──────────────────────────────────────────────────

/**
 * Get location with translations for specific language
 * @param {string} id - Location ID
 * @param {string} lang - Language code (en, pl, uk, ru)
 * @returns {Promise<Object>} Location with translated fields
 */
export async function getLocationTranslated(id, lang = 'en') {
    if (!USE_SUPABASE) {
        return _mockGetLocation(id)
    }

    // Get location
    const location = await getLocation(id)
    if (!location) return null

    // Get translations
    const translations = await getTranslations(id)
    
    if (translations && translations[lang]) {
        // Merge translations with original data
        return {
            ...location,
            ...translations[lang],
            isTranslated: true,
            translatedTo: lang
        }
    }
    
    return location
}

// ─── Shape converter (app → DB) ────────────────────────────────────────────

function _toRow(d) {
    const row = {}
    if (d.title !== undefined)       row.title = d.title
    if (d.description !== undefined) row.description = d.description
    if (d.address !== undefined)     row.address = d.address
    if (d.city !== undefined)        row.city = d.city
    if (d.country !== undefined)     row.country = d.country
    if (d.lat !== undefined)         row.lat = d.lat
    if (d.lng !== undefined)         row.lng = d.lng
    if (d.category !== undefined)    row.category = d.category
    if (d.cuisine !== undefined)     row.cuisine = d.cuisine
    if (d.image !== undefined)       row.image = d.image
    if (d.photos !== undefined)      row.photos = d.photos
    if (d.rating !== undefined)      row.rating = d.rating
    if (d.priceLevel !== undefined)  row.price_level = d.priceLevel
    if (d.openingHours !== undefined) row.opening_hours = d.openingHours
    if (d.tags !== undefined)        row.tags = d.tags
    if (d.vibe !== undefined)        row.vibe = d.vibe
    if (d.features !== undefined)    row.features = d.features
    if (d.best_for !== undefined)    row.best_for = d.best_for
    if (d.dietary !== undefined)     row.dietary = d.dietary
    if (d.has_wifi !== undefined)    row.has_wifi = d.has_wifi
    if (d.has_outdoor_seating !== undefined) row.has_outdoor_seating = d.has_outdoor_seating
    if (d.reservations_required !== undefined) row.reservations_required = d.reservations_required
    if (d.michelin_stars !== undefined) row.michelin_stars = d.michelin_stars
    if (d.michelin_bib !== undefined) row.michelin_bib = d.michelin_bib
    if (d.insider_tip !== undefined) row.insider_tip = d.insider_tip
    if (d.what_to_try !== undefined) row.what_to_try = d.what_to_try
    if (d.ai_keywords !== undefined) row.ai_keywords = d.ai_keywords
    if (d.ai_context !== undefined)  row.ai_context = d.ai_context
    if (d.status !== undefined)      row.status = d.status
    return row
}

// ─── Mock fallbacks ────────────────────────────────────────────────────────

function _mockGetLocations(filters = {}) {
    let filtered = [...MOCK_LOCATIONS]
    if (filters.category && filters.category !== 'All') {
        filtered = filtered.filter(l => l.category === filters.category)
    }
    if (filters.city) {
        filtered = filtered.filter(l => l.city.toLowerCase().includes(filters.city.toLowerCase()))
    }
    if (filters.country) {
        filtered = filtered.filter(l => l.country.toLowerCase().includes(filters.country.toLowerCase()))
    }
    if (filters.minRating != null) {
        filtered = filtered.filter(l => l.rating >= filters.minRating)
    }
    if (filters.priceLevel?.length) {
        filtered = filtered.filter(l => filters.priceLevel.includes(l.priceLevel))
    }
    return {
        data: filtered,
        total: filtered.length,
        hasMore: false,
    }
}

function _mockGetLocation(id) {
    return MOCK_LOCATIONS.find(l => l.id === id) || null
}

function _mockCreate(data) {
    const newLocation = {
        ...data,
        id: `mock_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    }
    MOCK_LOCATIONS.push(newLocation)
    return newLocation
}

function _mockUpdate(id, updates) {
    const index = MOCK_LOCATIONS.findIndex(l => l.id === id)
    if (index === -1) return null
    MOCK_LOCATIONS[index] = { ...MOCK_LOCATIONS[index], ...updates, updatedAt: new Date().toISOString() }
    return MOCK_LOCATIONS[index]
}

function _mockDelete(id) {
    const index = MOCK_LOCATIONS.findIndex(l => l.id === id)
    if (index !== -1) MOCK_LOCATIONS.splice(index, 1)
}

export default {
    getLocations,
    getLocation,
    getLocationTranslated,
    createLocation,
    updateLocation,
    deleteLocation,
}
