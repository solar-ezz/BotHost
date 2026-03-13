import { NextResponse } from 'next/server'

export async function GET() {
  const clientId = process.env.DISCORD_CLIENT_ID!
  const redirectUri = encodeURIComponent(process.env.DISCORD_REDIRECT_URI!)
  const scope = encodeURIComponent('identify email')

  const url = `https://discord.com/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`

  return NextResponse.redirect(url)
}
