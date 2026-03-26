const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org'
const CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours

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
