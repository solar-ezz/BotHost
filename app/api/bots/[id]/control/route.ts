import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const LOG_MESSAGES: Record<string, Record<string, { level: 'INFO' | 'WARN' | 'ERROR'; message: string }[]>> = {
  start: {
    STOPPED: [
      { level: 'INFO', message: 'Starting bot process...' },
      { level: 'INFO', message: 'Loading environment variables' },
      { level: 'INFO', message: 'Connecting to Discord gateway...' },
      { level: 'INFO', message: 'Bot started successfully and connected to Discord' },
    ],
    ERROR: [
      { level: 'INFO', message: 'Restarting after error...' },
      { level: 'INFO', message: 'Connecting to Discord gateway...' },
      { level: 'INFO', message: 'Bot started successfully' },
    ],
  },
  stop: {
    RUNNING: [
      { level: 'INFO', message: 'Received stop signal' },
      { level: 'INFO', message: 'Closing active connections...' },
      { level: 'INFO', message: 'Bot stopped gracefully' },
    ],
  },
  restart: {
    RUNNING: [
      { level: 'INFO', message: 'Restarting bot...' },
      { level: 'INFO', message: 'Shutting down current instance' },
      { level: 'INFO', message: 'Starting new instance...' },
      { level: 'INFO', message: 'Bot restarted and connected to Discord' },
    ],
    STOPPED: [
      { level: 'INFO', message: 'Starting bot...' },
      { level: 'INFO', message: 'Connecting to Discord gateway...' },
      { level: 'INFO', message: 'Bot started successfully' },
    ],
    ERROR: [
      { level: 'INFO', message: 'Force restarting after error...' },
      { level: 'INFO', message: 'Connecting to Discord gateway...' },
      { level: 'INFO', message: 'Bot restarted and connected successfully' },
    ],
  },
}

const NEXT_STATUS: Record<string, Record<string, 'RUNNING' | 'STOPPED' | 'ERROR'>> = {
  start: { STOPPED: 'RUNNING', ERROR: 'RUNNING' },
  stop: { RUNNING: 'STOPPED' },
  restart: { RUNNING: 'RUNNING', STOPPED: 'RUNNING', ERROR: 'RUNNING' },
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { action } = await req.json()
  if (!['start', 'stop', 'restart'].includes(action)) {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }

  const bot = await prisma.bot.findFirst({ where: { id: params.id, userId: session.userId } })
  if (!bot) return NextResponse.json({ error: 'Bot not found' }, { status: 404 })

  const statusMap = NEXT_STATUS[action]
  const nextStatus = statusMap?.[bot.status]
  if (!nextStatus) {
    return NextResponse.json({ error: `Cannot ${action} a bot that is ${bot.status}` }, { status: 400 })
  }

  const messages = LOG_MESSAGES[action]?.[bot.status] || []

  await prisma.bot.update({
    where: { id: params.id },
    data: { status: nextStatus, updatedAt: new Date() },
  })

  if (messages.length > 0) {
    await prisma.log.createMany({
      data: messages.map(m => ({
        botId: params.id,
        level: m.level,
        message: m.message,
      })),
    })
  }

  if (nextStatus === 'RUNNING') {
    await prisma.metric.create({
      data: {
        botId: params.id,
        cpu: Math.random() * 5 + 1,
        memory: Math.random() * 30 + 20,
        uptime: 0,
      },
    })
  }

  const updated = await prisma.bot.findUnique({ where: { id: params.id } })
  return NextResponse.json(updated)
}
