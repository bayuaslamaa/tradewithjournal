// app/layout.tsx
import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'TWX Trading Journal',
  description: 'Your premium AI-assisted trading journal',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'TWX Journal',
  },
}

export const viewport: Viewport = {
  themeColor: '#050608',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,          // prevent iOS double-tap zoom on form inputs
  userScalable: false,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="antialiased relative overflow-x-hidden">
        
        {/* Background glow effects */}
        <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-[var(--accent)]/10 rounded-full blur-[120px] pointer-events-none -z-10" />
        <div className="fixed bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[var(--accent2)]/5 rounded-full blur-[100px] pointer-events-none -z-10" />

        {/* Top nav bar */}
        <header
          className="sticky top-0 z-50 glass-panel border-x-0 border-t-0"
        >
          <div
            className="max-w-3xl mx-auto px-5 flex items-center justify-between"
            style={{ height: '64px' }}
          >
            <a href="/" className="flex items-center gap-3 group">
              <div
                className="w-9 h-9 flex items-center justify-center rounded-xl shrink-0 transition-transform group-hover:scale-105"
                style={{ 
                  background: 'linear-gradient(135deg, var(--accent) 0%, #00b377 100%)', 
                  color: '#000',
                  boxShadow: '0 4px 12px var(--accent-glow)'
                }}
              >
                <span className="display-font font-bold" style={{ fontSize: '0.8rem' }}>TW</span>
              </div>
              <span className="display-font font-bold text-lg tracking-tight group-hover:text-[var(--text)] text-[var(--text)]/90 transition-colors">
                TWX Journal
              </span>
            </a>

            {/* Desktop-only new trade button */}
            <a
              href="/add"
              className="mono hidden sm:flex items-center justify-center px-5 py-2.5 rounded-lg transition-all hover:scale-105 active:scale-95"
              style={{
                background: 'rgba(0, 255, 178, 0.1)',
                color: 'var(--accent)',
                border: '1px solid rgba(0, 255, 178, 0.2)',
                fontWeight: 600,
                fontSize: '0.75rem',
                letterSpacing: '0.05em',
              }}
            >
              + NEW TRADE
            </a>
          </div>
        </header>

        {/* Main content — extra bottom padding for mobile FAB */}
        <main className="max-w-3xl mx-auto px-4 sm:px-5 pt-8 pb-28 relative z-10">
          {children}
        </main>

        <footer
          className="mono text-center pb-8 hidden sm:block opacity-60 hover:opacity-100 transition-opacity"
          style={{ color: 'var(--muted)', fontSize: '0.65rem', letterSpacing: '0.15em' }}
        >
          TWX TRADING JOURNAL · {new Date().getFullYear()}
        </footer>
      </body>
    </html>
  )
}
