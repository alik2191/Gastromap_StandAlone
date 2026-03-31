import React from 'react'
import { useI18n } from '@/hooks/useI18n'
import { Globe } from 'lucide-react'

/**
 * LanguageSelector - Компонент выбора языка
 * 
 * @param {boolean} isAdminMode - Режим админки (скрывает выбор языка)
 * @param {string} className - CSS класс
 * @param {function} onLanguageChange - Callback при смене языка
 */
export function LanguageSelector({ isAdminMode = false, className = '', onLanguageChange }) {
    const { 
        language, 
        setLanguage, 
        getAvailableLanguages 
    } = useI18n('common', isAdminMode)

    const languages = [
        { code: 'en', label: 'English', flag: '🇬🇧' },
        { code: 'ru', label: 'Русский', flag: '🇷🇺' },
        { code: 'pl', label: 'Polski', flag: '🇵🇱' },
        { code: 'ua', label: 'Українська', flag: '🇺🇦' }
    ].filter(lang => getAvailableLanguages().includes(lang.code))

    const handleChange = (e) => {
        const newLang = e.target.value
        setLanguage(newLang)
        if (onLanguageChange) {
            onLanguageChange(newLang)
        }
    }

    // В режиме админки показываем только русский
    if (isAdminMode) {
        return (
            <div className={`flex items-center gap-2 ${className}`}>
                <Globe className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">Русский</span>
            </div>
        )
    }

    return (
        <div className={`relative ${className}`}>
            <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-gray-400" />
                <select
                    value={language}
                    onChange={handleChange}
                    className="text-sm border border-gray-300 rounded-md px-3 py-1.5 bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition-colors"
                    aria-label="Select language"
                >
                    {languages.map(lang => (
                        <option key={lang.code} value={lang.code}>
                            {lang.flag} {lang.label}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    )
}

export default LanguageSelector
