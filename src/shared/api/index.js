/**
 * Barrel export — import everything from '@/shared/api'
 *
 * @example
 * import { getLocations, getLocationById } from '@/shared/api'
 * import { signIn, signOut } from '@/shared/api'
 * import { analyzeQuery } from '@/shared/api'
 */

export * from './locations.api'
export * from './auth.api'
export * from './ai.api'
export { ApiError, simulateDelay } from './client'
