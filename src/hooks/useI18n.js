import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import i18n, { changeLanguage, getCurrentLanguage } from '@/i18n/config'

/**
 * useI18n - Умный хук для управления переводами
 * 
 * @param {string} namespace - Пространство имен (common, admin, features)
 * @param {boolean} isAdmin - Режим админки (true = русский, false = английский)
 * @returns {Object} Методы и данные для работы с переводами
 */
export function useI18n(namespace = 'common', isAdmin = false) {
    const { t, i18n: i18nInstance } = useTranslation()
    const [currentLang, setCurrentLang] = useState(getCurrentLanguage())

    // Авто-переключение языка на основе роли
    useEffect(() => {
        const targetLang = isAdmin ? 'ru' : 'en'
        if (getCurrentLanguage() !== targetLang) {
            changeLanguage(targetLang)
            setCurrentLang(targetLang)
        }
    }, [isAdmin])

    // Функция для явного переключения языка
    const setLanguage = (lng) => {
        changeLanguage(lng)
        setCurrentLang(lng)
    }

    // Функция для переключения на язык пользователя
    const setUserLanguage = () => setLanguage('en')

    // Функция для переключения на язык админки
    const setAdminLanguage = () => setLanguage('ru')

    // Получить доступные языки
    const getAvailableLanguages = () => {
        return i18nInstance.options.supportedLngs || ['en', 'ru', 'pl', 'ua']
    }

    return {
        t,
        i18n: i18nInstance,
        language: currentLang,
        setLanguage,
        setUserLanguage,
        setAdminLanguage,
        getAvailableLanguages,
        isAdminMode: isAdmin
    }
}

/**
 * useAppLanguage - Хук только для пользовательского приложения
 */
export function useAppLanguage() {
    return useI18n('features', false)
}

/**
 * useAdminLanguage - Хук только для админки
 */
export function useAdminLanguage() {
    return useI18n('admin', true)
}

export default useI18n
