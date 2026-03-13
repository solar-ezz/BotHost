'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, Eye, EyeOff, Info } from 'lucide-react'

export default function NewBotPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [token, setToken] = useState('')
  const [language, setLanguage] = useState('javascript')
  const [showToken, setShowToken] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/bots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, token, language }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to create bot')
      } else {
        router.push(`/bots/${data.id}`)
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-2xl">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-surface-500 hover:text-surface-700 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to dashboard
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-surface-900">Add a new bot</h1>
        <p className="text-surface-500 mt-1 text-sm">Configure your Discord bot to start hosting</p>
      </div>

      <div className="bg-white border border-surface-100 rounded-2xl p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">Bot name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              placeholder="My Awesome Bot"
              className="w-full px-3 py-2.5 border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all placeholder:text-surface-300"
            />
            <p className="text-xs text-surface-400 mt-1.5">A friendly name to identify this bot in your dashboard</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">Discord bot token</label>
            <div className="relative">
              <input
                type={showToken ? 'text' : 'password'}
                value={token}
                onChange={e => setToken(e.target.value)}
                required
                placeholder="MTExxx.xxx.xxx"
                className="w-full px-3 py-2.5 pr-10 border border-surface-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all placeholder:text-surface-300"
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600"
              >
                {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div className="flex items-start gap-2 mt-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              <Info className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">Your token is encrypted and stored securely. Find it in the Discord Developer Portal under Bot settings.</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">Bot language</label>
            <select
              value={language}
              onChange={e => setLanguage(e.target.value)}
              className="w-full px-3 py-2.5 border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all bg-white"
            >
              <option value="javascript">JavaScript / Node.js</option>
              <option value="typescript">TypeScript</option>
              <option value="python">Python</option>
            </select>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-brand-600 text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-brand-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Creating...' : 'Create bot'}
            </button>
            <Link href="/dashboard" className="px-5 py-2.5 text-sm font-medium text-surface-600 hover:text-surface-900 transition-colors">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
