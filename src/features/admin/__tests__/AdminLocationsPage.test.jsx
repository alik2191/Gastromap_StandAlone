import { describe, it, expect, vi } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { renderWithRouter } from '@/test/helpers'
import AdminLocationsPage from '../pages/AdminLocationsPage'

describe('AdminLocationsPage', () => {
    it('renders locations page with stats', () => {
        renderWithRouter(<AdminLocationsPage />)

        expect(screen.getByText(/Локации/i)).toBeInTheDocument()
        expect(screen.getByText(/Всего/i)).toBeInTheDocument()
        expect(screen.getAllByText(/В очереди/i).length).toBeGreaterThan(0)
    })

    it('displays table header', () => {
        renderWithRouter(<AdminLocationsPage />)
        // 'Объект' is in the header th and description.
        expect(screen.getAllByText(/Объект/i).length).toBeGreaterThan(0)
        expect(screen.getByText(/Рейтинг/i)).toBeInTheDocument()
        expect(screen.getAllByText(/Статус/i).length).toBeGreaterThan(0)
    })

    it('can switch tabs', () => {
        renderWithRouter(<AdminLocationsPage />)

        const moderationTab = screen.getByRole('button', { name: /В очереди/i })
        fireEvent.click(moderationTab)

        // Check if moderation specific content is visible
        // Coffee Hub is in pending state in our mock data
        expect(screen.getAllByText(/Coffee Hub/i).length).toBeGreaterThan(0)
    })

    it('opens and closes slide-over panel', async () => {
        renderWithRouter(<AdminLocationsPage />)

        // Click on a location row
        const locationRow = screen.getByText(/Zen Garden/i)
        fireEvent.click(locationRow)

        // Check if slide over title is present
        expect(screen.getByText(/Редактирование/i)).toBeInTheDocument()

        // Find close button and click it
        const closeButton = screen.getByLabelText(/close-panel/i)
        fireEvent.click(closeButton)

        // Panel should be closed. Use waitFor because of AnimatePresence
        await waitFor(() => {
            expect(screen.queryByText(/Редактирование/i)).not.toBeInTheDocument()
        }, { timeout: 2000 })
    })
})
