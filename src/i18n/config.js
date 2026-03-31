import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// English translations
import enTranslation from '../locales/en/translation.json'

// Russian translations
import ruTranslation from '../locales/ru/translation.json'

// Polish translations
import plTranslation from '../locales/pl/translation.json'

// Ukrainian translations
import uaTranslation from '../locales/ua/translation.json'

const resources = {
    en: { translation: enTranslation },
    ru: { translation: ruTranslation },
    pl: { translation: plTranslation },
    ua: { translation: uaTranslation }
}

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'en',
        supportedLngs: ['en', 'ru', 'pl', 'ua'],
        debug: false,
        interpolation: {
            escapeValue: false // React already escapes by default
        },
        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage']
        }
    })

// Helper function to change language
export const changeLanguage = (lng) => i18n.changeLanguage(lng)

// Helper to get current language
export const getCurrentLanguage = () => i18n.language

export default i18n
