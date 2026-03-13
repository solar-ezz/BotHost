import { NextResponse } from 'next/server'

export async function GET() {
  const clientId = process.env.DISCORD_CLIENT_ID!
  const redirectUri = encodeURIComponent(process.env.DISCORD_REDIRECT_URI!)
  const scope = encodeURIComponent('identify email')
  const state = crypto.randomUUID()

  const url = `https://discord.com/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&state=${state}`

  const response = NextResponse.redirect(url)
  response.cookies.set('oauth-state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 10,
    path: '/',
  })

  return response
}
