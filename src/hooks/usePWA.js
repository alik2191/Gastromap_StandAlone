import { useState, useEffect } from 'react'

export function usePWA() {
    const [deferredPrompt, setDeferredPrompt] = useState(null)
    const [isInstallable, setIsInstallable] = useState(false)
    const [isInstalled, setIsInstalled] = useState(false)

    useEffect(() => {
        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
            setIsInstalled(true)
        }

        const handler = (e) => {
            // Prevent Chrome 67 and earlier from automatically showing the prompt
            e.preventDefault()
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e)
            setIsInstallable(true)
        }

        window.addEventListener('beforeinstallprompt', handler)

        window.addEventListener('appinstalled', () => {
            setIsInstallable(false)
            setIsInstalled(true)
            setDeferredPrompt(null)
        })

        return () => {
            window.removeEventListener('beforeinstallprompt', handler)
        }
    }, [])

    const installPWA = async () => {
        if (!deferredPrompt) return

        // Show the prompt
        deferredPrompt.prompt()

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice
        void outcome

        // We've used the prompt, and can't use it again, throw it away
        setDeferredPrompt(null)
        setIsInstallable(false)
    }

    return { isInstallable, isInstalled, installPWA }
}
