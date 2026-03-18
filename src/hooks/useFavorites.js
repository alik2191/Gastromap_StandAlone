import { useCallback } from 'react'
import { useFavoritesStore } from '@/features/dashboard/hooks/useFavoritesStore'

/**
 * useFavorites — convenince hook for favourites with haptic feedback.
 *
 * Adds Vibration API on toggle so the interaction feels native on mobile.
 *
 * @returns {{
 *   favoriteIds: string[],
 *   isFavorite: (id: string) => boolean,
 *   toggleFavorite: (id: string) => void,
 *   count: number,
 * }}
 */
export function useFavorites() {
    const { favoriteIds, toggleFavorite: storToggle, isFavorite } = useFavoritesStore()

    const toggleFavorite = useCallback((id) => {
        storToggle(id)
        // Haptic feedback — native feel on mobile
        if (navigator.vibrate) {
            navigator.vibrate(isFavorite(id) ? [10] : [10, 30, 10])
        }
    }, [storToggle, isFavorite])

    return {
        favoriteIds,
        isFavorite,
        toggleFavorite,
        count: favoriteIds.length,
    }
}
