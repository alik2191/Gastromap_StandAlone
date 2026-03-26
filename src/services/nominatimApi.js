const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org'
const CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours

// ─── City photo pool (deterministic: same city name → same photo) ────────────
const CITY_PHOTOS = [
    'photo-1519197924294-4ba991a11128',
    'photo-1502602898657-3e91760cbb34',
    'photo-1543783207-ec64e4d95325',
    'photo-1467269204594-9661b134dd2b',
    'photo-1477959858617-67f85cf4f1df',
    'photo-1480714378408-67cf0d13bc1b',
    'photo-1534430480872-3498386e7856',
    'photo-1522083165195-3424ed129620',
    'photo-1449824913935-59a10b8d2000',
    'photo-1444723121867-7a241cacace9',
]

function hashStr(str) {
    let h = 0
    for (let i = 0; i < str.length; i++) h = Math.imul(31, h) + str.charCodeAt(i) | 0
    return Math.abs(h)
}

/** Get a deterministic Unsplash city photo URL based on city name */
export function getCityImage(cityName) {
    const photo = CITY_PHOTOS[hashStr((cityName || '').toLowerCase()) % CITY_PHOTOS.length]
    return `https://images.unsplash.com/${photo}?q=80&w=1200&auto=format&fit=crop`
}

/**
 * Geocode a city+country pair to bounding box + center coordinates.
 * Uses localStorage to cache results for 24 hours (respects Nominatim ToS).
 *
 * @param {string} city
 * @param {string} country
 * @returns {{ lat: number, lon: number, boundingbox: [south, north, west, east], display_name: string }}
 */
export async function geocodeCity(city, country) {
    const cacheKey = `nominatim:${city.toLowerCase()}:${country.toLowerCase()}`
    try {
        const cached = localStorage.getItem(cacheKey)
        if (cached) {
            const { data, timestamp } = JSON.parse(cached)
            if (Date.now() - timestamp < CACHE_TTL) return data
        }
    } catch {
        // ignore localStorage errors
    }

    const params = new URLSearchParams({
        city,
        country,
        format: 'json',
        limit: '1',
        addressdetails: '1',
    })

    const res = await fetch(`${NOMINATIM_BASE}/search?${params}`, {
        headers: {
            'Accept-Language': 'en',
            'User-Agent': 'GastroMap/2.0 (gastromap.app)',
        },
    })

    if (!res.ok) throw new Error(`Nominatim error: ${res.status}`)

    const results = await res.json()
    if (!results.length) throw new Error(`City not found: ${city}, ${country}`)

    const { boundingbox, lat, lon, display_name } = results[0]
    const data = {
        lat: parseFloat(lat),
        lon: parseFloat(lon),
        // Nominatim returns [south, north, west, east] as strings
        boundingbox: boundingbox.map(parseFloat),
        display_name,
    }

    try {
        localStorage.setItem(cacheKey, JSON.stringify({ data, timestamp: Date.now() }))
    } catch {
        // ignore quota errors
    }

    return data
}

/**
 * Fetch a list of cities for a given country via Nominatim.
 * Cached for 24 hours. Returns an array of { name, lat, lon, image }.
 *
 * @param {string} country  e.g. "poland"
 * @returns {Promise<Array<{ name: string, lat: number, lon: number, image: string }>>}
 */
export async function getCitiesForCountry(country) {
    const cacheKey = `nominatim:cities:${country.toLowerCase()}`
    try {
        const cached = localStorage.getItem(cacheKey)
        if (cached) {
            const { data, timestamp } = JSON.parse(cached)
            if (Date.now() - timestamp < CACHE_TTL) return data
        }
    } catch {
        // ignore
    }

    const params = new URLSearchParams({
        country,
        featuretype: 'city',
        format: 'json',
        limit: '15',
        addressdetails: '1',
    })

    const res = await fetch(`${NOMINATIM_BASE}/search?${params}`, {
        headers: {
            'Accept-Language': 'en',
            'User-Agent': 'GastroMap/2.0 (gastromap.app)',
        },
    })

    if (!res.ok) throw new Error(`Nominatim cities error: ${res.status}`)

    const results = await res.json()

    const seen = new Set()
    const cities = results
        .filter(r => r.name && r.lat && r.lon)
        .map(r => ({
            name: r.name,
            lat: parseFloat(r.lat),
            lon: parseFloat(r.lon),
            image: getCityImage(r.name),
        }))
        .filter(c => {
            if (seen.has(c.name)) return false
            seen.add(c.name)
            return true
        })

    try {
        localStorage.setItem(cacheKey, JSON.stringify({ data: cities, timestamp: Date.now() }))
    } catch {
        // ignore quota errors
    }

    return cities
}
