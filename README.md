# BotHost — Discord Bot Hosting Platform

## Setup: Discord OAuth Application

Before deploying, you need to create a Discord OAuth app:

1. Go to [discord.com/developers/applications](https://discord.com/developers/applications)
2. Click **New Application** → give it a name → **Create**
3. Go to **OAuth2** in the left sidebar
4. Under **Redirects**, click **Add Redirect** and enter:
   - For local dev: `http://localhost:3000/api/auth/discord/callback`
   - For production: `https://your-domain.vercel.app/api/auth/discord/callback`
5. Copy your **Client ID** and **Client Secret** from the OAuth2 page

---

## Environment Variables (Vercel)

Add these in **Vercel → Settings → Environment Variables**:

| Variable | Value |
|---|---|
| `DATABASE_URL` | Your Prisma/Neon/Supabase connection string |
| `DIRECT_URL` | Same as DATABASE_URL (or non-pooled URL) |
| `JWT_SECRET` | Random 32+ char string (`openssl rand -base64 32`) |
| `DISCORD_CLIENT_ID` | From Discord Developer Portal → OAuth2 |
| `DISCORD_CLIENT_SECRET` | From Discord Developer Portal → OAuth2 |
| `DISCORD_REDIRECT_URI` | `https://your-domain.vercel.app/api/auth/discord/callback` |

---

## Deploy to Vercel

```bash
git add .
git commit -m "Discord OAuth auth"
git push
```

Vercel will auto-deploy. The `vercel-build` script runs `prisma db push` to sync the schema automatically.

---

## Local Development

Create `.env.local`:
```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
JWT_SECRET="local-dev-secret-32-chars-minimum"
DISCORD_CLIENT_ID="your-client-id"
DISCORD_CLIENT_SECRET="your-client-secret"
DISCORD_REDIRECT_URI="http://localhost:3000/api/auth/discord/callback"
```

```bash
npm install
npx prisma db push
npm run dev
```
