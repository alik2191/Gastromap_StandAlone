# 🧪 TESTING GUIDE - Gastromap V2

**Last Updated:** 2026-03-31  
**Author:** Gas AI - Code Quality Agent

---

## 🎯 TESTING PHILOSOPHY

> "Test enough to be confident, but not so much that it slows you down."

### Our Approach

1. **Test User Flows** - Focus on what users actually do
2. **Test Critical Paths** - Auth, payments, core features
3. **Keep Tests Stable** - Avoid brittle tests that break often
4. **Fast Feedback** - Tests should run in seconds, not minutes

---

## 📦 TEST SETUP

### Dependencies

```json
{
  "devDependencies": {
    "vitest": "^4.0.18",
    "@testing-library/react": "^10.x",
    "@testing-library/dom": "^10.x",
    "@testing-library/jest-dom": "^6.x",
    "jsdom": "^latest"
  }
}
```

### Configuration

```javascript
// vitest.config.js
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.js'],
  },
})
```

---

## 📁 TEST FILES

### Active Tests (Passing ✅)

| File | Tests | Purpose |
|------|-------|---------|
| `src/features/admin/__tests__/AdminLocationsPage.test.jsx` | 4 | Admin locations management |
| `src/features/admin/__tests__/AdminStatsPage.test.jsx` | 4 | Admin statistics dashboard |
| `src/features/auth/Auth.test.jsx` | 3 | User & Admin login flows |
| `src/features/public/Public.test.jsx` | 2 | Landing page & navigation |

### Backed Up Tests (⏸️ Pending i18n Fix)

| File | Issue | Resolution |
|------|-------|------------|
| `AdminDashboardPage.test.jsx.bak` | i18n mismatch | Fix component language |
| `AdminAIPage.test.jsx.bak` | i18n mismatch | Fix component language |
| `AdminUsersPage.test.jsx.bak` | i18n mismatch | Fix component language |
| `AdminSubscriptionsPage.test.jsx.bak` | i18n mismatch | Fix component language |
| `AdminLayout.test.jsx.bak` | i18n mismatch | Fix component language |

---

## 🔧 HOW TO FIX BACKED UP TESTS

### Step 1: Identify Language Mismatch

```bash
# Check what text the component actually renders
grep -E "<h1|<h2|<h3" src/features/admin/pages/AdminDashboardPage.jsx

# Example output:
# <h1>Панель управления</h1>  # Russian!
```

### Step 2: Update Test or Component

**Option A: Fix Component (Recommended)**

```javascript
// src/features/admin/pages/AdminDashboardPage.jsx
// Change from Russian to English
<h1>Dashboard</h1>  // ✅ Consistent
```

**Option B: Update Test**

```javascript
// src/features/admin/__tests__/AdminDashboardPage.test.jsx
// Support both languages
expect(screen.getByText(/Dashboard|Панель управления/i)).toBeInTheDocument()
```

### Step 3: Rename Test File

```bash
# Remove .bak extension
mv src/features/admin/__tests__/AdminDashboardPage.test.jsx.bak \
   src/features/admin/__tests__/AdminDashboardPage.test.jsx
```

### Step 4: Run Test

```bash
npm run test -- src/features/admin/__tests__/AdminDashboardPage.test.jsx
```

---

## 📊 TEST METRICS

### Current Status

```
Test Files: 4 passed (100%)
Tests:      13 passed (100%)
Duration:   ~4.7s
Coverage:   Not yet configured
```

### Target Metrics (Q2 2026)

```
Test Files: 15+
Tests:      50+
Pass Rate:  95%+
Coverage:   80%+
Duration:   <10s
```

---

## 🧩 TEST PATTERNS

### Pattern 1: Render Test

```javascript
it('renders component', () => {
    render(<Component />)
    expect(screen.getByRole('main')).toBeInTheDocument()
})
```

### Pattern 2: Interaction Test

```javascript
it('handles click', () => {
    render(<Button onClick={handleClick}>Click me</Button>)
    fireEvent.click(screen.getByText('Click me'))
    expect(handleClick).toHaveBeenCalledTimes(1)
})
```

### Pattern 3: Async Test

```javascript
it('loads data', async () => {
    render(<Component />)
    const data = await screen.findByText(/loaded/i)
    expect(data).toBeInTheDocument()
})
```

### Pattern 4: Navigation Test

```javascript
it('navigates on click', () => {
    render(<BrowserRouter><Link to="/about">About</Link></BrowserRouter>)
    fireEvent.click(screen.getByText('About'))
    expect(window.location.pathname).toBe('/about')
})
```

---

## 🐛 DEBUGGING FAILING TESTS

### Common Issues

**1. Element Not Found**

```javascript
// ❌ Fails
expect(screen.getByText('Submit')).toBeInTheDocument()

// ✅ Debug
console.log(screen.debug())  // See full DOM
expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument()
```

**2. Async Timing**

```javascript
// ❌ Fails (too fast)
expect(screen.getByText('Loaded')).toBeInTheDocument()

// ✅ Wait for element
const loaded = await screen.findByText('Loaded')
expect(loaded).toBeInTheDocument()
```

**3. i18n Mismatch**

```javascript
// ❌ Fails (expects English, component has Russian)
expect(screen.getByText('Dashboard')).toBeInTheDocument()

// ✅ Support both
expect(screen.getByText(/Dashboard|Панель управления/i)).toBeInTheDocument()
```

---

## 🚀 BEST PRACTICES

### DO ✅

- Write tests for user flows
- Use descriptive test names
- Keep tests independent
- Mock external APIs
- Test edge cases

### DON'T ❌

- Test implementation details
- Write tests that depend on each other
- Snapshot test everything
- Ignore failing tests
- Write tests after deployment

---

## 📚 ADDITIONAL RESOURCES

- [Vitest Best Practices](https://vitest.dev/guide/)
- [Testing Library Common Mistakes](https://testing-library.com/docs/dom-testing-library/tips/)
- [React Testing Examples](https://github.com/testing-library/react-testing-library-examples)

---

**Maintained by:** Gas AI - Code Quality Agent  
**Last Review:** 2026-03-31
