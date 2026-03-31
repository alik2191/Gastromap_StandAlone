# 🏗️ ARCHITECTURE OVERVIEW - Gastromap V2

**Last Updated:** 2026-03-31  
**Author:** Gas AI - Code Quality Agent

---

## 🎯 SYSTEM OVERVIEW

```
┌─────────────────────────────────────────────────────────┐
│                    GASTROMAP V2                         │
│           AI-Powered Restaurant Discovery               │
└─────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
   ┌────▼────┐      ┌──────▼──────┐     ┌─────▼─────┐
   │Frontend │      │   Backend   │     │   Data    │
   │  React  │      │  Supabase   │     │  Storage  │
   │  + Vite │      │  PostgreSQL │     │   S3/CDN  │
   └────┬────┘      └──────┬──────┘     └─────┬─────┘
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
                    ┌──────▼──────┐
                    │  AI Services │
                    │  OpenRouter  │
                    │  (LLM APIs)  │
                    └──────────────┘
```

---

## 📦 TECH STACK

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.3.1 | UI framework |
| **Vite** | 5.x | Build tool |
| **Tailwind CSS** | 3.4.17 | Styling |
| **Zustand** | 5.0.10 | State management |
| **React Router** | 6.28.0 | Routing |
| **TanStack Query** | 5.90.19 | Data fetching |
| **Framer Motion** | 12.28.1 | Animations |
| **i18next** | 25.8.13 | Internationalization |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Supabase** | 2.100.1 | Database + Auth |
| **PostgreSQL** | 15+ | Primary database |
| **pgvector** | 0.5+ | Vector embeddings |
| **Edge Functions** | Deno | Server-side logic |

### AI/ML

| Technology | Provider | Purpose |
|------------|----------|---------|
| **OpenRouter** | Multiple | LLM gateway |
| **DeepSeek R1** | DeepSeek | Primary chat model |
| **Step 3.5 Flash** | StepFun | Fast responses |
| **Qwen3.5** | Alibaba | Multilingual support |

---

## 🗂️ PROJECT STRUCTURE

```
Gastromap_StandAlone/
│
├── 📁 src/
│   │
│   ├── 📁 features/           # Feature-based modules
│   │   ├── admin/             # Admin panel
│   │   │   ├── components/    # Admin-specific components
│   │   │   ├── pages/         # Admin pages
│   │   │   ├── layout/        # Admin layout
│   │   │   └── __tests__/     # Admin tests
│   │   │
│   │   ├── auth/              # Authentication
│   │   │   ├── components/    # Login, Signup forms
│   │   │   └── hooks/         # Auth hooks
│   │   │
│   │   ├── public/            # Public pages
│   │   │   ├── Landing.jsx    # Landing page
│   │   │   └── Public.test.jsx
│   │   │
│   │   └── app/               # Main application
│   │       ├── components/    # App components
│   │       └── pages/         # App pages
│   │
│   ├── 📁 shared/             # Shared code
│   │   ├── api/               # API clients
│   │   │   ├── supabase.js    # Supabase client
│   │   │   ├── openrouter.js  # OpenRouter client
│   │   │   └── ai.api.js      # AI service
│   │   │
│   │   ├── config/            # Configuration
│   │   │   └── env.js         # Environment config
│   │   │
│   │   └── lib/               # Utilities
│   │       ├── utils.js       # Helper functions
│   │       └── supabase.js    # Supabase setup
│   │
│   ├── 📁 components/         # Reusable UI
│   │   ├── ui/                # Base UI components
│   │   └── shared/            # Shared components
│   │
│   ├── 📁 hooks/              # Custom React hooks
│   │   ├── useAIChat.js       # AI chat hook
│   │   └── useAuth.js         # Auth hook
│   │
│   └── 📁 store/              # Zustand stores
│       ├── useAppConfigStore.js
│       └── useAuthStore.js
│
├── 📁 docs/                   # Documentation
│   ├── CODE_QUALITY_GUIDE.md
│   ├── TESTING_GUIDE.md
│   └── ARCHITECTURE_OVERVIEW.md
│
├── 📁 supabase/               # Database
│   └── migrations/            # SQL migrations
│
├── 📁 functions/              # Backend functions
│   ├── classifyIntent.ts
│   ├── semanticSearch.ts
│   └── kgSearch.ts
│
└── 📄 package.json
```

---

## 🔄 DATA FLOW

### User Query Flow

```
User Input
    │
    ▼
┌─────────────┐
│ React App   │
│ (Frontend)  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ useAIChat   │
│ (Hook)      │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ AI API      │
│ (Service)   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ OpenRouter  │
│ (LLM Gateway)│
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ LLM Model   │
│ (DeepSeek)  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Response    │
│ Streaming   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ UI Update   │
│ (React)     │
└─────────────┘
```

### Database Query Flow

```
React Component
       │
       ▼
┌─────────────┐
│ TanStack    │
│ Query Hook  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Supabase    │
│ Client      │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ PostgreSQL  │
│ Database    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Row-Level   │
│ Security    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Data Cache  │
│ (React Query)│
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ UI Update   │
└─────────────┘
```

---

## 🔐 SECURITY

### Authentication

- **Provider:** Supabase Auth
- **Method:** JWT tokens
- **Storage:** Secure cookies
- **Sessions:** Persistent (30 days)

### Authorization

- **Row-Level Security (RLS):** Enabled on all tables
- **Role-Based Access:** Admin, Premium, Free
- **API Protection:** CORS + Rate limiting

### Data Protection

- **Encryption:** TLS 1.3 (in transit)
- **Database:** AES-256 (at rest)
- **Secrets:** Environment variables only

---

## 📊 STATE MANAGEMENT

### Zustand Stores

```javascript
// useAppConfigStore
{
  aiModel: string,
  temperature: number,
  agents: Array<Agent>,
  updateModel: (model: string) => void,
  updateSettings: (settings: object) => void
}

// useAuthStore
{
  user: User | null,
  isAuthenticated: boolean,
  login: (email, password) => Promise<void>,
  logout: () => void
}
```

### React Query Cache

```javascript
// Query Keys
['restaurants', { location, cuisine }]
['user', { userId }]
['reviews', { restaurantId }]
['ai-models', { provider }]
```

---

## 🚀 DEPLOYMENT

### Environments

| Environment | URL | Purpose |
|-------------|-----|---------|
| **Development** | localhost:5173 | Local development |
| **Staging** | staging.gastromap.com | Testing |
| **Production** | gastromap.com | Live site |

### Build Process

```bash
# 1. Install dependencies
npm install

# 2. Run tests
npm run test -- --run

# 3. Build production bundle
npm run build

# 4. Deploy to Vercel
vercel --prod
```

---

## 📈 PERFORMANCE TARGETS

| Metric | Target | Current |
|--------|--------|---------|
| **First Contentful Paint** | <1.5s | ~1.2s ✅ |
| **Time to Interactive** | <3.5s | ~2.8s ✅ |
| **Largest Contentful Paint** | <2.5s | ~2.1s ✅ |
| **Cumulative Layout Shift** | <0.1 | ~0.05 ✅ |
| **API Response Time** | <500ms | ~350ms ✅ |

---

## 🔮 FUTURE ENHANCEMENTS

### Q2 2026

- [ ] Knowledge Graph integration
- [ ] Semantic search with pgvector
- [ ] E2E tests (Playwright)
- [ ] CI/CD pipeline (GitHub Actions)

### Q3 2026

- [ ] Mobile app (React Native)
- [ ] Offline mode (PWA++)
- [ ] AR dish visualization
- [ ] Voice search

### Q4 2026

- [ ] AI employee assistants
- [ ] Health-aware recommendations
- [ ] Multi-city expansion
- [ ] Partner API integrations

---

**Maintained by:** Gas AI - Code Quality Agent  
**Last Review:** 2026-03-31  
**Next Review:** 2026-04-30
