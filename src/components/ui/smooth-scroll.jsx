import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import Lenis from 'lenis'

export default function SmoothScroll({ children }) {
    const { pathname } = useLocation()
    // Admin uses its own internal scroll (overflow-y-auto on <main>).
    // Lenis intercepts all wheel events on window and tries to scroll the
    // document, but AdminLayout has overflow-hidden — so the events get
    // swallowed and nothing scrolls.  Disable Lenis entirely for admin routes.
    const isAdmin = pathname.startsWith('/admin')
    const rafRef = useRef(null)

    useEffect(() => {
        if (isAdmin) return

        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            direction: 'vertical',
            gestureDirection: 'vertical',
            smooth: true,
            mouseMultiplier: 1,
            smoothTouch: false,
            touchMultiplier: 2,
        })

        function raf(time) {
            lenis.raf(time)
            rafRef.current = requestAnimationFrame(raf)
        }

        rafRef.current = requestAnimationFrame(raf)

        return () => {
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current)
                rafRef.current = null
            }
            lenis.destroy()
        }
    }, [isAdmin])

    return <div className="w-full min-h-screen">{children}</div>
}
