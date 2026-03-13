import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import StatusBadge from '@/components/StatusBadge'
import { Plus, Bot, ExternalLink, Cpu, Database } from 'lucide-react'

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const [user, bots] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.userId }, select: { name: true } }),
    prisma.bot.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: 'desc' },
      include: {
        metrics: { orderBy: { createdAt: 'desc' }, take: 1 },
        _count: { select: { logs: true } },
      },
    }),
  ])

  const runningCount = bots.filter(b => b.status === 'RUNNING').length
  const errorCount = bots.filter(b => b.status === 'ERROR').length

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-surface-900">Welcome back, {user?.name?.split(' ')[0]}</h1>
        <p className="text-surface-500 mt-1 text-sm">Manage and monitor your Discord bots</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-surface-100 rounded-xl p-5">
          <p className="text-xs font-medium text-surface-400 uppercase tracking-wide mb-1">Total Bots</p>
          <p className="text-3xl font-bold text-surface-900">{bots.length}</p>
        </div>
        <div className="bg-white border border-surface-100 rounded-xl p-5">
          <p className="text-xs font-medium text-surface-400 uppercase tracking-wide mb-1">Running</p>
          <p className="text-3xl font-bold text-emerald-600">{runningCount}</p>
        </div>
        <div className="bg-white border border-surface-100 rounded-xl p-5">
          <p className="text-xs font-medium text-surface-400 uppercase tracking-wide mb-1">Errors</p>
          <p className="text-3xl font-bold text-red-500">{errorCount}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-surface-900">Your Bots</h2>
        <Link
          href="/bots/new"
          className="inline-flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add bot
        </Link>
      </div>

      {bots.length === 0 ? (
        <div className="bg-white border border-surface-100 rounded-xl p-16 text-center">
          <div className="w-12 h-12 bg-surface-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Bot className="w-6 h-6 text-surface-400" />
          </div>
          <h3 className="font-semibold text-surface-900 mb-2">No bots yet</h3>
          <p className="text-sm text-surface-500 mb-6">Add your first Discord bot to get started</p>
          <Link
            href="/bots/new"
            className="inline-flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add your first bot
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {bots.map(bot => {
            const latestMetric = bot.metrics[0]
            return (
              <Link
                key={bot.id}
                href={`/bots/${bot.id}`}
                className="bg-white border border-surface-100 rounded-xl p-5 hover:border-brand-200 hover:shadow-sm transition-all flex items-center gap-4"
              >
                <div className="w-10 h-10 bg-brand-50 rounded-lg flex items-center justify-center shrink-0">
                  <Bot className="w-5 h-5 text-brand-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-semibold text-surface-900">{bot.name}</span>
                    <StatusBadge status={bot.status as 'RUNNING' | 'STOPPED' | 'ERROR' | 'STARTING'} />
                    {bot.language && (
                      <span className="text-xs bg-surface-100 text-surface-600 px-2 py-0.5 rounded font-medium">{bot.language}</span>
                    )}
                  </div>
                  <p className="text-xs text-surface-400">
                    {bot._count.logs} log entries · Created {new Date(bot.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {latestMetric && bot.status === 'RUNNING' && (
                  <div className="hidden sm:flex items-center gap-4 text-xs text-surface-500">
                    <span className="flex items-center gap-1">
                      <Cpu className="w-3.5 h-3.5" /> {latestMetric.cpu.toFixed(1)}%
                    </span>
                    <span className="flex items-center gap-1">
                      <Database className="w-3.5 h-3.5" /> {latestMetric.memory.toFixed(0)} MB
                    </span>
                  </div>
                )}
                <ExternalLink className="w-4 h-4 text-surface-300 shrink-0" />
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
