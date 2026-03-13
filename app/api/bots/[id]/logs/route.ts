import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const bot = await prisma.bot.findFirst({ where: { id: params.id, userId: session.userId } })
  if (!bot) return NextResponse.json({ error: 'Bot not found' }, { status: 404 })

  const url = new URL(req.url)
  const limit = parseInt(url.searchParams.get('limit') || '100')
  const level = url.searchParams.get('level')

  const logs = await prisma.log.findMany({
    where: {
      botId: params.id,
      ...(level && level !== 'ALL' ? { level: level as 'INFO' | 'WARN' | 'ERROR' | 'DEBUG' } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: Math.min(limit, 500),
  })

  return NextResponse.json(logs.reverse())
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const bot = await prisma.bot.findFirst({ where: { id: params.id, userId: session.userId } })
  if (!bot) return NextResponse.json({ error: 'Bot not found' }, { status: 404 })

  await prisma.log.deleteMany({ where: { botId: params.id } })
  return NextResponse.json({ ok: true })
}
