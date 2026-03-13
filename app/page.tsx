'use client'

import Link from 'next/link'
import { Bot, Zap, Shield, BarChart3, Terminal, ArrowRight, Check } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-surface-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-surface-900 text-lg">BotHost</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-surface-600 hover:text-surface-900 transition-colors font-medium">
              Sign in
            </Link>
            <Link href="/register" className="text-sm bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 transition-colors font-medium">
              Get started
            </Link>
          </div>
        </div>
      </nav>

      <section className="max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 border border-brand-200">
          <span className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-pulse-dot"></span>
          Built for Discord bot developers
        </div>
        <h1 className="text-5xl sm:text-6xl font-bold text-surface-900 leading-tight mb-6 text-balance">
          Host your Discord bots<br />
          <span className="text-brand-600">without the complexity</span>
        </h1>
        <p className="text-xl text-surface-500 max-w-2xl mx-auto mb-10 text-balance">
          Deploy, manage, and monitor your Discord bots from a single dashboard. Real-time logs, resource metrics, and one-click controls.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link href="/register" className="inline-flex items-center gap-2 bg-brand-600 text-white px-6 py-3 rounded-lg hover:bg-brand-700 transition-colors font-semibold text-sm">
            Start hosting free <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/login" className="inline-flex items-center gap-2 border border-surface-200 text-surface-700 px-6 py-3 rounded-lg hover:border-surface-300 hover:bg-surface-50 transition-colors font-semibold text-sm">
            Sign in to dashboard
          </Link>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="bg-surface-900 rounded-2xl p-6 overflow-hidden">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
            <span className="ml-2 text-surface-400 text-xs font-mono">bot-logs — music-bot</span>
          </div>
          <div className="space-y-1.5">
            {[
              { level: 'INFO', msg: 'Bot connected as MusicBot#4821', time: '12:00:01' },
              { level: 'INFO', msg: 'Joined voice channel: General in server 12847', time: '12:00:04' },
              { level: 'INFO', msg: 'Now playing: Bohemian Rhapsody — requested by user#1234', time: '12:00:07' },
              { level: 'WARN', msg: 'Queue has 47 tracks — memory usage elevated', time: '12:00:22' },
              { level: 'INFO', msg: 'Processed 128 commands in the last 60 seconds', time: '12:01:01' },
            ].map((log, i) => (
              <div key={i} className="flex items-start gap-3 font-mono text-xs">
                <span className="text-surface-500 shrink-0">{log.time}</span>
                <span className={`shrink-0 font-semibold ${log.level === 'WARN' ? 'text-yellow-400' : 'text-green-400'}`}>{log.level}</span>
                <span className="text-surface-300">{log.msg}</span>
              </div>
            ))}
            <div className="flex items-start gap-3 font-mono text-xs">
              <span className="text-surface-500 shrink-0">12:01:04</span>
              <span className="text-brand-400 shrink-0 font-semibold">INFO</span>
              <span className="text-surface-300">Heartbeat acknowledged<span className="animate-pulse">_</span></span>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-20">
        <h2 className="text-3xl font-bold text-surface-900 text-center mb-12">Everything you need</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Zap, title: 'One-click deploy', desc: 'Upload your bot files and go live instantly with automated dependency installation.' },
            { icon: Terminal, title: 'Live log streaming', desc: 'Real-time log viewer with level filtering. Debug issues as they happen.' },
            { icon: BarChart3, title: 'Resource metrics', desc: 'Monitor CPU and memory usage over time with clear historical charts.' },
            { icon: Shield, title: 'Secure by default', desc: 'Bot tokens encrypted at rest. Isolated environments per bot.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="p-6 border border-surface-100 rounded-xl hover:border-brand-200 hover:shadow-sm transition-all">
              <div className="w-10 h-10 bg-brand-50 rounded-lg flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-brand-600" />
              </div>
              <h3 className="font-semibold text-surface-900 mb-2">{title}</h3>
              <p className="text-sm text-surface-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="bg-brand-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to deploy your bot?</h2>
          <p className="text-brand-200 mb-8 max-w-lg mx-auto">Create your account and have your first bot running in under 5 minutes.</p>
          <div className="flex items-center justify-center gap-8 flex-wrap mb-8">
            {['Free to start', 'No credit card required', 'Cancel anytime'].map(f => (
              <div key={f} className="flex items-center gap-2 text-sm text-brand-100">
                <Check className="w-4 h-4 text-brand-300" /> {f}
              </div>
            ))}
          </div>
          <Link href="/register" className="inline-flex items-center gap-2 bg-white text-brand-700 px-6 py-3 rounded-lg font-semibold text-sm hover:bg-brand-50 transition-colors">
            Create free account <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-surface-100 py-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-brand-600 rounded-md flex items-center justify-center">
              <Bot className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-semibold text-surface-700">BotHost</span>
          </div>
          <p className="text-sm text-surface-400">© 2024 BotHost. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
