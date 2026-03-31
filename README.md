# 🍽️ GastroMap V2 - StandAlone

**AI-powered restaurant discovery platform with Knowledge Graph, personalized recommendations, and community-driven contributions.**

---

## 🚀 Quick Start

### 1. Install & Setup

```bash
git clone https://github.com/alik2191/Gastromap_StandAlone.git
cd Gastromap_StandAlone
npm install
cp .env.example .env
```

### 2. Setup Database

Run migrations in Supabase SQL Editor:
1. `supabase/migrations/20260331_knowledge_graph_ontology.sql`
2. `supabase/migrations/20260331_user_preferences_learning.sql`

### 3. Run

```bash
npm run dev
```

---

## 📦 Features

### 🧠 AI-Powered
- **GastroGuide AI** - Personalized restaurant recommendations
- **User Preference Learning** - Remembers likes/dislikes from chat
- **Knowledge Graph** - Cuisines, dishes, ingredients, allergens ontology
- **Intent Detection** - Understands context

### 👥 Community
- **User Submissions** - Anyone can suggest a restaurant
- **Insider Tip & Must Try** - Unique recommendations
- **Top-10 Contributors** - Lifetime free subscription
- **Hybrid Moderation** - AI + human review

### 🔍 Verification
- **Google Places Integration** - Auto-verify hours, status
- **Brave Search** - Fallback (2000 free queries/month)
- **AI Agent** - Detects changes, suggests updates

### ⚙️ Admin Panel
- **AI Settings** - Configure 3 AI agents
- **Model Selection** - Choose LLM for each agent
- **Moderation Queue** - Review submissions
- **Analytics** - Track AI usage

---

## 🗄️ Database Schema

### Core Tables
- **locations** - Restaurants/cafes/bars
- **cuisines** - World cuisines ontology
- **dishes** - Dishes with ingredients
- **ingredients** - Ingredient database
- **allergens** - Allergen information
- **vibes** - Atmosphere/occasion tags

### AI & Learning
- **user_preferences** - User preference profile
- **chat_sessions** - GastroGuide chat history
- **chat_messages** - Individual messages
- **contributors** - Leaderboard (Top-10)
- **user_submissions** - User-suggested locations
- **ai_agent_configs** - Agent configurations

---

## 🤖 AI Agents

### 1. Administrator AI
- **Model:** Claude 3.7 Sonnet
- **Role:** Help admin manage the app
- **Interface:** Telegram + Admin Dashboard

### 2. GastroGuide AI
- **Model:** Llama 3.3 70B (free)
- **Role:** User-facing restaurant guide
- **Features:** Personalization, learning

### 3. Verification Agent
- **Model:** Llama 3.3 70B (free)
- **Role:** Verify location data
- **Sources:** Google Places + Brave Search

### 4. Moderation AI
- **Model:** Qwen 2.5 Coder (free)
- **Role:** Pre-moderate submissions

---

## 🚀 Deployment

### Vercel

1. Connect repo to Vercel
2. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_OPENROUTER_API_KEY`
3. Deploy!

See **[docs/DEPLOY_GUIDE.md](./docs/DEPLOY_GUIDE.md)** for full instructions.

---

## 📊 Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Zustand
- **Backend:** Supabase (PostgreSQL + pgvector)
- **AI:** OpenRouter (350+ LLM models)
- **Maps:** Leaflet, OpenStreetMap
- **i18n:** EN, PL, RU, UA

---

## 📈 Roadmap

- ✅ Knowledge Graph ontology
- ✅ User preference learning
- ✅ Contributor system
- 🔄 Mobile app (React Native)
- 🔄 AR dish visualization
- 🔄 Voice search

---

## 👥 Team

- **Alik** - Founder & Developer
- **Gas AI** - AI Agent & Automation

---

## 📄 License

MIT License

---

**Built with ❤️ for food lovers**
