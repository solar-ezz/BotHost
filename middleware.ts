import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from './lib/auth-edge'

const PUBLIC_PATHS = ['/', '/login', '/register']
const API_PUBLIC = ['/api/auth/discord', '/api/auth/discord/callback']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (PUBLIC_PATHS.includes(pathname) || API_PUBLIC.some(p => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  if (pathname.startsWith('/api/')) {
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const session = await verifyToken(token)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.next()
  }

  const token = request.cookies.get('auth-token')?.value
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const session = await verifyToken(token)
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
