# 🚀 GastroMap V2 - Complete Deployment Guide

**Step-by-step guide to deploy on Vercel + Supabase**

---

## ⏱️ Estimated Time: 35-40 minutes

---

## 🎯 STEP 1: Supabase Setup (15 min)

### 1.1 Create Project
1. Go to https://supabase.com
2. New Project → Name: `gastromap-production`
3. Save database password!

### 1.2 Get API Keys
Settings → API:
- **Project URL:** `https://xxxxx.supabase.co`
- **anon/public key:** `eyJhbGci...`

### 1.3 Run Migrations
SQL Editor → New Query:
1. Run `20260331_knowledge_graph_ontology.sql`
2. Run `20260331_user_preferences_learning.sql`

✅ Verify: 30+ tables created

---

## 🎯 STEP 2: OpenRouter Setup (5 min)

1. Go to https://openrouter.ai
2. Sign up → Keys → Create Key
3. Copy: `sk-or-v1-...`

**Free models available:**
- Llama 3.3 70B
- DeepSeek V3
- Qwen 2.5 Coder

---

## 🎯 STEP 3: Vercel Deployment (10 min)

### 3.1 Connect GitHub
1. https://vercel.com/new
2. Import: `Gastromap_StandAlone`

### 3.2 Environment Variables

| Name | Value |
|------|-------|
| `VITE_SUPABASE_URL` | Your Supabase URL |
| `VITE_SUPABASE_ANON_KEY` | Your anon key |
| `VITE_OPENROUTER_API_KEY` | Your OpenRouter key |
| `VITE_APP_NAME` | `GastroMap` |

### 3.3 Deploy
Click **Deploy** → Wait 2-5 min

---

## 🎯 STEP 4: Post-Deployment (5 min)

### 4.1 Test
- Open your Vercel URL
- Try GastroGuide chat
- Submit test location

### 4.2 Setup Admin
Supabase SQL Editor:
```sql
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'your-email@example.com';
```

---

## 🧪 Testing Checklist

- [ ] Homepage loads
- [ ] Search works
- [ ] GastroGuide responds
- [ ] Can submit location
- [ ] Admin panel accessible

---

## 📊 Cost Breakdown

**Free Tier:**
- Vercel: Free (100GB/month)
- Supabase: Free (500MB DB)
- OpenRouter: Free models
- Google Places: 1000/day free

**Total: $0/month** 🎉

---

## 🚨 Troubleshooting

**AI Not Working:**
- Check OpenRouter key in Vercel env vars

**Database Errors:**
- Re-run migrations in Supabase

**Build Fails:**
```bash
npm install
npm run build
```

---

## 🎉 You're Done!

Your GastroMap V2 is live! 🚀

Next steps:
1. Invite beta testers
2. Collect feedback
3. Monitor AI usage

---

**Questions?** Open issue on GitHub
