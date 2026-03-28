import type { Metadata } from 'next'
import { Inter, Manrope } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import CookieBanner from '@/components/CookieBanner'

const inter = Inter({ subsets: ['latin'], variable: '--font-body' })
const manrope = Manrope({ subsets: ['latin'], variable: '--font-headline' })

export const metadata: Metadata = {
  title: 'SnapFins | Personal Finance Dashboard',
  description: 'AI-Powered Personal Finance Tracker',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        {/* Inline script to prevent FOUC (Flash of Unstyled Content) before hydration */}
        <script id="theme-script" dangerouslySetInnerHTML={{
          __html: `
            try {
              const t = localStorage.getItem('snapfins-theme');
              if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                document.documentElement.classList.add('dark');
              } else {
                document.documentElement.classList.remove('dark');
              }
            } catch(e){}
          `
        }} />
      </head>
      <body className={`${inter.variable} ${manrope.variable} antialiased bg-background text-foreground min-h-screen flex flex-col selection:bg-primary/20`}>
        {children}
        <CookieBanner />
      </body>
    </html>
  )
}
