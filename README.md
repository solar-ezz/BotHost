# BotHost — Discord Bot Hosting Platform

A full-stack Next.js 15 application for hosting and managing Discord bots.

## Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: PostgreSQL via Prisma ORM v6
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
DIRECT_URL="postgresql://..."
JWT_SECRET="your-random-secret-min-32-chars"
```

> For local development, `DATABASE_URL` and `DIRECT_URL` can be the same connection string.

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

Vercel will auto-populate `DATABASE_URL` and `POSTGRES_URL_NON_POOLING` in your environment.

### 4. Set Environment Variables

In Vercel project settings → **Environment Variables**:

| Variable | Value |
|---|---|
| `DATABASE_URL` | Vercel Postgres pooled URL (auto-added) |
| `DIRECT_URL` | `POSTGRES_URL_NON_POOLING` value (needed by Prisma for migrations) |
| `JWT_SECRET` | A random 32+ character string |

Generate a strong JWT secret: `openssl rand -base64 32`

### 5. Deploy

The `postinstall` script runs `prisma generate` automatically.
The `build` script runs `prisma migrate deploy` then `next build`.

Click **Deploy** — done.

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
      route.ts
      [id]/
        route.ts
        control/route.ts
        logs/route.ts
        metrics/route.ts
components/
  Sidebar.tsx
  StatusBadge.tsx
lib/
  auth.ts
  prisma.ts
middleware.ts
prisma/
  schema.prisma
```
