import React, { useEffect } from 'react'
import { AppProviders } from './providers/AppProviders'
import { AppRouter } from './router/AppRouter'
import ReloadPrompt from '@/components/pwa/ReloadPrompt'
import { InstallPrompt } from '@/components/pwa/InstallPrompt'
import { OfflineIndicator } from '@/components/pwa/OfflineIndicator'
import { OnboardingGate } from '@/features/auth/components/OnboardingGate'
import { useLocationsStore } from '@/features/public/hooks/useLocationsStore'

const App = ({ includeRouter = true }) => {
    const initialize = useLocationsStore(s => s.initialize)

    // Load locations from Supabase (or mocks) on first render
    useEffect(() => { initialize() }, [initialize])

    return (
        <AppProviders includeRouter={includeRouter}>
            {/* Global PWA overlays */}
            <OfflineIndicator />

            <OnboardingGate>
                <AppRouter />
            </OnboardingGate>

            {/* These float above all content */}
            <ReloadPrompt />
            <InstallPrompt />
        </AppProviders>
    )
}

export default App
