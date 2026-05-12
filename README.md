# 🌿 Bite

**Your personal AI nutrition coach.** Log meals through a natural conversation, track your daily macros, and see trends over time — all in one clean, fast web app.

🔗 **Live:** [mindyourbite.vercel.app](https://mindyourbite.vercel.app)

---

## Features

- **Conversational meal logging** — just tell the AI what you ate; it extracts calories, protein, carbs, fat, and fiber automatically
- **Daily macro dashboard** — see today's totals at a glance alongside your logged meals
- **Trends view** — visualise your nutrition over time with timezone-correct aggregation
- **Goals / settings** — set your own calorie and macro targets
- **Google OAuth** — one-click sign-in via Supabase Auth
- **Guest / demo mode** — shareable access for recruiters without requiring a login

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router, Turbopack) |
| Styling | Tailwind CSS v4 + custom design tokens |
| Database & Auth | Supabase (Postgres, RLS, Google OAuth) |
| AI | Google Gemini 2.0 Flash |
| Deployment | Vercel |

---

## Getting Started

### Prerequisites

- Node.js 18+
- [Supabase](https://supabase.com) account (free)
- [Vercel](https://vercel.com) account (free)
- [Gemini API key](https://aistudio.google.com/apikey)

### 1 — Clone and install

```bash
