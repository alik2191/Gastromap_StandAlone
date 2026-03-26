const OVERPASS_URL = 'https://overpass-api.de/api/interpreter'

// ─── Unsplash photo pools per category ──────────────────────────────────────
// Fixed IDs → deterministic images (same place = same photo on every load)
const PHOTO_POOLS = {
    Restaurant: [
        'photo-1517248135467-4c7edcad34c4',
        'photo-1555396273-367ea4eb4db5',
        'photo-1414235077428-338989a2e8c0',
        'photo-1424847651672-bf20a4b0982b',
        'photo-1466978913421-dad2ebd01d17',
        'photo-1544148103-0773bf10d330',
    ],
    Cafe: [
        'photo-1554118811-1e0d58224f24',
        'photo-1495474472287-4d71bcdd2085',
        'photo-1501339847302-ac426a4a7cbb',
        'photo-1442975631115-c4f7b05b8a2c',
        'photo-1509042239860-f550ce710b93',
    ],
    Bar: [
        'photo-1514362545857-3bc16c4c7d1b',
        'photo-1470337458703-46ad1756a187',
        'photo-1559526323-cb2f2fe2591b',
        'photo-1572116469696-31de0f17cc34',
    ],
    'Street Food': [
        'photo-1504674900247-0877df9cc836',
        'photo-1476224203421-9ac39bcb3327',
        'photo-1455619452474-d2be8b1e70cd',
        'photo-1547592180-85f173990554',
    ],
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Simple non-negative integer hash for deterministic photo selection */
function hashId(str) {
    let h = 0
    for (let i = 0; i < str.length; i++) {
        h = Math.imul(31, h) + str.charCodeAt(i) | 0
    }
    return Math.abs(h)
}

function getImage(id, category) {
    const pool = PHOTO_POOLS[category] ?? PHOTO_POOLS.Restaurant
    const photo = pool[hashId(id) % pool.length]
    return `https://images.unsplash.com/${photo}?q=80&w=1000&auto=format&fit=crop`
}

function mapAmenityToCategory(amenity) {
    switch (amenity) {
        case 'restaurant':  return 'Restaurant'
        case 'cafe':        return 'Cafe'
        case 'bar':
        case 'pub':         return 'Bar'
        case 'fast_food':
        case 'food_court':  return 'Street Food'
        default:            return 'Restaurant'
    }
}

function mapPriceLevel(tags, category) {
    const raw = tags?.['price_level'] ?? tags?.['payment:cash']
    if (raw && /^[1-3]$/.test(raw)) {
        return ['$', '$$', '$$$'][parseInt(raw) - 1]
    }
    if (category === 'Street Food') return '$'
    if (category === 'Bar')         return '$$'
    return '$$'
}

function mapVibe(category, cuisine) {
    if (category === 'Bar') return 'Energetic'
    if (category === 'Cafe') return 'Casual'
    const c = (cuisine || '').toLowerCase()
    if (c.includes('french') || c.includes('italian') || c.includes('japanese')) return 'Romantic'
    return 'Casual'
}

function parseOpeningHours(oh) {
    if (!oh) return null
    if (oh.includes('24/7')) return '24/7'
    return oh
}

function capitalize(str) {
    if (!str) return str
    return str.charAt(0).toUpperCase() + str.slice(1)
}

// ─── Transform a single OSM element to app location format ──────────────────

function transformElement(element) {
    const tags = element.tags || {}
    const name = tags.name
    if (!name) return null // skip unnamed places

    const id = `osm_${element.id}`
    const category = mapAmenityToCategory(tags.amenity)
    const cuisine = capitalize(tags.cuisine?.split(';')[0]?.trim() ?? null)

    const lat = element.lat ?? element.center?.lat
    const lon = element.lon ?? element.center?.lon
    if (!lat || !lon) return null

    const addrStreet = [tags['addr:street'], tags['addr:housenumber']].filter(Boolean).join(' ')
    const addrCity = tags['addr:city'] ?? tags['addr:suburb'] ?? null
    const address = addrStreet
        ? addrStreet + (addrCity ? `, ${addrCity}` : '')
        : (addrCity ?? 'Address not available')

    // Pseudo-rating: use OSM stars tag if present, otherwise hash-based 3.5–4.9
    const rating = tags['stars']
        ? Math.min(parseFloat(tags['stars']), 5)
        : Math.round((3.5 + (hashId(id) % 15) / 10) * 10) / 10

    const features = []
    if (tags.outdoor_seating === 'yes')     features.push('Outdoor Seating')
    if (tags.wheelchair === 'yes')          features.push('Wheelchair Access')
    if (tags.takeaway === 'yes')            features.push('Takeaway')
    if (tags.delivery === 'yes')            features.push('Delivery')
    if (tags.internet_access === 'wlan')    features.push('WiFi')
    if (tags['diet:vegan'] === 'yes')       features.push('Vegan Menu')
    if (tags['diet:vegetarian'] === 'yes')  features.push('Vegetarian Options')

    const special_labels = []
    if (tags.michelin_stars || tags['stars:michelin']) special_labels.push('Michelin Star')
    if (tags['diet:vegan'] === 'yes')                  special_labels.push('Vegan Menu')
    if (tags.organic === 'yes')                        special_labels.push('Organic')
    if (tags.takeaway === 'yes')                       special_labels.push('Takeaway Available')

    const tagsList = [cuisine, ...features.slice(0, 2)].filter(Boolean)

    const description =
        tags.description ??
        (
            [
                cuisine ? `${cuisine} cuisine` : null,
                category !== 'Restaurant' ? category : null,
                addrCity ? `in ${addrCity}` : null,
            ].filter(Boolean).join(', ') ||
            `A ${category.toLowerCase()} in the city.`
        )

    return {
        id,
        title: name,
        description,
        address,
        coordinates: { lat, lng: lon },
        category,
        cuisine: cuisine || null,
        image: getImage(id, category),
        rating,
        tags: tagsList,
        special_labels,
        openingHours: parseOpeningHours(tags.opening_hours),
        priceLevel: mapPriceLevel(tags, category),
        vibe: mapVibe(category, cuisine),
        features,
        phone: tags.phone ?? tags['contact:phone'] ?? null,
        website: tags.website ?? tags['contact:website'] ?? null,
    }
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Fetch restaurants/cafes/bars from OpenStreetMap within a bounding box.
 * Uses Overpass API (free, no key needed).
 *
 * @param {[number, number, number, number]} boundingbox  [south, north, west, east]
 * @param {number} limit  max results (default 100)
 * @returns {Promise<Location[]>}
 */
export async function fetchPlacesByBoundingBox(boundingbox, limit = 100) {
    const [south, north, west, east] = boundingbox

    const query = `
[out:json][timeout:25];
(
  node["amenity"~"^(restaurant|cafe|bar|pub|fast_food)$"]["name"](${south},${west},${north},${east});
  way["amenity"~"^(restaurant|cafe|bar|pub|fast_food)$"]["name"](${south},${west},${north},${east});
);
out center ${limit};
`.trim()

    const res = await fetch(OVERPASS_URL, {
        method: 'POST',
        body: `data=${encodeURIComponent(query)}`,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (!res.ok) throw new Error(`Overpass API error: ${res.status}`)

    const json = await res.json()
    return json.elements.map(transformElement).filter(Boolean).slice(0, limit)
}
