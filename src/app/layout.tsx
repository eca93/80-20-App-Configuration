// src/app/layout.tsx 
import './globals.css'
import { Inter } from 'next/font/google'
import { SettingsProvider } from '@/lib/contexts/SettingsContext'
import { Navigation } from '@/components/Navigation'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SettingsProvider>
          <Navigation />
          <main className="min-h-screen bg-background">
            {children}
          </main>
        </SettingsProvider>
      </body>
    </html>
  )
} 