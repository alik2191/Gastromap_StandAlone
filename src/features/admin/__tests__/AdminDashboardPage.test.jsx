import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithRouter } from '@/test/helpers'
import AdminDashboardPage from '../pages/AdminDashboardPage'

describe('AdminDashboardPage', () => {
    it('renders dashboard with stats', () => {
        renderWithRouter(<AdminDashboardPage />)

        expect(screen.getByText(/Панель управления/i)).toBeInTheDocument()
        expect(screen.getByText(/Пользователей/i)).toBeInTheDocument()
        expect(screen.getByText(/Локаций/i)).toBeInTheDocument()
        expect(screen.getByText(/Просмотры/i)).toBeInTheDocument()
    })

    it('displays welcome message and activity feed', () => {
        renderWithRouter(<AdminDashboardPage />)
        expect(screen.getByText(/Последняя активность/i)).toBeInTheDocument()
        expect(screen.getByText(/Дмитрий С./i)).toBeInTheDocument()
    })

    it('renders AI Insight block', () => {
        renderWithRouter(<AdminDashboardPage />)
        expect(screen.getByText(/GastroAI/i)).toBeInTheDocument()
    })
})
