// components/StatsBar.tsx
import type { Trade } from '@/types/trade'

interface Props { trades: Trade[] }

export default function StatsBar({ trades }: Props) {
  const closed = trades.filter(t => t.result !== 'PENDING')
  const wins   = trades.filter(t => t.result === 'WIN').length
  const losses = trades.filter(t => t.result === 'LOSS').length
  const winRate = closed.length > 0
    ? ((wins / (wins + losses)) * 100).toFixed(1)
    : '—'
  const avgGrade = trades.filter(t => t.grade != null).length > 0
    ? (trades.reduce((a, t) => a + (t.grade ?? 0), 0) /
       trades.filter(t => t.grade != null).length).toFixed(1)
    : '—'
  const totalPnl = trades
    .reduce((a, t) => a + (Number(t.pnlPct) ?? 0), 0)
    .toFixed(2)

  const stats = [
    { label: 'TOTAL TRADES', value: trades.length,       unit: '' },
    { label: 'WIN RATE',     value: `${winRate}%`,        unit: '' },
    { label: 'W / L',        value: `${wins} / ${losses}`,unit: '' },
    { label: 'AVG GRADE',    value: `${avgGrade} / 5`,   unit: '' },
    { label: 'NET P&L',      value: `${Number(totalPnl) >= 0 ? '+' : ''}${totalPnl}%`, unit: '',
      color: Number(totalPnl) > 0 ? 'var(--win)' : Number(totalPnl) < 0 ? 'var(--loss)' : undefined },
  ]

  return (
    <div
      className="grid grid-cols-2 sm:grid-cols-5 gap-px mb-8 rounded-2xl overflow-hidden glass-panel"
    >
      {stats.map(s => (
        <div
          key={s.label}
          className="py-5 px-5 flex flex-col gap-1.5 transition-colors hover:bg-[var(--surface-hover)]"
          style={{ background: 'var(--surface2)' }}
        >
          <span className="mono" style={{ fontSize: '0.65rem', letterSpacing: '0.12em', color: 'var(--muted)', fontWeight: 600 }}>
            {s.label}
          </span>
          <span
            className="display-font font-bold tracking-tight"
            style={{ fontSize: '1.2rem', color: s.color ?? 'var(--text)' }}
          >
            {s.value}
          </span>
        </div>
      ))}
    </div>
  )
}
