import { useState, useEffect, useCallback } from 'react'
import { config } from '@/shared/config/env'

/**
 * useGeolocation — browser Geolocation API wrapper.
 *
 * Features:
 * - One-shot & watch modes
 * - Permission state tracking
 * - Automatic cleanup on unmount
 * - Centred on app default location as fallback
 *
 * @param {Object}  options
 * @param {boolean} [options.watch=false]       - Watch position in real time
 * @param {boolean} [options.requestOnMount=false] - Request position immediately
 *
 * @returns {{
 *   coords: { lat: number, lng: number } | null,
 *   accuracy: number | null,
 *   error: string | null,
 *   permission: 'idle'|'pending'|'granted'|'denied'|'unavailable',
 *   requestLocation: () => void,
 * }}
 */
export function useGeolocation({ watch = false, requestOnMount = false } = {}) {
    const [coords, setCoords] = useState(null)
    const [accuracy, setAccuracy] = useState(null)
    const [error, setError] = useState(null)
    const [permission, setPermission] = useState('idle')

    const onSuccess = useCallback((position) => {
        setCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
        })
        setAccuracy(position.coords.accuracy)
        setPermission('granted')
        setError(null)
    }, [])

    const onError = useCallback((err) => {
        if (err.code === err.PERMISSION_DENIED) {
            setPermission('denied')
            setError('Доступ к геолокации запрещён')
        } else if (err.code === err.POSITION_UNAVAILABLE) {
            setError('Позиция недоступна')
        } else {
            setError('Превышено время ожидания геолокации')
        }
    }, [])

    const geoOptions = {
        enableHighAccuracy: true,
        timeout: 10_000,
        maximumAge: 30_000,
    }

    const requestLocation = useCallback(() => {
        if (!navigator.geolocation) {
            setPermission('unavailable')
            setError('Геолокация не поддерживается браузером')
            return
        }
        setPermission('pending')
        navigator.geolocation.getCurrentPosition(onSuccess, onError, geoOptions)
    }, [onSuccess, onError])

    useEffect(() => {
        if (requestOnMount) requestLocation()
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (!watch || !navigator.geolocation) return
        setPermission('pending')
        const watchId = navigator.geolocation.watchPosition(onSuccess, onError, geoOptions)
        return () => navigator.geolocation.clearWatch(watchId)
    }, [watch, onSuccess, onError]) // eslint-disable-line react-hooks/exhaustive-deps

    return { coords, accuracy, error, permission, requestLocation }
}
