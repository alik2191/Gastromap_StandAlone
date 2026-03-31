/**
 * Auto-Translation API
 * 
 * Automatically translates location data to multiple languages
 * Uses OpenRouter AI models for translation
 * 
 * Supported languages:
 * - en: English
 * - pl: Polish
 * - uk: Ukrainian
 * - ru: Russian
 */

import { analyzeQuery } from './ai.api'
import { supabase } from './client'
import { config } from '@/shared/config/env'

// Supported languages
export const SUPPORTED_LANGUAGES = {
    en: { name: 'English', label: 'EN' },
    pl: { name: 'Polish', label: 'PL' },
    uk: { name: 'Ukrainian', label: 'UK' },
    ru: { name: 'Russian', label: 'RU' }
}

// Fields to translate
export const TRANSLATABLE_FIELDS = [
    'title',
    'description',
    'address',
    'insider_tip',
    'what_to_try',
    'ai_context'
]

/**
 * Translate text to target language
 * @param {string} text - Text to translate
 * @param {string} targetLang - Target language code (en, pl, uk, ru)
 * @param {string} sourceLang - Source language code (optional, auto-detect)
 * @returns {Promise<string>} Translated text
 */
export async function translateText(text, targetLang, sourceLang = 'auto') {
    if (!text || typeof text !== 'string') {
        return text
    }
    
    const targetLanguage = SUPPORTED_LANGUAGES[targetLang]?.name || targetLang
    
    const prompt = `Translate the following text to ${targetLanguage}. 
Preserve formatting, proper nouns, and brand names.
Return ONLY the translation, no explanations.

Text to translate:
"${text}"`

    try {
        const response = await analyzeQuery(prompt, {
            systemPrompt: 'You are a professional translator. Translate accurately while preserving meaning and tone.',
            temperature: 0.3,
            maxTokens: 1000
        })
        
        return response?.answer?.trim() || text
    } catch (error) {
        console.error('[Translation API] Error translating text:', error)
        return text // Return original on error
    }
}

/**
 * Translate array of strings (e.g., what_to_try)
 * @param {Array<string>} texts - Array of texts to translate
 * @param {string} targetLang - Target language
 * @returns {Promise<Array<string>>} Translated array
 */
export async function translateArray(texts, targetLang) {
    if (!Array.isArray(texts)) {
        return texts
    }
    
    const translated = await Promise.all(
        texts.map(text => translateText(text, targetLang))
    )
    
    return translated
}

/**
 * Translate all translatable fields of a location
 * @param {Object} locationData - Location data object
 * @param {string} targetLang - Target language
 * @param {string} sourceLang - Source language (optional)
 * @returns {Promise<Object>} Translated location data
 */
export async function translateLocation(locationData, targetLang, sourceLang = 'auto') {
    if (!locationData) {
        return locationData
    }
    
    const translated = { ...locationData }
    
    // Translate text fields
    for (const field of TRANSLATABLE_FIELDS) {
        if (locationData[field]) {
            if (Array.isArray(locationData[field])) {
                translated[field] = await translateArray(locationData[field], targetLang)
            } else {
                translated[field] = await translateText(locationData[field], targetLang, sourceLang)
            }
        }
    }
    
    return translated
}

/**
 * Auto-translate location to all supported languages
 * @param {Object} locationData - Location data
 * @param {string} sourceLang - Source language (optional, auto-detect)
 * @returns {Promise<Object>} Location with all translations
 */
export async function autoTranslateAll(locationData, sourceLang = 'auto') {
    if (!locationData) {
        return locationData
    }
    
    const result = {
        ...locationData,
        translations: {}
    }
    
    // Translate to each supported language
    const translations = {}
    
    for (const [langCode, langInfo] of Object.entries(SUPPORTED_LANGUAGES)) {
        console.log(`[Translation API] Translating to ${langInfo.name}...`)
        
        try {
            const translated = await translateLocation(locationData, langCode, sourceLang)
            translations[langCode] = {
                title: translated.title,
                description: translated.description,
                address: translated.address,
                insider_tip: translated.insider_tip,
                what_to_try: translated.what_to_try,
                ai_context: translated.ai_context,
                translated_at: new Date().toISOString()
            }
        } catch (error) {
            console.error(`[Translation API] Failed to translate to ${langCode}:`, error)
            // Store partial translation on error
            translations[langCode] = {
                title: locationData.title,
                description: locationData.description,
                error: error.message
            }
        }
    }
    
    result.translations = translations
    return result
}

/**
 * Save translations to database
 * @param {string} locationId - Location ID
 * @param {Object} translations - Translations object
 * @returns {Promise<void>}
 */
export async function saveTranslations(locationId, translations) {
    try {
        const { error } = await supabase
            .from('location_translations')
            .upsert({
                location_id: locationId,
                translations: translations,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'location_id'
            })
        
        if (error) {
            console.error('[Translation API] Error saving translations:', error)
            throw error
        }
        
        console.log('[Translation API] Translations saved successfully')
    } catch (error) {
        console.error('[Translation API] Exception saving translations:', error)
        throw error
    }
}

/**
 * Get translations for a location
 * @param {string} locationId - Location ID
 * @returns {Promise<Object|null>} Translations object
 */
export async function getTranslations(locationId) {
    try {
        const { data, error } = await supabase
            .from('location_translations')
            .select('translations')
            .eq('location_id', locationId)
            .single()
        
        if (error) {
            if (error.code === 'PGRST116') {
                // No translations found
                return null
            }
            throw error
        }
        
        return data?.translations || null
    } catch (error) {
        console.error('[Translation API] Error getting translations:', error)
        return null
    }
}

/**
 * Get location with translations for specific language
 * @param {string} locationId - Location ID
 * @param {string} lang - Language code
 * @returns {Promise<Object|null>} Location with translations
 */
export async function getLocationWithTranslation(locationId, lang) {
    try {
        // Get location
        const { data: location, error: locError } = await supabase
            .from('locations')
            .select('*')
            .eq('id', locationId)
            .single()
        
        if (locError) throw locError
        if (!location) return null
        
        // Get translations
        const translations = await getTranslations(locationId)
        
        if (translations && translations[lang]) {
            // Merge translations with original data
            const translated = {
                ...location,
                ...translations[lang]
            }
            return translated
        }
        
        return location
    } catch (error) {
        console.error('[Translation API] Error getting location with translation:', error)
        return null
    }
}

/**
 * Batch translate multiple locations
 * @param {Array<Object>} locations - Array of location data
 * @param {string} targetLang - Target language
 * @returns {Promise<Array<Object>>} Translated locations
 */
export async function batchTranslate(locations, targetLang) {
    if (!Array.isArray(locations)) {
        return locations
    }
    
    console.log(`[Translation API] Batch translating ${locations.length} locations to ${targetLang}...`)
    
    const translated = await Promise.all(
        locations.map(loc => translateLocation(loc, targetLang))
    )
    
    return translated
}

/**
 * Detect language of text (simple heuristic)
 * @param {string} text - Text to analyze
 * @returns {string} Detected language code
 */
export function detectLanguage(text) {
    if (!text) return 'en'
    
    const cyrillic = /[\u0400-\u04FF]/
    const polish = /[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/
    
    if (polish.test(text)) return 'pl'
    if (cyrillic.test(text)) {
        // Distinguish Ukrainian and Russian
        const ukrainian = /ієґюяії/
        if (ukrainian.test(text.toLowerCase())) return 'uk'
        return 'ru'
    }
    
    return 'en'
}

/**
 * Enable auto-translation on location create/update
 * Call this from locations.api.js createLocation and updateLocation
 * @param {Object} locationData - Location data
 * @param {boolean} autoTranslate - Enable auto-translation
 * @returns {Promise<Object>} Location with translations
 */
export async function processLocationTranslations(locationData, autoTranslate = true) {
    if (!autoTranslate || !config.ai.isOpenRouterConfigured) {
        return locationData
    }
    
    console.log('[Translation API] Processing auto-translations...')
    
    try {
        const result = await autoTranslateAll(locationData)
        return result
    } catch (error) {
        console.error('[Translation API] Auto-translation failed:', error)
        // Return original data on error (non-blocking)
        return locationData
    }
}

export default {
    translateText,
    translateArray,
    translateLocation,
    autoTranslateAll,
    saveTranslations,
    getTranslations,
    getLocationWithTranslation,
    batchTranslate,
    detectLanguage,
    processLocationTranslations,
    SUPPORTED_LANGUAGES,
    TRANSLATABLE_FIELDS
}
