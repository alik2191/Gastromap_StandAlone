import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * useReviewsStore — persistent user-submitted reviews.
 *
 * Each location has a list of reviews and an aggregated rating.
 * Seeded with demo reviews that make the UI feel non-empty on first launch.
 *
 * @typedef {Object} Review
 * @property {string}  id
 * @property {string}  locationId
 * @property {string}  authorName
 * @property {number}  rating        - 1–5
 * @property {string}  text
 * @property {string}  date          - ISO string
 * @property {boolean} verified      - always true for user-submitted
 */

const SEED_REVIEWS = {
    '1': [
        { id: 'r1a', locationId: '1', authorName: 'Sophie M.', rating: 5, text: 'Best coffee in Krakow, bar none. The vintage atmosphere takes you back in time.', date: '2026-02-14T10:00:00Z', verified: true },
        { id: 'r1b', locationId: '1', authorName: 'Tomasz K.', rating: 5, text: 'Absolutely magical place. The cakes are divine and the staff are so warm.', date: '2026-01-28T14:30:00Z', verified: true },
        { id: 'r1c', locationId: '1', authorName: 'Elena S.', rating: 4, text: 'Bit crowded on weekends, but totally worth it. The Tiramisu is life-changing.', date: '2025-12-20T09:00:00Z', verified: true },
    ],
    '2': [
        { id: 'r2a', locationId: '2', authorName: 'Daniel R.', rating: 5, text: 'Hamsa is a culinary revelation. The hummus alone is worth the trip to Kazimierz.', date: '2026-03-01T19:00:00Z', verified: true },
        { id: 'r2b', locationId: '2', authorName: 'Anna W.', rating: 4, text: 'Great vibe and amazing food. Portions are generous. Highly recommend the falafel.', date: '2026-02-10T13:00:00Z', verified: true },
    ],
    '3': [
        { id: 'r3a', locationId: '3', authorName: 'Jan B.', rating: 5, text: 'The view from the Main Square is unbeatable. Fine dining done right.', date: '2026-02-28T20:00:00Z', verified: true },
    ],
}

function computeAggregate(reviews) {
    if (!reviews?.length) return { average: 0, count: 0, distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } }
    const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    reviews.forEach((r) => { if (dist[r.rating] !== undefined) dist[r.rating]++ })
    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    return {
        average: Math.round(avg * 10) / 10,
        count: reviews.length,
        distribution: dist,
    }
}

export const useReviewsStore = create(
    persist(
        (set, get) => ({
            // Map of locationId → Review[]
            reviewsByLocation: SEED_REVIEWS,

            /** Get all reviews for a location */
            getReviews: (locationId) =>
                get().reviewsByLocation[locationId] ?? [],

            /** Get aggregated stats for a location */
            getAggregate: (locationId) =>
                computeAggregate(get().reviewsByLocation[locationId] ?? []),

            /** Submit a new review */
            addReview: (locationId, { authorName, rating, text }) => {
                const review = {
                    id: `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                    locationId,
                    authorName: authorName || 'Anonymous',
                    rating: Math.min(5, Math.max(1, Math.round(rating))),
                    text: text.trim(),
                    date: new Date().toISOString(),
                    verified: true,
                }
                set((state) => ({
                    reviewsByLocation: {
                        ...state.reviewsByLocation,
                        [locationId]: [review, ...(state.reviewsByLocation[locationId] ?? [])],
                    },
                }))
                return review
            },

            /** Delete own review */
            deleteReview: (locationId, reviewId) => {
                set((state) => ({
                    reviewsByLocation: {
                        ...state.reviewsByLocation,
                        [locationId]: (state.reviewsByLocation[locationId] ?? []).filter(
                            (r) => r.id !== reviewId
                        ),
                    },
                }))
            },
        }),
        { name: 'gastromap-reviews' }
    )
)
