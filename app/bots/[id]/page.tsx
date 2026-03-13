'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Play, Square, RotateCcw, Trash2, Cpu, Database, Clock, Terminal, BarChart3, Loader2, Download } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import StatusBadge from '@/components/StatusBadge'
import clsx from 'clsx'

type Status = 'RUNNING' | 'STOPPED' | 'ERROR' | 'STARTING'
type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG' | 'ALL'

interface Bot {
  id: string
  name: string
  status: Status
  language: string
  createdAt: string
  updatedAt: string
}

interface Log {
  id: string
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG'
  message: string
  createdAt: string
}

interface Metric {
  id: string
  cpu: number
  memory: number
  uptime: number
  createdAt: string
}

const LOG_LEVEL_COLORS: Record<string, string> = {
  INFO: 'text-green-400',
  WARN: 'text-yellow-400',
  ERROR: 'text-red-400',
  DEBUG: 'text-blue-400',
}

function formatUptime(seconds: number) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

export default function BotDetailPage() {
  const params = useParams()
  const router = useRouter()
  const botId = params.id as string

  const [bot, setBot] = useState<Bot | null>(null)
  const [logs, setLogs] = useState<Log[]>([])
  const [metrics, setMetrics] = useState<Metric[]>([])
  const [logFilter, setLogFilter] = useState<LogLevel>('ALL')
  const [activeTab, setActiveTab] = useState<'logs' | 'metrics'>('logs')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [autoScroll, setAutoScroll] = useState(true)
  const logsEndRef = useRef<HTMLDivElement>(null)
  const pollRef = useRef<NodeJS.Timeout | null>(null)

  const fetchBot = useCallback(async () => {
    const res = await fetch(`/api/bots/${botId}`)
    if (res.status === 404) { router.push('/dashboard'); return }
    const data = await res.json()
    setBot(data)
    setLogs(data.logs || [])
    setMetrics(data.metrics || [])
  }, [botId, router])

  useEffect(() => {
    fetchBot().finally(() => setLoading(false))
  }, [fetchBot])

  useEffect(() => {
    if (bot?.status === 'RUNNING') {
      pollRef.current = setInterval(async () => {
        await fetch(`/api/bots/${botId}/metrics`, { method: 'POST' })
        const res = await fetch(`/api/bots/${botId}/metrics`)
        if (res.ok) {
          const data = await res.json()
          setMetrics(data)
        }
        const logsRes = await fetch(`/api/bots/${botId}/logs?limit=100`)
        if (logsRes.ok) {
          const logsData = await logsRes.json()
          setLogs(logsData)
        }
      }, 10000)
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [bot?.status, botId])

  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [logs, autoScroll])

  async function handleControl(action: 'start' | 'stop' | 'restart') {
    setActionLoading(action)
    try {
      const res = await fetch(`/api/bots/${botId}/control`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      if (res.ok) {
        await fetchBot()
      }
    } finally {
      setActionLoading(null)
    }
  }

  async function handleDelete() {
    setActionLoading('delete')
    try {
      await fetch(`/api/bots/${botId}`, { method: 'DELETE' })
      router.push('/dashboard')
    } finally {
      setActionLoading(null)
    }
  }

  async function handleClearLogs() {
    await fetch(`/api/bots/${botId}/logs`, { method: 'DELETE' })
    setLogs([])
  }

  function downloadLogs() {
    const text = filteredLogs
      .map(l => `[${new Date(l.createdAt).toISOString()}] [${l.level}] ${l.message}`)
      .join('\n')
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${bot?.name}-logs.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const filteredLogs = logFilter === 'ALL' ? logs : logs.filter(l => l.level === logFilter)
  const latestMetric = metrics[metrics.length - 1]

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-96">
        <Loader2 className="w-6 h-6 animate-spin text-surface-400" />
      </div>
    )
  }

  if (!bot) return null

  return (
    <div className="p-8">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-surface-500 hover:text-surface-700 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> All bots
      </Link>

      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-surface-900">{bot.name}</h1>
            <StatusBadge status={bot.status} />
            {bot.language && (
              <span className="text-xs bg-surface-100 text-surface-600 px-2 py-0.5 rounded font-medium">{bot.language}</span>
            )}
          </div>
          <p className="text-sm text-surface-400">Created {new Date(bot.createdAt).toLocaleDateString()} · Last updated {new Date(bot.updatedAt).toLocaleTimeString()}</p>
        </div>

        <div className="flex items-center gap-2">
          {bot.status === 'STOPPED' || bot.status === 'ERROR' ? (
            <button
              onClick={() => handleControl('start')}
              disabled={!!actionLoading}
              className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors"
            >
              {actionLoading === 'start' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              Start
            </button>
          ) : null}
          {bot.status === 'RUNNING' ? (
            <>
              <button
                onClick={() => handleControl('stop')}
                disabled={!!actionLoading}
                className="inline-flex items-center gap-2 bg-surface-200 text-surface-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-surface-300 disabled:opacity-50 transition-colors"
              >
                {actionLoading === 'stop' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Square className="w-4 h-4" />}
                Stop
              </button>
              <button
                onClick={() => handleControl('restart')}
                disabled={!!actionLoading}
                className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-200 disabled:opacity-50 transition-colors"
              >
                {actionLoading === 'restart' ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                Restart
              </button>
            </>
          ) : null}
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="inline-flex items-center gap-2 text-surface-400 hover:text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg text-sm transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-surface-100 rounded-xl p-5">
          <div className="flex items-center gap-2 text-surface-400 text-xs font-medium uppercase tracking-wide mb-2">
            <Cpu className="w-3.5 h-3.5" /> CPU Usage
          </div>
          <p className="text-2xl font-bold text-surface-900">
            {latestMetric && bot.status === 'RUNNING' ? `${latestMetric.cpu.toFixed(1)}%` : '—'}
          </p>
        </div>
        <div className="bg-white border border-surface-100 rounded-xl p-5">
          <div className="flex items-center gap-2 text-surface-400 text-xs font-medium uppercase tracking-wide mb-2">
            <Database className="w-3.5 h-3.5" /> Memory
          </div>
          <p className="text-2xl font-bold text-surface-900">
            {latestMetric && bot.status === 'RUNNING' ? `${latestMetric.memory.toFixed(0)} MB` : '—'}
          </p>
        </div>
        <div className="bg-white border border-surface-100 rounded-xl p-5">
          <div className="flex items-center gap-2 text-surface-400 text-xs font-medium uppercase tracking-wide mb-2">
            <Clock className="w-3.5 h-3.5" /> Uptime
          </div>
          <p className="text-2xl font-bold text-surface-900">
            {latestMetric && bot.status === 'RUNNING' ? formatUptime(latestMetric.uptime) : '—'}
          </p>
        </div>
      </div>

      <div className="bg-white border border-surface-100 rounded-xl overflow-hidden">
        <div className="flex border-b border-surface-100">
          <button
            onClick={() => setActiveTab('logs')}
            className={clsx(
              'flex items-center gap-2 px-5 py-4 text-sm font-medium border-b-2 transition-colors',
              activeTab === 'logs'
                ? 'border-brand-600 text-brand-700 bg-brand-50/50'
                : 'border-transparent text-surface-500 hover:text-surface-700'
            )}
          >
            <Terminal className="w-4 h-4" /> Logs
            <span className="bg-surface-100 text-surface-600 text-xs px-1.5 py-0.5 rounded-full font-semibold">{logs.length}</span>
          </button>
          <button
            onClick={() => setActiveTab('metrics')}
            className={clsx(
              'flex items-center gap-2 px-5 py-4 text-sm font-medium border-b-2 transition-colors',
              activeTab === 'metrics'
                ? 'border-brand-600 text-brand-700 bg-brand-50/50'
                : 'border-transparent text-surface-500 hover:text-surface-700'
            )}
          >
            <BarChart3 className="w-4 h-4" /> Metrics
          </button>
        </div>

        {activeTab === 'logs' && (
          <div>
            <div className="flex items-center justify-between px-5 py-3 border-b border-surface-100 bg-surface-50/50">
              <div className="flex items-center gap-2">
                {(['ALL', 'INFO', 'WARN', 'ERROR', 'DEBUG'] as LogLevel[]).map(level => (
                  <button
                    key={level}
                    onClick={() => setLogFilter(level)}
                    className={clsx(
                      'text-xs px-2.5 py-1 rounded-full font-medium transition-colors',
                      logFilter === level
                        ? 'bg-brand-600 text-white'
                        : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
                    )}
                  >
                    {level}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAutoScroll(!autoScroll)}
                  className={clsx('text-xs px-2.5 py-1 rounded-full font-medium transition-colors', autoScroll ? 'bg-brand-100 text-brand-700' : 'bg-surface-100 text-surface-600')}
                >
                  Auto-scroll
                </button>
                <button onClick={downloadLogs} className="text-xs text-surface-500 hover:text-surface-700 p-1.5 rounded hover:bg-surface-100 transition-colors">
                  <Download className="w-3.5 h-3.5" />
                </button>
                <button onClick={handleClearLogs} className="text-xs text-surface-500 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50 transition-colors">
                  Clear
                </button>
              </div>
            </div>
            <div className="bg-surface-950 h-96 overflow-y-auto scrollbar-thin p-4">
              {filteredLogs.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-surface-500 text-sm">No logs yet</p>
                </div>
              ) : (
                <>
                  {filteredLogs.map(log => (
                    <div key={log.id} className="log-line flex items-start gap-3 mb-0.5 hover:bg-white/5 px-1 rounded">
                      <span className="text-surface-500 shrink-0 text-xs">{new Date(log.createdAt).toLocaleTimeString()}</span>
                      <span className={clsx('shrink-0 font-semibold text-xs w-10', LOG_LEVEL_COLORS[log.level])}>{log.level}</span>
                      <span className="text-surface-200 text-xs">{log.message}</span>
                    </div>
                  ))}
                  <div ref={logsEndRef} />
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === 'metrics' && (
          <div className="p-6">
            {metrics.length < 2 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <BarChart3 className="w-8 h-8 text-surface-300 mb-3" />
                <p className="text-sm text-surface-500">No metrics yet</p>
                <p className="text-xs text-surface-400 mt-1">Metrics will appear once your bot has been running</p>
              </div>
            ) : (
              <div className="space-y-8">
                <div>
                  <h3 className="text-sm font-semibold text-surface-700 mb-4">CPU Usage (%)</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={metrics}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="createdAt" tickFormatter={v => new Date(v).toLocaleTimeString()} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                      <Tooltip
                        labelFormatter={v => new Date(v).toLocaleTimeString()}
                        formatter={(v: number) => [`${v.toFixed(1)}%`, 'CPU']}
                        contentStyle={{ fontSize: 12, border: '1px solid #e2e8f0', borderRadius: 8 }}
                      />
                      <Line type="monotone" dataKey="cpu" stroke="#3b82f6" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-surface-700 mb-4">Memory Usage (MB)</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={metrics}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="createdAt" tickFormatter={v => new Date(v).toLocaleTimeString()} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                      <Tooltip
                        labelFormatter={v => new Date(v).toLocaleTimeString()}
                        formatter={(v: number) => [`${v.toFixed(0)} MB`, 'Memory']}
                        contentStyle={{ fontSize: 12, border: '1px solid #e2e8f0', borderRadius: 8 }}
                      />
                      <Line type="monotone" dataKey="memory" stroke="#10b981" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl animate-slide-up">
            <h3 className="font-bold text-surface-900 mb-2">Delete {bot.name}?</h3>
            <p className="text-sm text-surface-500 mb-6">This will permanently delete the bot and all its logs and metrics. This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={!!actionLoading}
                className="flex-1 bg-red-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {actionLoading === 'delete' && <Loader2 className="w-4 h-4 animate-spin" />}
                Delete bot
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 border border-surface-200 text-surface-700 py-2.5 rounded-lg text-sm font-semibold hover:bg-surface-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
