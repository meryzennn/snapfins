import type { Metadata } from 'next'
import { Inter, Manrope } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'

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
      </head>
      <body className={`${inter.variable} ${manrope.variable} antialiased bg-background text-foreground min-h-screen flex flex-col selection:bg-primary/20`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body >
    </html>
  )
}
