import { QueryClient } from '@tanstack/react-query'

/**
 * Single QueryClient instance for the entire app.
 * Configured for mobile-first PWA usage:
 * - No refetch on window focus (prevents janky mobile UX)
 * - staleTime: 5 min — avoids redundant network requests
 * - gcTime: 10 min — keeps data in cache between route changes
 */
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 5 * 60 * 1000,
            gcTime: 10 * 60 * 1000,
        },
        mutations: {
            retry: 0,
        },
    },
})
