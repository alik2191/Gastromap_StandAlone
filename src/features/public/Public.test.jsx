import { describe, it, expect } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@/test/helpers'
import App from '@/app/App'

vi.mock('@/components/auth/SubscriptionGate', () => ({
    default: ({ children }) => children,
}))

describe('Public Features Integration', () => {
    it('renders Landing page with hero content', () => {
        renderWithProviders(<App includeRouter={false} />, {
            initialEntries: ['/'],
        })

        // Hero headline is synchronous — LandingPage is not lazy loaded
        expect(screen.getByText(/Discover places/i)).toBeInTheDocument()
        expect(screen.getByText(/Get Started/i)).toBeInTheDocument()
    })

    it('navigates from Landing to SignUp on Get Started click', async () => {
        renderWithProviders(<App includeRouter={false} />, {
            initialEntries: ['/'],
        })

        // Click the CTA — navigates to /auth/signup
        fireEvent.click(screen.getByText(/Get Started/i))

        // SignUpPage is lazy-loaded — wait for it to mount
        const heading = await screen.findByText(/Create account|Sign up|Регистрация/i, {}, { timeout: 5000 })
        expect(heading).toBeInTheDocument()
    })
})
