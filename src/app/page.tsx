'use client'
import { useEffect, useState, useCallback } from 'react'
import type { Trade, TradeResult } from '@/types/trade'
import TradeCard from '@/components/TradeCard'
import StatsBar from '@/components/StatsBar'

const RESULTS: { label: string; value: TradeResult | 'ALL' }[] = [
  { label: 'ALL',  value: 'ALL' },
  { label: 'WIN',  value: 'WIN' },
  { label: 'LOSS', value: 'LOSS' },
  { label: 'PEND', value: 'PENDING' },
  { label: 'B/E',  value: 'BREAKEVEN' },
]

export default function HomePage() {
  const [trades, setTrades]   = useState<Trade[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)
  const [filter, setFilter]   = useState<TradeResult | 'ALL'>('ALL')
  const [search, setSearch]   = useState('')

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const params = new URLSearchParams()
      if (filter !== 'ALL') params.set('result', filter)
      const res = await fetch(`/api/trades?${params}`)
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
      setTrades(await res.json())
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => { load() }, [load])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this trade?')) return
    await fetch(`/api/trades/${id}`, { method: 'DELETE' })
    setTrades(prev => prev.filter(t => t.id !== id))
  }

  const visible = trades.filter(t => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      t.pair.toLowerCase().includes(q) ||
      t.reason?.toLowerCase().includes(q) ||
      t.lesson?.toLowerCase().includes(q) ||
      t.aiOutlook?.toLowerCase().includes(q) ||
      t.tags?.some(tag => tag.toLowerCase().includes(q))
    )
  })

  return (
    <div className="animate-in fade-in duration-500">
      {/* Page title */}
      <div className="mb-8 text-center sm:text-left">
        <h1 className="display-font font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-[var(--muted)]" style={{ fontSize: '2.2rem' }}>
          Trading Journal
        </h1>
        <p className="mono text-[var(--accent)] mt-1.5" style={{ fontSize: '0.75rem', letterSpacing: '0.1em', fontWeight: 600 }}>
          ENTRY · EMOTION · EVOLUTION
        </p>
      </div>

      {/* Stats */}
      {trades.length > 0 && <StatsBar trades={trades} />}

      {/* Controls Container */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        {/* Search */}
        <div className="flex-1 relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]">🔍</span>
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search pair, setup, lesson…"
            className="w-full pl-10 pr-4 py-3 text-sm outline-none rounded-xl glass-input placeholder-[var(--muted)] text-[var(--text)]"
          />
        </div>

        {/* Filter pills — scrollable on mobile */}
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar items-center">
          {RESULTS.map(r => (
            <button
              key={r.value}
              onClick={() => setFilter(r.value)}
              className="mono shrink-0 px-4 py-2.5 rounded-xl transition-all outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
              style={{
                fontSize: '0.7rem',
                letterSpacing: '0.08em',
                fontWeight: 700,
                background: filter === r.value ? 'var(--accent)' : 'var(--surface)',
                color:      filter === r.value ? '#000'          : 'var(--muted)',
                border: `1px solid ${filter === r.value ? 'var(--accent)' : 'var(--border)'}`,
                boxShadow: filter === r.value ? '0 4px 12px var(--accent-glow)' : 'none',
              }}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* States */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-8 h-8 rounded-full border-2 border-[var(--border2)] border-t-[var(--accent)] animate-spin" />
          <div className="mono text-xs" style={{ color: 'var(--muted)', letterSpacing: '0.1em' }}>
            SYNCING DATA...
          </div>
        </div>
      )}

      {error && (
        <div
          className="mono text-xs text-center p-5 rounded-2xl mb-4 glass-panel"
          style={{ color: 'var(--loss)', borderColor: 'rgba(255,77,109,0.3)' }}
        >
          {error}
        </div>
      )}

      {!loading && visible.length === 0 && !error && (
        <div className="text-center py-24 glass-panel rounded-3xl mt-4">
          <div
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 shadow-2xl shadow-[var(--accent-glow)]"
            style={{ background: 'linear-gradient(135deg, var(--surface2) 0%, var(--surface-solid) 100%)', border: '1px solid var(--border)' }}
          >
            <span style={{ fontSize: '2.2rem' }}>📈</span>
          </div>
          <h2 className="display-font font-bold text-xl mb-2 text-[var(--text)]">No Trades Found</h2>
          <p className="mb-8 text-[var(--muted)] text-sm max-w-sm mx-auto leading-relaxed">
            {search || filter !== 'ALL' ? "We couldn't find any trades matching your current filters." : "Your journal is empty. Start tracking your edge by logging your first trade."}
          </p>
          <a
            href="/add"
            className="mono inline-flex items-center justify-center px-8 py-4 rounded-xl font-bold transition-transform hover:scale-105 active:scale-95"
            style={{ 
              background: 'linear-gradient(135deg, var(--accent) 0%, #00b377 100%)', 
              color: '#000', 
              fontSize: '0.8rem', 
              letterSpacing: '0.08em',
              boxShadow: '0 8px 24px var(--accent-glow)'
            }}
          >
            + LOG TRADE
          </a>
        </div>
      )}

      {/* Trade list */}
      <div className="grid gap-3 sm:gap-4">
        {visible.map((trade, i) => (
          <div key={trade.id} style={{ animationDelay: `${i * 40}ms` }}>
            <TradeCard trade={trade} onDelete={handleDelete} />
          </div>
        ))}
      </div>

      {/* Mobile FAB */}
      <a
        href="/add"
        className="fixed right-5 bottom-6 w-14 h-14 flex items-center justify-center rounded-full sm:hidden transition-transform active:scale-95 z-50"
        style={{ 
          background: 'linear-gradient(135deg, var(--accent) 0%, #00b377 100%)', 
          color: '#000', 
          fontSize: '1.8rem', 
          fontWeight: 300,
          boxShadow: '0 8px 32px var(--accent-glow)',
          border: '1px solid rgba(255,255,255,0.4)'
        }}
        aria-label="Add trade"
      >
        +
      </a>

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  )
}
