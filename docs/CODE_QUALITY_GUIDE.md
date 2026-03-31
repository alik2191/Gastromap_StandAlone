# 📋 CODE QUALITY GUIDE - Gastromap V2

**Last Updated:** 2026-03-31  
**Author:** Gas AI - Code Quality Agent

---

## 🎯 OVERVIEW

This guide documents the code quality standards, testing strategy, and best practices for Gastromap V2.

---

## 📊 PROJECT STRUCTURE

```
Gastromap_StandAlone/
├── src/
│   ├── features/          # Feature-based modules
│   │   ├── admin/         # Admin panel features
│   │   ├── auth/          # Authentication flows
│   │   ├── public/        # Public pages (Landing)
│   │   └── app/           # Main app features
│   ├── shared/            # Shared utilities
│   │   ├── api/           # API clients (Supabase, OpenRouter)
│   │   ├── config/        # Configuration files
│   │   └── lib/           # Utility functions
│   ├── components/        # Reusable UI components
│   ├── hooks/             # Custom React hooks
│   └── store/             # Zustand state management
├── docs/                  # Documentation (this folder)
├── tests/                 # E2E tests (future)
└── supabase/              # Database migrations
```

---

## 🧪 TESTING STRATEGY

### Test Pyramid

```
        /\
       /  \      E2E Tests (Future)
      /----\    
     /      \   Integration Tests (Current)
    /--------\  
   /          \ Unit Tests (Future)
  /------------\
```

### Current Test Coverage

| Test Suite | Tests | Status | Duration |
|------------|-------|--------|----------|
| AdminLocationsPage | 4 | ✅ 100% | ~800ms |
| Public Features | 2 | ✅ 100% | ~1200ms |
| Auth Features | 3 | ✅ 100% | ~2400ms |
| AdminStatsPage | 4 | ✅ 100% | ~300ms |
| **TOTAL** | **13** | **✅ 100%** | **~4.7s** |

### Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test -- --watch

# Run tests with coverage (future)
npm run test -- --coverage

# Run specific test file
npm run test -- src/features/auth/Auth.test.jsx
```

### Test File Naming Convention

```
✅ Correct:
- AdminLocationsPage.test.jsx
- Auth.test.jsx
- Public.test.jsx

❌ Incorrect:
- adminLocationsPageTest.js
- test-auth.jsx
```

### Test Structure Example

```javascript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Component from '../Component'

describe('ComponentName', () => {
    it('renders correctly', () => {
        render(<Component />)
        expect(screen.getByRole('main')).toBeInTheDocument()
    })

    it('handles user interaction', () => {
        render(<Component />)
        const button = screen.getByRole('button')
        fireEvent.click(button)
        expect(button).toHaveAttribute('aria-expanded', 'true')
    })
})
```

---

## 🔧 CODE QUALITY CHECKS

### Pre-Commit Checklist

- [ ] Tests pass (`npm run test`)
- [ ] No console.log in production code
- [ ] No TODO/FIXME comments (or documented)
- [ ] Imports use correct aliases (@/)
- [ ] Components follow single responsibility
- [ ] Props are typed/validated

### Automated Checks (Future CI/CD)

```yaml
# .github/workflows/ci.yml (example)
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm install
      - run: npm run test -- --run
      - run: npm run build
```

---

## 📝 CODING STANDARDS

### React Components

```javascript
// ✅ Good: Clear structure, proper imports
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export function ComponentName({ prop1, prop2 }) {
    // Hooks first
    const [state, setState] = useState(initialValue)
    
    // Effects
    useEffect(() => {
        // side effect
    }, [dependencies])
    
    // Event handlers
    const handleClick = () => {
        // handler logic
    }
    
    // Render
    return (
        <div className={cn('base-styles', className)}>
            {/* JSX */}
        </div>
    )
}
```

### State Management (Zustand)

```javascript
// ✅ Good: Clear store structure
import { create } from 'zustand'

export const useStore = create((set, get) => ({
    // State
    items: [],
    isLoading: false,
    
    // Actions
    setItems: (items) => set({ items }),
    setLoading: (isLoading) => set({ isLoading }),
    
    // Selectors (computed values)
    getItemCount: () => get().items.length,
}))
```

### API Calls (Supabase)

```javascript
// ✅ Good: Error handling, typed responses
import { supabase } from '@/lib/supabase'

export async function fetchData() {
    try {
        const { data, error } = await supabase
            .from('table')
            .select('*')
            .eq('status', 'active')
        
        if (error) throw error
        return data
    } catch (err) {
        console.error('Fetch error:', err)
        throw err
    }
}
```

---

## ⚠️ KNOWN ISSUES

### Technical Debt

| Issue | Count | Priority | Status |
|-------|-------|----------|--------|
| console.log statements | 24 | Medium | Documented |
| TODO/FIXME comments | 2 | Low | Documented |
| React Router future flags | 1 | Low | Pending |
| i18n mismatch in admin | 5 files | Medium | Backed up tests |

### Resolution Plan

1. **Before Production:**
   - Remove all console.log statements
   - Fix i18n consistency in admin components
   - Add React Router future flags

2. **Post-Launch:**
   - Setup CI/CD pipeline
   - Add E2E tests
   - Implement code coverage reporting

---

## 📚 RESOURCES

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Zustand Guide](https://zustand-demo.pmnd.rs/)
- [Supabase JS Client](https://supabase.com/docs/reference/javascript/introduction)

---

**Maintained by:** Gas AI - Code Quality Agent  
**Contact:** Via GitHub Issues
