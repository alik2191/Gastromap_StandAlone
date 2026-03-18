import { useCallback, useMemo } from 'react'
import { useLocationsStore } from '@/features/public/hooks/useLocationsStore'

/**
 * useLocationFilter — convenient access to filter state + derived values.
 *
 * Wraps useLocationsStore and memoises derived data to prevent
 * unnecessary re-renders in FilterModal and category bars.
 *
 * @returns {{
 *   filteredLocations: Array,
 *   activeCategory: string,
 *   searchQuery: string,
 *   activePriceLevels: string[],
 *   minRating: number|null,
 *   activeVibes: string[],
 *   sortBy: string,
 *   activeFilterCount: number,
 *   hasActiveFilters: boolean,
 *   setCategory: Function,
 *   setSearchQuery: Function,
 *   applyFilters: Function,
 *   resetFilters: Function,
 * }}
 */
export function useLocationFilter() {
    const {
        filteredLocations,
        activeCategory,
        searchQuery,
        activePriceLevels,
        minRating,
        activeVibes,
        sortBy,
        setCategory,
        setSearchQuery,
        setPriceLevels,
        setMinRating,
        setVibes,
        setSortBy,
        applyFilters,
        resetFilters,
    } = useLocationsStore()

    const activeFilterCount = useMemo(() => {
        let count = 0
        if (activeCategory !== 'All') count++
        if (activePriceLevels.length) count++
        if (minRating != null) count++
        if (activeVibes.length) count++
        return count
    }, [activeCategory, activePriceLevels, minRating, activeVibes])

    const hasActiveFilters = activeFilterCount > 0 || Boolean(searchQuery)

    return {
        filteredLocations,
        activeCategory,
        searchQuery,
        activePriceLevels,
        minRating,
        activeVibes,
        sortBy,
        activeFilterCount,
        hasActiveFilters,
        setCategory,
        setSearchQuery,
        setPriceLevels,
        setMinRating,
        setVibes,
        setSortBy,
        applyFilters,
        resetFilters,
    }
}
