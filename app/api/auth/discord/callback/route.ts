import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createToken } from '@/lib/auth-edge'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')

  const cookieHeader = req.headers.get('cookie') || ''
  const storedState = cookieHeader
    .split(';')
    .map(c => c.trim())
    .find(c => c.startsWith('oauth-state='))
    ?.split('=')[1]

  if (!code || !state || state !== storedState) {
    return NextResponse.redirect(new URL('/login?error=invalid_state', req.url))
  }

  try {
    const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID!,
        client_secret: process.env.DISCORD_CLIENT_SECRET!,
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.DISCORD_REDIRECT_URI!,
      }),
    })

    if (!tokenRes.ok) {
      return NextResponse.redirect(new URL('/login?error=token_failed', req.url))
    }

    const tokenData = await tokenRes.json()
    const accessToken = tokenData.access_token

    const userRes = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    if (!userRes.ok) {
      return NextResponse.redirect(new URL('/login?error=user_failed', req.url))
    }

    const discordUser = await userRes.json()

    const user = await prisma.user.upsert({
      where: { discordId: discordUser.id },
      update: {
        name: discordUser.global_name || discordUser.username,
        email: discordUser.email || null,
        avatar: discordUser.avatar
          ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
          : null,
      },
      create: {
        discordId: discordUser.id,
        name: discordUser.global_name || discordUser.username,
        email: discordUser.email || null,
        avatar: discordUser.avatar
          ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
          : null,
      },
    })

    const jwt = await createToken({ userId: user.id, discordId: user.discordId })

    const response = NextResponse.redirect(new URL('/dashboard', req.url))
    response.cookies.set('auth-token', jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })
    response.cookies.delete('oauth-state')

    return response
  } catch (err) {
    console.error('Discord OAuth error:', err)
    return NextResponse.redirect(new URL('/login?error=server_error', req.url))
  }
}
