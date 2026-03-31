#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Простые переводы для ключей
const translations = {
    pl: {
        // Dashboard
        "dashboard.greeting_morning": "Dzień dobry",
        "dashboard.greeting_afternoon": "Dzień dobry",
        "dashboard.greeting_evening": "Dobry wieczór",
        "dashboard.tagline": "Odkrywaj najlepsze miejsca kulinarne",
        "dashboard.search_placeholder": "Szukaj restauracji, kuchni, miejsc…",
        "dashboard.search_btn": "Szukaj",
        "dashboard.explore_countries": "Odkrywaj Kraje",
        "dashboard.culinary_traditions": "Tradycje Kulinarne",
        "dashboard.recommended": "Polecane",
        "dashboard.perfect_spots": "Idealne Miejsca",
        "dashboard.top_choice": "Top Wybór",
        "dashboard.trending": "Trendy",
        "dashboard.hot_spots": "Popularne Miejsca",
        "dashboard.view_all": "Zobacz Wszystko",
        
        // Profile
        "profile.level": "Poziom",
        "profile.visited": "Odwiedzone",
        "profile.reviews": "Opinie",
        "profile.reward": "Nagroda",
        "profile.contributions": "Wkład",
        "profile.add_place": "Dodaj Miejsce",
        "profile.no_contributions": "Brak wkładu",
        "profile.approved": "Zatwierdzone",
        "profile.pending": "Oczekujące",
        "profile.taste_profile": "Profil Smaku",
        "profile.foodie_dna_label": "Foodie DNA",
        "profile.atmosphere_label": "Atmosfera",
        "profile.features_label": "Cechy",
        "profile.no_dna": "Brak DNA",
        "profile.no_atmosphere": "Brak atmosfery",
        "profile.no_features": "Brak cech",
        "profile.labs": "Labs",
        "profile.biosync_title": "BioSync",
        "profile.biosync_coming": "Wkrótce",
        "profile.biosync_desc": "Personalizacja oparta na zdrowiu",
        "profile.biosync_btn": "Dołącz do listy oczekujących",
        "profile.dine_title": "Dine",
        "profile.dine_beta": "Beta",
        "profile.dine_desc": "Zamawiaj jedzenie z AI",
        "profile.dine_btn": "Wypróbuj",
        "profile.section_account": "Konto",
        "profile.personal_info": "Informacje Osobiste",
        "profile.language_region": "Język i Region",
        "profile.security": "Bezpieczeństwo",
        "profile.section_support": "Wsparcie",
        "profile.send_feedback": "Wyślij Opinię",
        "profile.help_center": "Centrum Pomocy",
        "profile.section_legal": "Prawne",
        "profile.terms": "Warunki",
        "profile.privacy_policy": "Polityka Prywatności",
        "profile.gdpr": "GDPR",
        "profile.section_app": "Aplikacja",
        "profile.check_updates": "Sprawdź Aktualizacje",
        "profile.sign_out": "Wyloguj",
        "profile.feedback_title": "Przekaż Opinię",
        "profile.feedback_desc": "Pomóż nam ulepszyć GastroMap",
        "profile.feedback_placeholder": "Podziel się swoimi przemyśleniami, sugestiami lub problemami…",
        "profile.feedback_send": "Wyślij",
        
        // Profile Edit
        "profile_edit.title": "Edytuj Profil",
        "profile_edit.basic_info": "Podstawowe Informacje",
        "profile_edit.full_name": "Pełne Imię",
        "profile_edit.name_placeholder": "Twoje imię",
        "profile_edit.email": "Email",
        "profile_edit.email_placeholder": "twój@email.com",
        "profile_edit.bio": "Bio",
        "profile_edit.bio_placeholder": "Opowiedz nam o sobie…",
        "profile_edit.taste_dna": "DNA Smaku",
        "profile_edit.dna_label": "Preferencje Kulinarne",
        "profile_edit.dna_hint": "Czego lubisz jeść?",
        "profile_edit.dna_placeholder": "np. Włoskie, Azjatyckie, Wegetariańskie…",
        "profile_edit.atm_label": "Atmosfera",
        "profile_edit.atm_hint": "Jaki klimat lubisz?",
        "profile_edit.atm_placeholder": "np. Romantyczny, Luksusowy, Casual…",
        "profile_edit.features_label": "Cechy",
        "profile_edit.features_hint": "Co jest dla ciebie ważne?",
        "profile_edit.features_placeholder": "np. Ogródek, Parking, Przyjazne zwierzętom…",
        "profile_edit.save": "Zapisz Zmiany",
        
        // Add Place
        "add_place.title": "Dodaj Miejsce",
        "add_place.description": "Podziel się swoim ulubionym miejscem",
        "add_place.section_basic": "Podstawowe",
        "add_place.name_label": "Nazwa",
        "add_place.name_placeholder": "np. Trattoria Bella",
        "add_place.type_label": "Typ",
        "add_place.type_placeholder": "Wybierz typ",
        "add_place.type_restaurant": "Restauracja",
        "add_place.type_cafe": "Kawiarnia",
        "add_place.type_bar": "Bar",
        "add_place.type_streetfood": "Street Food",
        "add_place.city_label": "Miasto",
        "add_place.city_placeholder": "np. Kraków",
        "add_place.address_label": "Adres",
        "add_place.address_placeholder": "Pełny adres",
        "add_place.section_insider": "Wskazówki Insidera",
        "add_place.tip_label": "Wskazówka",
        "add_place.tip_placeholder": "Twoja tajna wskazówka…",
        "add_place.must_try_label": "Must-Try Dania",
        "add_place.must_try_placeholder": "Co musisz spróbować?…",
        "add_place.section_vibe": "Klimat",
        "add_place.tags_label": "Tagi",
        "add_place.tags_placeholder": "Dodaj tagi…",
        "add_place.optional": "(Opcjonalne)",
        "add_place.submit_btn": "Wyślij Miejsce",
        "add_place.submit_notice": "Twoje zgłoszenie zostanie przejrzane przed opublikowaniem.",
        "add_place.success_title": "Miejsce Wysłane!",
        "add_place.success_desc": "Dziękujemy za wkład. Sprawdzimy to wkrótce.",
        "add_place.add_another": "Dodaj Kolejne",
        "add_place.back_home": "Wróć do Strony Głównej",
        
        // Common
        "common.loading": "Ładowanie…",
        "common.error": "Błąd",
        "common.retry": "Ponów",
        "common.back": "Wróć",
        "common.close": "Zamknij",
        "common.save": "Zapisz",
        "common.cancel": "Anuluj",
        "common.edit": "Edytuj",
        "common.delete": "Usuń",
        "common.share": "Udostępnij",
        "common.search": "Szukaj",
        "common.filter": "Filtr",
        "common.all": "Wszystko"
    },
    ua: {
        // Dashboard
        "dashboard.greeting_morning": "Доброго ранку",
        "dashboard.greeting_afternoon": "Доброго дня",
        "dashboard.greeting_evening": "Доброго вечора",
        "dashboard.tagline": "Відкривайте найкращі кулінарні місця",
        "dashboard.search_placeholder": "Шукати ресторани, кухню, місця…",
        "dashboard.search_btn": "Пошук",
        "dashboard.explore_countries": "Досліджувати Країни",
        "dashboard.culinary_traditions": "Кулінарні Традиції",
        "dashboard.recommended": "Рекомендовані",
        "dashboard.perfect_spots": "Ідеальні Місця",
        "dashboard.top_choice": "Топ Вибір",
        "dashboard.trending": "Тренди",
        "dashboard.hot_spots": "Популярні Місця",
        "dashboard.view_all": "Переглянути Всі",
        
        // Profile
        "profile.level": "Рівень",
        "profile.visited": "Відвідано",
        "profile.reviews": "Відгуки",
        "profile.reward": "Нагорода",
        "profile.contributions": "Внески",
        "profile.add_place": "Додати Місце",
        "profile.no_contributions": "Немає внесків",
        "profile.approved": "Схвалено",
        "profile.pending": "На розгляді",
        "profile.taste_profile": "Профіль Смаку",
        "profile.foodie_dna_label": "Foodie DNA",
        "profile.atmosphere_label": "Атмосфера",
        "profile.features_label": "Особливості",
        "profile.no_dna": "Немає DNA",
        "profile.no_atmosphere": "Немає атмосфери",
        "profile.no_features": "Немає особливостей",
        "profile.labs": "Лабораторії",
        "profile.biosync_title": "BioSync",
        "profile.biosync_coming": "Незабаром",
        "profile.biosync_desc": "Персоналізація на основі здоров'я",
        "profile.biosync_btn": "Приєднатися до списку очікування",
        "profile.dine_title": "Dine",
        "profile.dine_beta": "Бета",
        "profile.dine_desc": "Замовляйте їжу з AI",
        "profile.dine_btn": "Спробувати",
        "profile.section_account": "Акаунт",
        "profile.personal_info": "Особиста Інформація",
        "profile.language_region": "Мова та Регіон",
        "profile.security": "Безпека",
        "profile.section_support": "Підтримка",
        "profile.send_feedback": "Надіслати Відгук",
        "profile.help_center": "Центр Допомоги",
        "profile.section_legal": "Юридичне",
        "profile.terms": "Умови",
        "profile.privacy_policy": "Політика Конфіденційності",
        "profile.gdpr": "GDPR",
        "profile.section_app": "Додаток",
        "profile.check_updates": "Перевірити Оновлення",
        "profile.sign_out": "Вийти",
        "profile.feedback_title": "Надіслати Відгук",
        "profile.feedback_desc": "Допоможіть нам покращити GastroMap",
        "profile.feedback_placeholder": "Поділіться своїми думками, пропозиціями або проблемами…",
        "profile.feedback_send": "Надіслати",
        
        // Profile Edit
        "profile_edit.title": "Редагувати Профіль",
        "profile_edit.basic_info": "Основна Інформація",
        "profile_edit.full_name": "Повне Ім'я",
        "profile_edit.name_placeholder": "Ваше ім'я",
        "profile_edit.email": "Email",
        "profile_edit.email_placeholder": "ваш@email.com",
        "profile_edit.bio": "Біо",
        "profile_edit.bio_placeholder": "Розкажіть нам про себе…",
        "profile_edit.taste_dna": "DNA Смаку",
        "profile_edit.dna_label": "Кулінарні Уподобання",
        "profile_edit.dna_hint": "Що ви любите їсти?",
        "profile_edit.dna_placeholder": "напр. Італійська, Азійська, Вегетаріанська…",
        "profile_edit.atm_label": "Атмосфера",
        "profile_edit.atm_hint": "Який клімат ви любите?",
        "profile_edit.atm_placeholder": "напр. Романтичний, Розкішний, Повсякденний…",
        "profile_edit.features_label": "Особливості",
        "profile_edit.features_hint": "Що для вас важливо?",
        "profile_edit.features_placeholder": "напр. Тераса, Парковка, Дозволені тварини…",
        "profile_edit.save": "Зберегти Зміни",
        
        // Add Place
        "add_place.title": "Додати Місце",
        "add_place.description": "Поділіться своїм улюбленим місцем",
        "add_place.section_basic": "Основне",
        "add_place.name_label": "Назва",
        "add_place.name_placeholder": "напр. Trattoria Bella",
        "add_place.type_label": "Тип",
        "add_place.type_placeholder": "Виберіть тип",
        "add_place.type_restaurant": "Ресторан",
        "add_place.type_cafe": "Кафе",
        "add_place.type_bar": "Бар",
        "add_place.type_streetfood": "Вулична Їжа",
        "add_place.city_label": "Місто",
        "add_place.city_placeholder": "напр. Київ",
        "add_place.address_label": "Адреса",
        "add_place.address_placeholder": "Повна адреса",
        "add_place.section_insider": "Інсайдерські Поради",
        "add_place.tip_label": "Порада",
        "add_place.tip_placeholder": "Ваша таємна порада…",
        "add_place.must_try_label": "Must-Try Страви",
        "add_place.must_try_placeholder": "Що обов'язково спробувати?…",
        "add_place.section_vibe": "Атмосфера",
        "add_place.tags_label": "Теги",
        "add_place.tags_placeholder": "Додати теги…",
        "add_place.optional": "(Опціонально)",
        "add_place.submit_btn": "Надіслати Місце",
        "add_place.submit_notice": "Ваше подання буде перевірено перед публікацією.",
        "add_place.success_title": "Місце Надіслано!",
        "add_place.success_desc": "Дякуємо за внесок. Ми перевіримо це найближчим часом.",
        "add_place.add_another": "Додати Ще Одне",
        "add_place.back_home": "Повернутися на Головну",
        
        // Common
        "common.loading": "Завантаження…",
        "common.error": "Помилка",
        "common.retry": "Повторити",
        "common.back": "Назад",
        "common.close": "Закрити",
        "common.save": "Зберегти",
        "common.cancel": "Скасувати",
        "common.edit": "Редагувати",
        "common.delete": "Видалити",
        "common.share": "Поділитися",
        "common.search": "Пошук",
        "common.filter": "Фільтр",
        "common.all": "Все"
    }
}

// Merge translations into existing JSON
function mergeTranslations(existing, additions) {
    const result = { ...existing }
    
    Object.keys(additions).forEach(key => {
        const keys = key.split('.')
        let current = result
        for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) current[keys[i]] = {}
            current = current[keys[i]]
        }
        current[keys[keys.length - 1]] = additions[key]
    })
    
    return result
}

// Process Polish
const plPath = path.join(__dirname, '../src/locales/pl/translation.json')
const plExisting = JSON.parse(fs.readFileSync(plPath, 'utf8'))
const plMerged = mergeTranslations(plExisting, translations.pl)
fs.writeFileSync(plPath, JSON.stringify(plMerged, null, 2), 'utf8')
console.log('✅ Polish translations added!')

// Process Ukrainian
const uaPath = path.join(__dirname, '../src/locales/ua/translation.json')
const uaExisting = JSON.parse(fs.readFileSync(uaPath, 'utf8'))
const uaMerged = mergeTranslations(uaExisting, translations.ua)
fs.writeFileSync(uaPath, JSON.stringify(uaMerged, null, 2), 'utf8')
console.log('✅ Ukrainian translations added!')

