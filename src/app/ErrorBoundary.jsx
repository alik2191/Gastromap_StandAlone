import React from 'react'
import { RefreshCw, AlertTriangle, Home } from 'lucide-react'

/**
 * ErrorBoundary — catches JS errors in child component tree.
 *
 * Usage:
 *   <ErrorBoundary>
 *     <SomeComponent />
 *   </ErrorBoundary>
 *
 *   <ErrorBoundary fallback={<MapErrorFallback />}>
 *     <MapPage />
 *   </ErrorBoundary>
 */
export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props)
        this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error }
    }

    componentDidCatch(error, info) {
        // TODO: send to Sentry / analytics when available
        if (import.meta.env.DEV) {
            console.error('[ErrorBoundary] caught:', error, info.componentStack)
        }
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null })
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return typeof this.props.fallback === 'function'
                    ? this.props.fallback({ error: this.state.error, reset: this.handleReset })
                    : this.props.fallback
            }

            return <DefaultErrorUI error={this.state.error} onReset={this.handleReset} />
        }

        return this.props.children
    }
}

// ─── Default error screen ──────────────────────────────────────────────────

function DefaultErrorUI({ error, onReset }) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F5F5F7] dark:bg-[#0f172a] p-6">
            <div className="max-w-sm w-full text-center">
                {/* Icon */}
                <div className="w-20 h-20 mx-auto mb-8 rounded-[32px] bg-red-500/10 dark:bg-red-500/20 flex items-center justify-center">
                    <AlertTriangle className="text-red-500" size={36} />
                </div>

                {/* Message */}
                <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
                    Что-то пошло не так
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-2 leading-relaxed">
                    Произошла непредвиденная ошибка. Попробуйте обновить страницу.
                </p>

                {/* Dev-only error details */}
                {import.meta.env.DEV && error?.message && (
                    <pre className="mt-4 mb-6 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-left text-[11px] text-red-600 dark:text-red-400 overflow-auto max-h-32 font-mono">
                        {error.message}
                    </pre>
                )}

                {/* Actions */}
                <div className="flex flex-col gap-3 mt-8">
                    <button
                        onClick={onReset}
                        className="h-13 w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95"
                    >
                        <RefreshCw size={16} />
                        Попробовать снова
                    </button>
                    <a
                        href="/"
                        className="h-13 w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 font-black text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95"
                    >
                        <Home size={16} />
                        На главную
                    </a>
                </div>
            </div>
        </div>
    )
}

// ─── Specialised fallbacks ────────────────────────────────────────────────

/**
 * Lightweight fallback for the map widget — keeps the rest of the page intact.
 */
export function MapErrorFallback({ error, reset }) {
    return (
        <div className="w-full h-full min-h-[300px] flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-800/50 rounded-2xl gap-4">
            <AlertTriangle className="text-slate-400" size={32} />
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                Карта недоступна
            </p>
            <button
                onClick={reset}
                className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest"
            >
                Обновить
            </button>
        </div>
    )
}

/**
 * Inline fallback for AI chat section — minimal, non-blocking.
 */
export function AIChatErrorFallback({ reset }) {
    return (
        <div className="flex flex-col items-center justify-center p-8 gap-3 text-center">
            <AlertTriangle className="text-amber-500" size={28} />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                GastroGuide временно недоступен
            </p>
            <button
                onClick={reset}
                className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest"
            >
                Попробовать снова
            </button>
        </div>
    )
}
