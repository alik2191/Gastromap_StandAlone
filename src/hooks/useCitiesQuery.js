import { useQuery } from '@tanstack/react-query'
import { getCitiesForCountry, getCityImage } from '@/services/nominatimApi'

/**
 * Well-known cities per country — used as fallback if Nominatim returns nothing
 * or while the user is offline.
 */
const FALLBACK_CITIES = {
    poland:      ['Krakow', 'Warsaw', 'Gdansk', 'Wroclaw', 'Poznan', 'Lodz'],
    france:      ['Paris', 'Lyon', 'Marseille', 'Bordeaux', 'Nice', 'Toulouse'],
    spain:       ['Barcelona', 'Madrid', 'Seville', 'Valencia', 'Bilbao', 'Granada'],
    germany:     ['Berlin', 'Munich', 'Hamburg', 'Cologne', 'Frankfurt', 'Dresden'],
    italy:       ['Rome', 'Milan', 'Florence', 'Venice', 'Naples', 'Bologna'],
    portugal:    ['Lisbon', 'Porto', 'Faro', 'Braga', 'Coimbra'],
    netherlands: ['Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht', 'Eindhoven'],
    czechia:     ['Prague', 'Brno', 'Ostrava', 'Plzen', 'Olomouc'],
    austria:     ['Vienna', 'Graz', 'Linz', 'Salzburg', 'Innsbruck'],
    hungary:     ['Budapest', 'Debrecen', 'Miskolc', 'Pecs', 'Gyor'],
}

function buildFallback(country) {
    const names = FALLBACK_CITIES[country?.toLowerCase()] ?? []
    return names.map(name => ({ name, lat: null, lon: null, image: getCityImage(name) }))
}

/**
 * Fetch real cities for a country from Nominatim (OpenStreetMap).
 * Falls back to a curated list if the API is unreachable or returns nothing.
 *
 * React Query caches: stale after 24h, kept in memory 48h.
 */
export function useCitiesQuery(country) {
    return useQuery({
        queryKey: ['cities', country?.toLowerCase()],
        queryFn: async () => {
            try {
                const cities = await getCitiesForCountry(country)
                return cities.length > 0 ? cities : buildFallback(country)
            } catch {
                return buildFallback(country)
            }
        },
        staleTime: 24 * 60 * 60 * 1000,
        gcTime:    48 * 60 * 60 * 1000,
        enabled: !!country,
        retry: 1,
        // Show fallback data immediately while fetching (placeholderData)
        placeholderData: () => buildFallback(country),
    })
}
