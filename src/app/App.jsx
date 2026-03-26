import React, { useEffect } from 'react'
import { AppProviders } from './providers/AppProviders'
import { AppRouter } from './router/AppRouter'
import ReloadPrompt from '@/components/pwa/ReloadPrompt'
import { InstallPrompt } from '@/components/pwa/InstallPrompt'
import { OfflineIndicator } from '@/components/pwa/OfflineIndicator'
import { OnboardingGate } from '@/features/auth/components/OnboardingGate'
import { useLocationsStore } from '@/features/public/hooks/useLocationsStore'
import { useAuthStore } from '@/features/auth/hooks/useAuthStore'

const App = ({ includeRouter = true }) => {
    const initialize = useLocationsStore(s => s.initialize)
    const initAuth = useAuthStore(s => s.initAuth)

    useEffect(() => {
        // Restore Supabase session + subscribe to auth changes
        initAuth()
        // Load locations from Supabase (or mocks)
        initialize()
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <AppProviders includeRouter={includeRouter}>
            <OfflineIndicator />

            <OnboardingGate>
                <AppRouter />
            </OnboardingGate>

            <ReloadPrompt />
            <InstallPrompt />
        </AppProviders>
    )
}

export default App
