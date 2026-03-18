/**
 * AI / GastroIntelligence API
 *
 * Currently wraps the local scoring engine.
 * Replace `analyzeQuery` body with a real LLM call (Claude API)
 * without changing any component.
 */

import { gastroIntelligence } from '@/services/gastroIntelligence'
import { ApiError, simulateDelay } from './client'

/**
 * @typedef {Object} AIResponse
 * @property {string}   content  - Text message to display in chat
 * @property {Array}    matches  - Matched locations (up to 3)
 * @property {string}   [intent] - Detected intent: 'recommendation' | 'info' | 'general'
 */

/**
 * Analyze user query and return AI response with location recommendations.
 * @param {string} message
 * @param {{ preferences?: Object, history?: Array }} [context]
 * @returns {Promise<AIResponse>}
 */
export async function analyzeQuery(message, context = {}) {
    if (!message?.trim()) {
        throw new ApiError('Message cannot be empty', 400, 'EMPTY_MESSAGE')
    }

    // TODO: Replace with Claude API call:
    // const response = await anthropic.messages.create({
    //   model: config.ai.model,
    //   system: buildSystemPrompt(context),
    //   messages: [{ role: 'user', content: message }],
    // })

    const result = await gastroIntelligence.analyzeQuery(message)

    return {
        content: result.content,
        matches: result.matches ?? [],
        intent: detectIntent(message),
    }
}

/**
 * Simple rule-based intent detection.
 * Will be replaced by LLM classification.
 * @param {string} text
 * @returns {'recommendation' | 'info' | 'general'}
 */
function detectIntent(text) {
    const q = text.toLowerCase()
    if (
        q.includes('recommend') || q.includes('where') ||
        q.includes('best') || q.includes('find') ||
        q.includes('eat') || q.includes('drink')
    ) {
        return 'recommendation'
    }
    if (q.includes('open') || q.includes('hours') || q.includes('menu') || q.includes('price')) {
        return 'info'
    }
    return 'general'
}
