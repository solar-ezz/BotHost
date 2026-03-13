import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function getBot(botId: string, userId: string) {
  return prisma.bot.findFirst({ where: { id: botId, userId } })
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const bot = await prisma.bot.findFirst({
    where: { id, userId: session.userId },
    include: {
      logs: { orderBy: { createdAt: 'desc' }, take: 100 },
      metrics: { orderBy: { createdAt: 'desc' }, take: 30 },
    },
  })

  if (!bot) return NextResponse.json({ error: 'Bot not found' }, { status: 404 })
  return NextResponse.json(bot)
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const bot = await getBot(id, session.userId)
  if (!bot) return NextResponse.json({ error: 'Bot not found' }, { status: 404 })

  await prisma.bot.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const bot = await getBot(id, session.userId)
  if (!bot) return NextResponse.json({ error: 'Bot not found' }, { status: 404 })

  const { name, token } = await req.json()
  const updated = await prisma.bot.update({
    where: { id },
    data: { ...(name && { name }), ...(token && { token }) },
  })

  return NextResponse.json(updated)
}
