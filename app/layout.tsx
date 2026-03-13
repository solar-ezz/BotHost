import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'BotHost — Discord Bot Hosting',
  description: 'Professional hosting platform for Discord bots',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
