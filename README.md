# BotHost — Discord Bot Hosting Platform

A full-stack Next.js 14 application for hosting and managing Discord bots.

## Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL via Prisma ORM
- **Auth**: JWT (jose) + bcryptjs, cookie-based sessions
- **UI**: Tailwind CSS + Recharts + Lucide Icons
- **Deploy**: Vercel + Vercel Postgres (or Neon/Supabase)

---

## Local Development

```bash
npm install
```

Create `.env.local`:
```env
DATABASE_URL="postgresql://..."
JWT_SECRET="your-random-secret-min-32-chars"
```

```bash
npx prisma migrate dev --name init
npm run dev
```

---

## Deploying to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
gh repo create bothost --public --push
```

### 2. Create Vercel Project

Go to [vercel.com](https://vercel.com) → **New Project** → Import your repo.

### 3. Add a Database

In your Vercel project → **Storage** tab → **Create Database** → **Postgres**.

Copy the `DATABASE_URL` it gives you.

### 4. Set Environment Variables

In Vercel project settings → **Environment Variables**:

| Variable | Value |
|---|---|
| `DATABASE_URL` | Your Postgres connection string |
| `JWT_SECRET` | A random 32+ character string |

Generate a strong secret: `openssl rand -base64 32`

### 5. Add Build Command for Prisma

In Vercel project settings → **Build & Output Settings** → override Build Command:

```
prisma generate && prisma migrate deploy && next build
```

### 6. Deploy

Click **Deploy** — Vercel will build and run your migrations automatically.

---

## Project Structure

```
app/
  page.tsx              ← Landing page
  layout.tsx
  globals.css
  login/page.tsx        ← Login
  register/page.tsx     ← Registration
  dashboard/
    layout.tsx          ← Auth-gated layout with sidebar
    page.tsx            ← Bot overview dashboard
  bots/
    layout.tsx
    new/page.tsx        ← Add new bot form
    [id]/page.tsx       ← Bot detail: logs, metrics, controls
  api/
    auth/
      login/route.ts
      register/route.ts
      logout/route.ts
      me/route.ts
    bots/
      route.ts          ← GET all, POST create
      [id]/
        route.ts        ← GET, PATCH, DELETE
        control/route.ts ← POST start/stop/restart
        logs/route.ts   ← GET, DELETE
        metrics/route.ts ← GET, POST (record metric)
components/
  Sidebar.tsx
  StatusBadge.tsx
lib/
  auth.ts               ← JWT + bcrypt helpers
  prisma.ts             ← Prisma client singleton
middleware.ts           ← Route protection
prisma/
  schema.prisma
```
