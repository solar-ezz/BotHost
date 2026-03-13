'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bot, LayoutDashboard, Plus, LogOut, Sun, Moon } from 'lucide-react'
import clsx from 'clsx'
import { useTheme } from './ThemeProvider'
import Image from 'next/image'

interface SidebarProps {
  user: { name: string; email: string | null; avatar: string | null }
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()
  const { theme, toggle } = useTheme()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/login'
  }

  const links = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/bots/new', label: 'Add Bot', icon: Plus },
  ]

  return (
    <aside className="w-60 border-r border-surface-100 dark:border-surface-800 bg-white dark:bg-surface-900 flex flex-col h-screen sticky top-0">
      <div className="h-16 flex items-center px-5 border-b border-surface-100 dark:border-surface-800">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-surface-900 dark:text-white">BotHost</span>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={clsx(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              pathname === href
                ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400'
                : 'text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-800 hover:text-surface-900 dark:hover:text-white'
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="p-3 border-t border-surface-100 dark:border-surface-800">
        <button
          onClick={toggle}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-surface-500 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-800 hover:text-surface-700 dark:hover:text-white transition-colors mb-1"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          {theme === 'dark' ? 'Light mode' : 'Dark mode'}
        </button>
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          {user.avatar ? (
            <Image
              src={user.avatar}
              alt={user.name}
              width={28}
              height={28}
              className="rounded-full"
            />
          ) : (
            <div className="w-7 h-7 bg-brand-100 dark:bg-brand-900 rounded-full flex items-center justify-center">
              <span className="text-xs font-semibold text-brand-700 dark:text-brand-400">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-surface-900 dark:text-white truncate">{user.name}</p>
            {user.email && <p className="text-xs text-surface-400 dark:text-surface-500 truncate">{user.email}</p>}
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-surface-500 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-800 hover:text-surface-700 dark:hover:text-white transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </aside>
  )
}
