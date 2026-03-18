import { describe, it, expect, beforeEach } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@/test/helpers'
import App from '@/app/App'
import { useAuthStore } from './hooks/useAuthStore'

vi.mock('@/components/auth/SubscriptionGate', () => ({
    default: ({ children }) => children,
}))

describe('Auth Features Integration', () => {
    beforeEach(() => {
        // Reset auth store before each test
        useAuthStore.getState().logout()
    })

    it('renders login form after lazy load', async () => {
        renderWithProviders(<App includeRouter={false} />, {
            initialEntries: ['/login'],
        })

        // LoginPage is lazy — wait for it to mount
        const emailInput = await screen.findByLabelText(/Email/i, {}, { timeout: 4000 })
        expect(emailInput).toBeInTheDocument()
        expect(screen.getByLabelText(/Password/i)).toBeInTheDocument()
    })

    it('allows user login and redirects to dashboard', async () => {
        renderWithProviders(<App includeRouter={false} />, {
            initialEntries: ['/login'],
        })

        // Wait for lazy LoginPage
        const emailInput = await screen.findByLabelText(/Email/i, {}, { timeout: 4000 })

        fireEvent.change(emailInput, { target: { value: 'user@example.com' } })
        fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password' } })
        fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

        // Dashboard is lazy too — wait for it (login has async signIn delay)
        expect(
            await screen.findByText(/What are we eating today?/i, {}, { timeout: 5000 })
        ).toBeInTheDocument()
    })

    it('allows admin login and redirects to admin panel', async () => {
        renderWithProviders(<App includeRouter={false} />, {
            initialEntries: ['/login'],
        })

        const emailInput = await screen.findByLabelText(/Email/i, {}, { timeout: 4000 })

        fireEvent.change(emailInput, { target: { value: 'admin@gastromap.com' } })
        fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'adminpass' } })
        fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

        expect(
            await screen.findByText(/Панель управления/i, {}, { timeout: 5000 })
        ).toBeInTheDocument()
    })
})
