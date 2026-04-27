# Bite — Setup & Deployment Guide

## Prerequisites
- Node.js 18+
- GitHub account
- Supabase account (free): https://supabase.com
- Vercel account (free): https://vercel.com
- Gemini API key: https://aistudio.google.com/apikey

---

## Step 1 — Supabase Setup

1. Go to https://supabase.com → "New Project"
2. Name it `bite` and save the password
3. Go to **SQL Editor** → paste the entire contents of `supabase/schema.sql` → Run
4. Go to **Project Settings → API** and copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

---

## Step 2 — Environment Variables

Copy the example env file:
```bash
cp .env.local.example .env.local
```

Then fill in all values in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
GEMINI_API_KEY=AIza...
```

---

## Step 3 — Seed Historical Data

```bash
npm install tsx dotenv --save-dev
npx tsx supabase/seed.ts
```

This imports your 166 historical meal entries and auto-generates 34 daily summaries.

---

## Step 4 — Run Locally

```bash
npm run dev
```

Open http://localhost:3000 — you should see the Bite Daily Log with the AI chat.

---

## Step 5 — GitHub

```bash
cd bite-app
git init
git add .
git commit -m "feat: initial Bite app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/bite-app.git
git push -u origin main
```

---

## Step 6 — Deploy to Vercel

1. Go to https://vercel.com → "Add New Project"
2. Import your `bite-app` GitHub repo
3. In **Environment Variables**, add all 4 vars from Step 2
4. Click **Deploy** — done! 🎉

Vercel auto-deploys on every `git push`.

---

## Database Schema Overview

| Table | Purpose |
|-------|---------|
| `meals` | Every individual meal logged (by AI or manually) |
| `daily_summaries` | Auto-aggregated per-day stats (via DB trigger) |
| `chat_messages` | AI chat history for memory context |
| `user_goals` | Nutrition targets (calories, protein, etc.) |

The `nutrition` field uses JSONB — easy to add new macros without migrations.

---

## Evolving the Schema

Since we're using JSONB for nutrition data, adding a new field (e.g., `sodium_mg`) is as simple as:

```typescript
// In your meal logging code:
nutrition: { protein_g: 45, carbs_g: 30, fat_g: 10, fiber_g: 5, sodium_mg: 300 }
```

No SQL migration needed! The trigger auto-updates `daily_summaries` too — though you'll need to update the `refresh_daily_summary` function if you want the new field aggregated there.
