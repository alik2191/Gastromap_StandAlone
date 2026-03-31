#!/usr/bin/env node

import fs from 'fs'

const ruPath = 'src/locales/ru/translation.json'
const ru = JSON.parse(fs.readFileSync(ruPath, 'utf8'))

// Добавлю недостающие ключи
ru.dashboard = {
    ...ru.dashboard,
    greeting_morning: "Доброе утро",
    greeting_afternoon: "Добрый день",
    greeting_evening: "Добрый вечер",
    tagline: "Открывайте лучшие кулинарные места",
    search_placeholder: "Искать рестораны, кухню, места…",
    search_btn: "Поиск",
    explore_countries: "Исследовать Страны",
    culinary_traditions: "Кулинарные Традиции",
    recommended: "Рекомендуемые",
    perfect_spots: "Идеальные Места",
    top_choice: "Топ Выбор",
    trending: "Тренды",
    hot_spots: "Популярные Места",
    view_all: "Посмотреть Все"
}

ru.profile = {
    ...ru.profile,
    level: "Уровень",
    visited: "Посещено",
    reviews: "Отзывы",
    reward: "Награда",
    contributions: "Вклады",
    add_place: "Добавить Место",
    no_contributions: "Нет вкладов",
    approved: "Одобрено",
    pending: "На рассмотрении",
    taste_profile: "Профиль Вкуса",
    foodie_dna_label: "Foodie DNA",
    atmosphere_label: "Атмосфера",
    features_label: "Особенности",
    no_dna: "Нет DNA",
    no_atmosphere: "Нет атмосферы",
    no_features: "Нет особенностей",
    labs: "Лаборатории",
    biosync_title: "BioSync",
    biosync_coming: "Скоро",
    biosync_desc: "Персонализация на основе здоровья",
    biosync_btn: "Вступить в лист ожидания",
    dine_title: "Dine",
    dine_beta: "Бета",
    dine_desc: "Заказывайте еду с AI",
    dine_btn: "Попробовать",
    section_account: "Аккаунт",
    personal_info: "Личная Информация",
    language_region: "Язык и Регион",
    security: "Безопасность",
    section_support: "Поддержка",
    send_feedback: "Отправить Отзыв",
    help_center: "Центр Помощи",
    section_legal: "Юридическое",
    terms: "Условия",
    privacy_policy: "Политика Конфиденциальности",
    gdpr: "GDPR",
    section_app: "Приложение",
    check_updates: "Проверить Обновления",
    sign_out: "Выйти",
    feedback_title: "Отправить Отзыв",
    feedback_desc: "Помогите нам улучшить GastroMap",
    feedback_placeholder: "Поделитесь своими мыслями, предложениями или проблемами…",
    feedback_send: "Отправить"
}

ru.profile_edit = {
    title: "Редактировать Профиль",
    basic_info: "Основная Информация",
    full_name: "Полное Имя",
    name_placeholder: "Ваше имя",
    email: "Email",
    email_placeholder: "ваш@email.com",
    bio: "Био",
    bio_placeholder: "Расскажите нам о себе…",
    taste_dna: "DNA Вкуса",
    dna_label: "Кулинарные Предпочтения",
    dna_hint: "Что вы любите есть?",
    dna_placeholder: "напр. Итальянская, Азиатская, Вегетарианская…",
    atm_label: "Атмосфера",
    atm_hint: "Какой климат вы любите?",
    atm_placeholder: "напр. Романтичный, Роскошный, Повседневный…",
    features_label: "Особенности",
    features_hint: "Что для вас важно?",
    features_placeholder: "напр. Терраса, Парковка, Разрешены животные…",
    save: "Сохранить Изменения"
}

ru.add_place = {
    title: "Добавить Место",
    description: "Поделитесь своим любимым местом",
    section_basic: "Основное",
    name_label: "Название",
    name_placeholder: "напр. Trattoria Bella",
    type_label: "Тип",
    type_placeholder: "Выберите тип",
    type_restaurant: "Ресторан",
    type_cafe: "Кафе",
    type_bar: "Бар",
    type_streetfood: "Уличная Еда",
    city_label: "Город",
    city_placeholder: "напр. Москва",
    address_label: "Адрес",
    address_placeholder: "Полный адрес",
    section_insider: "Инсайдерские Советы",
    tip_label: "Совет",
    tip_placeholder: "Ваш тайный совет…",
    must_try_label: "Must-Try Блюда",
    must_try_placeholder: "Что обязательно попробовать?…",
    section_vibe: "Атмосфера",
    tags_label: "Теги",
    tags_placeholder: "Добавить теги…",
    optional: "(Опционально)",
    submit_btn: "Отправить Место",
    submit_notice: "Ваше представление будет проверено перед публикацией.",
    success_title: "Место Отправлено!",
    success_desc: "Спасибо за вклад. Мы проверим это в ближайшее время.",
    add_another: "Добавить Еще Одно",
    back_home: "Вернуться на Главную"
}

ru.common = {
    loading: "Загрузка…",
    error: "Ошибка",
    retry: "Повторить",
    back: "Назад",
    close: "Закрыть",
    save: "Сохранить",
    cancel: "Отменить",
    edit: "Редактировать",
    delete: "Удалить",
    share: "Поделиться",
    search: "Поиск",
    filter: "Фильтр",
    all: "Все"
}

fs.writeFileSync(ruPath, JSON.stringify(ru, null, 2), 'utf8')
console.log('✅ Russian translations completed!')
