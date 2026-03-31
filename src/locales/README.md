# 🌍 TRANSLATIONS - Quick Start Guide

## 📁 Structure

```
locales/
├── en/          # English (User App - Default)
├── ru/          # Russian (Admin Panel)
├── pl/          # Polish (Future)
└── ua/          # Ukrainian (Future)
```

## 🎯 Current Setup

| Area | Language | Files |
|------|----------|-------|
| **Admin Panel** | 🇷🇺 Russian | `ru/admin/*.json` |
| **User App** | 🇬🇧 English | `en/features/*.json` |
| **Shared UI** | Both | `*/common/*.json` |

## 🚀 Adding New Translation

### 1. Create file in appropriate folder

```bash
# For user feature (English)
src/locales/en/features/my_feature.json

# For admin feature (Russian)
src/locales/ru/admin/my_feature.json

# For shared UI (Both)
src/locales/en/common/my_translations.json
src/locales/ru/common/my_translations.json
```

### 2. Add translations

```json
{
    "my_feature": {
        "title": "My Feature",
        "description": "Description here"
    }
}
```

### 3. Use in component

```javascript
import { useAppLanguage } from '@/hooks/useI18n'

function MyComponent() {
    const { t } = useAppLanguage()
    
    return <h1>{t('my_feature.title')}</h1>
}
```

## 📝 Translation Keys Format

```
✅ Good:
- nav.explore
- buttons.save
- admin.dashboard.title
- features.ai_chat.placeholder

❌ Bad:
- explore_text
- saveButton
- title_admin_dashboard
```

## 🔧 Quick Commands

```bash
# Find missing translations
grep -r "t('" src/ --include="*.jsx" | grep -v locales

# Count translation keys
find src/locales/en -name "*.json" -exec cat {} \; | grep -c ":"

# Check JSON syntax
npx jsonlint src/locales/en/features/*.json
```

## 📊 Status

| Language | Status | Coverage |
|----------|--------|----------|
| English | ✅ Complete | 100% |
| Russian | ✅ Complete (Admin) | 100% |
| Polish | ⏳ Pending | 0% |
| Ukrainian | ⏳ Pending | 0% |

## 🆘 Need Help?

See full documentation: [docs/I18N_GUIDE.md](../../docs/I18N_GUIDE.md)
