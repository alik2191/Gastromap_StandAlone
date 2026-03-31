/**
 * E2E Tests for Auto-Translation System
 * 
 * Tests automatic translation of locations to multiple languages
 * Run: npm run test:e2e
 */

import { describe, it, expect, beforeEach } from 'vitest'
import {
    translateText,
    translateArray,
    translateLocation,
    autoTranslateAll,
    detectLanguage,
    SUPPORTED_LANGUAGES,
    TRANSLATABLE_FIELDS
} from '../../src/shared/api/translation.api.js'

describe('Auto-Translation System', () => {
    const mockLocation = {
        id: 'test-123',
        title: 'Ursus Restaurant',
        description: 'Cozy Italian restaurant in the heart of Krakow',
        address: 'ul. Floriańska 15, Kraków',
        city: 'Kraków',
        country: 'Poland',
        insider_tip: 'Try the homemade pasta - it\'s amazing!',
        what_to_try: ['Carbonara', 'Tiramisu', 'Fresh bread'],
        ai_context: 'Popular among locals, romantic atmosphere'
    }

    beforeEach(() => {
        console.log('🧪 Starting translation test...')
    })

    describe('Configuration', () => {
        it('should have supported languages', () => {
            expect(SUPPORTED_LANGUAGES).toHaveProperty('en')
            expect(SUPPORTED_LANGUAGES).toHaveProperty('pl')
            expect(SUPPORTED_LANGUAGES).toHaveProperty('uk')
            expect(SUPPORTED_LANGUAGES).toHaveProperty('ru')
        })

        it('should have translatable fields defined', () => {
            expect(TRANSLATABLE_FIELDS).toBeInstanceOf(Array)
            expect(TRANSLATABLE_FIELDS).toContain('title')
            expect(TRANSLATABLE_FIELDS).toContain('description')
            expect(TRANSLATABLE_FIELDS.length).toBeGreaterThan(0)
        })
    })

    describe('Language Detection', () => {
        it('should detect English', () => {
            const detected = detectLanguage('Hello, how are you?')
            expect(detected).toBe('en')
        })

        it('should detect Polish', () => {
            const detected = detectLanguage('Dzień dobry, jak się masz?')
            expect(detected).toBe('pl')
        })

        it('should detect Ukrainian', () => {
            const detected = detectLanguage('Привіт, як справи?')
            expect(detected).toBe('uk')
        })

        it('should detect Russian', () => {
            const detected = detectLanguage('Привет, как дела?')
            expect(detected).toBe('ru')
        })

        it('should handle empty text', () => {
            const detected = detectLanguage('')
            expect(detected).toBe('en')
        })
    })

    describe('Text Translation', () => {
        it('should translate text to Polish', async () => {
            const text = 'Cozy Italian restaurant'
            const translated = await translateText(text, 'pl')
            
            expect(translated).toBeDefined()
            expect(typeof translated).toBe('string')
            expect(translated.length).toBeGreaterThan(0)
            console.log(`EN: "${text}" → PL: "${translated}"`)
        }, 10000)

        it('should translate text to Ukrainian', async () => {
            const text = 'Best pizza in town'
            const translated = await translateText(text, 'uk')
            
            expect(translated).toBeDefined()
            expect(typeof translated).toBe('string')
            console.log(`EN: "${text}" → UK: "${translated}"`)
        }, 10000)

        it('should translate text to Russian', async () => {
            const text = 'Fresh seafood daily'
            const translated = await translateText(text, 'ru')
            
            expect(translated).toBeDefined()
            expect(typeof translated).toBe('string')
            console.log(`EN: "${text}" → RU: "${translated}"`)
        }, 10000)

        it('should handle empty text', async () => {
            const translated = await translateText('', 'pl')
            expect(translated).toBe('')
        })

        it('should return original text on error', async () => {
            const text = 'Test translation'
            const translated = await translateText(text, 'invalid_lang')
            expect(translated).toBe(text)
        })
    })

    describe('Array Translation', () => {
        it('should translate array of strings', async () => {
            const texts = ['Pizza', 'Pasta', 'Salad']
            const translated = await translateArray(texts, 'pl')
            
            expect(Array.isArray(translated)).toBe(true)
            expect(translated.length).toBe(texts.length)
            console.log(`EN: ${JSON.stringify(texts)} → PL: ${JSON.stringify(translated)}`)
        }, 10000)

        it('should handle non-array input', async () => {
            const translated = await translateArray('not an array', 'pl')
            expect(translated).toBe('not an array')
        })
    })

    describe('Location Translation', () => {
        it('should translate location to Polish', async () => {
            const translated = await translateLocation(mockLocation, 'pl')
            
            expect(translated).toHaveProperty('title')
            expect(translated).toHaveProperty('description')
            expect(translated).toHaveProperty('address')
            console.log(`Location translated to Polish:`, translated.title)
        }, 15000)

        it('should translate location to Ukrainian', async () => {
            const translated = await translateLocation(mockLocation, 'uk')
            
            expect(translated).toHaveProperty('title')
            expect(translated).toHaveProperty('description')
            console.log(`Location translated to Ukrainian:`, translated.title)
        }, 15000)

        it('should translate location to Russian', async () => {
            const translated = await translateLocation(mockLocation, 'ru')
            
            expect(translated).toHaveProperty('title')
            expect(translated).toHaveProperty('description')
            console.log(`Location translated to Russian:`, translated.title)
        }, 15000)

        it('should preserve non-translatable fields', async () => {
            const translated = await translateLocation(mockLocation, 'pl')
            
            expect(translated.id).toBe(mockLocation.id)
            expect(translated.city).toBe(mockLocation.city)
            expect(translated.country).toBe(mockLocation.country)
        }, 15000)
    })

    describe('Auto-Translate All Languages', () => {
        it('should translate to all supported languages', async () => {
            const result = await autoTranslateAll(mockLocation)
            
            expect(result).toHaveProperty('translations')
            expect(result.translations).toHaveProperty('en')
            expect(result.translations).toHaveProperty('pl')
            expect(result.translations).toHaveProperty('uk')
            expect(result.translations).toHaveProperty('ru')
            
            console.log('✅ Location translated to all languages:')
            console.log('  EN:', result.translations.en?.title)
            console.log('  PL:', result.translations.pl?.title)
            console.log('  UK:', result.translations.uk?.title)
            console.log('  RU:', result.translations.ru?.title)
        }, 30000)

        it('should include translation timestamps', async () => {
            const result = await autoTranslateAll(mockLocation)
            
            Object.values(result.translations).forEach(trans => {
                expect(trans).toHaveProperty('translated_at')
            })
        }, 30000)

        it('should handle null input', async () => {
            const result = await autoTranslateAll(null)
            expect(result).toBeNull()
        })
    })

    describe('Error Handling', () => {
        it('should handle translation failures gracefully', async () => {
            const badLocation = {
                title: null,
                description: undefined
            }
            
            const translated = await translateLocation(badLocation, 'pl')
            expect(translated).toBeDefined()
        })

        it('should continue on partial failures', async () => {
            const location = {
                title: 'Test',
                description: 'Test description',
                what_to_try: ['Item 1', 'Item 2']
            }
            
            const translated = await translateLocation(location, 'pl')
            expect(translated).toHaveProperty('title')
            expect(translated).toHaveProperty('description')
        }, 15000)
    })
})

console.log('🎯 Auto-Translation E2E Tests Loaded')
