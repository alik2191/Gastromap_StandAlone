# 🌍 I18N GUIDE - Gastromap V2

**Last Updated:** 2026-03-31  
**Author:** Gas AI - i18n Architect  
**Status:** ✅ READY FOR IMPLEMENTATION

---

## 🎯 OVERVIEW

Gastromap V2 uses a **modular i18n system** with separate language management for:
- **Admin Panel** → Russian (fixed)
- **User App** → English (default) + other languages

---

## 📁 PROJECT STRUCTURE

```
src/
├── i18n/
│   └── config.js              # Main i18n configuration
│
├── locales/
│   ├── en/                    # English (User App)
│   │   ├── common/            # Shared translations
│   │   │   ├── navigation.json
│   │   │   ├── buttons.json
│   │   │   └── status.json
│   │   └── features/          # Feature-specific
│   │       ├── explore.json
│   │       ├── location_card.json
│   │       └── reviews.json
│   │
│   ├── ru/                    # Russian (Admin + Optional User)
│   │   ├── common/
│   │   ├── admin/             # Admin-only translations
│   │   │   ├── dashboard.json
│   │   │   ├── locations.json
│   │   │   └── users.json
│   │   └── features/          # Russian user features (optional)
│   │
│   ├── pl/                    # Polish (Future)
│   └── ua/                    # Ukrainian (Future)
│
└── hooks/
    └── useI18n.js             # Smart i18n hook
```

---

## 🔧 ARCHITECTURE

### Language Separation Strategy

```
┌─────────────────────────────────────┐
│         GASTROMAP V2 APP            │
└─────────────────────────────────────┘
                │
        ┌───────┴───────┐
        │               │
   ┌────▼────┐    ┌────▼────┐
   │  Admin  │    │  User   │
   │  Panel  │    │   App   │
   └────┬────┘    └────┬────┘
        │               │
   ┌────▼────┐    ┌────▼────┐
   │ Russian │    │ English │
   │ (Fixed) │    │ + More  │
   └─────────┘    └─────────┘
```

### Translation Namespaces

| Namespace | Purpose | Languages |
|-----------|---------|-----------|
| **common** | Shared UI (nav, buttons, status) | All |
| **admin** | Admin panel only | Russian |
| **features** | User-facing features | English + others |

---

## 🚀 QUICK START

### 1. Using in Components

```javascript
import { useI18n } from '@/hooks/useI18n'

function MyComponent() {
    const { t, language, setLanguage } = useI18n()
    
    return (
        <div>
            <h1>{t('nav.explore')}</h1>
            <button>{t('buttons.save')}</button>
        </div>
    )
}
```

### 2. Admin Component (Auto Russian)

```javascript
import { useAdminLanguage } from '@/hooks/useI18n'

function AdminDashboard() {
    const { t } = useAdminLanguage()
    
    return (
        <div>
            <h1>{t('admin.dashboard.title')}</h1>
            <p>{t('admin.dashboard.welcome', { name: 'Admin' })}</p>
        </div>
    )
}
```

### 3. User Component (Auto English)

```javascript
import { useAppLanguage } from '@/hooks/useI18n'

function ExplorePage() {
    const { t } = useAppLanguage()
    
    return (
        <div>
            <h1>{t('explore.discover')}</h1>
            <p>{t('explore.places_found', { count: 10 })}</p>
        </div>
    )
}
```

---

## 📝 ADDING NEW LANGUAGE

### Step 1: Create Folder Structure

```bash
mkdir -p src/locales/es/common
mkdir -p src/locales/es/features
```

### Step 2: Add Translation Files

```json
// src/locales/es/common/navigation.json
{
    "nav": {
        "overview": "Descripción general",
        "explore": "Explorar",
        "ai_guide": "GastroGuía",
        "saved": "Guardados",
        "visited": "Visitados"
    }
}
```

### Step 3: Update i18n Config

```javascript
// src/i18n/config.js
import esCommon from '../locales/es/common/navigation.json'

const resources = {
    en: { ... },
    ru: { ... },
    es: {  // Add Spanish
        translation: esCommon
    }
}

i18n.init({
    supportedLngs: ['en', 'ru', 'pl', 'ua', 'es']  // Add 'es'
})
```

### Step 4: Test

```javascript
import { changeLanguage } from '@/i18n/config'
changeLanguage('es')
```

---

## 🔧 HELPER FUNCTIONS

### Manual Language Change

```javascript
import { changeLanguage } from '@/i18n/config'

// Change to Spanish
changeLanguage('es')

// Change to Polish
changeLanguage('pl')
```

### Get Current Language

```javascript
import { getCurrentLanguage } from '@/i18n/config'

const current = getCurrentLanguage()  // 'en', 'ru', etc.
```

### Use LanguageSelector Component

```javascript
import { LanguageSelector } from '@/features/shared/components/LanguageSelector'

function Header() {
    return (
        <header>
            <LanguageSelector isAdminMode={false} />
        </header>
    )
}
```

---

## 📊 TRANSLATION WORKFLOW

### For New Features

1. **Create translation keys** in `src/locales/en/features/`
2. **Add Russian translations** (if needed) in `src/locales/ru/features/`
3. **Use `t()` function** in components
4. **Test both languages**

### Example: Adding New Feature

```javascript
// 1. Create English translations
// src/locales/en/features/ai_chat.json
{
    "ai": {
        "chat": {
            "title": "GastroGuide AI",
            "placeholder": "Ask me anything...",
            "suggestions": [
                "Best Italian restaurants",
                "Romantic places for date night",
                "Budget-friendly options"
            ]
        }
    }
}

// 2. Create Russian translations (optional)
// src/locales/ru/features/ai_chat.json
{
    "ai": {
        "chat": {
            "title": "GastroGuide AI",
            "placeholder": "Спросите меня о чём угодно...",
            "suggestions": [
                "Лучшие итальянские рестораны",
                "Романтические места для свидания",
                "Бюджетные варианты"
            ]
        }
    }
}

// 3. Use in component
import { useAppLanguage } from '@/hooks/useI18n'

function AIChat() {
    const { t } = useAppLanguage()
    
    return (
        <div>
            <h2>{t('ai.chat.title')}</h2>
            <input placeholder={t('ai.chat.placeholder')} />
        </div>
    )
}
```

---

## 🎨 BEST PRACTICES

### DO ✅

- Use **namespaces** (common, admin, features)
- Keep translations **modular** (one file per feature)
- Use **interpolation** for variables: `{{count}}`
- Test **both admin and user modes**
- Document **new translation keys**

### DON'T ❌

- Hardcode text in components
- Mix admin and user translations
- Use Russian in user-facing code
- Forget to add fallback translations

---

## 🔍 DEBUGGING

### Check Current Translations

```javascript
import { useTranslation } from 'react-i18next'

function DebugComponent() {
    const { t, i18n } = useTranslation()
    
    console.log('Current language:', i18n.language)
    console.log('Available languages:', i18n.options.supportedLngs)
    console.log('Translation:', t('nav.explore'))
    
    return <div>Check console</div>
}
```

### Missing Translation Key

If you see the key itself instead of translation:
1. Check if key exists in JSON file
2. Verify namespace is correct
3. Ensure file is imported in config

---

## 📈 FUTURE ENHANCEMENTS

### Planned for Q2 2026

- [ ] **User language preferences** - Save per user
- [ ] **Auto-detect location** - Suggest local language
- [ ] **RTL support** - Arabic, Hebrew
- [ ] **Translation management** - Crowdin integration
- [ ] **Lazy loading** - Load translations on demand

### Planned for Q3 2026

- [ ] **AI translations** - Auto-translate missing keys
- [ ] **Community contributions** - Allow user translations
- [ ] **A/B testing** - Test different translations
- [ ] **Analytics** - Track language usage

---

## 📚 RESOURCES

- [react-i18next Documentation](https://react.i18next.com/)
- [i18next Browser Language Detector](https://github.com/i18next/i18next-browser-languageDetector)
- [Translation Best Practices](https://www.i18next.com/)

---

## 🆘 TROUBLESHOOTING

### Issue: Translations not loading

**Solution:**
```bash
# Clear browser cache
# Check console for import errors
# Verify JSON syntax in translation files
```

### Issue: Wrong language displayed

**Solution:**
```javascript
// Force language change
import { changeLanguage } from '@/i18n/config'
changeLanguage('en')  // or 'ru'
```

### Issue: Admin showing English

**Solution:**
```javascript
// Use useAdminLanguage hook
import { useAdminLanguage } from '@/hooks/useI18n'
const { t } = useAdminLanguage()  // Auto Russian
```

---

**Maintained by:** Gas AI - i18n Architect  
**Last Review:** 2026-03-31  
**Next Review:** 2026-04-30
