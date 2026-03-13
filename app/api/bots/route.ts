import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const bots = await prisma.bot.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { logs: true } },
      metrics: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
  })

  return NextResponse.json(bots)
}

export async function POST(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, token, language } = await req.json()
  if (!name || !token) {
    return NextResponse.json({ error: 'Name and token are required' }, { status: 400 })
  }

  const bot = await prisma.bot.create({
    data: {
      name,
      token,
      language: language || 'javascript',
      userId: session.userId,
      status: 'STOPPED',
    },
  })

  await prisma.log.create({
    data: {
      botId: bot.id,
      level: 'INFO',
      message: `Bot "${name}" created and ready to start`,
    },
  })

  return NextResponse.json(bot, { status: 201 })
}
