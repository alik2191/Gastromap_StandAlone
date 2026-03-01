import { MOCK_LOCATIONS } from '../mocks/locations';
import { MOCK_USER_PERSONA } from '../mocks/userPersona';

/**
 * GastroIntelligence Service
 * The "Jarvis" core of the application.
 */
class GastroIntelligence {
    constructor() {
        this.user = MOCK_USER_PERSONA;
        this.locations = MOCK_LOCATIONS;
    }

    /**
     * Process a user message and return an intelligent response
     * In a real app, this would call an LLM with RAG (Retrieval-Augmented Generation)
     */
    async analyzeQuery(text) {
        const query = text.toLowerCase();
        
        // 1. Context Analysis: Does the user want a recommendation?
        const isLookingForFood = query.includes('eat') || query.includes('cafe') || query.includes('where') || query.includes('recommend');
        
        // 2. Personalization: Use user context for ranking
        let filtered = this.locations;

        if (isLookingForFood) {
            // Rank locations based on user preferences (Simulating AI)
            filtered = this.locations.map(loc => {
                let score = 0;
                
                // Match by tags and preferences
                loc.tags.forEach(tag => {
                    if (this.user.preferences.favoriteCuisines.includes(tag)) score += 2;
                });

                // Match by vibe
                if (this.user.preferences.vibePreference.includes(loc.vibe)) score += 1;

                // Match by features
                loc.features.forEach(f => {
                    if (this.user.preferences.features.includes(f)) score += 1;
                });

                return { ...loc, matchScore: score };
            }).sort((a, b) => b.matchScore - a.matchScore);
        }

        // 3. Generate response
        const topMatch = filtered[0];

        if (topMatch && topMatch.matchScore > 0) {
            return {
                content: `Based on your love for ${this.user.preferences.favoriteCuisines[0]} and ${this.user.preferences.vibePreference[0]} vibes, I highly recommend ${topMatch.title}. It has a rating of ${topMatch.rating} and features ${topMatch.features.join(', ')}.`,
                matches: filtered.slice(0, 3)
            };
        }

        return {
            content: "I'm still learning your tastes, but Krakow has some great spots! Tell me more about what you're craving right now.",
            matches: []
        };
    }
}

export const gastroIntelligence = new GastroIntelligence();
