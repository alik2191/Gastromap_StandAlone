/**
 * Test helpers — shared render utilities for all test files.
 *
 * Use renderWithProviders instead of plain render() whenever
 * the component under test uses:
 *   - React Router hooks (useLocation, useNavigate, useParams)
 *   - TanStack React Query (useQuery, useMutation)
 *   - Zustand stores (automatically available, no wrapper needed)
 */

import React from 'react'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

/**
 * Create a fresh QueryClient for each test — avoids state leaking between tests.
 */
export function createTestQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: { retry: false, staleTime: 0, gcTime: 0 },
            mutations: { retry: false },
        },
        // Silence React Query's console.error in tests
        logger: { log: () => {}, warn: () => {}, error: () => {} },
    })
}

/**
 * Render component with Router + QueryClient context.
 *
 * @param {React.ReactElement} ui
 * @param {{
 *   initialEntries?: string[],
 *   queryClient?: QueryClient,
 * }} options
 */
export function renderWithProviders(ui, options = {}) {
    const {
        initialEntries = ['/'],
        queryClient = createTestQueryClient(),
    } = options

    function Wrapper({ children }) {
        return (
            <QueryClientProvider client={queryClient}>
                <MemoryRouter initialEntries={initialEntries}>
                    {children}
                </MemoryRouter>
            </QueryClientProvider>
        )
    }

    return {
        ...render(ui, { wrapper: Wrapper }),
        queryClient,
    }
}

/**
 * Render with router only (no React Query).
 * Use for components that only need navigation context.
 */
export function renderWithRouter(ui, { initialEntries = ['/'] } = {}) {
    return render(
        <MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>
    )
}
