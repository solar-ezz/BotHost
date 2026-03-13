import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const bot = await prisma.bot.findFirst({ where: { id, userId: session.userId } })
  if (!bot) return NextResponse.json({ error: 'Bot not found' }, { status: 404 })

  const metrics = await prisma.metric.findMany({
    where: { botId: id },
    orderBy: { createdAt: 'desc' },
    take: 30,
  })

  return NextResponse.json(metrics.reverse())
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const bot = await prisma.bot.findFirst({ where: { id, userId: session.userId } })
  if (!bot) return NextResponse.json({ error: 'Bot not found' }, { status: 404 })

  if (bot.status !== 'RUNNING') {
    return NextResponse.json({ error: 'Bot is not running' }, { status: 400 })
  }

  const lastMetric = await prisma.metric.findFirst({
    where: { botId: id },
    orderBy: { createdAt: 'desc' },
  })

  const baseCpu = lastMetric?.cpu || 5
  const baseMemory = lastMetric?.memory || 40
  const baseUptime = lastMetric?.uptime || 0

  const cpu = Math.max(0.5, Math.min(95, baseCpu + (Math.random() - 0.5) * 8))
  const memory = Math.max(10, Math.min(90, baseMemory + (Math.random() - 0.5) * 5))
  const uptime = baseUptime + 30

  const metric = await prisma.metric.create({
    data: { botId: id, cpu, memory, uptime },
  })

  return NextResponse.json(metric)
}
