import type { Metadata } from 'next'
import { Inter, Manrope } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import CookieBanner from '@/components/CookieBanner'
import { AppProviders } from '@/components/Providers'

const inter = Inter({ subsets: ['latin'], variable: '--font-body' })
const manrope = Manrope({ subsets: ['latin'], variable: '--font-headline' })

export const metadata: Metadata = {
  metadataBase: new URL('https://snapfins.0x5zen.dev'),
  title: {
    default: 'SnapFins | AI-Powered Personal Finance',
    template: '%s | SnapFins'
  },
  description: 'Track your wealth, scan receipts with AI, and master your monthly budget with SnapFins.',
  keywords: ['personal finance', 'expense tracker', 'AI receipt scanner', 'budgeting app', 'financial dashboard'],
  authors: [{ name: 'SnapFins' }],
  creator: 'SnapFins',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://snapfins.0x5zen.dev',
    siteName: 'SnapFins',
    title: 'SnapFins | Personal Finance Dashboard',
    description: 'AI-Powered Personal Finance Tracker. Automatic receipt scanning & real-time wealth insights.',
    images: [
      {
        url: '/og-image.png', // Add a placeholder path for the user
        width: 1200,
        height: 630,
        alt: 'SnapFins Dashboard Preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SnapFins | AI-Powered Personal Finance',
    description: 'Automatic receipt scanning & real-time wealth insights.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/site.webmanifest',
  icons: {
    icon: [
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth" data-scroll-behavior="smooth">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        {/* Inline script to prevent FOUC (Flash of Unstyled Content) before hydration */}
        <Script id="theme-script" strategy="beforeInteractive">
          {`
            try {
              const t = localStorage.getItem('snapfins-theme');
              if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                document.documentElement.classList.add('dark');
              } else {
                document.documentElement.classList.remove('dark');
              }
            } catch(e){}
          `}
        </Script>
      </head>
      <body className={`${inter.variable} ${manrope.variable} antialiased bg-background text-foreground min-h-screen flex flex-col selection:bg-primary/20`}>
        <AppProviders>
          {children}
          <CookieBanner />
        </AppProviders>
      </body>
    </html>
  )
}
