import { cookies } from 'next/headers'
import { createToken, verifyToken } from './auth-edge'

export { createToken, verifyToken }

export async function getSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth-token')?.value
  if (!token) return null
  return verifyToken(token)
}

export function setAuthCookie(response: Response, token: string) {
  const headers = new Headers(response.headers)
  headers.append(
    'Set-Cookie',
    `auth-token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`
  )
  return headers
}
