// components/TradeCard.tsx
'use client'
import type { Trade } from '@/types/trade'
import { useState } from 'react'

interface Props {
  trade: Trade
  onDelete?: (id: string) => void
}

const resultConfig = {
  WIN:       { label: 'WIN',     cls: 'badge-win' },
  LOSS:      { label: 'LOSS',    cls: 'badge-loss' },
  PENDING:   { label: 'PENDING', cls: 'badge-pending' },
  BREAKEVEN: { label: 'B/E',     cls: 'badge-breakeven' },
}

export default function TradeCard({ trade, onDelete }: Props) {
  const [expanded, setExpanded] = useState(false)
  const result = trade.result ?? 'PENDING'
  const cfg    = resultConfig[result as keyof typeof resultConfig] ?? resultConfig.PENDING

  const pnlPct   = trade.pnlPct != null ? Number(trade.pnlPct) : null
  const hasRiskPlan = Boolean(trade.maxLossAmount || trade.recommendedBuyAmount || trade.estimatedQuantity || trade.plannedRR)
  const pnlColor =
    pnlPct == null ? 'var(--muted)'
    : pnlPct > 0   ? 'var(--win)'
    : pnlPct < 0   ? 'var(--loss)'
    :                'var(--be)'

  return (
    <article
      className={`fade-up rounded-2xl overflow-hidden transition-all duration-300 glass-panel ${expanded ? 'ring-1 ring-[var(--border-hover)] bg-[var(--surface-hover)]' : 'hover:bg-[var(--surface-hover)] hover:border-[var(--border-hover)] hover:shadow-lg'}`}
    >
      {/* ── Card header ── */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full text-left px-5 py-5 sm:px-6 sm:py-5 flex items-start gap-4 transition-all outline-none focus-visible:bg-[var(--surface2)]"
      >
        {/* Trade # */}
        <span
          className="mono text-xs pt-1 shrink-0"
          style={{ color: 'var(--muted)', minWidth: '2.5rem' }}
        >
          #{String(trade.tradeNumber).padStart(3, '0')}
        </span>

        <div className="flex-1 min-w-0">
          {/* Row 1: pair + direction + result + P&L */}
          <div className="flex flex-wrap items-center gap-2.5 mb-2">
            <span className="display-font font-bold tracking-tight text-[var(--text)]" style={{ fontSize: '1.1rem' }}>
              {trade.pair}
            </span>

            {trade.direction && (
              <span
                className="mono px-2 py-0.5 rounded-md"
                style={{
                  background: trade.direction === 'LONG'
                    ? 'rgba(0,230,160,0.1)' : 'rgba(255,77,109,0.1)',
                  color: trade.direction === 'LONG' ? 'var(--win)' : 'var(--loss)',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                }}
              >
                {trade.direction}
              </span>
            )}

            <span
              className={`mono px-2.5 py-0.5 rounded-md ${cfg.cls}`}
              style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.06em' }}
            >
              {cfg.label}
            </span>

            {pnlPct != null && (
              <span className="mono font-bold" style={{ color: pnlColor, fontSize: '0.8rem' }}>
                {pnlPct > 0 ? '+' : ''}{pnlPct}%
              </span>
            )}
          </div>

          {/* Row 2: date + reason preview */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4 mt-0.5">
            <span className="mono font-medium" style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>
              {new Date(trade.date).toLocaleDateString('en-GB', {
                day: '2-digit', month: 'short', year: 'numeric',
              })}
            </span>
            {trade.reason && (
              <span
                className="truncate text-[var(--text)]/70"
                style={{ fontSize: '0.85rem', maxWidth: '28rem' }}
              >
                {trade.reason}
              </span>
            )}
          </div>
        </div>

        {/* Grade dots */}
        <div className="hidden sm:flex gap-1.5 items-center shrink-0 pt-1.5 ml-2">
          {[1,2,3,4,5].map(n => (
            <span
              key={n}
              className={`grade-dot ${trade.grade != null && n <= trade.grade ? 'active' : ''}`}
            />
          ))}
        </div>

        {/* Chevron */}
        <span
          className="mono shrink-0 pt-1 ml-2 transition-transform duration-300"
          style={{ color: 'var(--muted)', transform: expanded ? 'rotate(180deg)' : 'none', fontSize: '0.8rem' }}
        >
          ▼
        </span>
      </button>

      {/* ── Expanded body ── */}
      {expanded && (
        <div
          className="px-5 sm:px-6 pb-6 slide-in"
        >
          <div className="h-px w-full bg-[var(--border2)] mb-5" />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Section label="SETUP / REASON"  text={trade.reason} />
            <Section label="AI OUTLOOK"      text={trade.aiOutlook} accent />
            <Section label="EMOTION BEFORE"  text={trade.emotionBefore} />
            <Section label="EMOTION AFTER"   text={trade.emotionAfter} />
            {hasRiskPlan && (
              <div className="sm:col-span-2">
                <div className="p-4 rounded-xl bg-[var(--accent)]/5 border border-[var(--accent)]/10">
                  <p
                    className="mono mb-3"
                    style={{ fontSize: '0.65rem', letterSpacing: '0.12em', color: 'var(--accent)', fontWeight: 600 }}
                  >
                    RISK PLAN
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {trade.portfolioValue && <RiskStat label="PORTFOLIO" value={`$${trade.portfolioValue}`} />}
                    {trade.riskPercent && <RiskStat label="RISK" value={`${trade.riskPercent}%`} />}
                    {trade.maxLossAmount && <RiskStat label="MAX LOSS" value={`$${trade.maxLossAmount}`} loss />}
                    {trade.recommendedBuyAmount && <RiskStat label="BUY" value={`$${trade.recommendedBuyAmount}`} accent />}
                    {trade.estimatedQuantity && <RiskStat label="QTY" value={trade.estimatedQuantity} />}
                    {trade.plannedRewardAmount && <RiskStat label="REWARD" value={`$${trade.plannedRewardAmount}`} />}
                    {trade.plannedRR && <RiskStat label="R:R" value={`1 : ${trade.plannedRR}`} />}
                  </div>
                </div>
              </div>
            )}
            {trade.lesson && (
              <div className="sm:col-span-2">
                <Section label="LESSON" text={trade.lesson} highlight />
              </div>
            )}
          </div>

          {/* Tags */}
          {trade.tags && trade.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-6">
              {trade.tags.map(t => (
                <span key={t} className="tag-pill">{t}</span>
              ))}
            </div>
          )}

          {/* Chart + actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 mt-8 pt-5 border-t border-[var(--border2)]">
            {trade.chartUrl && (
              <a
                href={trade.chartUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 mono font-bold hover:brightness-125 transition-all"
                style={{ color: 'var(--accent2)', fontSize: '0.75rem' }}
              >
                <span className="text-base">📈</span> View Chart
              </a>
            )}
            
            <div className="flex gap-3 w-full sm:w-auto ml-auto">
              <a
                href={`/edit/${trade.id}`}
                className="flex-1 sm:flex-none text-center mono px-5 py-2 rounded-lg transition-all hover:bg-[var(--surface2)]"
                style={{ border: '1px solid var(--border2)', color: 'var(--text)', fontSize: '0.75rem', fontWeight: 600 }}
              >
                EDIT
              </a>
              {onDelete && (
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(trade.id); }}
                  className="flex-1 sm:flex-none mono px-5 py-2 rounded-lg transition-all hover:bg-[rgba(255,77,109,0.1)]"
                  style={{ border: '1px solid rgba(255,77,109,0.3)', color: 'var(--loss)', fontSize: '0.75rem', fontWeight: 600 }}
                >
                  DELETE
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </article>
  )
}

function RiskStat({ label, value, accent, loss }: {
  label: string
  value: string
  accent?: boolean
  loss?: boolean
}) {
  const color = loss ? 'var(--loss)' : accent ? 'var(--accent)' : 'var(--text)'
  return (
    <div className="rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border2)' }}>
      <p className="mono mb-1" style={{ fontSize: '0.55rem', letterSpacing: '0.1em', color: 'var(--muted)' }}>{label}</p>
      <p className="mono font-bold" style={{ fontSize: '0.78rem', color }}>{value}</p>
    </div>
  )
}

function Section({
  label, text, accent, highlight
}: {
  label: string; text: string | null | undefined; accent?: boolean; highlight?: boolean
}) {
  if (!text) return null
  return (
    <div className={`p-4 rounded-xl ${accent ? 'bg-[var(--accent)]/5 border border-[var(--accent)]/10' : highlight ? 'bg-[var(--surface2)] border border-[var(--border2)]' : ''}`}>
      <p
        className="mono mb-2"
        style={{ fontSize: '0.65rem', letterSpacing: '0.12em', color: accent ? 'var(--accent)' : 'var(--muted)', fontWeight: 600 }}
      >
        {label}
      </p>
      <p style={{ fontSize: '0.9rem', color: highlight ? 'var(--text)' : 'var(--text)', opacity: highlight ? 1 : 0.85, lineHeight: 1.6 }}>{text}</p>
    </div>
  )
}
