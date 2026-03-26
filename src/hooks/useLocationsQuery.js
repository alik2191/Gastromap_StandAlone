import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { geocodeCity } from '@/services/nominatimApi'
import { fetchPlacesByBoundingBox } from '@/services/overpassApi'
import { useLocationsStore } from '@/features/public/hooks/useLocationsStore'
import { MOCK_LOCATIONS } from '@/mocks/locations'

/**
 * Fetch real venue data from OpenStreetMap for a given city+country.
 * - Geocodes city → bounding box via Nominatim
 * - Fetches restaurants/cafes/bars via Overpass API
 * - Syncs results to Zustand store (filteredLocations updates automatically)
 * - Falls back to MOCK_LOCATIONS if API is unreachable or returns nothing
 *
 * React Query handles caching: staleTime 1h, gcTime 24h.
 */
export function useLocationsQuery(city, country) {
    const setLocations = useLocationsStore((s) => s.setLocations)

    const query = useQuery({
        queryKey: ['locations', city?.toLowerCase(), country?.toLowerCase()],
        queryFn: async () => {
            const geo = await geocodeCity(city, country)
            const places = await fetchPlacesByBoundingBox(geo.boundingbox, 100)
            return places.length ? places : MOCK_LOCATIONS
        },
        staleTime: 60 * 60 * 1000,        // consider fresh for 1 hour
        gcTime: 24 * 60 * 60 * 1000,      // keep in memory cache 24 hours
        enabled: !!(city && country),
        retry: 1,
    })

    // Push fetched data into the Zustand store so all consumers (map, filters, etc.) see it
    useEffect(() => {
        if (query.data) {
            setLocations(query.data)
        }
    }, [query.data, setLocations])

    return query
}
